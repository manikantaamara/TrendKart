"use client";

import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

interface AIBackgroundRemoverCanvasProps {
  initialImage: string;
  onProcessedImage: (url: string) => void;
}

export const AIBackgroundRemoverCanvas: React.FC<AIBackgroundRemoverCanvasProps> = ({
  initialImage,
  onProcessedImage
}) => {
  const [style, setStyle] = useState('studio_white');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const url = `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80&mode=${style}`;
      setProcessedUrl(url);
      onProcessedImage(url);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center">
          <Sparkles className="w-4 h-4 text-purple-500 mr-1.5" /> AI Background Remover Studio
        </h4>
        <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold">
          High-Res Studio Quality
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Original Preview */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Original Photo</span>
          <div className="h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center">
            <img src={initialImage} alt="Original" className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Processed AI Output */}
        <div className="space-y-1">
          <span className="text-[10px] text-purple-500 font-bold uppercase block">AI Studio Output</span>
          <div className="h-40 rounded-xl overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-center relative">
            {isProcessing ? (
              <div className="text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                <span className="text-[10px] text-slate-400 block font-semibold">Removing Background...</span>
              </div>
            ) : processedUrl ? (
              <img src={processedUrl} alt="Processed" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-slate-400 font-medium">Click Process to remove BG</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setStyle('studio_white')}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition ${
              style === 'studio_white' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            Studio White
          </button>
          <button
            type="button"
            onClick={() => setStyle('transparent')}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition ${
              style === 'transparent' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            Transparent
          </button>
        </div>

        <button
          type="button"
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 transition"
        >
          Process Image
        </button>
      </div>
    </div>
  );
};
