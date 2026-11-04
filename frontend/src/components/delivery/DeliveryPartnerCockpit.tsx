"use client";

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Navigation, 
  ToggleLeft, 
  ToggleRight,
  CheckCircle,
  AlertCircle,
  Wallet,
  Calendar,
  Star,
  User as UserIcon,
  Settings as SettingsIcon,
  Package,
  TrendingUp
} from 'lucide-react';
import { LiveGPSMapVisualizer } from './LiveGPSMapVisualizer';
import { fetchAvailableDeliveryOrders, acceptDeliveryOrder, markOrderPickedUp, verifyDeliveryOTP, getLiveTracking } from '@/lib/api';
import { useRole } from '@/context/RoleContext';
import { Order, DeliveryTracking } from '@/types';
import { supabase } from '@/lib/supabase';

export type DeliveryTab = 
  | 'available_orders'
  | 'accepted_orders'
  | 'navigation'
  | 'wallet'
  | 'daily_earnings'
  | 'weekly_earnings'
  | 'monthly_earnings'
  | 'ratings'
  | 'profile'
  | 'settings';

export const DeliveryPartnerCockpit: React.FC = () => {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<DeliveryTab>('available_orders');
  const [isOnline, setIsOnline] = useState(true);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeTracking, setActiveTracking] = useState<DeliveryTracking | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState(0.0);
  const [completedCount, setCompletedCount] = useState(0);

  const loadDeliveryData = async () => {
    const available = await fetchAvailableDeliveryOrders();
    setAvailableOrders(available);

    if (!user) {
      setAvailableOrders([]);
      setActiveOrder(null);
      setActiveTracking(null);
      return;
    }

    const { data: myCompleted } = await supabase.from('orders').select('*').eq('delivery_partner_id', user.id).eq('status', 'delivered');
    setCompletedCount(myCompleted?.length || 0);
    setDailyEarnings((myCompleted?.length || 0) * 95);

    const { data: myAccepted } = await supabase.from('orders').select('*').eq('delivery_partner_id', user.id).not('status', 'in', '("delivered","cancelled")');
    if (myAccepted?.length) {
      setActiveOrder(myAccepted[0]);
      const track = await getLiveTracking(myAccepted[0].id);
      setActiveTracking(track);
    } else {
      setActiveOrder(null);
      setActiveTracking(null);
    }
  };

  useEffect(() => {
    loadDeliveryData();

    const channel = supabase
      .channel('delivery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadDeliveryData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAcceptOrder = async (order: Order) => {
    if (!user) return;
    const driverInfo = {
      id: user.id,
      name: user.full_name || "Express Partner",
      phone: user.phone || "",
      vehicle: "Electric Scooter"
    };

    const assigned = await acceptDeliveryOrder(order.id, driverInfo);
    if (assigned) {
      setActiveOrder(assigned);
      setActiveTab('accepted_orders');
      loadDeliveryData();
    }
  };

  const handleMarkPickedUp = async () => {
    if (!activeOrder) return;
    const updated = await markOrderPickedUp(activeOrder.id);
    if (updated) {
      setActiveOrder(updated);
      loadDeliveryData();
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!activeOrder) return { success: false, message: "No active delivery" };
    const res = await verifyDeliveryOTP(activeOrder.id, otp);
    if (res.success) {
      setDailyEarnings(prev => prev + 95);
      setCompletedCount(prev => prev + 1);
      setActiveOrder(null);
      setActiveTab('available_orders');
      loadDeliveryData();
    }
    return res;
  };

  const deliveryNavTabs: { id: DeliveryTab; label: string; icon: any }[] = [
    { id: 'available_orders', label: 'Available Orders', icon: Package },
    { id: 'accepted_orders', label: 'Accepted Orders', icon: CheckCircle },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'daily_earnings', label: 'Daily Earnings', icon: DollarSign },
    { id: 'weekly_earnings', label: 'Weekly Earnings', icon: Calendar },
    { id: 'monthly_earnings', label: 'Monthly Earnings', icon: TrendingUp },
    { id: 'ratings', label: 'Ratings', icon: Star },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Driver Status Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
              alt={user?.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">{user?.full_name || 'Delivery Partner'}</h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                KYC Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.phone || 'Electric Vehicle Partner'}</p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">
          <span className="text-xs font-bold text-slate-300">{isOnline ? 'Online (Receiving Requests)' : 'Offline'}</span>
          <button onClick={() => setIsOnline(!isOnline)} className="text-rose-500">
            {isOnline ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Delivery Navigation Bar */}
      <div className="bg-slate-100 dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {deliveryNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'available_orders' && availableOrders.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                    {availableOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* EARNINGS SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Today's Earnings</span>
          <span className="text-2xl font-black text-emerald-500">₹{dailyEarnings}</span>
          <span className="text-[10px] text-slate-500 block">{completedCount} Deliveries Completed</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Weekly Wallet Balance</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">₹{dailyEarnings}</span>
          <span className="text-[10px] text-rose-500 font-semibold cursor-pointer block">Withdraw to Bank →</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Driver Rating</span>
          <span className="text-2xl font-black text-amber-500">5.0 / 5.0</span>
          <span className="text-[10px] text-emerald-500 block">Verified Express Partner</span>
        </div>
      </div>

      {/* AVAILABLE ORDERS TAB VIEW */}
      {activeTab === 'available_orders' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Package className="w-4 h-4 text-emerald-500 mr-2" /> Nearby Orders Ready for Pickup ({availableOrders.length})
          </h3>

          {availableOrders.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No delivery requests available.
            </div>
          ) : (
            availableOrders.map(order => (
              <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Order #{order.order_number}</span>
                  <p className="text-[11px] text-slate-400">Pickup: {order.shop_name} • Payout: ₹95</p>
                  <p className="text-[10px] text-slate-500">Deliver to: {order.customer_name} ({order.delivery_address})</p>
                </div>
                <button 
                  onClick={() => handleAcceptOrder(order)} 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow active:scale-95 transition"
                >
                  Accept Dispatch
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ACCEPTED ORDERS & NAVIGATION TAB VIEW */}
      {(activeTab === 'accepted_orders' || activeTab === 'navigation') && (
        activeOrder && isOnline ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-rose-500/10 p-4 rounded-2xl border border-rose-500/30 text-rose-500 text-xs font-bold">
              <div>
                <span className="flex items-center text-sm font-black">
                  <Truck className="w-4 h-4 mr-2 animate-bounce" /> Active Dispatch Order: #{activeOrder.order_number}
                </span>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">Status: <span className="uppercase font-bold text-rose-500">{activeOrder.status.replace(/_/g, ' ')}</span></p>
              </div>

              {activeOrder.status === 'assigned' && (
                <button onClick={handleMarkPickedUp} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow">
                  Click 'Picked Up' From Shop
                </button>
              )}
            </div>

            {activeTracking && (
              <LiveGPSMapVisualizer
                trackingData={activeTracking}
                onVerifyOTP={(otp) => handleVerifyOTP(otp)}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-100 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
            <p>No active delivery in progress. Toggle online status to receive nearby shop order dispatches!</p>
          </div>
        )
      )}

      {/* WALLET TAB VIEW */}
      {activeTab === 'wallet' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Wallet className="w-4 h-4 text-emerald-500 mr-2" /> Driver Wallet Balance & Withdrawals
          </h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-slate-400 block">Available Cash Balance</span>
              <span className="text-2xl font-black text-emerald-500">₹{dailyEarnings}.00</span>
            </div>
            <button className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">Instant Cashout to UPI</button>
          </div>
        </div>
      )}

      {/* DAILY / WEEKLY / MONTHLY EARNINGS VIEWS */}
      {(activeTab === 'daily_earnings' || activeTab === 'weekly_earnings' || activeTab === 'monthly_earnings') && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-2" />
            {activeTab === 'daily_earnings' ? "Today's Earnings Breakdown" : activeTab === 'weekly_earnings' ? "Weekly Income History" : "Monthly Earnings Log"}
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between">
              <span>Express Delivery Dispatches ({completedCount} Trips)</span>
              <span className="font-bold text-emerald-500">₹{dailyEarnings}</span>
            </div>
          </div>
        </div>
      )}

      {/* RATINGS TAB VIEW */}
      {activeTab === 'ratings' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Star className="w-4 h-4 text-amber-500 mr-2" /> Customer Ratings & Reviews
          </h3>
          <p className="text-xs text-slate-400 py-6 text-center">No ratings yet.</p>
        </div>
      )}

      {/* PROFILE TAB VIEW */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-center max-w-xl mx-auto">
          <img src={user?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"} alt={user?.full_name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-rose-500 shadow-md" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name || 'Delivery Partner'}</h3>
          <p className="text-xs text-slate-500">{user?.email || ''}</p>
          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase mt-2 inline-block">KYC Verified Rider</span>
        </div>
      )}

      {/* SETTINGS TAB VIEW */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-xl mx-auto text-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <SettingsIcon className="w-5 h-5 text-slate-500 mr-2" /> Rider Duty & Vehicle Settings
          </h3>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
            <span>Vehicle: TVS iQube Electric Scooter (DL 01 EX 9921)</span>
            <button className="text-rose-500 font-bold">Edit</button>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
            <span>Audio Dispatch Alerts</span>
            <span className="text-emerald-500 font-bold">Enabled</span>
          </div>
        </div>
      )}
    </div>
  );
};
