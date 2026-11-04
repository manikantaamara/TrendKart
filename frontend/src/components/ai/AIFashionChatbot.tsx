"use client";

import React, { useState } from 'react';
import { X, Send, Sparkles, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

interface AIFashionChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const AIFashionChatbot: React.FC<AIFashionChatbotProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "👋 Hi! I'm your TrendKart AI Fashion Stylist. Ask me about nearby store collections, festival outfits, size fitting, or 30-min express deliveries!",
      time: "Just now"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai/chatbot?query_text=${encodeURIComponent(query)}`, { method: 'POST' });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: data.reply || "I searched nearby stores and found great local fashion options for you!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const { data: realProds } = await supabase.from('products').select('*, shops(shop_name)').or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      const replyMsg = realProds?.length
        ? `🛍️ Found ${realProds.length} matching item(s) for "${query}": ${realProds.map((p: any) => p.name).slice(0, 3).join(', ')}.`
        : `No matching local fashion items found for "${query}".`;
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: replyMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What linen shirts are available within 30 min delivery?",
    "Recommend an ethnic kurta for a weekend wedding",
    "How fast is delivery to Connaught Place?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-sm">TrendKart AI Stylist</h3>
              <p className="text-[11px] text-white/80 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Hyperlocal Assistant • Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-rose-500 text-white rounded-br-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
              }`}>
                <p>{m.text}</p>
                <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-rose-500 animate-bounce" />
                <span>Searching nearby local stores...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex space-x-2 text-[11px]">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-500 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-700 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about local outfits or delivery..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
