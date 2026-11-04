"use client";

import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product, Order } from '@/types';
import { createOrder } from '@/lib/api';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  netTotal: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  checkout: (user: { id: string; full_name: string; address?: string }) => Promise<Order | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const addToCart = (product: Product, size?: string, color?: string) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
    const selectedColor = color || (product.colors && product.colors[0]) || 'Default';

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, size: selectedSize, color: selectedColor, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size && item.color === color)));
  };

  const updateQuantity = (productId: string, size: string, color: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.size === size && item.color === color) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  const applyCoupon = (code: string) => {
    if (code.toUpperCase() === "TREND300" || code.toUpperCase() === "INSTANT50") {
      setAppliedCoupon(code.toUpperCase());
      setDiscountAmount(300);
      return true;
    }
    return false;
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.discount_price || item.product.base_price;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 ? 30 : 0;
  const netTotal = Math.max(subtotal - discountAmount + deliveryFee, 0);

  const checkout = async (user: { id: string; full_name: string; address?: string }): Promise<Order | null> => {
    if (cart.length === 0) return null;

    const firstShopId = cart[0].product.shop_id || "s-shop-101";
    const firstShopName = cart[0].product.shop_name || "Zara Local Express";

    const created = await createOrder({
      customer_id: user.id,
      customer_name: user.full_name,
      shop_id: firstShopId,
      shop_name: firstShopName,
      delivery_address: user.address || "Connaught Place, New Delhi - 110001",
      total_amount: subtotal,
      discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      net_amount: netTotal,
      items: cart
    });

    clearCart();
    return created;
  };

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      subtotal,
      discountAmount,
      deliveryFee,
      netTotal,
      appliedCoupon,
      applyCoupon,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
