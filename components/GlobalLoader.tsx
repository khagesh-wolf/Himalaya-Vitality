
import React from 'react';
import { useLoading } from '../context/LoadingContext';
import { Loader2 } from 'lucide-react';

export const GlobalLoader = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 animate-in fade-in">
      <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-sm w-full mx-4 text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand-red/20 blur-xl rounded-full"></div>
            <Loader2 className="w-12 h-12 text-brand-red animate-spin relative z-10" strokeWidth={2.5} />
        </div>
        <span className="text-brand-dark font-heading font-bold text-lg animate-pulse">{loadingMessage}</span>
        <p className="text-gray-400 text-xs mt-2 font-medium uppercase tracking-wider">Please wait</p>
      </div>
    </div>
  );
};
