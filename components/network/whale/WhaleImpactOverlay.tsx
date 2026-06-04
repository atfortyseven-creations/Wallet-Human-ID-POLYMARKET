"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Flame, ShieldAlert, Zap, Cpu, Globe } from 'lucide-react';

interface WhaleImpactProps {
    active: boolean;
    data: {
        amount: number;
        asset: string;
        usdValue: number;
        chain: string;
        dex?: string;
    } | null;
    onComplete: () => void;
}

export function WhaleImpactOverlay({ active, data, onComplete }: WhaleImpactProps) {
    useEffect(() => {
        if (active) {
            const timer = setTimeout(onComplete, 4500);
            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    if (!active || !data) return null;

    const isMega = data.usdValue >= 1000000;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
            >
                {/* Fixed Background Noise Grain */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-bg" />

                {/* System Ambient Glow */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 1.5], opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={`absolute w-[1000px] h-[1000px] rounded-full blur-[160px] ${isMega ? 'bg-indigo-500/30' : 'bg-white/10'}`}
                />

                {/* Main Content Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative flex flex-col items-center"
                >
                    {/* SVG Filter for System Glow */}
                    <svg className="absolute w-0 h-0">
                        <filter id="system-glow">
                            <feGaussianBlur stdDeviation="12" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </svg>

                    {/* Impact Card */}
                    <motion.div
                        className={`glass-system p-10 md:p-14 rounded-[3rem] flex flex-col items-center gap-6 relative overflow-hidden backdrop-blur-3xl border-white/5`}
                        style={{ filter: 'url(#system-glow)' }}
                    >
                        {/* Status Label */}
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-2"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isMega ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                                Large Scale Movement Alert
                            </span>
                        </motion.div>

                        {/* Amount Heading */}
                        <div className="text-center space-y-2">
                            <motion.h2 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`text-7xl md:text-8xl font-black tracking-tighter ${isMega ? 'text-indigo-500' : 'text-white'} leading-none`}
                            >
                                ${data.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-500 text-sm font-medium tracking-tight"
                            >
                                {data.amount.toLocaleString()} {data.asset} detected on {data.chain}
                            </motion.p>
                        </div>

                        {/* Divider */}
                        <div className="w-12 h-[1px] bg-white/10 my-2" />

                        {/* Labels / Metadata */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3"
                        >
                            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <Globe size={14} className="text-gray-400" />
                                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{data.chain}</span>
                            </div>
                            {data.dex && (
                                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-500" />
                                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">{data.dex}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Impact Footer */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className={`mt-6 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border ${isMega ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-600'}`}
                        >
                            {isMega ? 'Critical Elite Impact' : 'Whale Activity Detected'}
                        </motion.div>
                    </motion.div>

                    {/* Meta Stream Footer */}
                    <div className="mt-8 flex gap-12 opacity-30">
                        <div className="flex items-center gap-2">
                            <Cpu size={14} className="text-white" />
                            <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">System Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Flame size={14} className="text-white" />
                            <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">Market Shift Active</span>
                        </div>
                    </div>
                </motion.div>

                {/* Screen Vignette */}
                <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${isMega ? 'bg-indigo-950/20' : 'bg-black/40'}`} style={{ backdropFilter: 'blur(4px)' }} />
            </motion.div>
        </AnimatePresence>
    );
}
