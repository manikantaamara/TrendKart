"use client";

import React, { useState } from 'react';
import { ShoppingBag, Store, Truck, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { UserRole } from '@/types';

export const RoleSelectionLanding: React.FC = () => {
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    role: UserRole;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    role: 'customer',
    mode: 'login'
  });

  const openAuth = (role: UserRole, mode: 'login' | 'register') => {
    setAuthModalState({
      isOpen: true,
      role,
      mode
    });
  };

  const closeAuth = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-12 py-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Title Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold px-4 py-1.5 rounded-full animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India's premier hyperlocal fashion marketplace</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
          Welcome to <span className="gradient-text-brand">TrendKart</span>
        </h1>
        <p className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300">
          Local Fashion. Instant Delivery.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Select your portal to continue. Experience instant 30-minute doorstep fashion dispatches from local boutiques near you.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Customer Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between group">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-rose-500" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">
                For Shoppers
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Customer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse nearby clothing stores and order products with fast local delivery.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => openAuth('customer', 'login')}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 transition active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => openAuth('customer', 'register')}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl text-xs transition active:scale-95"
            >
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Shop Owner Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between group">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Store className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                For Retail Merchants
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Shop Owner</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Register your clothing store, manage inventory, receive orders, and grow your business.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => openAuth('shop_owner', 'login')}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => openAuth('shop_owner', 'register')}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-2xl text-xs shadow-md transition active:scale-95"
            >
              <span>Register Your Shop</span>
            </button>
          </div>
        </div>

        {/* Delivery Partner Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl transition duration-300 flex flex-col justify-between group">
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Truck className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                For Riders & Drivers
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Delivery Partner</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Earn money by delivering orders in your city.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => openAuth('delivery_partner', 'login')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => openAuth('delivery_partner', 'register')}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl text-xs transition active:scale-95"
            >
              <span>Become a Delivery Partner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 max-w-4xl mx-auto">
        <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-lg font-black text-rose-500">30 Mins</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Express Doorstep Fulfilment</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-lg font-black text-amber-500">100% Verified</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Local High-Street Boutiques</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-lg font-black text-emerald-500">GPS Live</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Realtime Rider Map Dispatch</span>
        </div>
      </div>

      {/* Auth Modal Render */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuth}
        initialRole={authModalState.role}
        initialMode={authModalState.mode}
      />
    </div>
  );
};
