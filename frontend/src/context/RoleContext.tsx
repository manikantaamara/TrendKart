"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '@/types';
import { supabase } from '@/lib/supabase';

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  roleTitle: string;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, targetRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  registerUser: (data: { 
    email: string; 
    password: string; 
    full_name: string; 
    role: UserRole; 
    phone?: string;
    store_name?: string;
    address?: string;
    city?: string;
    pincode?: string;
    vehicle_info?: string;
    gst_number?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const roleTitleMap: Record<UserRole, string> = {
    customer: 'Customer Hub',
    shop_owner: 'Shop Owner Portal',
    delivery_partner: 'Delivery Driver Cockpit',
    admin: 'Admin Control Center',
  };

  useEffect(() => {
    // Restore authenticated session from local Supabase user store
    try {
      const savedUser = localStorage.getItem('trendkart_user');
      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setCurrentRole(parsedUser.role);
        localStorage.setItem('trendkart_role', parsedUser.role);
      }
    } catch (e) {
      console.error("Error loading session:", e);
    }
  }, []);

  const setRole = (role: UserRole) => {
    if (!isAuthenticated) {
      setCurrentRole(role);
      localStorage.setItem('trendkart_role', role);
    }
  };

  const login = async (email: string, password: string, targetRole?: UserRole): Promise<{ success: boolean; message?: string }> => {
    const normEmail = email.toLowerCase().trim();

    try {
      // 1. Try Supabase Auth API
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password: password
      });

      if (!authErr && authData.user) {
        const { data: dbUser } = await supabase.from('users').select('*').eq('email', normEmail).maybeSingle();
        const userObj: User = dbUser || {
          id: authData.user.id,
          email: normEmail,
          full_name: authData.user.user_metadata?.full_name || normEmail.split('@')[0],
          phone: authData.user.user_metadata?.phone || '',
          role: (authData.user.user_metadata?.role as UserRole) || targetRole || 'customer',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };

        setUser(userObj);
        setIsAuthenticated(true);
        setCurrentRole(userObj.role);
        localStorage.setItem('trendkart_user', JSON.stringify(userObj));
        localStorage.setItem('trendkart_role', userObj.role);
        return { success: true };
      }
    } catch (err) {
      console.warn("Supabase Auth API direct connection check:", err);
    }

    // 2. Query Supabase database users table
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', normEmail).maybeSingle();

    if (!existingUser) {
      return { 
        success: false, 
        message: `Account not found for ${normEmail}. Registration is mandatory before login! Please sign up.` 
      };
    }

    // Verify role matches target login if provided
    if (targetRole && existingUser.role !== targetRole) {
      return {
        success: false,
        message: `Account is registered as ${existingUser.role.replace('_', ' ')}. Please switch tabs or login to your registered role portal.`
      };
    }

    setUser(existingUser);
    setIsAuthenticated(true);
    setCurrentRole(existingUser.role);
    localStorage.setItem('trendkart_user', JSON.stringify(existingUser));
    localStorage.setItem('trendkart_role', existingUser.role);
    return { success: true };
  };

  const registerUser = async (data: { 
    email: string; 
    password: string; 
    full_name: string; 
    role: UserRole; 
    phone?: string;
    store_name?: string;
    address?: string;
    city?: string;
    pincode?: string;
    vehicle_info?: string;
    gst_number?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const normEmail = data.email.toLowerCase().trim();

    // Check if account already exists
    const { data: existingCheck } = await supabase.from('users').select('id').eq('email', normEmail).maybeSingle();
    if (existingCheck) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    // 1. Supabase Auth Sign Up — this is the source of truth for auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: normEmail,
      password: data.password,
      options: {
        data: { full_name: data.full_name, role: data.role, phone: data.phone }
      }
    });

    if (authErr || !authData.user) {
      return { success: false, message: authErr?.message || 'Signup failed. Please try again.' };
    }

    const authUserId = authData.user.id;

    // 2. Create User Record in `users` table using the Auth UUID as the primary key
    const avatarUrl = data.role === 'shop_owner'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : data.role === 'delivery_partner'
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const { data: newUser, error: insertErr } = await supabase.from('users').insert({
      id: authUserId,
      email: normEmail,
      full_name: data.full_name,
      phone: data.phone || '',
      role: data.role,
      password_hash: 'managed-by-supabase-auth',
      avatar_url: avatarUrl,
    }).select().single();

    if (insertErr || !newUser) {
      console.error('Users table insert error:', insertErr);
      // Still allow login using auth data even if users table insert fails due to RLS
      const fallbackUser: User = {
        id: authUserId,
        email: normEmail,
        full_name: data.full_name,
        phone: data.phone || '',
        role: data.role,
        avatar_url: avatarUrl,
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setCurrentRole(data.role);
      localStorage.setItem('trendkart_user', JSON.stringify(fallbackUser));
      localStorage.setItem('trendkart_role', data.role);
      return { success: true };
    }

    // 3. Store role-specific records
    const userId = newUser?.id || authUserId;
    if (data.role === 'shop_owner') {
      const shopName = data.store_name || `${data.full_name}'s Boutique`;
      await supabase.from('shops').insert({
        owner_id: userId,
        shop_name: shopName,
        slug: shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `High-street local fashion collection by ${data.full_name} with instant 30-minute delivery.`,
        address: data.address || '',
        city: data.city || '',
        pincode: data.pincode || '',
        latitude: 28.6315,
        longitude: 77.2167,
        gst_number: data.gst_number || '',
        is_verified: true,
        is_active: true,
      });
    } else if (data.role === 'delivery_partner') {
      await supabase.from('delivery_partners').insert({
        user_id: userId,
        name: data.full_name,
        email: normEmail,
        phone: data.phone || '',
        vehicle_type: 'Electric Scooter',
        vehicle_number: data.vehicle_info || '',
        driving_licence: `DL-${Date.now()}`,
        kyc_status: 'verified',
        is_online: true,
      });
    } else if (data.role === 'customer') {
      await supabase.from('customers').insert({ user_id: userId });
    }

    const finalUser = newUser || {
      id: authUserId,
      email: normEmail,
      full_name: data.full_name,
      phone: data.phone || '',
      role: data.role,
      avatar_url: avatarUrl,
    };
    setUser(finalUser);
    setIsAuthenticated(true);
    setCurrentRole(finalUser.role);
    localStorage.setItem('trendkart_user', JSON.stringify(finalUser));
    localStorage.setItem('trendkart_role', finalUser.role);
    return { success: true };
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
    setCurrentRole('customer');
    localStorage.removeItem('trendkart_user');
    localStorage.removeItem('trendkart_role');
    localStorage.removeItem('trendkart_token');
  };

  const activeRole = (user && isAuthenticated) ? user.role : currentRole;

  return (
    <RoleContext.Provider 
      value={{ 
        currentRole: activeRole, 
        setRole, 
        roleTitle: roleTitleMap[activeRole],
        isAuthenticated,
        user,
        login,
        registerUser,
        logout
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};
