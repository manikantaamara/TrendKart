"use client";

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Store, CheckCircle, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { DeliveryTracking } from '@/types';

interface LiveGPSMapVisualizerProps {
  trackingData: DeliveryTracking;
  onVerifyOTP: (otp: string) => Promise<{ success: boolean; message: string }>;
}

export const LiveGPSMapVisualizer: React.FC<LiveGPSMapVisualizerProps> = ({ trackingData, onVerifyOTP }) => {
  const [driverPos, setDriverPos] = useState({ lat: trackingData.driver_lat, lng: trackingData.driver_lng });
  const [etaMins, setEtaMins] = useState(trackingData.estimated_minutes);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState<string | null>(null);
  const [isDelivered, setIsDelivered] = useState(trackingData.status === 'delivered');

  // Simulated real-time GPS smooth movement
  useEffect(() => {
    if (isDelivered) return;
    const interval = setInterval(() => {
      setDriverPos(prev => ({
        lat: prev.lat - 0.0003,
        lng: prev.lng - 0.0002
      }));
      setEtaMins(prev => Math.max(1, prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isDelivered]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onVerifyOTP(enteredOtp);
    setOtpStatus(res.message);
    if (res.success) {
      setIsDelivered(true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Driver Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
              alt="Driver"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{trackingData.driver_name}</h3>
              <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Express Rider
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{trackingData.vehicle_number}</p>
            <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">📞 {trackingData.driver_phone}</p>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
          <span className="text-xl font-black text-rose-500 flex items-center justify-end">
            <Clock className="w-4 h-4 mr-1 text-rose-500 animate-pulse" /> {isDelivered ? 'Delivered 🎉' : `${etaMins} Mins`}
          </span>
        </div>
      </div>

      {/* Simulated Live GPS Canvas Map */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col justify-between p-4">
        {/* Animated Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        
        {/* Route Polyline Simulation */}
        <svg className="absolute inset-0 w-full h-full stroke-rose-500/40 stroke-2 stroke-dasharray-4">
          <path d="M 60 40 L 180 120 L 320 220" fill="none" strokeWidth="3" strokeDasharray="6" />
        </svg>

        {/* Shop Location Marker */}
        <div className="relative z-10 flex items-center space-x-2 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 w-fit">
          <Store className="w-4 h-4 text-purple-400" />
          <div>
            <span className="font-bold block text-[11px]">Zara Local CP Shop</span>
            <span className="text-[9px] text-slate-400">Order Picked Up</span>
          </div>
        </div>

        {/* Dynamic Moving Rider Marker */}
        <div 
          className="relative z-20 flex items-center space-x-2 bg-rose-600 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg shadow-rose-600/40 w-fit transition-all duration-1000 animate-float"
          style={{ transform: `translate(${Math.min(driverPos.lat * 4, 180)}px, 40px)` }}
        >
          <Truck className="w-4 h-4 text-white animate-bounce" />
          <div>
            <span className="font-bold block text-[11px]">Rider En Route (25 km/h)</span>
            <span className="text-[9px] text-white/80">0.8 km remaining</span>
          </div>
        </div>

        {/* Customer Location Pin */}
        <div className="relative z-10 flex items-center space-x-2 bg-emerald-950/90 text-white text-xs px-3 py-1.5 rounded-xl border border-emerald-700 w-fit self-end">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold block text-[11px]">Your Address (Green Park)</span>
            <span className="text-[9px] text-emerald-300">OTP Code: {trackingData.otp_code}</span>
          </div>
        </div>
      </div>

      {/* OTP Verification Console */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1.5" /> Handover Delivery OTP Verification
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Share this 4-digit code with the delivery partner upon arrival: <strong className="text-rose-500 font-mono text-sm ml-1">{trackingData.otp_code}</strong>
          </p>
        </div>

        <form onSubmit={handleOtpSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            maxLength={4}
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-24 text-center font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            Verify OTP
          </button>
        </form>
      </div>

      {otpStatus && (
        <div className={`p-3 rounded-xl text-xs font-bold text-center ${isDelivered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {otpStatus}
        </div>
      )}
    </div>
  );
};
