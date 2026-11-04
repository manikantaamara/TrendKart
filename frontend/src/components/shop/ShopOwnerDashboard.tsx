"use client";

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Package, 
  TrendingUp, 
  Plus, 
  Barcode, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Layers,
  Image as ImageIcon,
  Users,
  Percent,
  Tag,
  Star,
  CreditCard,
  User as UserIcon,
  Settings as SettingsIcon,
  ShoppingBag,
  BarChart3,
  Trash2,
  Edit
} from 'lucide-react';
import { AIProductGeneratorModal } from './AIProductGeneratorModal';
import { AIBackgroundRemoverCanvas } from './AIBackgroundRemoverCanvas';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useRole } from '@/context/RoleContext';
import { Product, Order, Shop } from '@/types';
import { fetchShopProducts, fetchShopOrders, updateOrderStatus, addProduct, deleteProduct } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const SALES_DATA: { day: string; sales: number }[] = [];

export type ShopOwnerTab = 
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'analytics'
  | 'revenue'
  | 'offers'
  | 'coupons'
  | 'reviews'
  | 'payouts'
  | 'profile'
  | 'settings';

export const ShopOwnerDashboard: React.FC = () => {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<ShopOwnerTab>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // Supabase Data State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Men Fashion');
  const [productDesc, setProductDesc] = useState('');
  const [productGender, setProductGender] = useState('Men');
  const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');

  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const shopId = currentShop?.id || user?.id || '';

  const loadShopData = async () => {
    setLoading(true);
    if (user) {
      const { data: shopData } = await supabase.from('shops').select('*').eq('owner_id', user.id).maybeSingle();
      setCurrentShop(shopData);
      const sid = shopData?.id || user.id;
      const prods = sid ? await fetchShopProducts(sid) : [];
      const ords = sid ? await fetchShopOrders(sid) : [];
      setProductsList(prods);
      setOrdersList(ords);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadShopData();
    const channel = supabase
      .channel('shop-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadShopData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadShopData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice) return;

    await addProduct({
      shop_id: shopId,
      shop_name: currentShop?.shop_name || user?.full_name || "Boutique Store",
      name: productName,
      slug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_name: productCategory,
      description: productDesc || `${productName} crafted with premium quality for instant 30-min doorstep delivery.`,
      gender: productGender,
      base_price: Number(productPrice),
      discount_price: Number(productPrice),
      images: [productImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Olive Green", "Black"],
      in_stock: true,
      delivery_mins: 25
    });

    setShowAddModal(false);
    setProductName('');
    setProductPrice('');
    setProductDesc('');
    loadShopData();
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    loadShopData();
  };

  const handleAcceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'preparing');
    loadShopData();
  };

  const handleRejectOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled', 'Shop declined order due to stock unavailability.');
    loadShopData();
  };

  const handleMarkReadyForPickup = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready_for_pickup');
    loadShopData();
  };

  const handleSimulateBarcodeScan = () => {
    const randomBarcode = `890123456${Math.floor(1000 + Math.random() * 9000)}`;
    setScannedBarcode(randomBarcode);
  };

  // Calculate Realtime Dashboard Metrics
  const pendingOrders = ordersList.filter(o => o.status === 'pending_shop_acceptance');
  const preparingOrders = ordersList.filter(o => o.status === 'preparing');
  const readyOrders = ordersList.filter(o => o.status === 'ready_for_pickup');
  const completedOrders = ordersList.filter(o => o.status === 'delivered');
  const todayRevenue = completedOrders.reduce((sum, o) => sum + (o.net_amount || 0), 0);

  const shopNavTabs: { id: ShopOwnerTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'offers', label: 'Offers', icon: Percent },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'payouts', label: 'Payouts', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <Store className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black">{currentShop?.shop_name || user?.full_name || 'My Boutique Store'}</h2>
              <p className="text-xs text-slate-400">GST: {currentShop?.gst_number || 'Registered'} • Hyperlocal Express Verified Store</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSimulateBarcodeScan}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl border border-slate-700 transition flex items-center space-x-2"
          >
            <Barcode className="w-4 h-4 text-emerald-400" />
            <span>Scan Barcode</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Item</span>
          </button>
        </div>
      </div>

      {scannedBarcode && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex justify-between items-center">
          <span>Barcode Scanned Successfully: {scannedBarcode}</span>
          <button onClick={() => setScannedBarcode(null)} className="text-xs underline">Clear</button>
        </div>
      )}

      {/* Shop Navigation Tab Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {shopNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'orders' && pendingOrders.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD & REVENUE OVERVIEW VIEW */}
      {(activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'revenue') && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Revenue</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{todayRevenue}</span>
              <span className="text-[11px] text-emerald-500 font-semibold block">↑ +18.4% vs yesterday</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Inventory</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{productsList.length} SKUs</span>
              <span className="text-[11px] text-purple-500 font-semibold block">In-Stock Verified</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Orders</span>
              <span className="text-2xl font-black text-rose-500">{pendingOrders.length} New Orders</span>
              <span className="text-[11px] text-rose-400 font-semibold block">Awaiting Acceptance</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Delivery Speed</span>
              <span className="text-2xl font-black text-emerald-500">24.2 Mins</span>
              <span className="text-[11px] text-emerald-400 font-semibold block">Hyperlocal Fast Badge</span>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <TrendingUp className="w-4 h-4 text-rose-500 mr-2" /> Weekly Sales Performance (₹)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_DATA}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* PRODUCTS & INVENTORY VIEW */}
      {(activeTab === 'dashboard' || activeTab === 'products' || activeTab === 'inventory') && (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <Package className="w-4 h-4 text-purple-500 mr-2" /> Shop Catalog & Stock Management ({productsList.length} Items)
            </h3>
            <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl shadow">
              + Add Item
            </button>
          </div>

          {productsList.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Your inventory is empty.</p>
              <p className="text-xs text-slate-500">Add your first product to start selling.</p>
              <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow">
                + Upload New Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {productsList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <img src={item.images[0]} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{item.category_name || item.gender}</td>
                      <td className="p-3 font-bold text-emerald-500">₹{item.discount_price || item.base_price}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg font-bold">
                          In Stock
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => handleDeleteProduct(item.id)} className="text-rose-500 font-bold hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS WORKFLOW VIEW */}
      {(activeTab === 'dashboard' || activeTab === 'orders') && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <ShoppingBag className="w-4 h-4 text-indigo-500 mr-2" /> Incoming Customer Orders Workflow ({ordersList.length})
          </h3>

          {ordersList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders currently in workflow queue.</p>
          ) : (
            <div className="space-y-4">
              {ordersList.map(order => (
                <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Order #{order.order_number}</span>
                      <p className="text-[11px] text-slate-500">{order.customer_name} • {order.items_count} Item • ₹{order.net_amount}</p>
                      <p className="text-[10px] text-slate-400">📍 Delivery: {order.delivery_address}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      order.status === 'pending_shop_acceptance' ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                      order.status === 'preparing' ? 'bg-amber-500/10 text-amber-500' :
                      order.status === 'ready_for_pickup' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {order.status === 'pending_shop_acceptance' && (
                      <>
                        <button 
                          onClick={() => handleAcceptOrder(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Order & Reduce Stock</span>
                        </button>
                        <button 
                          onClick={() => handleRejectOrder(order.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Order</span>
                        </button>
                      </>
                    )}

                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => handleMarkReadyForPickup(order.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Mark READY FOR PICKUP (Dispatch Delivery Rider)</span>
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      <span className="text-xs text-purple-500 font-bold flex items-center">
                        ⚡ Order marked Ready! Searching nearby online delivery riders...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CUSTOMERS VIEW */}
      {activeTab === 'customers' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Users className="w-4 h-4 text-emerald-500 mr-2" /> Repeat Local Customers
          </h3>
          {ordersList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No customers yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {Array.from(new Set(ordersList.map(o => o.customer_name))).map((custName, idx) => {
                const custOrders = ordersList.filter(o => o.customer_name === custName);
                const spent = custOrders.reduce((acc, o) => acc + (o.net_amount || 0), 0);
                return (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{custName}</span>
                      <p className="text-[10px] text-slate-400">{custOrders.length} Orders</p>
                    </div>
                    <span className="text-emerald-500 font-bold">Total Spent: ₹{spent}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* OFFERS & COUPONS VIEW */}
      {(activeTab === 'offers' || activeTab === 'coupons') && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Tag className="w-4 h-4 text-rose-500 mr-2" /> Store Promotional Coupons
          </h3>
          <p className="text-xs text-slate-400 py-6 text-center">No active coupons.</p>
        </div>
      )}

      {/* REVIEWS VIEW */}
      {activeTab === 'reviews' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Star className="w-4 h-4 text-amber-500 mr-2" /> Store Rating & Customer Feedback
          </h3>
          <p className="text-xs text-slate-400 py-6 text-center">No reviews yet.</p>
        </div>
      )}

      {/* PAYOUTS VIEW */}
      {activeTab === 'payouts' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <CreditCard className="w-4 h-4 text-emerald-500 mr-2" /> Bank Settlement & Payouts
          </h3>
          <p className="text-xs text-slate-400 py-6 text-center">No payout history available.</p>
        </div>
      )}

      {/* PROFILE VIEW */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-center max-w-xl mx-auto">
          <img src={user?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"} alt={user?.full_name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-rose-500 shadow-md" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name || 'Shop Owner'}</h3>
          <p className="text-xs text-slate-500">{user?.email || ''}</p>
          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase mt-2 inline-block">Registered Shop Owner</span>
        </div>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-xl mx-auto text-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <SettingsIcon className="w-5 h-5 text-slate-500 mr-2" /> Store Operations & Delivery Radius
          </h3>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
            <span>Store Delivery Radius: 5.0 KM</span>
            <button className="text-rose-500 font-bold">Edit Radius</button>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
            <span>Automatic Driver Dispatch: Enabled</span>
            <span className="text-emerald-500 font-bold">Active</span>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <Plus className="w-5 h-5 text-rose-500 mr-2" /> Upload Item to Supabase Database
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Oversized Linen Shirt"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="1890"
                    className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Men Fashion">Men Fashion</option>
                    <option value="Women Fashion">Women Fashion</option>
                    <option value="Ethnic & Festival">Ethnic & Festival</option>
                    <option value="Formal Suiting">Formal Suiting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Product to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
