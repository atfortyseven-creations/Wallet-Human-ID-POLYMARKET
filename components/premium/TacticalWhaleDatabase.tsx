"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVIPStore } from '@/lib/vip-store';
import { X, Search, Filter, ArrowUpDown, ExternalLink, ShieldCheck } from 'lucide-react';

export const TacticalWhaleDatabase: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { leaderboard500 } = useVIPStore();
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const list = leaderboard500 || [];
        if (!search) return list;
        return list.filter(w => 
            w.address.toLowerCase().includes(search.toLowerCase()) || 
            w.label?.toLowerCase().includes(search.toLowerCase())
        );
    }, [leaderboard500, search]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-[2560px] mx-auto text-left h-full bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                            <ShieldCheck className="text-cyan-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Whale Activity Ledger</h2>
                            <p className="text-sm text-white/30 font-mono uppercase tracking-widest">500 High-Volume On-Chain Entities · Telemetry Sync</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH ENTITY OR ADDRESS..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all w-64 md:w-80"
                            />
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-950">
                            <tr className="text-left border-b border-white/10">
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Rank</th>
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Entity Signature</th>
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tier</th>
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">24H Volume</th>
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Activity</th>
                                <th className="pb-4 px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((w, idx) => (
                                <tr key={w.address} className="group hover:bg-white/2 transition-all">
                                    <td className="py-4 px-4">
                                        <div className="text-sm font-black font-mono text-white/20 group-hover:text-cyan-400">
                                            #{w.rank || idx + 1}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white uppercase tracking-tight">{w.label}</span>
                                            <span className="text-[10px] font-mono text-white/20">{w.address}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                                            w.tier === 'MEGA' 
                                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                        }`}>
                                            {w.tier}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="text-sm font-black font-mono text-white">
                                            ${(w.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            {w.txCount || 0} TRADES
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex justify-center">
                                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">SECURE</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/2 flex justify-between items-center">
                    <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
                        DATA SET: CORE-AUDIT-TERMINAL-500
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500/50 uppercase tracking-widest">
                        <ArrowUpDown size={12} /> Auto-Sorted by 24H Volume Descending
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
