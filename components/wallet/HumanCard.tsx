"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Copy, ExternalLink, QrCode, Wallet, TrendingUp, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StealthText } from '@/components/ui/stealth-text';
import { useApp } from '@/components/AppContext';
import useSWR from 'swr';

import ReceiveModal from '@/components/wallet/modals/ReceiveModal';
import QRScannerModal from '@/components/wallet/QRScannerModal';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface HumanCardProps {
    address?: string;
    balance?: string;
    change24hUSD?: number;
    change24hPercent?: number;
}

export const HumanCard = ({ address: propAddress, balance: propBalance, change24hUSD, change24hPercent }: HumanCardProps) => {
    const { t } = useApp();
    
    // User Data State
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isReceiveOpen, setIsReceiveOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Optimized Data Fetching with SWR
    const { data: walletData, error } = useSWR('/api/user/wallet', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 30000
    });

    const balance = propBalance !== undefined 
        ? (propBalance.startsWith('$') ? propBalance : `$${propBalance}`) 
        : (walletData?.balance ? `$${walletData.balance}` : (loading && !walletData ? "..." : "$0.00"));
    
    // Prioritize prop address for all logic
    const address = propAddress || walletData?.address || "";
    const addressDisplay = address || "Connect Wallet";

    useEffect(() => {
        if (walletData || error) setLoading(false);
    }, [walletData, error]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const onScan = () => setIsScannerOpen(true);
    const onReceive = () => setIsReceiveOpen(true);

    return (
        <>
            <div className="relative group perspective-1000 w-full max-w-md mx-auto">
                {/* 3D GLASS CARD CONTAINER - PURPLE THEME */}
                <motion.div 
                    initial={{ rotateX: 5, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative w-full aspect-[1.586/1] rounded-3xl p-6 flex flex-col justify-between overflow-hidden backdrop-blur-2xl border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                    style={{
                        background: "linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                >
                    {/* Internal Glow Effects */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* HEADER: LOGO & CHIP */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2 text-white/60 bg-black/20 px-3 py-1.5 rounded-full text-xs font-mono border border-white/5">
                            <Shield size={12} className="text-[#00ff9d]" />
                            LEDGER SECURED
                        </div>
                        <div className="w-12 h-8 rounded-md bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10" />
                            <div className="absolute top-0 left-1/2 h-full w-[1px] bg-white/10" />
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
                        
                        {/* Unique User Balance */}
                        <div className="text-5xl font-black text-white tracking-tighter drop-shadow-lg mb-2">
                             {loading ? (
                                 <div className="h-12 w-48 bg-white/10 animate-pulse rounded mx-auto" />
                             ) : (
                                 <StealthText>{balance}</StealthText>
                             )}
                        </div>
                        
                        {/* Trend Pill - Real-time Change State */}
                        {(change24hUSD !== undefined || change24hPercent !== undefined) ? (
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg transition-all",
                                (change24hPercent || 0) >= 0 
                                    ? "bg-[#00ff9d]/10 border-[#00ff9d]/20 text-[#00ff9d]" 
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    (change24hPercent || 0) >= 0 ? "bg-[#00ff9d] animate-pulse" : "bg-red-400"
                                )} />
                                <span>
                                    { (change24hPercent || 0) >= 0 ? '+' : '' }
                                    { change24hUSD?.toFixed(2) } USD ({ change24hPercent?.toFixed(2) }%)
                                </span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg bg-[#00ff9d]/10 border-[#00ff9d]/20 text-[#00ff9d]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                                <span>READY TO RECEIVE</span>
                            </div>
                        )}
                    </div>

                    {/* FOOTER: ADDRESS & ACTIONS */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        
                        {/* Address with Copy */}
                        <button 
                            onClick={handleCopy}
                            className="group/addr flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                        >
                            <span className="font-mono text-xs">{addressDisplay.slice(0, 6)}...{addressDisplay.slice(-4)}</span>
                            {copied ? (
                               <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#00ff9d] text-[10px] font-bold">COPIED</motion.span>
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

            <ReceiveModal 
                isOpen={isReceiveOpen} 
                onClose={() => setIsReceiveOpen(false)} 
                userAddress={address} 
            />
            <QRScannerModal 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={(data) => {
                    console.log("Scanned:", data);
                    setIsScannerOpen(false);
                }}
            />
        </>
    );
};

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
