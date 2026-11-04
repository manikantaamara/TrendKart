export type UserRole = 'customer' | 'shop_owner' | 'delivery_partner' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  store_name?: string;
  address?: string;
  city?: string;
  pincode?: string;
  vehicle_info?: string;
  gst_number?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  gst_number?: string;
  rating: number;
  total_ratings: number;
  is_verified: boolean;
  is_active: boolean;
  distance_km?: number;
  estimated_delivery_mins?: number;
  logo_url?: string;
  banner_url?: string;
}

export interface Product {
  id: string;
  shop_id: string;
  shop_name: string;
  name: string;
  slug: string;
  category_id?: number;
  category_name?: string;
  brand_name?: string;
  description: string;
  gender: string;
  base_price: number;
  discount_price?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  in_stock: boolean;
  ai_generated_desc?: string;
  rating?: number;
  distance_km?: number;
  delivery_mins?: number;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  shop_id: string;
  shop_name: string;
  customer_id: string;
  customer_name: string;
  delivery_partner_id?: string;
  delivery_address: string;
  total_amount: number;
  discount_amount: number;
  delivery_fee: number;
  net_amount: number;
  status: 'pending_shop_acceptance' | 'preparing' | 'ready_for_pickup' | 'assigned' | 'out_for_delivery' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  otp_code: string;
  estimated_delivery_time: string;
  items_count: number;
  created_at: string;
}

export interface DeliveryTracking {
  order_id: string;
  order_number: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  driver_lat: number;
  driver_lng: number;
  shop_lat: number;
  shop_lng: number;
  customer_lat: number;
  customer_lng: number;
  estimated_minutes: number;
  otp_code: string;
  status: string;
}

export interface AIOutfitRecommendation {
  outfit_name: string;
  match_score: number;
  reasoning: string;
  items: {
    type: string;
    name: string;
    price: number;
    shop: string;
  }[];
}
