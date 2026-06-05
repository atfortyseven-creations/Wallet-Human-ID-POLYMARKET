"use client";

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

interface Block {
    id: string;
    height: number;
    version: number;
    timestamp: number;
    tx_count: number;
    size: number;
    weight: number;
    merkle_root: string;
    extras: {
        reward: number;
        coinbaseRaw: string;
        medianFee: number;
        feeRange: number[];
        totalFees: number;
        avgFee: number;
        avgFeeRate: number;
        pool: {
            id: number;
            name: string;
            slug: string;
        };
    };
}

export function LatestBlocks({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const containerClass = isArctic
        ? `bg-white/80 backdrop-blur-2xl border border-slate-200 overflow-hidden flex flex-col h-full rounded-[4rem] shadow-sm relative ${hideHeader ? 'p-0' : 'p-8 lg:p-12'}`
        : `bg-white border border-slate-200 overflow-hidden flex flex-col h-full rounded-[4rem] shadow-sm relative ${hideHeader ? 'p-0' : 'p-8 lg:p-12'}`;
    
    const cardClass = isArctic
        ? "bg-white/60 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-[2.5rem] p-8 transition-all cursor-default overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20"
        : "bg-black/5 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-[2.5rem] p-8 transition-all cursor-default overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20";
    const { data: blocks, isLoading } = useQuery({
        queryKey: ['network', 'blocks'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/blocks');
            if (!res.ok) throw new Error('Failed to fetch blocks');
            return res.json();
        },
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 p-12 h-[500px] flex flex-col items-center justify-center gap-6 rounded-[3.5rem] shadow-sm">
                <div className="w-8 h-8 border-3 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Ledger...</span>
            </div>
        );
    }

    return (
        <div className={containerClass}>
            {/*  HEADER SECTION  */}
            {!hideHeader && (
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-black/5 border border-slate-100 flex items-center justify-center">
                        <Box className="text-slate-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                            Confirmed <span className="text-slate-300">Assertions</span>
                        </h2>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-1 shadow-indigo-500/10 drop-shadow-md">Chronicle Synchronized</div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 pr-4 scrollbar-none transform-gpu overscroll-contain">
                <AnimatePresence initial={false}>
                {blocks?.slice(0, 10).map((block: Block, index: number) => (
                        <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group relative"
                        >
                            <div className={cardClass}>
                                <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-8 flex-1 min-w-0">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center flex-shrink-0">
                                            <div className="text-[8px] font-black text-indigo-400 tracking-widest uppercase leading-none mb-1">SEQ</div>
                                            <div className="text-lg font-black text-indigo-600 font-mono leading-none">
                                                {block.height % 100}
                                            </div>
                                        </div>
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl font-black font-mono text-slate-900 tracking-tighter">
                                                    #{block.height}
                                                </span>
                                                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                                                    {safeToFixed(block.size / 1024 / 1024, 2)} MB
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={12} className="text-slate-300" />
                                                    {(() => {
                                                        try {
                                                            const date = new Date(block.timestamp * 1000);
                                                            return formatDistanceToNow(date, { addSuffix: true });
                                                        } catch (e) { return "---"; }
                                                    })()}
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="text-slate-900">{safeToLocaleString(block.tx_count || 0)}</span> Settlements
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex flex-col items-end gap-3 flex-shrink-0">
                                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                                            {block.extras?.pool?.name || "Private Validator"}
                                        </div>
                                        <div className="text-[11px] font-black text-slate-400 font-mono tracking-tighter uppercase">
                                            Incentive: <span className="text-slate-900">{safeToFixed(block.extras?.totalFees / 100000000, 4)}</span> BTC
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
