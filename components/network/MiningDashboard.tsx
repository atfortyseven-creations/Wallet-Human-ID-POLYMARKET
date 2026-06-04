"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Clock, Lock } from 'lucide-react';
import { NetworkTabs } from '@/components/network/NetworkTabs';
import { HalvingCountdown } from '@/components/network/HalvingCountdown';
import { MiningPoolDistribution } from '@/components/network/MiningPoolDistribution';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';
import { safeToFixed } from '@/lib/utils/number-format';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export function MiningDashboard() {
    const { data: stats } = useQuery({
        queryKey: ['network', 'mining'],
        queryFn: async () => {
            const [diffRes, hashrateRes] = await Promise.all([
                fetch('/api/network/v1/difficulty-adjustment'),
                fetch('/api/network/v1/hashrate'),
            ]);
            const diffData = await diffRes.json();
            const hashrateData = hashrateRes.ok ? await hashrateRes.json() : null;
            return {
                difficulty: {
                    current: diffData.difficulty,
                    history: Array.from({ length: 7 }, (_, i) => ({
                        time: Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
                        difficulty: diffData.difficulty * (1 + diffData.difficultyChange / 100 * (i / 6)),
                    })),
                },
                hashrate: {
                    current: hashrateData?.current ?? null,
                    history: hashrateData?.history ?? [],
                },
                avgBlockTimeMin: hashrateData?.avgBlockTimeMin ?? null,
            };
        },
        refetchInterval: 60000,
    });

    const kpis = [
        {
            label: 'Global Hashrate',
            value: stats?.hashrate.current ? `${safeToFixed(stats.hashrate.current, 2)} EH/s` : '',
            icon: Activity,
        },
        {
            label: 'Network Difficulty',
            value: stats?.difficulty.current ? `${safeToFixed(stats.difficulty.current / 1e12, 2)} T` : '',
            icon: Lock,
        },
        {
            label: 'Average Block Time',
            value: stats?.avgBlockTimeMin ? `${safeToFixed(stats.avgBlockTimeMin, 2)} min` : '',
            icon: Clock,
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Minimalist Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            <div className="relative z-10 pt-32 pb-32 px-6 max-w-[2560px] mx-auto space-y-24 text-left">
                <NetworkTabs />

                {/* Editorial header with halving widget */}
                <div className="flex flex-col items-center text-center space-y-12">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16 rounded-[2rem] bg-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-orange-100"
                        >
                            <Activity size={32} className="text-white" />
                        </motion.div>
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-950">
                                Mining
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase">Global Proof of Work Consensus</p>
                        </div>
                    </div>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg leading-relaxed max-w-2xl font-medium"
                    >
                        Real-time tracking of global Bitcoin consensus. Hashrate distribution, 
                        difficulty adjustments, and network performance analysis.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-md pt-4"
                    >
                        <HalvingCountdown />
                    </motion.div>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {kpis.map(({ label, value, icon: Icon }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-[0_24px_80px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_120px_rgba(0,0,0,0.06)] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center border border-slate-100 mb-8 group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors duration-500">
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

                {/* Hashrate History Chart */}
                <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm">
                    <div className="border-b border-slate-100 pb-8 mb-12 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Trailing 30 Days</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Hashrate Performance</h2>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-2 bg-black/5 rounded-full">Exahash per Second</span>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.hashrate.history}>
                                <defs>
                                    <linearGradient id="hashGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 8" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="transparent"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={20}
                                />
                                <YAxis
                                    stroke="transparent"
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, fontFamily: 'monospace' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}E`}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #f1f5f9',
                                        borderRadius: '24px',
                                        padding: '20px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
                                    }}
                                    itemStyle={{ color: '#0f172a', fontWeight: 900, fontSize: '20px', fontFamily: 'monospace' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 900, marginBottom: '8px' }}
                                    cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hashrate"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#hashGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pool Distribution */}
                <div className="space-y-12">
                    <div className="border-b border-slate-100 pb-8 mx-4 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Entity Contribution</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Pool Distribution</h2>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm">
                        <MiningPoolDistribution />
                    </div>
                </div>

                {/* Technical Briefing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                    {[
                        {
                            title: 'Network Efficiency',
                            body: 'Continuous monitoring of the global energy footprint. Mining operations are increasingly shifting towards sustainable and surplus energy sources to secure the ledger.',
                        },
                        {
                            title: 'Difficulty Equilibrium',
                            body: 'The protocol adjusts difficulty every 2,016 blocks to maintain a 10-minute average target. This automated calibration ensures network stability and security.',
                        },
                    ].map(({ title, body }) => (
                        <div key={title} className="p-8 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">{title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
