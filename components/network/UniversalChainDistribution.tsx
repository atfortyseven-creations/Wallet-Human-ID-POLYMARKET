"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Globe, Server } from 'lucide-react';

interface ChainWeight {
    id: string;
    name: string;
    symbol: string;
    weight: number; // percentage of total hashrate or security
    health: number;
    color: string;
    type: 'POW' | 'POS' | 'L2';
}

const CHAIN_WEIGHTS: ChainWeight[] = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', weight: 64.2, health: 100, color: '#f97316', type: 'POW' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', weight: 18.4, health: 99.9, color: '#6366f1', type: 'POS' },
    { id: 'sol', name: 'Solana', symbol: 'SOL', weight: 4.8, health: 98.4, color: '#8b5cf6', type: 'POS' },
    { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', weight: 3.2, health: 99.1, color: '#eab308', type: 'POS' },
    { id: 'base', name: 'Base', symbol: 'BASE', weight: 2.1, health: 100, color: '#0052ff', type: 'L2' },
    { id: 'arb', name: 'Arbitrum', symbol: 'ARB', weight: 1.8, health: 99.8, color: '#28a0f0', type: 'L2' },
    { id: 'opt', name: 'Optimism', symbol: 'OP', weight: 1.4, health: 99.7, color: '#ff0420', type: 'L2' },
    { id: 'pol', name: 'Polygon', symbol: 'POL', weight: 1.2, health: 99.2, color: '#7b3fe4', type: 'POS' },
    { id: 'avax', name: 'Avalanche', symbol: 'AVAX', weight: 0.9, health: 98.9, color: '#e84142', type: 'POS' },
    { id: 'trx', name: 'Tron', symbol: 'TRX', weight: 0.7, health: 99.5, color: '#ff0013', type: 'POS' },
    { id: 'link', name: 'Chainlink', symbol: 'LINK', weight: 0.5, health: 100, color: '#2a5ada', type: 'L2' },
    { id: 'matic', name: 'Polygon Pos', symbol: 'MATIC', weight: 0.4, health: 99.0, color: '#8247e5', type: 'POS' },
    // Simplified for mockup, representing 33 chains
];

export function UniversalChainDistribution({ theme = 'default' }: { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';

    return (
        <div className={`${isArctic ? 'bg-white/60 backdrop-blur-3xl border-slate-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'} rounded-[3rem] border p-8 md:p-12 overflow-hidden relative group`}>
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm ${isArctic ? 'bg-indigo-50 border-indigo-100' : 'bg-black/5 border-slate-100'}`}>
                            <Globe size={24} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Global Security Weight</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Multi-Chain Consensus Distribution</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${isArctic ? 'bg-white/80 border-slate-200' : 'bg-black/5 border-slate-100'}`}>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">33 Nodes Synchronized</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {CHAIN_WEIGHTS.map((chain, i) => (
                        <motion.div 
                            key={chain.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group/item"
                        >
                            <div className="flex items-center justify-between mb-2 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: chain.color }} />
                                    <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{chain.name}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${isArctic ? 'bg-black/5 border-slate-100 text-slate-400' : 'bg-black/5 border-slate-100 text-slate-400'}`}>{chain.type}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs font-black font-mono text-slate-900 tracking-tighter">{chain.weight}%</div>
                                        <div className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Hash Share</div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className={`text-xs font-black font-mono tracking-tighter ${chain.health > 99 ? 'text-emerald-500' : 'text-amber-500'}`}>{chain.health}%</div>
                                        <div className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Integrity</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`h-2.5 w-full rounded-full overflow-hidden border ${isArctic ? 'bg-black/5 border-slate-100' : 'bg-black/5 border-slate-100'}`}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${chain.weight}%` }}
                                    transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: "circOut" }}
                                    className="h-full rounded-full relative overflow-hidden"
                                    style={{ backgroundColor: chain.color }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-slate-300">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Aggregate Network Security: <span className="text-slate-900">2.41 ZETAHASH</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">System Validation Active</span>
                    </div>
                </div>
            </div>
            
            {/* Decorative Grid */}
            <div className={`absolute inset-0 pointer-events-none opacity-[0.03] ${isArctic ? 'bg-indigo-900' : 'bg-slate-900'}`} style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />
        </div>
    );
}

