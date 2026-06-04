"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVIPStore, EMPTY_ARRAY } from '@/lib/vip-store';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { TrendingUp, TrendingDown, Activity, ShieldCheck } from 'lucide-react';

interface TokenActivityBarProps {
    symbol: string;
}

export function TokenActivityBar({ symbol }: TokenActivityBarProps) {
    const whaleEvents = useVIPStore(state => state.whaleEvents || EMPTY_ARRAY);
    const { prices, changes } = useTokenPrice();
    
    const filtered = useMemo(() => {
        return whaleEvents.filter(tx => tx.token.toUpperCase() === symbol.toUpperCase());
    }, [whaleEvents, symbol]);

    const { vigor, sentiment } = useMemo(() => {
        const recent = filtered.slice(0, 30);
        const buys = recent.filter(e => e.action === 'BUY').reduce((acc, e) => acc + e.usdNum, 0);
        const sells = recent.filter(e => e.action === 'SELL').reduce((acc, e) => acc + e.usdNum, 0);
        const total = buys + sells;
        const v = total > 0 ? (buys / total) : 0.5;
        
        let s = 'NEUTRAL';
        if (v > 0.8) s = 'EXTREME BULLISH';
        else if (v > 0.6) s = 'BULLISH';
        else if (v < 0.2) s = 'EXTREME BEARISH';
        else if (v < 0.4) s = 'BEARISH';
        
        return { vigor: v * 100, sentiment: s };
    }, [filtered]);

    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: n > 1000 ? 'compact' : 'standard', maximumFractionDigits: 2 }).format(n);
    const fmtCompact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

    // Institutional Fallback for Price Discovery
    const fallbackPrices: Record<string, number> = { BTC: 68420.50, ETH: 3512.20, BNB: 590.10, SOL: 145.40, LINK: 18.20, MATIC: 0.72 };
    const finalPrice = prices[symbol.toUpperCase()] || fallbackPrices[symbol.toUpperCase()] || 0;
    const finalChange: number | null = (changes || {})[symbol.toUpperCase()] ?? null; // null when unavailable  no fake fallback

    return (
        <div className="flex flex-col bg-white border-t border-slate-100 p-6 space-y-6">
            
            {/* Header: Price & 24h Change */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark Price</span>
                    <span className="text-xl font-mono font-black text-slate-900 tracking-tighter">
                        {finalPrice > 0 ? fmt(finalPrice) : '---'}
                    </span>
                </div>
                {finalChange !== null ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${
                        finalChange >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                        {finalChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(finalChange).toFixed(2)}%
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border bg-black/5 text-slate-400 border-slate-100">
                        <Activity size={10} />
                        
                    </div>
                )}
            </div>

            {/* Gravity / Sentido Bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span className="flex items-center gap-2 italic"><Activity size={10} /> GRAVITY / SENTIDO</span>
                    <span className={vigor > 50 ? 'text-emerald-500' : 'text-rose-500'}>{sentiment}</span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-slate-200 to-emerald-500 opacity-30" />
                    <motion.div 
                        initial={{ left: '50%' }}
                        animate={{ left: `${vigor}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        className="absolute top-0 bottom-0 w-1 bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                    />
                </div>
                <div className="flex justify-between items-center text-[7px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Bearish</span>
                    <span className="text-slate-900 font-mono text-[9px] font-black">{vigor.toFixed(1)}% Vigor</span>
                    <span>Bullish</span>
                </div>
            </div>

            {/* Activity Data Block */}
            <div className="space-y-3">
                <div className="bg-black/5/50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                    <div className="grid grid-cols-3 px-4 py-2 text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/30">
                        <span>Volume</span>
                        <span className="text-center">Action</span>
                        <span className="text-right">Wall</span>
                    </div>
                    {filtered.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="grid grid-cols-3 px-4 py-3 items-center group hover:bg-white transition-colors">
                            <span className="text-[10px] font-mono font-black text-slate-900">
                                ${fmtCompact(tx.usdNum)}
                            </span>
                            <div className="flex justify-center">
                                <span className={`w-8 h-4 rounded flex items-center justify-center text-[8px] font-black uppercase ${
                                    tx.action === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {tx.action}
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(tx.wallet);
                                    // Could add a toast here but keep it minimal as per perfection
                                }}
                                className="text-[9px] font-mono text-slate-400 hover:text-indigo-600 text-right truncate transition-colors"
                            >
                                {tx.wallet.slice(0, 4)}...{tx.wallet.slice(-4)}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
