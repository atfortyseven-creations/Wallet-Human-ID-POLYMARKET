"use client";

import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore, HACandle, EMPTY_ARRAY } from '@/lib/vip-store';

const COLORS = {
    BULL: '#06d6a0',      // vivid cyan/mint (Heikin-Ashi Bull)
    BEAR: '#ef476f',      // vivid rose (Heikin-Ashi Bear)
    NEUTRAL: '#94a3b8',   // slate-400
    GRID: 'rgba(15, 23, 42, 0.05)',
};

interface ChartProps {
    symbol?: string;
    compact?: boolean;
    onClick?: () => void;
    showAxes?: boolean;
}

const arePropsEqual = (prev: any, next: any) => {
    return prev.symbol === next.symbol && prev.compact === next.compact;
};

/**
 * WHALE HEIKIN-ASHI MATRIX V1.0
 * Implements 1-minute smoothed trend analysis with persistent telemetry.
 */
export const WhaleMomentumChart = memo(({
    symbol = "",
    compact = false,
    onClick,
    showAxes = false,
}: ChartProps) => {
    const s = symbol.toUpperCase().trim();
    const candles = useVIPStore(state => state.candleFeeds[s] || EMPTY_ARRAY) as HACandle[];

    // Calculate chart bounds and scales
    const { 
        visibleCandles, 
        minPrice, 
        maxPrice, 
        maxVol, 
        isBullish,
        lastPrice
    } = useMemo(() => {
        if (!candles.length) return { visibleCandles: [], minPrice: 0, maxPrice: 0, maxVol: 0, isBullish: true, lastPrice: 0 };

        // Take last 60 candles for 1h view
        const data = [...candles].sort((a, b) => a.ts - b.ts).slice(-60);
        
        let min = Infinity, max = -Infinity, mv = 0;
        data.forEach(c => {
            min = Math.min(min, c.haLow, c.haClose, c.haOpen);
            max = Math.max(max, c.haHigh, c.haClose, c.haOpen);
            mv = Math.max(mv, c.volume);
        });

        // Add 5% padding
        const range = max - min;
        min -= range * 0.05;
        max += range * 0.05;

        const last = data[data.length - 1];
        const bull = last.haClose >= last.haOpen;

        return { 
            visibleCandles: data, 
            minPrice: min, 
            maxPrice: max, 
            maxVol: mv,
            isBullish: bull,
            lastPrice: last.haClose
        };
    }, [candles]);

    const fmt = (n: number) => {
        if (n >= 1000) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
    };

    const getX = (i: number) => (i / 59) * 100;
    const getY = (p: number) => 100 - ((p - minPrice) / (maxPrice - minPrice)) * 100;

    return (
        <div onClick={onClick} className={`relative flex flex-col h-full w-full ${compact ? '' : 'p-6 bg-white/40 rounded-3xl border border-slate-100/50 backdrop-blur-xl shadow-2xl overflow-hidden'}`}>
            
            {/* Header / Legend */}
            <div className={`flex items-center justify-between z-10 ${compact ? 'px-4 py-3 border-b border-slate-50 mb-1' : 'mb-4'}`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-slate-800 tracking-tighter">{s}</span>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    {!compact && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Heikin-Ashi 1m  Whale Optimized
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[12px] font-black font-mono tracking-tight ${isBullish ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(lastPrice)}
                    </span>
                    {!compact && <span className="text-[8px] font-black text-slate-300 uppercase">Real-time Stream</span>}
                </div>
            </div>

            {/* Main Canvas */}
            <div className={`flex-1 relative overflow-hidden ${compact ? 'min-h-[80px]' : 'min-h-[180px] rounded-2xl bg-black/5/30 border border-slate-100/50 shadow-inner'}`}>
                {/* Horizontal Grid */}
                {!compact && (
                    <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-40">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-px w-full border-t border-dashed border-slate-200" />)}
                    </div>
                )}

                {candles.length > 0 ? (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full p-2 overflow-visible">
                        {/* Volume Profile (Bottom Layer) */}
                        {visibleCandles.map((c, i) => {
                            const vH = (c.volume / (maxVol || 1)) * 25;
                            return (
                                <rect
                                    key={`v-${i}`}
                                    x={getX(i) - 0.5}
                                    y={100 - vH}
                                    width="1"
                                    height={vH}
                                    fill={c.haClose >= c.haOpen ? COLORS.BULL : COLORS.BEAR}
                                    opacity="0.1"
                                />
                            );
                        })}

                        {/* Heikin-Ashi Candles */}
                        {visibleCandles.map((c, i) => {
                            const x = getX(i);
                            const yOpen = getY(c.haOpen);
                            const yClose = getY(c.haClose);
                            const yHigh = getY(c.haHigh);
                            const yLow = getY(c.haLow);
                            const isGreen = c.haClose >= c.haOpen;
                            const color = isGreen ? COLORS.BULL : COLORS.BEAR;
                            
                            const bodyTop = Math.min(yOpen, yClose);
                            const bodyBottom = Math.max(yOpen, yClose);
                            const bodyHeight = Math.max(0.5, bodyBottom - bodyTop);

                            return (
                                <g key={`c-${i}`}>
                                    {/* Wick */}
                                    <line 
                                        x1={x} y1={yHigh} x2={x} y2={yLow} 
                                        stroke={color} strokeWidth="0.5" strokeOpacity="0.4"
                                    />
                                    {/* Body */}
                                    <motion.rect
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        x={x - 0.6}
                                        y={bodyTop}
                                        width="1.2"
                                        height={bodyHeight}
                                        fill={color}
                                        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">
                            Initializing Pulse...
                        </span>
                    </div>
                )}

                {/* Vertical Cursor Line (Simulated for right edge) */}
                <div className="absolute top-0 bottom-0 right-1 w-px bg-slate-200 opacity-20" />
            </div>

            {/* Footer / Stats */}
            {!compact && (
                <div className="mt-4 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div className="flex items-center gap-4">
                        <span>Min: {fmt(minPrice)}</span>
                        <span>Max: {fmt(maxPrice)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-100 border border-emerald-500/20" />
                        <span className="text-slate-300 font-mono">Persistence Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}, arePropsEqual);

WhaleMomentumChart.displayName = 'WhaleMomentumChart';
