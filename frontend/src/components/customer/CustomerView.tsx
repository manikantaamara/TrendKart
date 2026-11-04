"use client";

import React, { useState, useEffect } from 'react';
import { Product, Shop, Order, DeliveryTracking } from '@/types';
import { fetchNearbyShops, searchProducts, fetchCustomerOrders, getLiveTracking, verifyDeliveryOTP } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useRole } from '@/context/RoleContext';
import { LiveGPSMapVisualizer } from '@/components/delivery/LiveGPSMapVisualizer';
import { supabase } from '@/lib/supabase';
import { 
  Store, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Check, 
  Star, 
  Filter,
  CreditCard,
  Truck,
  ShieldCheck,
  Tag,
  Search as SearchIcon,
  Grid,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
  Package,
  Percent
} from 'lucide-react';

interface CustomerViewProps {
  searchQuery?: string;
}

export type CustomerTab = 
  | 'home'
  | 'search'
  | 'categories'
  | 'nearby_shops'
  | 'offers'
  | 'wishlist'
  | 'cart'
  | 'orders'
  | 'track_order'
  | 'notifications'
  | 'profile'
  | 'settings';

export const CustomerView: React.FC<CustomerViewProps> = ({ searchQuery }) => {
  const { user } = useRole();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [activeTracking, setActiveTracking] = useState<DeliveryTracking | null>(null);
  const [notificationsList, setNotificationsList] = useState<Array<{ id: string; title: string; message: string; created_at?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'express' | 'ethnic' | 'formal'>('all');
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const { cart, addToCart, removeFromCart, updateQuantity, subtotal, discountAmount, deliveryFee, netTotal, appliedCoupon, applyCoupon, checkout, wishlist, toggleWishlist } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [latestPlacedOrderId, setLatestPlacedOrderId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const shopData = await fetchNearbyShops(searchQuery || localSearch);
    const prodData = await searchProducts({ q: searchQuery || localSearch });
    setShops(shopData);
    setProducts(prodData);

    if (user) {
      const orders = await fetchCustomerOrders(user.id);
      setCustomerOrders(orders);
    } else {
      setCustomerOrders([]);
    }

    const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    setNotificationsList(notifs || []);

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to Supabase Realtime changes
    const channel = supabase
      .channel('customer-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery, localSearch, user]);

  useEffect(() => {
    async function loadTracking() {
      const targetId = latestPlacedOrderId || customerOrders[0]?.id;
      if (!targetId) {
        setActiveTracking(null);
        return;
      }
      const track = await getLiveTracking(targetId);
      setActiveTracking(track);
    }
    loadTracking();
  }, [latestPlacedOrderId, customerOrders]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponMsg("🎉 Coupon TREND300 applied! ₹300 saved.");
    } else {
      setCouponMsg("❌ Invalid code. Try 'TREND300' or 'INSTANT50'");
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setOrderPlaced(true);
    const created = await checkout(user);

    if (created) {
      setLatestPlacedOrderId(created.id);
    }

    setTimeout(() => {
      setOrderPlaced(false);
      loadData();
      setActiveTab('track_order');
    }, 1200);
  };

  const filteredProducts = products.filter(p => {
    if (activeCategoryFilter === 'express') return (p.delivery_mins || 30) <= 30;
    if (activeCategoryFilter === 'ethnic') return p.category_name?.includes('Ethnic') || p.slug.includes('kurta');
    if (activeCategoryFilter === 'formal') return p.category_name?.includes('Men') || p.slug.includes('blazer');
    return true;
  });

  const customerNavTabs: { id: CustomerTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Store },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'nearby_shops', label: 'Nearby Shops', icon: MapPin },
    { id: 'offers', label: 'Offers', icon: Percent },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'cart', label: 'Cart', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'track_order', label: 'Track Order', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Customer Dashboard Navigation Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {customerNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'cart' && cart.length > 0 && (
                  <span className="bg-white text-rose-500 text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                    {cart.length}
                  </span>
                )}
                {tab.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                    {wishlist.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HOME TAB VIEW */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-rose-950 text-white p-8 border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Hyperlocal Express • 30 Mins Guaranteed
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Shop High-Street Fashion From <span className="gradient-text-brand">Nearby Boutiques</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect with stores within 5km in Connaught Place & South Delhi. Try outfits at home with doorstep size exchange and instant local delivery.
              </p>
              <div className="flex flex-wrap gap-2 text-xs pt-2">
                <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">✨ Festival Offers</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">🏷️ Flat ₹300 Off (TREND300)</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">⚡ Instant Driver Dispatch</span>
              </div>
            </div>
          </div>

          {/* Nearby Stores Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
                  <Store className="w-5 h-5 text-rose-500 mr-2" /> Verified Nearby Clothing Stores
                </h3>
                <p className="text-xs text-slate-500">Delivering within 25 - 45 minutes to your location</p>
              </div>
              <button onClick={() => setActiveTab('nearby_shops')} className="text-xs font-bold text-rose-500 hover:underline">
                View All Stores →
              </button>
            </div>

            {shops.length === 0 ? (
              <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
                No nearby shops found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shops.map(shop => (
                  <div 
                    key={shop.id} 
                    className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition group"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img src={shop.banner_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80"} alt={shop.shop_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                        <Clock className="w-3 h-3 text-emerald-400 mr-1" /> {shop.estimated_delivery_mins} mins
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{shop.shop_name}</h4>
                        <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-500 mr-1" /> {shop.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{shop.description}</p>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="flex items-center"><MapPin className="w-3 h-3 text-rose-500 mr-1" /> {shop.distance_km} km away</span>
                        <span className="text-emerald-500 font-semibold">Open Now</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Filter Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-4 py-2 rounded-xl transition ${activeCategoryFilter === 'all' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              All Nearby Items
            </button>
            <button
              onClick={() => setActiveCategoryFilter('express')}
              className={`px-4 py-2 rounded-xl transition flex items-center ${activeCategoryFilter === 'express' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              <Clock className="w-3.5 h-3.5 mr-1" /> Under 30-Min Delivery
            </button>
            <button
              onClick={() => setActiveCategoryFilter('ethnic')}
              className={`px-4 py-2 rounded-xl transition ${activeCategoryFilter === 'ethnic' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Festival & Ethnic
            </button>
            <button
              onClick={() => setActiveCategoryFilter('formal')}
              className={`px-4 py-2 rounded-xl transition ${activeCategoryFilter === 'formal' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Suits & Blazers
            </button>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
              No products available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                      
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center">
                        <Clock className="w-3 h-3 text-emerald-400 mr-1" /> {product.delivery_mins || 25} min delivery
                      </span>

                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 text-rose-500 p-2 rounded-full shadow-md hover:scale-110 transition"
                      >
                        <Heart className="w-4 h-4 fill-rose-500/20" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">{product.shop_name}</span>
                        <span className="text-slate-400">{product.gender}</span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-3">
                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">₹{product.discount_price || product.base_price}</span>
                        {product.discount_price && (
                          <span className="text-xs text-slate-400 line-through ml-2">₹{product.base_price}</span>
                        )}
                      </div>
                      <span className="text-xs text-emerald-500 font-bold">In Stock</span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 transition active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag (30-Min Delivery)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEARCH TAB VIEW */}
      {activeTab === 'search' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <SearchIcon className="w-5 h-5 text-rose-500 mr-2" /> Search Nearby Stores & Fashion Items
            </h3>
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search linen shirts, silk sarees, blazers, zara, Connaught Place..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-2xl" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{product.name}</h4>
                <p className="text-xs text-slate-500">{product.shop_name}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-rose-500">₹{product.discount_price || product.base_price}</span>
                  <button onClick={() => addToCart(product)} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl">Add to Bag</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB VIEW */}
      {activeTab === 'categories' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <Grid className="w-5 h-5 text-purple-500 mr-2" /> Explore Local Fashion Categories
          </h3>
          {Array.from(new Set(products.map(p => p.category_name).filter(Boolean))).length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from(new Set(products.map(p => p.category_name).filter(Boolean))).map((catName, idx) => {
                const catProds = products.filter(p => p.category_name === catName);
                return (
                  <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-3 space-y-2 hover:shadow-xl transition cursor-pointer">
                    <img src={catProds[0]?.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80"} alt={catName!} className="w-full h-32 object-cover rounded-xl" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{catName}</h4>
                    <span className="text-[10px] text-slate-400 block">{catProds.length} items</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NEARBY SHOPS TAB VIEW */}
      {activeTab === 'nearby_shops' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
              <MapPin className="w-5 h-5 text-rose-500 mr-2" /> Verified Local Boutiques (Connaught Place)
            </h3>
            <span className="text-xs text-emerald-500 font-bold">{shops.length} Active Stores Delivering Now</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {shops.map(shop => (
              <div key={shop.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <img src={shop.banner_url} alt={shop.shop_name} className="w-full h-40 object-cover rounded-2xl" />
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-base text-slate-900 dark:text-white">{shop.shop_name}</h4>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">★ {shop.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500">{shop.description}</p>
                  <p className="text-xs text-slate-400 font-medium">📍 {shop.address}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-emerald-500 font-bold">⚡ Delivery in {shop.estimated_delivery_mins} Mins</span>
                  <button onClick={() => setActiveTab('home')} className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl">View Store Items</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OFFERS TAB VIEW */}
      {activeTab === 'offers' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <Percent className="w-5 h-5 text-amber-500 mr-2" /> Exclusive Hyperlocal Discount Coupons
          </h3>
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white space-y-3 shadow-xl">
              <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">FLAT ₹300 OFF</span>
              <h4 className="text-2xl font-black">Use Code: TREND300</h4>
              <p className="text-xs text-white/90">Valid on orders above ₹1,499 from any local boutique store in Connaught Place.</p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 text-white space-y-3 shadow-xl">
              <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">FREE EXPRESS DELIVERY</span>
              <h4 className="text-2xl font-black">Use Code: INSTANT50</h4>
              <p className="text-xs text-white/90">Zero delivery charge on 30-minute express doorstep dispatches!</p>
            </div>
          </div>
        </div>
      )}

      {/* WISHLIST TAB VIEW */}
      {activeTab === 'wishlist' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <Heart className="w-5 h-5 text-rose-500 mr-2" /> Your Saved Wishlist ({wishlist.length})
          </h3>
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs glass-card rounded-3xl">
              No saved items in your wishlist yet. Click the heart icon on products to save them!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div key={item.id} className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <img src={item.images[0]} alt={item.name} className="w-full h-36 object-cover rounded-xl" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-500 text-xs">₹{item.discount_price || item.base_price}</span>
                    <button onClick={() => addToCart(item)} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl">Move to Bag</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CART TAB VIEW */}
      {activeTab === 'cart' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingBag className="w-5 h-5 text-rose-500 mr-2" /> Your Hyperlocal Bag Items
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Your shopping bag is empty. Add items from nearby stores!
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.product.name}</h4>
                        <p className="text-[11px] text-slate-500">{item.product.shop_name} • Size: {item.size}</p>
                        <span className="text-xs font-bold text-rose-500 mt-1 block">₹{item.product.discount_price || item.product.base_price}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.color, -1)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold">-</button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.color, 1)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold">+</button>
                      <button onClick={() => removeFromCart(item.product.id, item.size, item.color)} className="text-xs text-rose-500 ml-2">Remove</button>
                    </div>
                  </div>
                ))}

                {/* Coupon Code Section */}
                <form onSubmit={handleApplyCoupon} className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (e.g. TREND300)"
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl">Apply</button>
                </form>
                {couponMsg && <p className="text-xs font-semibold text-rose-500">{couponMsg}</p>}

                {/* Bill Breakdown */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Local Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Hyperlocal Driver Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Net Total</span>
                    <span>₹{netTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={orderPlaced}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-xl shadow-rose-500/25 transition active:scale-95"
                >
                  {orderPlaced ? (
                    <span>Creating Supabase Order & Dispatching Local Driver...</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{netTotal} via Razorpay / UPI Express</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDERS TAB VIEW */}
      {activeTab === 'orders' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <Package className="w-5 h-5 text-indigo-500 mr-2" /> Recent Orders & Realtime Fulfillment History ({customerOrders.length})
          </h3>
          
          {customerOrders.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
              No orders placed yet. Add items to your bag and experience 30-minute doorstep delivery!
            </div>
          ) : (
            customerOrders.map(order => (
              <div key={order.id} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Order #{order.order_number}</span>
                    <p className="text-[11px] text-slate-400">{order.shop_name} • OTP: <span className="font-bold text-amber-500">{order.otp_code}</span></p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-500 animate-pulse'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Total Amount ({order.items_count} items)</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{order.net_amount}</span>
                </div>
                <button onClick={() => { setLatestPlacedOrderId(order.id); setActiveTab('track_order'); }} className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl">
                  Track Live Rider GPS →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TRACK ORDER TAB VIEW */}
      {activeTab === 'track_order' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {activeTracking ? (
            <LiveGPSMapVisualizer
              trackingData={activeTracking}
              onVerifyOTP={(otp) => verifyDeliveryOTP(activeTracking.order_id, otp)}
            />
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
              No active order to track.
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TAB VIEW */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
            <Bell className="w-5 h-5 text-amber-500 mr-2" /> Order & Promotion Alerts ({notificationsList.length})
          </h3>
          {notificationsList.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-3xl">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notificationsList.map((notif, idx) => (
                <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-xs text-slate-500">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB VIEW */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <img src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={user?.full_name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-rose-500 shadow-md" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name || 'Customer'}</h3>
              <p className="text-xs text-slate-500">{user?.email || ''}</p>
              <span className="bg-rose-500/10 text-rose-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase mt-2 inline-block">Customer Account</span>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB VIEW */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <SettingsIcon className="w-5 h-5 text-slate-500 mr-2" /> Account & App Preferences
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span>Default Delivery Address: Connaught Place, New Delhi</span>
                <button className="text-rose-500 font-bold">Edit</button>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span>Push & Order Notifications</span>
                <span className="text-emerald-500 font-bold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
