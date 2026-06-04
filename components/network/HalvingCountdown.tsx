"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Timer, Layers, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow, addMinutes } from 'date-fns';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export function HalvingCountdown() {
    const { data: blocks } = useQuery({
        queryKey: ['network', 'blocks'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/blocks');
            if (!res.ok) throw new Error('Failed to fetch blocks');
            return res.json();
        },
        refetchInterval: 60000,
    });

    const currentHeight = blocks?.[0]?.height || 0;
    const HALVING_INTERVAL = 210000;
    const nextHalvingHeight = (Math.floor(currentHeight / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;
    const blocksRemaining = nextHalvingHeight - currentHeight;
    const minutesRemaining = blocksRemaining * 10;
    const estimatedDate = addMinutes(new Date(), minutesRemaining);

    if (!currentHeight) return null;

    return (
        <div className="bg-white border border-slate-100 p-8 md:p-14 relative overflow-hidden rounded-[3.5rem] shadow-sm group">
             {/* Abstract Background Elements */}
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-50 rounded-full blur-[100px] opacity-50 transition-opacity duration-1000 group-hover:opacity-80" />
             
            <div className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2.5 bg-orange-50 text-orange-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100 shadow-sm">
                            <Layers size={14} strokeWidth={2.5} /> Monetary Policy Invariant
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                            Epoch Halving
                        </h2>
                    </div>
                
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full">
                        <div className="space-y-2">
                            <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">Current Height</div>
                            <div className="text-2xl md:text-4xl font-mono font-black text-slate-950 tracking-tighter">
                                {safeToLocaleString(currentHeight)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-orange-300 text-[9px] font-black uppercase tracking-[0.3em]">Target Activation</div>
                            <div className="text-2xl md:text-4xl font-mono font-black text-orange-600 tracking-tighter">
                                {safeToLocaleString(nextHalvingHeight)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">Blocks to Event</div>
                            <div className="text-2xl md:text-4xl font-mono font-black text-slate-950 tracking-tighter">
                                {safeToLocaleString(blocksRemaining)}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">Est. Projection</div>
                            <div className="text-xl md:text-2xl font-black text-indigo-600 uppercase tracking-widest leading-tight">
                               {estimatedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="relative h-2 bg-black/5 rounded-full overflow-hidden border border-slate-100">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentHeight % HALVING_INTERVAL) / HALVING_INTERVAL) * 100}%` }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Network progress toward epoch transition</span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest tabular-nums">{(((currentHeight % HALVING_INTERVAL) / HALVING_INTERVAL) * 100).toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

