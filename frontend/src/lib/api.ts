import { Product, Shop, Order, DeliveryTracking, User } from '@/types';
import { supabase } from './supabase';

// ====================================================================
// SHOPS & PRODUCTS API
// ====================================================================
export async function fetchNearbyShops(search?: string): Promise<Shop[]> {
  try {
    let query = supabase.from('shops').select('*').eq('is_active', true);
    if (search) {
      query = query.or(`shop_name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching shops:', err);
    return [];
  }
}

export async function searchProducts(params: {
  q?: string;
  category?: string;
  gender?: string;
  max_price?: number;
  max_delivery_mins?: number;
  shop_id?: string;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*, product_images(image_url, is_primary), shops(shop_name)')
      .eq('is_active', true);

    if (params.shop_id) query = query.eq('shop_id', params.shop_id);
    if (params.gender) query = query.eq('gender', params.gender);
    if (params.max_price) query = query.lte('base_price', params.max_price);
    if (params.max_delivery_mins) query = query.lte('delivery_mins', params.max_delivery_mins);
    if (params.q) query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((p: any) => ({
      ...p,
      shop_name: p.shops?.shop_name,
      images: p.product_images?.map((img: any) => img.image_url) || [],
    }));
  } catch (err) {
    console.error('Error searching products:', err);
    return [];
  }
}

export async function fetchShopProducts(shopId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(image_url)')
    .eq('shop_id', shopId)
    .eq('is_active', true);
  return (data || []).map((p: any) => ({ ...p, images: p.product_images?.map((i: any) => i.image_url) || [] }));
}

export async function fetchShopInventory(shopId: string) {
  const prods = await fetchShopProducts(shopId);
  const prodIds = prods.map(p => p.id);
  if (!prodIds.length) return [];
  const { data } = await supabase.from('inventory').select('*').in('product_id', prodIds);
  return data || [];
}

export async function addProduct(productData: Omit<Product, 'id'>) {
  const { data: newProd, error } = await supabase.from('products').insert(productData).select().single();
  if (error) throw error;

  const sizes = (productData as any).sizes || ['M'];
  const colors = (productData as any).colors || ['Default'];
  const inventoryRows = sizes.flatMap((sz: string) =>
    colors.map((col: string) => ({
      product_id: newProd.id,
      size: sz,
      color: col,
      stock_quantity: 10,
      sku: `SKU-${newProd.id.slice(0, 5)}-${sz}-${col}`,
    }))
  );
  await supabase.from('inventory').insert(inventoryRows);
  return newProd;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  return !error;
}

// ====================================================================
// ORDER & WORKFLOW API
// ====================================================================
export async function createOrder(orderPayload: {
  customer_id: string;
  customer_name: string;
  shop_id: string;
  shop_name: string;
  delivery_address: string;
  total_amount: number;
  discount_amount: number;
  delivery_fee: number;
  net_amount: number;
  items: Array<{ product: Product; size: string; color: string; quantity: number }>;
}): Promise<Order> {
  const orderNumber = `TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const otpCode = `${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: newOrder, error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_id: orderPayload.customer_id,
    customer_name: orderPayload.customer_name,
    shop_id: orderPayload.shop_id,
    shop_name: orderPayload.shop_name,
    delivery_address: orderPayload.delivery_address,
    total_amount: orderPayload.total_amount,
    discount_amount: orderPayload.discount_amount,
    delivery_fee: orderPayload.delivery_fee,
    net_amount: orderPayload.net_amount,
    status: 'pending_shop_acceptance',
    payment_status: 'paid',
    otp_code: otpCode,
    estimated_delivery_time: '25 mins',
    items_count: orderPayload.items.reduce((a, b) => a + b.quantity, 0),
  }).select().single();

  if (error) throw error;

  const orderItems = orderPayload.items.map(item => ({
    order_id: newOrder.id,
    product_id: item.product.id,
    product_name: item.product.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.product.discount_price || item.product.base_price,
    subtotal: (item.product.discount_price || item.product.base_price) * item.quantity,
  }));
  await supabase.from('order_items').insert(orderItems);

  await supabase.from('notifications').insert({
    user_id: orderPayload.shop_id,
    title: '🔔 New Order Received!',
    message: `Order #${orderNumber} from ${orderPayload.customer_name} requires shop acceptance. Total: ₹${orderPayload.net_amount}`,
    type: 'new_order',
  });

  return newOrder;
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
  return data || [];
}

export async function fetchShopOrders(shopId: string): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').eq('shop_id', shopId).order('created_at', { ascending: false });
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  const { data: updated, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
  if (error || !updated) return null;

  if (status === 'preparing') {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    for (const item of items || []) {
      const { data: invList } = await supabase.from('inventory').select('*').eq('product_id', item.product_id).eq('size', item.size);
      if (invList?.[0]) {
        await supabase.from('inventory').update({ stock_quantity: Math.max(0, invList[0].stock_quantity - item.quantity) }).eq('id', invList[0].id);
      }
    }
    await supabase.from('notifications').insert({ user_id: updated.customer_id, title: '🎉 Order Accepted!', message: `Shop ${updated.shop_name} accepted Order #${updated.order_number}.`, type: 'order_accepted' });
  }

  if (status === 'cancelled') {
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    for (const item of items || []) {
      const { data: invList } = await supabase.from('inventory').select('*').eq('product_id', item.product_id).eq('size', item.size);
      if (invList?.[0]) {
        await supabase.from('inventory').update({ stock_quantity: invList[0].stock_quantity + item.quantity }).eq('id', invList[0].id);
      }
    }
    await supabase.from('notifications').insert({ user_id: updated.customer_id, title: '❌ Order Cancelled', message: `Order #${updated.order_number} was cancelled.`, type: 'order_cancelled' });
  }

  if (status === 'ready_for_pickup') {
    await supabase.from('notifications').insert({ user_id: 'all_delivery_partners', title: '⚡ Order Ready for Pickup!', message: `Order #${updated.order_number} at ${updated.shop_name} is ready.`, type: 'ready_for_pickup' });
  }

  return updated;
}

// ====================================================================
// DELIVERY PARTNER WORKFLOW API
// ====================================================================
export async function fetchAvailableDeliveryOrders(): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').in('status', ['ready_for_pickup', 'preparing']).is('delivery_partner_id', null);
  return data || [];
}

export async function acceptDeliveryOrder(orderId: string, deliveryPartner: { id: string; name: string; phone: string; vehicle: string }) {
  const { data: updated, error } = await supabase.from('orders').update({ delivery_partner_id: deliveryPartner.id, status: 'assigned' }).eq('id', orderId).select().single();
  if (error || !updated) return null;

  await supabase.from('delivery_tracking').insert({
    order_id: updated.id,
    order_number: updated.order_number,
    driver_name: deliveryPartner.name,
    driver_phone: deliveryPartner.phone,
    vehicle_number: deliveryPartner.vehicle,
    driver_lat: 28.618,
    driver_lng: 77.21,
    shop_lat: 28.6315,
    shop_lng: 77.2167,
    customer_lat: 28.5562,
    customer_lng: 77.2066,
    estimated_minutes: 18,
    otp_code: updated.otp_code || '4829',
    status: 'assigned',
  });

  await supabase.from('notifications').insert({ user_id: updated.customer_id, title: '🛵 Rider Assigned!', message: `${deliveryPartner.name} assigned to Order #${updated.order_number}.`, type: 'delivery_assigned' });
  return updated;
}

export async function markOrderPickedUp(orderId: string) {
  const { data: updated } = await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('id', orderId).select().single();
  await supabase.from('delivery_tracking').update({ status: 'out_for_delivery' }).eq('order_id', orderId);
  if (updated) {
    await supabase.from('notifications').insert({ user_id: updated.customer_id, title: '🚚 Out for Delivery!', message: `Order #${updated.order_number} is en-route.`, type: 'out_for_delivery' });
  }
  return updated;
}

export async function verifyDeliveryOTP(orderId: string, otp: string) {
  const { data: orders } = await supabase.from('orders').select('*').or(`id.eq.${orderId},order_number.eq.${orderId}`);
  if (!orders?.length) return { success: false, message: '❌ Order not found.' };

  const targetOrder = orders[0];
  if (targetOrder.otp_code !== otp) return { success: false, message: '❌ Invalid OTP code.' };

  await supabase.from('orders').update({ status: 'delivered', payment_status: 'paid' }).eq('id', targetOrder.id);
  await supabase.from('delivery_tracking').update({ status: 'delivered', estimated_minutes: 0 }).eq('order_id', targetOrder.id);
  await supabase.from('notifications').insert({ user_id: targetOrder.customer_id, title: '✅ Order Delivered!', message: `Order #${targetOrder.order_number} delivered successfully!`, type: 'delivered' });

  return { success: true, message: '🎉 OTP Verified! Order marked as delivered.' };
}

export async function getLiveTracking(orderId: string): Promise<DeliveryTracking | null> {
  const { data } = await supabase.from('delivery_tracking').select('*').or(`order_id.eq.${orderId},order_number.eq.${orderId}`).maybeSingle();
  return data || null;
}

export async function generateAIDescription(data: { title: string; category: string; gender: string; material?: string }) {
  return {
    generated_description: `Step out in confidence with ${data.title}. Tailored from ${data.material || '100% Premium Cotton'} with modern fit for instant 30-min express delivery from nearby stores.`,
    suggested_tags: [data.category.toLowerCase(), data.gender.toLowerCase(), 'hyperlocal-express'],
    seo_title: `${data.title} - Hyperlocal Express | TrendKart`,
  };
}
