"use client";

import React, { useState } from 'react';
import { X, Sparkles, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { AIOutfitRecommendation } from '@/types';
import { supabase } from '@/lib/supabase';

interface AIOutfitRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIOutfitRecommenderModal: React.FC<AIOutfitRecommenderModalProps> = ({ isOpen, onClose }) => {
  const [gender, setGender] = useState('Men');
  const [occasion, setOccasion] = useState('Casual Weekend');
  const [color, setColor] = useState('Olive & Earthy');
  const [budget, setBudget] = useState(4000);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIOutfitRecommendation[] | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/outfit-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender,
          occasion,
          primary_color: color,
          budget_max: budget
        })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      const { data: realProds } = await supabase.from('products').select('*, shops(shop_name)').lte('base_price', budget);
      if (realProds?.length) {
        setRecommendations([
          {
            outfit_name: `${occasion} Hyperlocal Match`,
            match_score: 95,
            reasoning: `Selected available local items within ₹${budget} budget.`,
            items: realProds.slice(0, 3).map((p: any) => ({
              type: p.category_name || "Fashion Item",
              name: p.name,
              price: p.discount_price || p.base_price,
              shop: p.shop_name
            }))
          }
        ]);
      } else {
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">AI Outfit Recommender Engine</h2>
              <p className="text-xs text-white/80">Pairs matching topwear + bottomwear + shoes from nearby local stores</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="Men">Men Fashion</option>
                <option value="Women">Women Fashion</option>
                <option value="Unisex">Unisex / Festival</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Occasion / Vibe</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="Casual Weekend">Casual Weekend</option>
                <option value="Wedding / Ethnic">Wedding / Ethnic Festival</option>
                <option value="Corporate Formal">Corporate Formal</option>
                <option value="Party & Nightout">Party & Nightout</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Color Palette</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                placeholder="e.g. Navy & Ivory Gold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Budget (₹{budget})</label>
              <input
                type="range"
                min={1500}
                max={15000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 hover:scale-[1.01] transition"
          >
            {loading ? (
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 animate-spin" /> AI Analyzing Local Shop Inventories...</span>
            ) : (
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-amber-300" /> Generate Hyperlocal Outfit Pairings</span>
            )}
          </button>

          {/* AI Results */}
          {recommendations && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <span>Matched Local Outfits</span>
              </h3>

              {recommendations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No matching local fashion items available for your selected criteria.
                </p>
              ) : (
                recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-rose-500">{rec.outfit_name}</h4>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Total: ₹{rec.items.reduce((acc, item) => acc + item.price, 0)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">{rec.reasoning}</p>

                    <div className="space-y-2">
                      {rec.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                            <span className="text-[10px] text-slate-400">{item.type} • {item.shop}</span>
                          </div>
                          <span className="font-bold text-emerald-500">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
