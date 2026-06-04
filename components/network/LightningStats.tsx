"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Share2, Server, Globe } from 'lucide-react';

interface LightningStats {
    capacity: number;
    nodes: number;
    channels: number;
    clearing: number;
}

export function LightningStats({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { data: stats, isLoading } = useQuery<LightningStats>({
        queryKey: ['network', 'lightning-stats'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/lightning/stats');
            if (!res.ok) throw new Error('Failed to fetch lightning stats');
            return res.json();
        },
        refetchInterval: 60000,
    });

    if (isLoading) return null;

    const capacityBTC = (stats?.capacity || 0) / 100000000;

    return (
        <div className={`${isArctic ? 'bg-white/60 backdrop-blur-3xl border-slate-100' : 'bg-white border-slate-200 shadow-sm'} rounded-[2.5rem] border relative overflow-hidden group ${hideHeader ? 'p-0 border-none bg-transparent shadow-none' : 'p-8'}`}>
            {/* Background Glow */}
            {!hideHeader && <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700" />}
            
            <div className="relative z-10 flex flex-col gap-8">
                {!hideHeader && (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${isArctic ? 'bg-indigo-50/50 text-indigo-600 border-indigo-200' : 'bg-indigo-500/5 text-indigo-600 border-indigo-500/10'}`}>
                                <Zap size={16} fill="currentColor" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Lightning Network <span className="text-slate-300">Pulse</span></h3>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Capacity</span>
                        <div className="text-2xl font-black font-mono text-slate-900 tracking-tighter">
                            {capacityBTC.toFixed(0)} <span className="text-[10px] text-indigo-600">BTC</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Channels</span>
                        <div className="text-2xl font-black font-mono text-slate-900 tracking-tighter">
                            {(stats?.channels || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Network Nodes</span>
                        <div className="text-2xl font-black font-mono text-slate-900 tracking-tighter">
                            {(stats?.nodes || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Topology</span>
                        <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">
                            Institutional Grade
                        </div>
                    </div>
                </div>

                {!hideHeader && (
                    <div className={`pt-6 border-t flex items-center justify-between ${isArctic ? 'border-slate-100' : 'border-slate-50'}`}>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isArctic ? 'border-white bg-indigo-50' : 'border-white bg-black/5'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[8px] font-mono text-slate-300 uppercase tracking-[0.2em]">Layer 2 Synchronization Active</span>
                    </div>
                )}
            </div>
        </div>
    );
}
