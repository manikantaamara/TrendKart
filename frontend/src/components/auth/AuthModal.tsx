"use client";

import React, { useState, useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import { UserRole } from '@/types';
import { X, Lock, Mail, User as UserIcon, Store, Truck, ShieldCheck, Sparkles, ArrowRight, Phone, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'customer',
  initialMode = 'login'
}) => {
  const { login, registerUser } = useRole();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync role and mode whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode);
      setError(null);
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setStoreName('');
      setAddress('');
      setCity('');
      setPincode('');
      setVehicleInfo('');
      setGstNumber('');
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  const getRoleHeader = () => {
    switch (role) {
      case 'shop_owner':
        return {
          title: mode === 'login' ? 'Shop Owner Login' : 'Register Your Shop',
          subtitle: 'Access store inventory, order dispatches, and sales analytics',
          icon: Store,
          color: 'from-amber-500 to-rose-600',
          demoEmail: 'shop@trendkart.com'
        };
      case 'delivery_partner':
        return {
          title: mode === 'login' ? 'Delivery Partner Login' : 'Become a Delivery Partner',
          subtitle: 'Start delivering hyperlocal orders and track daily wallet earnings',
          icon: Truck,
          color: 'from-emerald-500 to-teal-600',
          demoEmail: 'driver@trendkart.com'
        };
      case 'admin':
        return {
          title: 'Admin Governance Portal',
          subtitle: 'System administration, store approvals & platform analytics',
          icon: ShieldCheck,
          color: 'from-indigo-600 to-purple-600',
          demoEmail: 'admin@trendkart.com'
        };
      default:
        return {
          title: mode === 'login' ? 'Customer Login' : 'Customer Sign Up',
          subtitle: 'Shop high-street local fashion with 30-minute express delivery',
          icon: UserIcon,
          color: 'from-rose-500 to-indigo-600',
          demoEmail: 'customer@trendkart.com'
        };
    }
  };

  const headerInfo = getRoleHeader();
  const IconComp = headerInfo.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const targetEmail = email.trim();
        if (!targetEmail || !password) {
          setError("Please enter your registered email and password.");
          setLoading(false);
          return;
        }

        const res = await login(targetEmail, password, role);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Login failed. Account must be registered first!');
        }
      } else {
        if (!email.trim() || !password || !fullName.trim()) {
          setError("Please fill in all mandatory registration fields.");
          setLoading(false);
          return;
        }

        const res = await registerUser({
          email: email.trim(),
          password: password,
          full_name: fullName.trim(),
          role: role,
          phone: phone.trim() || '+91 9876543210',
          store_name: storeName.trim(),
          address: address.trim(),
          city: city.trim() || 'New Delhi',
          pincode: pincode.trim() || '110001',
          vehicle_info: vehicleInfo.trim(),
          gst_number: gstNumber.trim()
        });

        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] overflow-y-auto">
        {/* Top Header Card */}
        <div className={`p-6 bg-gradient-to-r ${headerInfo.color} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <IconComp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black">{headerInfo.title}</h3>
              <p className="text-xs text-white/80 mt-0.5">{headerInfo.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Role Selector Tabs (Customer vs Shop Owner vs Delivery Partner) */}
        {role !== 'admin' && (
          <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-1 ${
                role === 'customer'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('shop_owner')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-1 ${
                role === 'shop_owner'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Shop Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('delivery_partner')}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-1 ${
                role === 'delivery_partner'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Delivery</span>
            </button>
          </div>
        )}

        {/* Mode Switcher Tabs (Login vs Register) */}
        {role !== 'admin' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'login' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'register' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role === 'shop_owner' ? 'Register Your Shop' : role === 'delivery_partner' ? 'Become a Partner' : 'Sign Up'}
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {role === 'shop_owner' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Store / Shop Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Connaught Silk House"
                        className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                      <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Shop Address & City</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Shop 12, Inner Circle, Connaught Place, New Delhi"
                        className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Store GSTIN Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="07AAAAA0000A1Z5"
                      className="w-full bg-slate-100 dark:bg-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </>
              )}

              {role === 'delivery_partner' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Details & DL Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleInfo}
                      onChange={(e) => setVehicleInfo(e.target.value)}
                      placeholder="e.g. DL 01 EX 9921 (TVS iQube Electric)"
                      className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                    <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Phone *</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-indigo-500/30 transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            <span>
              {loading 
                ? 'Authenticating...' 
                : mode === 'login' 
                ? `Login to ${role === 'shop_owner' ? 'Shop Owner' : role === 'delivery_partner' ? 'Delivery Partner' : 'Customer'} Dashboard` 
                : 'Complete Account Registration'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
