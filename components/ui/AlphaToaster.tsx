"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore, WhaleEvent } from '@/lib/vip-store';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

/**
 * AlphaToaster 
 * 
 * Minimalist, high-fidelity notification system.
 * Designed for absolute perfection and elegance.
 */
export function AlphaToaster() {
    const { isConnected } = useAccount();
    const whaleEvents = useVIPStore(state => state.whaleEvents);
    const [activeAlert, setActiveAlert] = useState<WhaleEvent | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Fixed conversion rate (approximate for display perfection)
    const USD_TO_EUR = 0.93;

    useEffect(() => {
        // [INSTITUTIONAL GUARD] Do not trigger alerts in Genesis mode (System Isolation)
        if (!isConnected) {
            if (activeAlert) setActiveAlert(null);
            return;
        }
        if (whaleEvents.length > 0 && !isMuted) {
            const latest = whaleEvents[0];
            // Defensive Audit: Improved threshold for better visibility
            if (latest && (latest.tier === 'MEGA' || latest.tier === 'LARGE' || latest.confidence > 90)) {
                if (activeAlert?.id !== latest.id) {
                    setActiveAlert(latest);
                    const timer = setTimeout(() => setActiveAlert(null), 12000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [whaleEvents, activeAlert?.id, isMuted, isConnected]);

    const formatEUR = (usd: number) => {
        const eur = usd * USD_TO_EUR;
        if (eur >= 1_000_000) return `${(eur / 1_000_000).toFixed(2)}M`;
        if (eur >= 1000) return `${(eur / 1000).toFixed(1)}K`;
        return `${eur.toFixed(2)}`;
    };

    const isBuy = (action: string) => 
        action.toUpperCase().includes('BUY');

    const sanitizeLabel = (label: string) => {
        const tacky = ["ALPHA CLEARANCE", "LIVE ALERT", "CLEARANCE ALERT"];
        const upperLabel = label.toUpperCase();
        if (tacky.some(t => upperLabel.includes(t))) return "Institutional Signal";
        return label;
    };

    return (
        <div className="fixed top-8 right-8 z-[100] flex flex-col items-end gap-4">
            
            {/* Global Visibility Toggle */}
            <button 
                onClick={() => {
                    setIsMuted(!isMuted);
                    if (!isMuted) setActiveAlert(null);
                    toast(isMuted ? "Signals Reactive" : "Signals Muted", { icon: isMuted ? "" : "" });
                }}
                className={`pointer-events-auto p-3 rounded-full border transition-all shadow-xl ${
                    isMuted 
                        ? 'bg-rose-500 text-white border-transparent' 
                        : 'bg-white text-black border-black/10 hover:border-black/20'
                }`}
            >
                {isMuted ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <AnimatePresence mode="wait">
                {activeAlert && !isMuted && (
                    <motion.div
                        key={activeAlert.id}
                        initial={{ opacity: 0, scale: 0.98, x: 20, filter: 'blur(12px)' }}
                        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, x: 10, filter: 'blur(8px)' }}
                        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="pointer-events-auto"
                    >
                        <div className="relative group overflow-hidden bg-white  border border-black/10  rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col min-w-[360px]">
                            
                            {/* Subtle Ambient Glow (Non-transparent container now helps contrast) */}
                            <div className={`absolute -top-[50%] -right-[50%] w-[100%] h-[100%] blur-[100px] rounded-full opacity-10 pointer-events-none transition-colors duration-700 ${
                                isBuy(activeAlert.action) ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            
                            <div className="p-7 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${
                                            isBuy(activeAlert.action) ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                            System Signal
                                        </span>
                                        <h3 className="text-[17px] font-bold text-black  tracking-tight">
                                            {sanitizeLabel(activeAlert.label)}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                                            isBuy(activeAlert.action) 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                        }`}>
                                            {isBuy(activeAlert.action) ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                                {isBuy(activeAlert.action) ? 'BUY' : 'SELL'}
                                            </span>
                                        </div>
                                        <button onClick={() => setActiveAlert(null)} className="text-black/10  hover:text-black  transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/20 ">Valuation</span>
                                        <span className="text-[20px] font-mono font-black text-black  tracking-tighter">
                                            {formatEUR(activeAlert.usdNum || 0)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end text-right">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/20 ">Asset Cluster</span>
                                        <span className="text-[15px] font-mono font-bold text-black  tracking-tight truncate max-w-[140px]">
                                            {Number(activeAlert.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[11px] opacity-40">{activeAlert.token}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-black/5 ">
                                    <a 
                                        href={`https://etherscan.io/tx/${activeAlert.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40  hover:text-black  transition-colors duration-300"
                                    >
                                        VERIFY ON CIPHER
                                        <ExternalLink size={11} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
                                    </a>
                                    <code className="text-[9px] font-mono text-black/20  uppercase tracking-tighter">
                                        {activeAlert.hash.slice(0, 6)}...{activeAlert.hash.slice(-4)}
                                    </code>
                                </div>
                            </div>

                            {/* Minimal Progress Bar */}
                            <div className="h-[3px] w-full bg-black/5 ">
                                <motion.div 
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 12, ease: "linear" }}
                                    className={`h-full ${isBuy(activeAlert.action) ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



