"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Store, 
  Truck, 
  Users, 
  TrendingUp, 
  Bell, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Order, Shop } from '@/types';

const PLATFORM_GTV: { month: string; gtv: number }[] = [];

export const AdminControlPanel: React.FC = () => {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  const [shopsList, setShopsList] = useState<Shop[]>([]);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);

  const loadAdminData = async () => {
    const [{ data: shops }, { data: drivers }, { data: orders }] = await Promise.all([
      supabase.from('shops').select('*'),
      supabase.from('delivery_partners').select('*'),
      supabase.from('orders').select('*'),
    ]);
    setShopsList(shops || []);
    setDriversList(drivers || []);
    setOrdersList(orders || []);
  };

  useEffect(() => {
    loadAdminData();
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, loadAdminData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, loadAdminData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const pendingShops = shopsList.filter(s => !s.is_verified);
  const pendingDrivers = driversList.filter(d => d.kyc_status === 'pending');

  const totalGTV = ordersList.reduce((sum, o) => sum + (o.net_amount || 0), 0);
  const platformCommission = Math.round(totalGTV * 0.10);

  const handleApproveShop = async (id: string) => {
    await supabase.from('shops').update({ is_verified: true }).eq('id', id);
    loadAdminData();
  };

  const handleApproveDriver = async (id: string) => {
    await supabase.from('delivery_partners').update({ kyc_status: 'verified' }).eq('id', id);
    loadAdminData();
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    await supabase.from('notifications').insert({ user_id: 'all_users', title: broadcastTitle, message: broadcastMessage, type: 'broadcast' });
    setBroadcastSuccess('🚀 Push notification broadcasted live to all active platform users via Supabase!');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black">TrendKart Admin Governance & Commission Panel</h2>
            <p className="text-xs text-slate-400">Supabase Platform Analytics • Merchant Approvals • Driver KYC Log</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total GTV (Gross Transaction)</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalGTV.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-emerald-500 font-semibold block">Realtime Supabase Total</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Commission (10%)</span>
          <span className="text-2xl font-black text-emerald-500">₹{platformCommission.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 block">Net Revenue Earned</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Local Stores</span>
          <span className="text-2xl font-black text-purple-500">{shopsList.filter(s => s.is_verified).length} Shops</span>
          <span className="text-[11px] text-amber-500 font-semibold block">{pendingShops.length} pending review</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Express Drivers</span>
          <span className="text-2xl font-black text-rose-500">{driversList.length} Drivers</span>
          <span className="text-[11px] text-emerald-400 font-semibold block">Express fulfillment</span>
        </div>
      </div>

      {/* Financial Bar Chart */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
          <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" /> Monthly Platform GTV Growth (₹)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PLATFORM_GTV}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="gtv" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Verification Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Shops */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Store className="w-4 h-4 text-rose-500 mr-2" /> Shop Verification Queue
          </h3>

          {pendingShops.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All pending shop applications verified! 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingShops.map(shop => (
                <div key={shop.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{shop.shop_name}</h4>
                    <p className="text-[10px] text-slate-500">{shop.address} • GST: {shop.gst_number || 'Pending'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleApproveShop(shop.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Drivers */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Truck className="w-4 h-4 text-emerald-500 mr-2" /> Driver KYC Approval Queue
          </h3>

          {pendingDrivers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">All driver KYC applications verified! 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map(driver => (
                <div key={driver.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{driver.name}</h4>
                    <p className="text-[10px] text-slate-500">{driver.vehicle_number} • DL: {driver.driving_licence}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleApproveDriver(driver.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]">Approve KYC</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Notification Form */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
          <Bell className="w-4 h-4 text-amber-500 mr-2" /> Supabase Realtime Broadcast Engine
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-3">
          <input
            type="text"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            placeholder="Push Notification Title (e.g. Flash 30-Min Festival Discount!)"
            className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
          />
          <textarea
            rows={2}
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Push Notification Body Message..."
            className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
          />
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">
            Broadcast Push Notification
          </button>
        </form>
        {broadcastSuccess && <p className="text-xs font-bold text-emerald-500">{broadcastSuccess}</p>}
      </div>
    </div>
  );
};
