"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Copy, ExternalLink, QrCode, Wallet, TrendingUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StealthText } from '@/components/ui/stealth-text';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface HumanCardProps {
    address: string;
    totalBalance: string;
    trend?: { value: string; percentage: string; positive: boolean };
    onReceive?: () => void;
    onSend?: () => void;
    onScan?: () => void;
}

export default function HumanCard({ 
    address = "0x...", 
    totalBalance = "$0.00",
    trend = { value: "+$0.00", percentage: "0.00%", positive: true },
    onReceive,
    onSend,
    onScan
}: HumanCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative w-full max-w-md mx-auto perspective-[1000px] group">
            
            {/* STACK EFFECT LAYERS */}
            {/* Layer 2 (Bottom) - Identity */}
            <motion.div 
                className="absolute inset-0 bg-neutral-900 rounded-[32px] translate-y-4 scale-[0.92] opacity-50 shadow-2xl z-0 border border-white/5"
                animate={{ 
                    translateY: isHovered ? 24 : 16,
                    scale: isHovered ? 0.90 : 0.92,
                }}
            />
            
            {/* Layer 1 (Middle) - Portfolio */}
            <motion.div 
                className="absolute inset-0 bg-neutral-800 rounded-[32px] translate-y-2 scale-[0.96] opacity-70 shadow-2xl z-10 border border-white/5"
                animate={{ 
                    translateY: isHovered ? 12 : 8,
                    scale: isHovered ? 0.94 : 0.96,
                }}
            />

            {/* MAIN CARD (Front) */}
            <motion.div
                className={cn(
                    "relative z-20 overflow-hidden",
                    "rounded-[32px] border border-white/10",
                    "bg-white/[0.03] backdrop-blur-[40px]",
                    "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]",
                    "p-8",
                    "flex flex-col justify-between min-h-[240px]"
                )}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                animate={{ 
                    y: isHovered ? -5 : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* GLASS SHINE EFFECT */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* HEADER: LOGO & CHIP */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-white/60 bg-black/20 px-3 py-1.5 rounded-full text-xs font-mono border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse box-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        HUMAN ID
                    </div>
                    <div className="w-12 h-8 rounded-md bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-white/10 flex items-center justify-center">
                        <div className="w-8 h-5 rounded-sm border border-white/20 relative overflow-hidden">
                             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
                             <div className="absolute top-0 left-1/2 h-full w-[1px] bg-white/10" />
                        </div>
                    </div>
                </div>

                {/* BALANCE SECTION - CENTERED */}
                <div className="text-center relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-neutral-400 text-xs font-medium uppercase tracking-[0.2em] mb-1"
                    >
                        Total Balance
                    </motion.div>
                    <motion.div 
                        layoutId="totalBalance"
                        className="text-5xl font-black text-white tracking-tighter drop-shadow-lg mb-2"
                    >
                        <StealthText>{totalBalance}</StealthText>
                    </motion.div>
                    
                    {/* Trend Pill */}
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg",
                        trend.positive 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        <TrendingUp size={12} className={trend.positive ? "" : "rotate-180"} />
                        <span><StealthText>{trend.value} ({trend.percentage})</StealthText></span>
                    </div>
                </div>

                {/* FOOTER: ADDRESS & ACTIONS */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    
                    {/* Address with Copy */}
                    <button 
                        onClick={handleCopy}
                        className="group/addr flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                    >
                        <span className="font-mono text-xs">{address.slice(0,6)}...{address.slice(-4)}</span>
                        {copied ? (
                           <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 text-[10px] font-bold">COPIED</motion.span>
                        ) : (
                           <Copy size={12} className="opacity-0 group-hover/addr:opacity-100 transition-opacity" />
                        )}
                    </button>

                    {/* Quick Actions (Mini) */}
                    <div className="flex gap-2">
                        <ActionButton icon={<QrCode size={16} />} onClick={onScan} label="Scan" />
                        <ActionButton icon={<ExternalLink size={16} />} onClick={onReceive} label="Receive" />
                    </div>
                </div>

            </motion.div>
        </div>
    );
}

function ActionButton({ icon, onClick, label }: { icon: React.ReactNode, onClick?: () => void, label: string }) {
    return (
        <button 
            onClick={onClick}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/5 hover:scale-105 active:scale-95"
            title={label}
        >
            {icon}
        </button>
    )
}
