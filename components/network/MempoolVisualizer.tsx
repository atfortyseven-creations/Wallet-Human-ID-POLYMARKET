"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layers, Truck, Loader } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

interface MempoolBlock {
    blockSize: number;
    blockVSize: number;
    nTx: number;
    totalFees: number;
    medianFee: number;
    feeRange: number[];
}

export function MempoolVisualizer({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { data: mempoolBlocks, isLoading } = useQuery<MempoolBlock[]>({
        queryKey: ['network', 'mempool-blocks'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/fees/mempool-blocks');
            if (!res.ok) throw new Error('Failed to fetch mempool blocks');
            return res.json();
        },
        refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <div className="bg-white/40 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-center gap-4 shadow-sm">
                 <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 animate-spin rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Mempool...</span>
            </div>
        );
    }

    if (!mempoolBlocks || mempoolBlocks.length === 0) {
        return (
             <div className="bg-black/5 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-center text-slate-500 shadow-sm">
                <Layers size={40} className="mb-4 opacity-50 text-indigo-400" />
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">No backlog detected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {!hideHeader && (
                <div className="flex justify-between items-center mb-6">
             <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Layers className="text-indigo-600" size={14} />
                    Mempool <span className="text-slate-500">Density</span>
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Priority</span>
                </div>
            </div>
            )}

            <div className="flex flex-col gap-3 relative">
                {mempoolBlocks.slice(0, 4).map((block, index) => {
                     // Dynamic scaling: instead of hardcoding 3000, we assess density relative to standard block limits
                     const maxTxsPerBlock = 4500; // More realistic upper bound for high-volume periods
                     const fillPercentage = Math.min((block.nTx / maxTxsPerBlock) * 100, 100);
                     
                     return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                relative w-full rounded-2xl border transition-all overflow-hidden group
                                ${index === 0 
                                    ? (isArctic ? 'bg-indigo-50/80 border-indigo-200 py-4 shadow-sm' : 'bg-indigo-50/50 border-indigo-200 py-4') 
                                    : (isArctic ? 'bg-white/40 border-slate-100 py-3' : 'bg-white border-slate-100 py-3')}
                            `}
                        >
                            <div 
                                className={`absolute inset-y-0 left-0 ${index === 0 ? 'bg-indigo-100 opacity-50' : 'bg-slate-100 opacity-50'}`}
                                style={{ width: `${fillPercentage}%` }}
                            />
                            
                            <div className="relative px-6 flex justify-between items-center z-10">
                                <div className="space-y-1">
                                     <span className={`text-[9px] font-black uppercase tracking-widest ${index === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {index === 0 ? "Imminent Block" : `Projected +${index}`}
                                     </span>
                                     <div className="text-xl font-black font-mono text-slate-900 tracking-tighter drop-shadow-sm">
                                        {safeToFixed(block.medianFee, 1)} <span className="text-[10px] text-slate-500 uppercase tracking-normal">sat/vB</span>
                                     </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <div className="text-xs font-black text-slate-900 font-mono tracking-tighter">
                                        {block.nTx.toLocaleString()} Tx
                                    </div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        {safeToFixed(block.blockSize / 1024 / 1024, 2)} MB
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                     );
                })}
            </div>
        </div>
    );
}

