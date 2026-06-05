"use client";

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeft, Loader, Copy, QrCode, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface AddressDashboardProps {
    address: string;
}

export function AddressDashboard({ address }: AddressDashboardProps) {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['network', 'address', address],
        queryFn: async () => {
            const res = await fetch(`/api/network/address/${address}`);
            if (!res.ok) throw new Error('Failed to fetch address');
            return res.json();
        },
        enabled: !!address,
    });

    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading: txsLoading 
    } = useInfiniteQuery({
        queryKey: ['network', 'address', address, 'txs'],
        queryFn: async ({ pageParam = '' }) => {
            const query = pageParam ? `?after_txid=${pageParam}` : '';
            const res = await fetch(`/api/network/address/${address}/txs${query}`);
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
        getNextPageParam: (lastPage: any[]) => {
            if (lastPage && lastPage.length === 50) {
                return lastPage[lastPage.length - 1].txid;
            }
            return undefined;
        },
        initialPageParam: '',
        enabled: !!address,
    });

    const txs = data?.pages.flat() || [];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address identification copied.");
    };

    if (statsLoading || !stats) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
                 <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auditing Entity State...</span>
            </div>
        );
    }

    const balance = (stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum) / 100000000;
    const totalReceived = stats.chain_stats.funded_txo_sum / 100000000;
    const totalSent = stats.chain_stats.spent_txo_sum / 100000000;

    return (
        <div className="min-h-screen bg-white pt-32 pb-32 px-6">
            {/* Minimalist Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            </div>

            <div className="max-w-[2560px] mx-auto space-y-20 relative z-10 text-left">
                 {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-100">
                    <div className="space-y-6 flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                            <Link href="/ledger" className="w-12 h-12 rounded-2xl bg-black/5 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-300">
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                <Wallet size={12} strokeWidth={3} /> Entity Identification
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="flex items-center gap-4 group">
                                <h1 className="text-2xl md:text-4xl font-black text-slate-950 truncate tracking-tighter uppercase leading-none">
                                    {address}
                                </h1>
                                <button onClick={() => copyToClipboard(address)} className="p-2 text-slate-300 hover:text-slate-950 transition-colors">
                                    <Copy size={20} strokeWidth={2.5} />
                                </button>
                             </div>
                             <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em]">Protocol Address Verification</p>
                        </div>
                    </div>
                </div>

                {/* Liquidity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-950 p-12 col-span-1 md:col-span-2 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20" />
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Verified Liquidity</span>
                                <div className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                    {safeToFixed(balance, 8)} <span className="text-indigo-400 text-3xl">BTC</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="space-y-1">
                                    <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Inscriptions</div>
                                    <div className="text-xl font-bold text-white font-mono">{safeToLocaleString(stats.chain_stats.tx_count)}</div>
                                </div>
                                <div className="w-px h-8 bg-slate-800" />
                                <div className="space-y-1">
                                    <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Protocol Type</div>
                                    <div className="text-sm font-black text-indigo-400 uppercase tracking-widest">Validated SegWit</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                         <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Inbound Accumulation</span>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <ArrowDownLeft size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-950 font-mono tracking-tighter">
                                {safeToFixed(totalReceived, 8)} <span className="text-xs text-slate-300">BTC</span>
                            </div>
                        </div>
                         <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Outbound Dispersion</span>
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                    <ArrowUpRight size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-950 font-mono tracking-tighter">
                                {safeToFixed(totalSent, 8)} <span className="text-xs text-slate-300">BTC</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operational History */}
                <div className="space-y-10">
                    <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Operational History</p>
                            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Recent Interactions</h2>
                        </div>
                    </div>
                    
                    {txsLoading && txs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Retrieving interactions...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {txs.map((tx: any, i: number) => {
                                let amount = 0;
                                let type = 'neutral';
                                
                                const sent = tx.vin.reduce((acc: number, vin: any) => {
                                    if (vin.prevout?.scriptpubkey_address === address) {
                                        return acc + vin.prevout.value;
                                    }
                                    return acc;
                                }, 0);
                                
                                const received = tx.vout.reduce((acc: number, vout: any) => {
                                    if (vout.scriptpubkey_address === address) {
                                        return acc + vout.value;
                                    }
                                    return acc;
                                }, 0);

                                if (sent > 0 && received > 0) {
                                     amount = received - sent; 
                                     type = amount > 0 ? 'received' : 'sent';
                                } else if (sent > 0) {
                                    amount = - (sent - received);
                                    type = 'sent';
                                } else {
                                    amount = received;
                                    type = 'received';
                                }

                                return (
                                    <motion.div 
                                        key={tx.txid}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-5">
                                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${type === 'received' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {type === 'received' ? <ArrowDownLeft size={20} strokeWidth={3} /> : <ArrowUpRight size={20} strokeWidth={3} />}
                                                 </div>
                                                 <div>
                                                     <Link href={`/network/tx/${tx.txid}`} className="text-slate-950 font-black font-mono text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest">
                                                        {tx.txid.slice(0, 24)}
                                                     </Link>
                                                     <div className="text-[10px] font-bold uppercase tracking-widest mt-1">
                                                        {tx.status?.confirmed ? (
                                                            <span className="text-emerald-600">
                                                                Validated · {(() => {
                                                                    try {
                                                                        if (!tx.status.block_time) return "INDEX_UNDEF";
                                                                        const date = new Date(tx.status.block_time * 1000);
                                                                        return format(date, 'MMM dd, HH:mm').toUpperCase();
                                                                    } catch (e) {
                                                                        return "ERR";
                                                                    }
                                                                })()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-orange-500">Pending Resolution</span>
                                                        )}
                                                     </div>
                                                 </div>
                                            </div>
                                            <div className="text-left md:text-right space-y-1">
                                                <div className={`font-black font-mono text-xl tracking-tighter ${amount > 0 ? 'text-emerald-600' : 'text-slate-950'}`}>
                                                    {amount > 0 ? '+' : ''}{safeToFixed(amount / 100000000, 8)} <span className="text-xs text-slate-300 uppercase">BTC</span>
                                                </div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    Fee: {safeToFixed(tx.fee / 100000000, 8)} BTC
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                             {(!txs || txs.length === 0) && (
                                <div className="text-center py-20 bg-black/5 border border-dashed border-slate-200 rounded-[2.5rem]">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No interaction records identified.</p>
                                </div>
                            )}

                            {hasNextPage && (
                                <div className="flex justify-center pt-12">
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                                    >
                                        {isFetchingNextPage ? "Retrieving records..." : "Retrieve Legacy Records"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

