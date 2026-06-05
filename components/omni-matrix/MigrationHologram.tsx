"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function MigrationHologram() {
    const { data, isLoading } = useQuery({
        queryKey: ['migration-hologram'],
        queryFn: async () => {
            const res = await fetch('/api/network/bridges/migration');
            if (!res.ok) throw new Error('Migration API Failed');
            return res.json();
        },
        refetchInterval: 30000,
    });

    return (
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-slate-200 relative overflow-hidden shadow-sm">
            {/* Holographic grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-6 border-b border-cyan-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100">
                        <Network size={18} className="text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Migration Hologram</h3>
                        <p className="text-[10px] text-cyan-600 uppercase tracking-widest">Cross-Chain Velocity</p>
                    </div>
                </div>
                {isLoading && <div className="w-4 h-4 border-t-2 border-cyan-500 rounded-full animate-spin" />}
            </div>

            <div className="space-y-4 relative z-10">
                {(data?.migrations || []).slice(0, 4).map((mig: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        key={mig.id} 
                        className="group flex flex-col gap-2 p-3 rounded-xl bg-black/5 border border-slate-100 hover:border-cyan-300 transition-all"
                    >
                        <div className="flex justify-between items-center w-full">
                           <div className="flex items-center gap-2">
                               <div className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                   {mig.origin}
                               </div>
                               <div className="h-px w-8 bg-cyan-500/30 relative">
                                   <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-pulse" />
                               </div>
                               <div className="px-2 py-1 rounded bg-cyan-50 border border-cyan-200 text-[10px] font-black text-cyan-700 uppercase tracking-widest shadow-sm">
                                   {mig.destination}
                               </div>
                           </div>
                           <div className="text-right flex flex-col items-end">
                               <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                                   {mig.volume_eth_est.toFixed(2)} Vol
                               </div>
                               <div className="text-[9px] text-slate-400 uppercase tracking-widest">{mig.whale.substring(0,8)}...</div>
                           </div>
                        </div>
                    </motion.div>
                ))}

                {data?.migrations?.length === 0 && !isLoading && (
                    <div className="text-center py-6">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Network Flow Stabilized.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
