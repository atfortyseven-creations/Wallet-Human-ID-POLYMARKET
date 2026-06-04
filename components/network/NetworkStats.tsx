"use client";

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Zap, Activity, BarChart3, Clock, Server } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

interface NetworkStats {
  prices: {
    USD: number;
    EUR: number;
  };
  difficulty: {
    difficultyChange: number;
    remainingBlocks: number;
    estimatedRetargetDate: number;
  };
  fees: {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  };
}

export function NetworkStats({ theme = 'default' }: { theme?: 'default' | 'arctic' }) {
  const isArctic = theme === 'arctic';
  const cardClass = isArctic 
    ? "bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all duration-500"
    : "bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all duration-500";
  
  const iconBoxClass = isArctic
    ? "p-2.5 bg-black/5 text-indigo-600 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-colors duration-500"
    : "p-2.5 bg-black/5 text-slate-400 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-colors duration-500";
  const { data: prices, isLoading } = useQuery({
    queryKey: ['network', 'prices'],
    queryFn: async () => {
      const res = await fetch('/api/network/v1/prices');
      if (!res.ok) throw new Error('Failed to fetch prices');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: difficulty } = useQuery({
    queryKey: ['network', 'difficulty'],
    queryFn: async () => {
      const res = await fetch('/api/network/v1/difficulty-adjustment');
      if (!res.ok) throw new Error('Failed to fetch difficulty');
      return res.json();
    },
    refetchInterval: 600000,
  });

  const { data: fees } = useQuery({
    queryKey: ['network', 'fees'],
    queryFn: async () => {
      const res = await fetch('/api/network/v1/fees/recommended');
      if (!res.ok) throw new Error('Failed to fetch fees');
      return res.json();
    },
    refetchInterval: 10000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Price Card */}
      <div className={cardClass}>
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
                <div className={iconBoxClass}>
                    <TrendingUp size={18} strokeWidth={3} />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Trace</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Peer Value</span>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black font-mono text-slate-950 tracking-tighter">
                        {prices?.USD ? `$${safeToLocaleString(prices.USD)}` : <div className="h-8 w-32 bg-black/5 rounded-xl animate-pulse" />}
                    </h3>
                </div>
            </div>
        </div>
      </div>

      {/* Fees Card */}
      <div className={cardClass}>
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
                <div className={iconBoxClass}>
                    <Zap size={18} strokeWidth={3} />
                </div>
                 <span className="text-[8px] font-black px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                    sat/vB
                </span>
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Incentive Density</span>
                <div className="flex items-end gap-8">
                    <div>
                        <div className="text-3xl font-black font-mono text-slate-950 tracking-tighter">
                            {fees?.fastestFee ?? <div className="h-8 w-12 bg-black/5 rounded-xl animate-pulse" />}
                        </div>
                        <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Immediate Settlement</div>
                    </div>
                    <div className="text-right pb-1">
                        <div className="text-xl font-black font-mono text-slate-300 tracking-tighter">{fees?.hourFee ?? '-'}</div>
                        <div className="text-[8px] font-black text-slate-200 uppercase tracking-widest mt-1">Standard Propagation</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Difficulty Card */}
      <div className={cardClass}>
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
                <div className={iconBoxClass}>
                    <Server size={18} strokeWidth={3} />
                </div>
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Security Equilibrium</span>
                <div className="flex flex-col">
                    <div className={`text-3xl font-black font-mono tracking-tighter ${difficulty?.difficultyChange && difficulty.difficultyChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {difficulty?.difficultyChange ? `${difficulty.difficultyChange > 0 ? '+' : ''}${safeToFixed(difficulty.difficultyChange, 2)}%` : <div className="h-8 w-24 bg-black/5 rounded-xl animate-pulse" />}
                    </div>
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 leading-relaxed">
                        {difficulty?.remainingBlocks} Confirmations until Periodic Recalibration
                    </div>
                </div>
            </div>
        </div>
      </div>
      
       {/* Network Status Card */}
       <div className={cardClass}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={100} className="text-slate-900" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
                <div className={iconBoxClass}>
                    <BarChart3 size={18} strokeWidth={3} />
                </div>
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                   <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Validated</span>
                </div>
            </div>
            <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Operational Protocol</span>
                <div className="text-3xl font-black font-mono text-slate-950 tracking-tighter">
                    PERFORMANCE ACTIVE
                </div>
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Continuity Level: 99.99%
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

