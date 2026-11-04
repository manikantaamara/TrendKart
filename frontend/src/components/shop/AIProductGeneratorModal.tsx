"use client";

import React, { useState } from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import { generateAIDescription } from '@/lib/api';

interface AIProductGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDescription: (desc: string) => void;
}

export const AIProductGeneratorModal: React.FC<AIProductGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyDescription
}) => {
  const [title, setTitle] = useState('Oversized Floral Linen Shirt');
  const [category, setCategory] = useState('Men Fashion');
  const [gender, setGender] = useState('Men');
  const [material, setMaterial] = useState('100% European Linen');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    const data = await generateAIDescription({ title, category, gender, material });
    setResult(data);
    setLoading(false);
  };

  const handleApply = () => {
    if (result?.generated_description) {
      onApplyDescription(result.generated_description);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Product Description Generator</h3>
              <p className="text-xs text-white/80">Generates SEO-friendly local store copy in seconds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Material / Fabric</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
          >
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            <span>Generate Copy with AI</span>
          </button>

          {result && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Generated Copy</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mt-1">{result.generated_description}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center"
                >
                  <Check className="w-4 h-4 mr-1" /> Use This Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
