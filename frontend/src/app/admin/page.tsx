"use client";

import React, { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { AdminControlPanel } from '@/components/admin/AdminControlPanel';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const { user, currentRole, isAuthenticated, login } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRole = user ? user.role : currentRole;

  if (isAuthenticated && activeRole === 'admin') {
    return <AdminControlPanel />;
  }

  if (isAuthenticated && activeRole !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 animate-fadeIn">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full text-center space-y-4 border border-rose-500/30 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Access Restricted (403)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are logged in as <span className="font-bold text-rose-500 capitalize">{activeRole.replace('_', ' ')}</span>. The Admin Governance Panel is strictly reserved for platform administrators.
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition active:scale-95"
          >
            Return to {activeRole === 'shop_owner' ? 'Shop Owner' : activeRole === 'delivery_partner' ? 'Delivery' : 'Customer'} Dashboard
          </a>
        </div>
      </div>
    );
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await login(email.trim(), password, 'admin');
      if (!res.success) {
        setError(res.message || 'Admin authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Admin authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Admin Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black">Admin Security Portal</h2>
              <p className="text-xs text-slate-400">Restricted TrendKart Governance Access</p>
            </div>
          </div>
        </div>

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating Admin...' : 'Authenticate Admin Credentials'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
