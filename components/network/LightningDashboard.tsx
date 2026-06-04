"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Users, Network, Activity } from 'lucide-react';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { TopLightningNodes } from '@/components/network/TopLightningNodes';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

export function LightningDashboard() {
    const { data: lightningStats } = useQuery({
        queryKey: ['network', 'lightning', 'stats'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/lightning/statistics/latest');
            if (!res.ok) return null;
            return res.json();
        },
        refetchInterval: 60000,
    });

    const stats = lightningStats?.latest || lightningStats;
    const nodeCount = stats?.node_count || null;
    const channelCount = stats?.channel_count || null;
    const totalCapacityBtc = stats?.total_capacity ? stats.total_capacity / 1e8 : null;

    const metrics = [
        { label: 'Network Nodes', value: nodeCount ? safeToLocaleString(nodeCount) : '', icon: Users },
        { label: 'Active Channels', value: channelCount ? safeToLocaleString(channelCount) : '', icon: Network },
        { label: 'Settlement Capacity', value: totalCapacityBtc ? `${safeToFixed(totalCapacityBtc, 2)} BTC` : '', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Minimalist Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            <div className="relative z-10 pt-32 pb-32 px-6 max-w-[2560px] mx-auto space-y-24 text-left">
                <NetworkTabs />

                {/* Centered Editorial Header */}
                <div className="flex flex-col items-center text-center space-y-10 max-w-3xl mx-auto">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center mx-auto shadow-2xl"
                        >
                            <Zap size={32} className="text-white" />
                        </motion.div>
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-950">
                                Lightning
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase">Bitcoin Layer 2 Infrastructure</p>
                        </div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg leading-relaxed font-medium"
                    >
                        Real-time global channel monitoring and decentralized capacity auditing.
                        Direct verification of peer-to-peer liquidity for instant network settlement.
                    </motion.p>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {metrics.map(({ label, value, icon: Icon }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_24px_80px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_120px_rgba(0,0,0,0.06)] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center border border-slate-100 mb-8 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors duration-500">
                                <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors duration-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                                <div className="text-4xl font-black text-slate-950 tracking-tighter font-mono">
                                    {value}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Top Liquidity Providers */}
                <div className="space-y-10">
                    <div className="flex items-end justify-between border-b border-slate-100 pb-8 mx-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Network Inventory</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Liquidity Providers</h2>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Flow</span>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                        <TopLightningNodes />
                    </div>
                </div>

                {/* Technical Briefing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                    {[
                        {
                            title: 'Network Integrity',
                            body: 'All monitoring utilizes redundant RPC endpoints (GetBlock) to ensure 99.9% availability. Real-time auditing maintains perfect data fidelity across the global node topology.',
                        },
                        {
                            title: 'Strategic Settlement',
                            body: 'Lightning Network nodes are distributed across five continents, providing a neutral and robust substrate for Bitcoin micro-settlements with near-zero latency.',
                        },
                    ].map(({ title, body }) => (
                        <div key={title} className="p-8 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">{title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
