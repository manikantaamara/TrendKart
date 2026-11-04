"use client";

import React, { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { UserRole } from '@/types';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Search, 
  Sun, 
  Moon, 
  Store, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Clock,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  onOpenAIOutfitModal: () => void;
  onOpenAIChatbot: () => void;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIOutfitModal, onOpenAIChatbot, onSearchChange }) => {
  const { currentRole, isAuthenticated, user, logout } = useRole();
  const { isDarkMode, toggleTheme } = useTheme();
  const { cart, wishlist } = useCart();
  const [searchVal, setSearchVal] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const activeRole = user ? user.role : currentRole;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header transition-colors duration-300">
        {/* Top Announcement & Express Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white text-xs py-1.5 px-4 flex justify-between items-center font-medium">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="flex items-center bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse">
              <Clock className="w-3 h-3 mr-1" /> Express 30 Mins
            </span>
            <span className="truncate">Local Fashion. Instant Delivery in Connaught Place & South Delhi!</span>
          </div>

          {/* Account Status / Profile Bar */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                <span className="text-[11px] font-bold text-amber-300 flex items-center">
                  <UserIcon className="w-3 h-3 mr-1" />
                  {user.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                  {user.role.replace('_', ' ')}
                </span>
                <button
                  onClick={logout}
                  className="ml-1 p-1 hover:bg-rose-500/30 rounded text-rose-300 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white text-gray-900 px-3 py-1 rounded-lg text-[11px] font-bold shadow-md hover:bg-slate-100 transition"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <a href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black text-rose-500">T</span>
                <span className="text-xl font-black text-indigo-400">K</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center">
                <span className="gradient-text-brand">TrendKart</span>
                <span className="ml-2 text-[10px] font-bold bg-hyperlocal-500/10 text-hyperlocal-600 dark:text-hyperlocal-500 px-2 py-0.5 rounded-full border border-hyperlocal-500/20">
                  HYPERLOCAL
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                Local Fashion. Instant Delivery.
              </p>
            </div>
          </a>

          {/* Hyperlocal Location Pill */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-rose-500 mr-2 animate-bounce" />
            <div>
              <span className="font-semibold block">Connaught Place, New Delhi</span>
              <span className="text-[10px] text-slate-400">Hyperlocal Fast Delivery</span>
            </div>
          </div>

          {/* Global Search Bar (RESTRICTED strictly to Customer Role) */}
          {isAuthenticated && activeRole === 'customer' && (
            <div className="flex-1 max-w-md relative hidden md:block">
              <input
                type="text"
                value={searchVal}
                onChange={handleSearch}
                placeholder="Search local shops, silk sarees, linen shirts, brands..."
                className="w-full bg-slate-100 dark:bg-slate-800/90 text-sm pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Features Trigger Buttons */}
            <button
              onClick={onOpenAIOutfitModal}
              className="flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-indigo-500/25 hover:scale-105 transition"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300 animate-spin" />
              <span className="hidden sm:inline">AI Outfit Matcher</span>
            </button>

            <button
              onClick={onOpenAIChatbot}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition relative"
              title="Fashion AI Chatbot"
            >
              <Sparkles className="w-5 h-5 text-rose-500" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Wishlist & Cart Counters (RESTRICTED strictly to Customer Role) */}
            {isAuthenticated && activeRole === 'customer' && (
              <>
                <button 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition relative"
                  title="Saved Wishlist"
                >
                  <Heart className="w-5 h-5 text-rose-500" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button 
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition relative flex items-center space-x-1"
                  title="Shopping Bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={activeRole}
      />
    </>
  );
};
