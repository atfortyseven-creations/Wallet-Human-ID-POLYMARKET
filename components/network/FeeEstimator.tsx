"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gauge, Zap, Clock, Turtle, Rabbit, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function FeeEstimator({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { t } = useLanguage();
    const { data: fees, isLoading } = useQuery({
        queryKey: ['network', 'fees', 'recommended'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/fees/recommended');
            if (!res.ok) throw new Error('Failed to fetch fees');
            return res.json();
        },
        refetchInterval: 10000, // Update every 10s
    });

    if (isLoading || !fees) {
        return (
            <Card className="bg-white border-slate-200 p-6 h-full flex flex-col items-center justify-center shadow-sm">
                 <div className="animate-pulse flex flex-col items-center gap-2">
                    <Gauge size={24} className="text-slate-400" />
                    <span className="text-xs text-slate-400 font-black tracking-widest uppercase">{t.network.stats.fees.radar}</span>
                 </div>
            </Card>
        );
    }

    return (
        <Card className={`${isArctic ? 'bg-white/60 backdrop-blur-3xl' : 'bg-white'} border ${isArctic ? 'border-slate-100' : 'border-slate-200'} relative overflow-hidden group shadow-sm rounded-[2.5rem] ${hideHeader ? 'p-0 border-none bg-transparent shadow-none' : 'p-8'}`}>
            {!hideHeader && (
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap className="text-indigo-600" size={14} /> <span className="text-slate-400">L1</span> Fees
                </h3>
            </div>
            )}

            <div className="grid grid-cols-3 gap-3">
                {/* Low Priority */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-black/5 border border-slate-100 hover:border-slate-300 transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Economic</span>
                    <span className="text-2xl font-black font-mono text-slate-900 tracking-tighter">{fees.hourFee}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">sat/vB</span>
                    <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={10} /> ~1h
                    </div>
                </div>

                {/* Medium Priority */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-indigo-50 border border-indigo-200 relative overflow-hidden shadow-[0_4px_15px_rgba(99,102,241,0.1)]">
                    <div className="absolute top-0 right-0 p-1">
                        <Zap size={8} className="text-indigo-600" fill="currentColor" />
                    </div>
                    <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Standard</span>
                    <span className="text-2xl font-black font-mono text-slate-900 tracking-tighter">{fees.halfHourFee}</span>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">sat/vB</span>
                    <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                        <Clock size={10} /> ~30m
                    </div>
                </div>

                {/* High Priority */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-black/5 border border-slate-100 hover:border-slate-300 transition-all">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Priority</span>
                    <span className="text-2xl font-black font-mono text-slate-900 tracking-tighter">{fees.fastestFee}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">sat/vB</span>
                    <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={10} /> ~10m
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Minimum Relay: <span className="text-slate-600">{fees.minimumFee} vB</span></span>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Update</span>
                </div>
            </div>
        </Card>
    );
}

