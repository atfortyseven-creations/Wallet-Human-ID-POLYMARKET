"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { InmersiveConstellations } from "@/components/shared/InmersiveConstellations";
import { useVIPStore, VIPStoreState, EMPTY_ARRAY } from "@/lib/vip-store";
import { TacticalPulseAnalytics } from "@/components/premium/TacticalPulseAnalytics";
import { LegendaryWhaleLeaderboard } from "@/components/premium/LegendaryWhaleLeaderboard";
import { PreCognitiveGrid } from "@/components/premium/PreCognitiveGrid";
import { X, Landmark, Globe, Zap, Cpu, Info, Activity, Fingerprint, Network } from "lucide-react";
import { MultiChainSystemty } from "@/components/premium/MultiChainSystemty";
import { SystemsUtilityHeader } from "@/components/shared/SystemsUtilityHeader";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { CatchTheWhale } from "@/components/vip/CatchTheWhale";
import { TokenChartOverlay } from "@/components/premium/TokenChartOverlay";
import dynamic from 'next/dynamic';

const WhaleMomentumChart = dynamic(() => import('@/components/network/whale/WhaleMomentumChart').then(m => m.WhaleMomentumChart), { ssr: false });
const MarketHeatmap24h = dynamic(() => import('@/components/vip/MarketHeatmap24h').then(m => m.MarketHeatmap24h), { ssr: false });
const ExchangeBTCOpenInterest = dynamic(() => import('@/components/vip/ExchangeBTCOpenInterest').then(m => m.ExchangeBTCOpenInterest), { ssr: false });


const PERFECTION_TOKENS = [
    "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "SHIB", "DOT", "LINK", 
    "MATIC", "AVAX", "TRX", "UNI", "PEPE", "FET", "DAI", "APE", "LDO", "ARB", 
    "OP", "STRK", "AUTH", "NEAR"
];

const FALLBACK_TOKEN_COLORS: Record<string, string> = {
    BTC:  '#f97316', ETH:  '#6366f1', BNB:  '#eab308', SOL:  '#8b5cf6',
    LINK: '#0ea5e9', MATIC:'#a855f7', AVAX: '#f87171', DOT: '#ec4899'
};

function getTokenColor(token: string) {
    return FALLBACK_TOKEN_COLORS[token.toUpperCase()] || '#6366f1';
}

export function MasterGrid() {
    const [activeTokenFilter, setActiveTokenFilter] = useState<string | null>(null);
    const [selectedSymbolForOverlay, setSelectedSymbolForOverlay] = useState<string | null>(null);
    const [selectedTokens, setSelectedTokens] = useState<string[]>(PERFECTION_TOKENS);
    
    const whaleEvents = useVIPStore((state: VIPStoreState) => state.whaleEvents || EMPTY_ARRAY);
    
    const { globalHeat, deltaStream, deltaColor } = useMemo(() => {
        const recent = whaleEvents.slice(0, 50);
        const buyVol = recent.filter(e => e.action === 'BUY').reduce((acc, e) => acc + e.usdNum, 0);
        const sellVol = recent.filter(e => e.action === 'SELL').reduce((acc, e) => acc + e.usdNum, 0);
        
        const heat = Math.min(recent.length / 5 + (buyVol / 1_000_000), 12).toFixed(2);
        const delta = buyVol + sellVol > 0 ? ((buyVol - sellVol) / (buyVol + sellVol)) * 100 : 0;
        
        return {
            globalHeat: heat,
            deltaStream: (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%',
            deltaColor: delta >= 0 ? 'text-white/90' : 'text-white/50'
        };
    }, [whaleEvents]);

    const filteredFeed = useMemo(() => {
        if (!activeTokenFilter) return whaleEvents;
        return whaleEvents.filter(tx => tx.token.toUpperCase() === activeTokenFilter);
    }, [whaleEvents, activeTokenFilter]);

    const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

    return (
        <div className="relative text-white/90 font-sans selection:bg-white/10 selection:text-white overflow-x-hidden">
            <div className="relative z-10 w-full max-w-[2560px] mx-auto flex flex-col">
                <div className="pb-24 relative z-10">
                    <div className="px-8 pt-12 max-w-[2400px] mx-auto">
                    </div>
                    <CatchTheWhale />

                    <section className="px-8 pb-8 pt-2 max-w-[2400px] mx-auto space-y-8">
                        <MarketHeatmap24h />
                        <ExchangeBTCOpenInterest />
                    </section>

                    <section className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[2400px] mx-auto">
                        <div className="lg:col-span-12 space-y-4 mb-8">
                            <LegendaryWhaleLeaderboard />
                        </div>

                        <div className="lg:col-span-12 space-y-4">
                            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-sm group hover:border-white/20 transition-all duration-500 overflow-hidden relative">
                                <TacticalPulseAnalytics />
                                <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Global Heat</p>
                                        <div className="text-2xl font-mono font-black text-white/90">{globalHeat} <span className="text-[10px] text-white/40 font-bold uppercase">{Number(globalHeat) > 8 ? 'Optimal' : 'Standard'}</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Delta Stream</p>
                                        <div className={`text-2xl font-mono font-black ${deltaColor}`}>{deltaStream}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="px-8 pb-12 overflow-hidden max-w-[2400px] mx-auto">
                        {!activeTokenFilter && (
                            <div className="mb-12 mt-8 relative z-20 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                                <div className="flex flex-wrap gap-2 pr-4 sm:pr-0 min-w-max sm:min-w-0">
                                    {PERFECTION_TOKENS.map(token => {
                                        const isSelected = selectedTokens.includes(token);
                                        return (
                                            <button
                                                key={token}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedTokens(selectedTokens.filter((t: string) => t !== token));
                                                    } else {
                                                        setSelectedTokens([...selectedTokens, token]);
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-aztec-mono font-black uppercase tracking-widest transition-all border ${
                                                    isSelected 
                                                        ? 'bg-white/10 text-white/90 border-white/20 shadow-sm' 
                                                        : 'bg-white/[0.02] text-white/50 border-white/10 hover:border-white/20 hover:text-white/90'
                                                }`}
                                            >
                                                {token}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTokenFilter ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 border border-white/5 rounded-[3.5rem] bg-white/[0.02] shadow-2xl p-10 overflow-hidden relative group h-[700px]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50 pointer-events-none" />
                                    <WhaleMomentumChart symbol={activeTokenFilter} onClick={() => setSelectedSymbolForOverlay(activeTokenFilter)} />
                                </div>
                                <div className="lg:col-span-4 flex flex-col gap-6">
                                    <div className="flex-1 bg-white/[0.02] backdrop-blur-xl rounded-[3rem] border border-white/5 p-8 overflow-y-auto custom-scrollbar shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em]">Persistent Activity: {activeTokenFilter}</h3>
                                            <button 
                                                onClick={() => setActiveTokenFilter(null)}
                                                className="px-3 py-1 bg-white/[0.05] hover:bg-white/10 text-white/50 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                Back to Grid
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {filteredFeed.slice(0, 50).map((tx) => (
                                                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1 h-8 rounded-full shrink-0 ${tx.action === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        <span className="text-sm font-black font-mono text-white/90">${fmt(tx.usdNum)}</span>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${tx.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{tx.action}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigator.clipboard.writeText(tx.wallet)}
                                                        className="text-[11px] font-mono text-white/40 hover:text-emerald-400 truncate text-left sm:text-right"
                                                    >
                                                        {tx.wallet.slice(0, 8)}...{tx.wallet.slice(-6)}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                {selectedTokens.map((token: string) => (
                                    <div key={token} className="group flex flex-col bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/30 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl">
                                        <div className="h-64 relative">
                                            <WhaleMomentumChart symbol={token} compact onClick={() => setSelectedSymbolForOverlay(token)} />
                                        </div>
                                        <PreCognitiveGrid symbol={token} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <AnimatePresence>
                    {selectedSymbolForOverlay && (
                        <TokenChartOverlay 
                            symbol={selectedSymbolForOverlay} 
                            onClose={() => setSelectedSymbolForOverlay(null)} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
