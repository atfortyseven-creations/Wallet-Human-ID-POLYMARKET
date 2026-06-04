"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, Activity, ShieldCheck, Zap, Globe, Layers, Cpu } from 'lucide-react';

interface ChainData {
    name: string;
    type: 'L1' | 'L2' | 'L3' | 'MODULAR' | 'Enterprise';
    status: 'OPTIMAL' | 'CONGESTED' | 'MAINTENANCE';
    tps: number;
    gas: string;
    tvl: string;
}

const CHAINS: ChainData[] = [
    { name: 'Ethereum', type: 'L1', status: 'OPTIMAL', tps: 15.4, gas: '12 gwei', tvl: '$52.4B' },
    { name: 'Bitcoin', type: 'L1', status: 'OPTIMAL', tps: 7.2, gas: '14 sat/vB', tvl: '$1.2T' },
    { name: 'Solana', type: 'L1', status: 'OPTIMAL', tps: 2450, gas: '<$0.01', tvl: '$4.2B' },
    { name: 'Polygon', type: 'L2', status: 'OPTIMAL', tps: 85.2, gas: '35 gwei', tvl: '$1.1B' },
    { name: 'Arbitrum', type: 'L2', status: 'OPTIMAL', tps: 12.8, gas: '0.1 gwei', tvl: '$3.4B' },
    { name: 'Optimism', type: 'L2', status: 'OPTIMAL', tps: 9.4, gas: '0.1 gwei', tvl: '$1.8B' },
    { name: 'Base', type: 'L2', status: 'OPTIMAL', tps: 14.2, gas: '0.1 gwei', tvl: '$1.2B' },
    { name: 'ZK-Sync', type: 'L2', status: 'OPTIMAL', tps: 22.1, gas: '0.2 gwei', tvl: '$850M' },
    { name: 'Starknet', type: 'L2', status: 'OPTIMAL', tps: 5.4, gas: '0.5 gwei', tvl: '$620M' },
    { name: 'Avalanche', type: 'L1', status: 'OPTIMAL', tps: 34.2, gas: '25 nAVAX', tvl: '$950M' },
    { name: 'Celestia', type: 'MODULAR', status: 'OPTIMAL', tps: 120.5, gas: '0.01 TIA', tvl: '$2.1B' },
    { name: 'Sui', type: 'L1', status: 'OPTIMAL', tps: 850, gas: '0.02 SUI', tvl: '$580M' },
    { name: 'Aptos', type: 'L1', status: 'OPTIMAL', tps: 450, gas: '0.01 APT', tvl: '$420M' },
    { name: 'Polkadot', type: 'L1', status: 'OPTIMAL', tps: 12.4, gas: '0.1 DOT', tvl: '$1.4B' },
    { name: 'Cardano', type: 'L1', status: 'OPTIMAL', tps: 5.2, gas: '0.17 ADA', tvl: '$640M' },
    { name: 'Near', type: 'L1', status: 'OPTIMAL', tps: 65.4, gas: '0.01 NEAR', tvl: '$1.1B' },
    { name: 'Tron', type: 'L1', status: 'OPTIMAL', tps: 45.2, gas: '1.2 TRX', tvl: '$8.4B' },
    { name: 'XRP Ledger', type: 'L1', status: 'OPTIMAL', tps: 1500, gas: '0.0001 XRP', tvl: '$1.2B' },
    { name: 'Cosmos', type: 'L1', status: 'OPTIMAL', tps: 35.4, gas: '0.01 ATOM', tvl: '$2.4B' },
    { name: 'Fantom', type: 'L1', status: 'OPTIMAL', tps: 22.8, gas: '20 gwei', tvl: '$320M' },
    { name: 'Stellar', type: 'L1', status: 'OPTIMAL', tps: 950, gas: '0.0001 XLM', tvl: '$150M' },
    { name: 'Algorand', type: 'L1', status: 'OPTIMAL', tps: 1200, gas: '0.001 ALGO', tvl: '$180M' },
    { name: 'Monad', type: 'Enterprise', status: 'OPTIMAL', tps: 10000, gas: 'LOW', tvl: '$0M' },
    { name: 'Berachain', type: 'Enterprise', status: 'OPTIMAL', tps: 45.2, gas: 'HIGH', tvl: '$0M' },
    { name: 'Linea', type: 'L2', status: 'OPTIMAL', tps: 12.1, gas: '0.4 gwei', tvl: '$450M' },
    { name: 'Scroll', type: 'L2', status: 'OPTIMAL', tps: 8.4, gas: '0.3 gwei', tvl: '$310M' },
    { name: 'Mantle', type: 'L2', status: 'OPTIMAL', tps: 15.6, gas: '0.2 gwei', tvl: '$240M' },
    { name: 'Blast', type: 'L2', status: 'OPTIMAL', tps: 10.2, gas: '0.1 gwei', tvl: '$1.8B' },
    { name: 'Polygon zkEVM', type: 'L2', status: 'OPTIMAL', tps: 5.4, gas: '0.1 gwei', tvl: '$140M' },
    { name: 'MegaETH', type: 'Enterprise', status: 'OPTIMAL', tps: 100000, gas: 'TRACE', tvl: '$0M' },
    { name: 'Hyperliquid', type: 'Enterprise', status: 'OPTIMAL', tps: 8500, gas: '0.01 HYPE', tvl: '$450M' },
    { name: 'Starknet L3', type: 'L3', status: 'OPTIMAL', tps: 120.4, gas: 'LOW', tvl: '$12M' },
    { name: 'Base L3', type: 'L3', status: 'OPTIMAL', tps: 85.2, gas: 'LOW', tvl: '$8M' },
];

export function MultiChainSystemty() {
    return (
        <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--aave-purple)]/5 blur-[100px] -mr-48 -mt-48 rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-xl">
                            <Network size={24} className="text-[var(--aave-teal)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Multi-Chain Systemty</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">33 Connected Extraction Points</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Sync</span>
                            <span className="text-sm font-mono font-black text-[var(--aave-teal)]">100.00%</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-2 border-[var(--aave-teal)] border-t-transparent animate-spin" />
                            <Zap size={16} className="text-[var(--aave-teal)] animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                    {CHAINS.map((chain, index) => (
                        <motion.div
                            key={chain.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="bg-white border border-slate-100 rounded-3xl p-5 hover:border-[var(--aave-teal)]/30 hover:shadow-xl transition-all group relative cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-[0.1em] ${
                                    chain.type === 'L1' ? 'bg-slate-950 text-white border-slate-950' :
                                    chain.type === 'L2' ? 'bg-[var(--aave-purple)]/5 text-[var(--aave-purple)] border-[var(--aave-purple)]/20' :
                                    'bg-[var(--aave-teal)]/5 text-[var(--aave-teal)] border-[var(--aave-teal)]/20'
                                }`}>
                                    {chain.type}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full ${chain.status === 'OPTIMAL' ? 'bg-[var(--aave-teal)] shadow-[0_0_8px_rgba(0,130,123,0.5)]' : 'bg-rose-500'} animate-pulse`} />
                            </div>

                            <h3 className="text-sm font-black text-slate-950 uppercase italic tracking-tight group-hover:text-[var(--aave-teal)] transition-colors">
                                {chain.name}
                            </h3>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TPS</p>
                                    <p className="text-[10px] font-mono font-black text-slate-900">{chain.tps}</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">GAS</p>
                                    <p className="text-[10px] font-mono font-black text-slate-900">{chain.gas}</p>
                                </div>
                                <div className="space-y-0.5 mt-2 col-span-2">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TVL Locked</p>
                                    <p className="text-[10px] font-mono font-black text-[var(--aave-purple)]">{chain.tvl}</p>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Activity size={10} className="text-slate-300" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Metrics */}
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--aave-teal)]" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">33 Nodes Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modular Stack Peak</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-xl border border-slate-100 italic">
                        <Cpu size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">Throughput Optimized: 1.2M e/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
