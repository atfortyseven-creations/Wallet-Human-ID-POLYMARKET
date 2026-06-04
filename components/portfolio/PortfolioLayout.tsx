'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export const PortfolioLayout: React.FC<PortfolioLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0E11] via-[#1a1f2e] to-[#0B0E11] text-white font-sans selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />
        
        <main className="relative z-10 container mx-auto p-4 lg:p-8 flex flex-col gap-8">
            {/* Header */}
            <header className="flex justify-between items-center glass-premium p-6 rounded-3xl">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                        PORTFOLIO <span className="text-white/80 font-light">COMMAND</span>
                    </h1>
                    <span className="text-gray-400 text-sm tracking-widest uppercase mt-1">Advanced Asset Analytics</span>
                </div>
                
            </header>

            {children}
        </main>
    </div>
  );
};

