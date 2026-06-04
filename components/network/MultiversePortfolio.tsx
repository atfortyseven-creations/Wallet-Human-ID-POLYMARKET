"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronRight, Activity, ArrowRightLeft } from 'lucide-react';
import { OMNI_CHAINS } from '@/lib/blockchain/OmniChainConstants';

export function MultiversePortfolio({ theme = 'default' }: { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const [address, setAddress] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [hasScanned, setHasScanned] = useState(false);
    const [totalUsd, setTotalUsd] = useState(0);
    const [chainBalances, setChainBalances] = useState<Record<string, number>>({});

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) return;
        setIsScanning(true);
        setHasScanned(false);
        
        try {
            const res = await fetch(`/api/network/multiverse/portfolio?address=${address}`);
            const data = await res.json();
            
            if (data && data.chains) {
                setTotalUsd(data.totalUsd || 0);
                
                // Directly use the natively mapped chains from the intelligent backend
                setChainBalances(data.chains);
            }
        } catch (error) {
            console.error("Failed to scan portfolio", error);
        } finally {
            setIsScanning(false);
            setHasScanned(true);
        }
    };

    return (
        <div className={`${isArctic ? 'bg-white/40 backdrop-blur-xl border-slate-200' : 'bg-white border-slate-200 shadow-sm'} rounded-3xl p-6 md:p-8 border relative overflow-hidden group transition-all`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${isArctic ? 'from-indigo-500/5' : 'from-emerald-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl border ${isArctic ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                            <Wallet size={18} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isArctic ? 'text-indigo-600' : 'text-emerald-600'}`}>Multichain Portfolio</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Omni-Chain Assets</h3>
                    <p className={`text-[11px] font-bold uppercase tracking-widest max-w-sm ${isArctic ? 'text-slate-400' : 'text-slate-500'}`}>
                        Instantly resolve and aggregate cryptographic wealth across 33+ L1 and L2 networks sequentially.
                    </p>
                </div>

                <div className="w-full md:w-1/2">
                    <form onSubmit={handleScan} className="flex gap-2 relative">
                        <input
                            type="text"
                            placeholder="Enter 0x... Address or ENS"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`flex-1 ${isArctic ? 'bg-white border-slate-200' : 'bg-black/5 border-slate-200'} rounded-2xl px-6 h-14 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none ${isArctic ? 'focus:border-indigo-400' : 'focus:border-emerald-400'} transition-colors`}
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !address.trim()}
                            className={`h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isArctic ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600'}`}
                        >
                            {isScanning ? (
                                <Activity size={16} className="animate-spin" />
                            ) : (
                                <>Scan <ChevronRight size={14} /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {hasScanned && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 pt-8 border-t border-slate-100"
                >
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8">
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 mb-2">Aggregated Net Worth</p>
                            <div className="text-5xl font-black font-mono text-slate-900 tracking-tighter">
                                ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6 md:mt-0">
                            <div className="px-5 py-3 rounded-full bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Active API Resolving</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {OMNI_CHAINS.slice(0, 12).map((chain, i) => {
                            // REAL API BALANCE INJECTION
                            const bal = chainBalances[chain.name] || 0;
                            if (bal === 0) return null; // Only show chains with balance
                            
                            return (
                                <motion.div 
                                    key={chain.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`${isArctic ? 'bg-white/80 border-slate-100' : 'bg-black/5 border-slate-100'} border rounded-2xl p-4 flex flex-col justify-between shadow-sm`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chain.color }} />
                                        <span className={`text-[9px] font-black uppercase tracking-wider truncate ${isArctic ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {chain.name}
                                        </span>
                                    </div>
                                    <div className="font-mono font-bold text-slate-900 text-sm">
                                        ${bal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {Object.keys(chainBalances).length === 0 && (
                             <div className="col-span-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border border-slate-200 rounded-2xl border-dashed">
                                No substantial liquid assets found on primary chains.
                             </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
