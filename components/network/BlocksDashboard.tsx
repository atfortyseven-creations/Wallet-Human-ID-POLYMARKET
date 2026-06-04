"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Box, ArrowLeft, Loader, Database, Clock, HardDrive } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { NetworkSearch } from '@/components/network/NetworkSearch';
import { NetworkTabs } from '@/components/network/NetworkTabs';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export function BlocksDashboard() {
    const { data: blocks, isLoading } = useQuery({
        queryKey: ['network', 'blocks', 'list'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/blocks');
            if (!res.ok) throw new Error('Failed to fetch blocks');
            return res.json();
        },
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
                 <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Ledger...</span>
            </div>
        );
    }

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
                            className="w-16 h-16 rounded-[2rem] bg-slate-950 flex items-center justify-center mx-auto shadow-2xl"
                        >
                            <Box size={32} className="text-white" />
                        </motion.div>
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-950">
                                Ledger
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase">Real-time Chain Verification</p>
                        </div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg leading-relaxed font-medium"
                    >
                        Real-time auditing of recent block confirmations and network throughput. 
                        Direct verification of the distributed ledger state.
                    </motion.p>
                    
                    <div className="w-full max-w-2xl pt-4">
                        <NetworkSearch />
                    </div>
                </div>

                {/* Block Sequence */}
                <div className="space-y-6">
                    <div className="flex items-end justify-between border-b border-slate-100 pb-8 mx-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Block Sequence</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Recent Confirmations</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {blocks?.map((block: any, i: number) => (
                            <motion.div
                                key={block.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group"
                            >
                                <Link href={`/network/blocks/${block.id}`}>
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-[0_24px_60px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-500">
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                                            
                                            {/* Height & Identification */}
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[1.5rem] bg-black/5 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all duration-500">
                                                    <Box size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-3xl font-black text-slate-950 tracking-tighter">
                                                        #{safeToLocaleString(block.height)}
                                                    </div>
                                                    <div className="font-mono text-[10px] font-bold text-slate-300 truncate w-48 md:w-auto uppercase tracking-widest">
                                                        {block.id.slice(0, 32)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metrics Inline Row */}
                                            <div className="flex items-center gap-12 lg:gap-16">
                                                <div className="space-y-1.5 flex flex-col items-start lg:items-end">
                                                    <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Database size={10} /> Data Volume
                                                    </span>
                                                    <span className="text-slate-950 font-black font-mono text-lg">{safeToFixed(block.size / 1000000, 2)} <span className="text-[10px] text-slate-300 uppercase">MB</span></span>
                                                </div>
                                                <div className="space-y-1.5 flex flex-col items-start lg:items-end">
                                                    <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <HardDrive size={10} /> Transactions
                                                    </span>
                                                    <span className="text-slate-950 font-black font-mono text-lg">{block.tx_count}</span>
                                                </div>
                                                <div className="space-y-1.5 flex flex-col items-start lg:items-end">
                                                    <span className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Clock size={10} /> Verified
                                                    </span>
                                                    <span className="text-slate-950 font-black text-sm whitespace-nowrap">
                                                        {(() => {
                                                            try {
                                                                if (!block.timestamp) return "N/A";
                                                                const date = new Date(block.timestamp * 1000);
                                                                return formatDistanceToNow(date, { addSuffix: true }).toUpperCase();
                                                            } catch (e) {
                                                                return "ERROR";
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

