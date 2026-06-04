"use client";

import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useVIPStore, WhaleEvent, EMPTY_ARRAY } from '@/lib/vip-store';
import { TrendingUp, TrendingDown } from 'lucide-react';

// --- ARCTIC AESTHETIC CONSTANTS
const COLORS = {
    BUY: '#06d6a0',      // vivid cyan/mint
    SELL: '#ef476f',     // vivid rose
    TRANSFER: '#06d6a0', // converged to green for unified long-side signal
};

const resolveCandleType = (action: string): 'BUY' | 'SELL' | 'TRANSFER' => {
    if (action === 'BUY' || action === 'COMPRA') return 'BUY';
    if (action === 'SELL' || action === 'VENTA') return 'SELL';
    return 'TRANSFER';
};

interface ChartProps {
    symbol: string;
    compact?: boolean;
    onClick?: () => void;
}

const arePropsEqual = (prev: any, next: any) => {
    return prev.symbol === next.symbol && prev.compact === next.compact;
};

/**
 * RESTORED HEIKIN-ASHI CHART: THE "TERMINAL BUENA" EDITION
 * Restores the exact visuals of the 48-interval chart with Arctic aesthetics,
 * but uses atomic subscriptions for loop prevention.
 */
/**
 * HEIKIN-ASHI TACTICAL MOMENTUM (LEGENDARY EDITION)
 * Implements 1-minute persistence and real-time micro-fluctuations.
 */
export const HeikinAshiChart = memo(({
    symbol,
    compact = false,
    onClick,
}: ChartProps) => {
    // Isolated Subscription
    const data = useVIPStore(state => state.tokenFeeds[symbol.toUpperCase()] || EMPTY_ARRAY);

    if (data.length > 0) {
        console.log(`[HeikinAshiChart] ${symbol} has ${data.length} events in store.`);
    }

    const { candles, netBuy, netSell, netTransfer, nowIndex = -1 } = useMemo(() => {
        if (!data.length) return { candles: [], netBuy: 0, netSell: 0, netTransfer: 0 };

        // ️ [DATA PRECISION] 1-Minute Wall-Clock Aligned Binning
        const binCount = 60; // 60 minutes of history
        const intervalMs = 60000; // 1 minute
        const now = Date.now();
        const endOfCurrentMinute = Math.floor(now / intervalMs) * intervalMs + intervalMs;
        const futurePadding = 0; // Removed projections as requested
        const chartEnd = endOfCurrentMinute + futurePadding;
        const startOfWindow = chartEnd - (binCount * intervalMs);
        
        const bins: WhaleEvent[][] = Array.from({ length: binCount }, () => []);

        data.forEach(e => {
            if (e.ts < startOfWindow || e.ts >= endOfCurrentMinute) return;
            const diff = e.ts - startOfWindow;
            const idx = Math.floor(diff / intervalMs);
            if (idx >= 0 && idx < binCount) {
                bins[idx].push(e);
            }
        });

        let haOpen = 50, haClose = 50;
        let nb = 0, ns = 0, nt = 0;

        const processedCandles = bins.map((bucket, i) => {
            let buy = 0, sell = 0, trans = 0;
            bucket.forEach(e => {
                const type = resolveCandleType(e.action);
                if (type === 'BUY') { buy += e.usdNum; nb += e.usdNum; }
                else if (type === 'SELL') { sell += e.usdNum; ns += e.usdNum; }
                else { trans += e.usdNum; nt += e.usdNum; }
            });

            const total = buy + sell + trans || (i === binCount - 1 ? 0.01 : 0); // Active candle baseline
            //  [TACTICAL VOLATILITY] Increased multiplier from 10 to 55 for aggressive signal detection
            const impact = total > 0 ? ((buy - sell) / Math.max(total, 0.01)) * 55 : 0;
            const newClose = Math.max(5, Math.min(95, haClose + impact));

            const open = (haOpen + haClose) / 2;
            const close = (open + newClose + Math.max(newClose, open) + Math.min(newClose, open)) / 4;
            //  [VISUAL AMPLIFICATION] Widened wick range for better readability
            const high = Math.min(98, Math.max(open, close) + Math.abs(impact) * 0.8);
            const low = Math.max(2, Math.min(open, close) - Math.abs(impact) * 0.8);

            let dominant: 'BUY' | 'SELL' | 'TRANSFER' = 'TRANSFER';
            if (buy >= sell && buy >= trans) dominant = 'BUY';
            else if (sell >= buy && sell >= trans) dominant = 'SELL';

            haOpen = open; haClose = close;

            return { open, close, high, low, type: dominant, volume: total, count: bucket.length, timestamp: startOfWindow + (i * intervalMs) };
        });

        const firstNonEmpty = processedCandles.findIndex(c => c.volume > 0);
        const trimStart = firstNonEmpty > 0 ? Math.max(0, firstNonEmpty - 3) : 0;
        const trimmedCandles = processedCandles.slice(trimStart);
        
        //  [CLARITY MAP] Calculate relative position of "NOW"
        const nowIdx = Math.floor((endOfCurrentMinute - startOfWindow) / intervalMs) - trimStart;

        return { candles: trimmedCandles, netBuy: nb, netSell: ns, netTransfer: nt, nowIndex: nowIdx };
    }, [data, symbol]);

    const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    const netFlow = netBuy - netSell;

    const renderCandle = (c: any, i: number, isLarge: boolean) => {
        const bodyBot = Math.min(c.open, c.close);
        const bodyH = Math.max(isLarge ? 1 : 0.5, Math.abs(c.close - c.open));
        const wickH = c.high - c.low;
        const color = COLORS[c.type as keyof typeof COLORS];
        
        //  [REAL CODE VIBRATION] Micro-oscillation tied to volume intensity
        // Higher volume = more "visual pressure"
        const vibrationScale = c.volume > 0 ? Math.min(1.05, 1 + (c.volume / 1000000) * 0.01) : 1;
        const activeClass = i === candles.length - 1 ? 'animate-pulse' : '';

        return (
            <div key={i} className={`relative flex-1 flex flex-col items-center h-full group/candle ${activeClass}`}>
                {/* WICK */}
                <div 
                    className="absolute w-px opacity-30 transition-all duration-300" 
                    style={{ backgroundColor: color, height: `${wickH}%`, bottom: `${c.low}%` }} 
                />
                
                {/* BODY with Micro-Fluctuation */}
                <motion.div 
                    animate={{ 
                        scaleY: [1, vibrationScale, 1],
                        opacity: c.volume > 0 ? [1, 1, 1] : 0.4
                    }}
                    transition={{ 
                        duration: 1.5, // Faster vibration for more "energy"
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className={`absolute rounded-full z-10 ${isLarge ? 'w-1.5 lg:w-3' : 'w-1 lg:w-2'}`}
                    style={{ 
                        backgroundColor: color, 
                        //  [VISIBILITY WALL] Minimum height increased for ultra-premium visibility
                        height: `${Math.max(isLarge ? 4 : 3, bodyH)}%`, 
                        bottom: `${bodyBot}%`, 
                        boxShadow: isLarge ? `0 0 15px ${color}60` : 'none',
                        width: isLarge ? 'auto' : undefined
                    }} 
                />
            </div>
        );
    };

    const buyVolumeTotal = data.filter(e => e.action === 'BUY').reduce((acc, e) => acc + e.usdNum, 0);
    const sellVolumeTotal = data.filter(e => e.action === 'SELL').reduce((acc, e) => acc + e.usdNum, 0);
    const totalMomentumV = buyVolumeTotal + sellVolumeTotal;
    const buyPct = totalMomentumV > 0 ? (buyVolumeTotal / totalMomentumV) * 100 : 50;
    const sellPct = totalMomentumV > 0 ? (sellVolumeTotal / totalMomentumV) * 100 : 50;

    if (compact) {
        return (
            <div
                onClick={onClick}
                className="relative bg-white backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] overflow-hidden cursor-crosshair pb-4 h-full flex flex-col justify-between"
            >
                <div className="absolute inset-0 bg-white pointer-events-none" />
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/50 z-10 relative">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-800">{symbol}</span>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest font-mono relative z-10">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{fmt(netBuy)}</span>
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{fmt(netSell)}</span>
                    </div>
                </div>
 
                <div className="h-32 flex items-end justify-between gap-px px-4 py-4 relative z-10 flex-1">
                    {/* Background grid lines for premium feel */}
                    <div className="absolute inset-0 border-t border-b border-slate-50 flex flex-col justify-between pointer-events-none opacity-50">
                        <div className="h-px w-full bg-slate-100"/>
                        <div className="h-px w-full bg-slate-100"/>
                        <div className="h-px w-full bg-slate-100"/>
                    </div>

                    {candles.map((c, i) => renderCandle(c, i, false))}
                </div>

                {/* Integrated Token Momentum Bar (Compact) */}
                <div className="px-5 mt-4 pb-2 space-y-2 z-10 relative">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth Vector</span>
                        <span className="text-[11px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-md">{buyPct.toFixed(0)}% BUY</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            style={{ width: `${buyPct}%` }}
                        />
                        <div 
                            className="h-full bg-rose-500 transition-all duration-700"
                            style={{ width: `${sellPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                        <span className="text-emerald-600">Buying Pressure</span>
                        <span className="text-rose-600">Selling Pressure</span>
                    </div>
                </div>
            </div>
        );
    }
 
    return (
        <div onClick={onClick} className="relative w-full h-full flex flex-col bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 group/chart">
            <div className="absolute inset-0 bg-white pointer-events-none" />
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-md relative z-10">
                <span className="text-[12px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">{symbol} / High-Fidelity Grid</span>
                <div className="flex items-center gap-3 sm:gap-6 text-[9px] sm:text-[11px] font-black uppercase tracking-widest overflow-hidden">
                   <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1.5 bg-black/5 rounded-lg border border-slate-100 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-slate-600 font-mono tracking-tighter">60M WINDOW</span>
                   </div>
                   <span className="text-emerald-600 font-mono bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-100 shrink-0">${fmt(netBuy)} B</span>
                   <span className="text-rose-600 font-mono bg-rose-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-rose-100 shrink-0">${fmt(netSell)} S</span>
                   <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                   <span className={`${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-mono shrink-0`}>{netFlow >= 0 ? '+' : ''}{fmt(netFlow)} DELTA</span>
                </div>
            </div>
 
            <div className="flex-1 relative p-8 flex flex-col">
                <div className="flex-1 border border-slate-100 rounded-2xl relative overflow-hidden bg-white shadow-inner">
                    <div className="absolute inset-0 flex items-end justify-between px-6 pb-6 gap-px">
                        {/* Premium Grid Background */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-6">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-px w-full bg-slate-300"/>)}
                        </div>

                        {/* TIME SECTOR DIVISIONS */}
                        {/* NO BARRIERS - CLEAN HISTORICAL DATA ONLY */}

                        {candles.map((c, i) => renderCandle(c, i, true))}
                    </div>
                </div>

                {/* Metrics & Momentum Section (Expanded) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Volume Profile */}
                    <div className="h-32 border border-slate-200 bg-black/5 rounded-3xl flex items-end gap-1 px-8 pb-4 pt-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-4 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Profile</div>
                        {candles.map((c, i) => {
                            const maxV = Math.max(...candles.map(x => x.volume), 1);
                            //  [LOG SCALE FEEL] Volume bars use sqrt for more balanced profile visibility
                            const barH = c.volume > 0 ? Math.max(5, (c.volume / maxV) * 90) : 0;
                            return <div key={i} className="flex-1 rounded-t-[4px] transition-all hover:bg-cyan-500/30" style={{ height: `${barH}%`, backgroundColor: COLORS[c.type as keyof typeof COLORS] + '80' }} />;
                        })}
                    </div>

                    {/* Momentum Grid */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center gap-5 shadow-sm">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Conviction</span>
                            <span className="text-3xl font-black text-emerald-600 font-mono bg-emerald-50 px-4 py-1 rounded-xl border border-emerald-100">{buyPct.toFixed(1)}% <span className="text-[10px] text-emerald-600/60 uppercase tracking-widest ml-1">Buy Side</span></span>
                        </div>
                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                style={{ width: `${buyPct}%` }}
                            />
                            <div 
                                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-1000"
                                style={{ width: `${sellPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em]">
                            <span className="text-emerald-600">Buying Support</span>
                            <span className="text-rose-600">Selling Resistance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, arePropsEqual);

HeikinAshiChart.displayName = 'HeikinAshiChart';
