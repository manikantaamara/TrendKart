"use client";

import React, { useState } from 'react';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { RoleProvider } from '@/context/RoleContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AIFashionChatbot } from '@/components/ai/AIFashionChatbot';
import { AIOutfitRecommenderModal } from '@/components/ai/AIOutfitRecommenderModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>TrendKart - Local Fashion. Instant Delivery.</title>
        <meta name="description" content="Hyperlocal fashion marketplace connecting customers, nearby store owners, and express delivery riders." />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <RoleProvider>
            <CartProvider>
              <LayoutInner>{children}</LayoutInner>
            </CartProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);
  const [isAIOutfitOpen, setIsAIOutfitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header
        onOpenAIChatbot={() => setIsAIChatbotOpen(true)}
        onOpenAIOutfitModal={() => setIsAIOutfitOpen(true)}
        onSearchChange={(val) => setSearchQuery(val)}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />

      {/* Global AI Modals */}
      <AIFashionChatbot
        isOpen={isAIChatbotOpen}
        onClose={() => setIsAIChatbotOpen(false)}
      />

      <AIOutfitRecommenderModal
        isOpen={isAIOutfitOpen}
        onClose={() => setIsAIOutfitOpen(false)}
      />
    </>
  );
}
