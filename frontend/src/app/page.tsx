"use client";

import React from 'react';
import { useRole } from '@/context/RoleContext';
import { CustomerView } from '@/components/customer/CustomerView';
import { ShopOwnerDashboard } from '@/components/shop/ShopOwnerDashboard';
import { DeliveryPartnerCockpit } from '@/components/delivery/DeliveryPartnerCockpit';
import { AdminControlPanel } from '@/components/admin/AdminControlPanel';
import { RoleSelectionLanding } from '@/components/auth/RoleSelectionLanding';

export default function HomePage() {
  const { user, isAuthenticated, currentRole } = useRole();

  if (!isAuthenticated || !user) {
    return <RoleSelectionLanding />;
  }

  // Dynamic Dashboard Selection based strictly on Authenticated User Role
  const role = user.role || currentRole;

  return (
    <div className="w-full">
      {role === 'customer' && <CustomerView />}
      {role === 'shop_owner' && <ShopOwnerDashboard />}
      {role === 'delivery_partner' && <DeliveryPartnerCockpit />}
      {role === 'admin' && <AdminControlPanel />}
    </div>
  );
}
