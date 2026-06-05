"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, Server, Hash } from 'lucide-react';
import { safeToFixed } from '@/lib/utils/number-format';

interface HashrateData {
    current: number;
    unit: string;
    avgBlockTimeMin: number;
    history: Array<{ time: number; hashrate: number }>;
}

export function HashrateVisualizer({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { data: stats, isLoading } = useQuery<HashrateData>({
        queryKey: ['network', 'hashrate-stats'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/hashrate');
            if (!res.ok) throw new Error('Failed to fetch hashrate');
            return res.json();
        },
        refetchInterval: 60000,
    });

    if (isLoading || !stats) return (
        <div className="h-full bg-black/5 border border-slate-100 rounded-[2.5rem] animate-pulse p-8 flex items-center justify-center">
            <Activity className="text-slate-200" />
        </div>
    );

    return (
        <div className={`${isArctic ? 'bg-white/40 backdrop-blur-xl border-slate-200' : 'bg-white border-slate-100 shadow-sm'} border rounded-[2.5rem] h-full flex flex-col group hover:border-slate-200 transition-all duration-500 ${hideHeader ? 'p-0 border-none bg-transparent shadow-none' : 'p-8'}`}>
            {!hideHeader && (
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors duration-500 ${isArctic ? 'bg-indigo-50/50 text-indigo-600 border border-indigo-100' : 'bg-black/5 text-slate-400 group-hover:bg-slate-950 group-hover:text-white'}`}>
                            <Hash size={14} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em]">Network <span className="text-slate-300">Hashrate</span></h3>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Computational Armor</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black font-mono text-slate-950 tracking-tighter">
                            {safeToFixed(stats.current, 2)} <span className="text-[10px] text-slate-400 uppercase tracking-normal">EH/s</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col justify-end gap-6">
                <div className="h-16 flex items-end justify-between gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                    {stats.history.map((point, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: i * 0.02 }}
                             className={`flex-1 rounded-t-sm transition-colors duration-500 ${isArctic ? 'bg-indigo-100 group-hover:bg-indigo-400' : 'bg-slate-200 group-hover:bg-indigo-500'}`}
                             style={{ height: `${(point.hashrate / stats.current) * 100}%` }}
                        />
                    ))}
                </div>

                <div className={`grid grid-cols-2 gap-4 ${hideHeader ? 'pt-2' : 'border-t border-slate-50 pt-6'}`}>
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg Block Time</span>
                        <div className="text-sm font-black font-mono text-slate-950">
                            {stats.avgBlockTimeMin} <span className="text-[9px] text-slate-300 uppercase">Min</span>
                        </div>
                    </div>
                    <div className="space-y-0.5 text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Synchronization</span>
                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                            Optimal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
