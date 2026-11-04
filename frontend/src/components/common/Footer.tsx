"use client";

import React, { useState } from 'react';
import { Store, Truck, ShieldCheck, Zap, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserRole } from '@/types';

export const Footer: React.FC = () => {
  const { user, isAuthenticated } = useRole();
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; role: UserRole }>({
    isOpen: false,
    role: 'customer'
  });

  const handlePortalClick = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      window.location.href = '/admin';
      return;
    }

    if (isAuthenticated && user) {
      if (user.role === targetRole) {
        window.location.href = '/';
      } else {
        // Open AuthModal for re-authenticating as another role
        setAuthModalState({ isOpen: true, role: targetRole });
      }
    } else {
      setAuthModalState({ isOpen: true, role: targetRole });
    }
  };

  return (
    <>
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
        {/* Brand Value Props */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">30-Min Delivery</h4>
              <p className="text-xs text-slate-500 mt-1">Local delivery partners bring clothing straight from nearby stores.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Support Local Shops</h4>
              <p className="text-xs text-slate-500 mt-1">Empowering neighborhood boutiques & verified high-street retailers.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Trial & Easy Return</h4>
              <p className="text-xs text-slate-500 mt-1">Doorstep size exchange and 7-day hassle-free instant refunds.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Live Driver Tracking</h4>
              <p className="text-xs text-slate-500 mt-1">Track your delivery agent on interactive GPS with secure OTP code.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center mb-3">
              <span className="gradient-text-brand">TrendKart</span>
            </h3>
            <p className="text-xs leading-relaxed mb-4">
              Digitizing local clothing stores for instant hyperlocal delivery. Bringing the convenience of e-commerce to your neighborhood.
            </p>
            <div className="flex space-x-2 text-xs">
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Razorpay Verified</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">FastAPI Powered</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Quick Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handlePortalClick('customer')} className="hover:text-rose-500 transition">
                  Customer Store Hub
                </button>
              </li>
              <li>
                <button onClick={() => handlePortalClick('shop_owner')} className="hover:text-rose-500 transition">
                  Shop Owner Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handlePortalClick('delivery_partner')} className="hover:text-rose-500 transition">
                  Delivery Partner Cockpit
                </button>
              </li>
              <li>
                <button onClick={() => handlePortalClick('admin')} className="hover:text-rose-500 transition">
                  Admin Governance Panel
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-rose-500 transition">Linen & Cuban Shirts</a></li>
              <li><a href="#" className="hover:text-rose-500 transition">Chikankari Kurta Sets</a></li>
              <li><a href="#" className="hover:text-rose-500 transition">Italian Wool Blazers</a></li>
              <li><a href="#" className="hover:text-rose-500 transition">Festival Sherwanis</a></li>
              <li><a href="#" className="hover:text-rose-500 transition">Western Party Wear</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">Hyperlocal Hub</h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center"><MapPin className="w-3.5 h-3.5 text-rose-500 mr-2" /> Connaught Place, New Delhi 110001</p>
              <p className="flex items-center"><Phone className="w-3.5 h-3.5 text-rose-500 mr-2" /> +91 (011) 4892-0000</p>
              <p className="flex items-center"><Mail className="w-3.5 h-3.5 text-rose-500 mr-2" /> support@trendkart.local</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
          <p>© 2026 TrendKart Hyperlocal Marketplace. All rights reserved. Built with Next.js, FastAPI & Supabase.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState(prev => ({ ...prev, isOpen: false }))}
        initialRole={authModalState.role}
      />
    </>
  );
};
