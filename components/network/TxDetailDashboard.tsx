"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Loader, CheckCircle, Clock, Database, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface TxDetailDashboardProps {
    txid: string;
}

export function TxDetailDashboard({ txid }: TxDetailDashboardProps) {
    const { data: tx, isLoading } = useQuery({
        queryKey: ['network', 'tx', txid],
        queryFn: async () => {
             const res = await fetch(`/api/network/tx/${txid}`);
             if (!res.ok) throw new Error('Failed to fetch transaction');
             return res.json();
        },
        enabled: !!txid,
    });

    if (isLoading || !tx) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
                 <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auditing Interaction DNA...</span>
            </div>
        );
    }

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
                                <FileText size={12} strokeWidth={3} /> Interaction Identifier
                            </div>
                        </div>
                        <div className="space-y-2">
                             <div className="flex items-center gap-4 group">
                                <h1 className="text-2xl md:text-4xl font-black text-slate-950 truncate tracking-tighter uppercase leading-none">
                                    {txid}
                                </h1>
                             </div>
                             <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em]">Peer-to-Peer Protocol Verification</p>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white border border-slate-100 p-12 col-span-1 md:col-span-2 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all duration-500">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                 {tx.status.confirmed ? (
                                     <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-50">
                                         <CheckCircle size={36} strokeWidth={2.5} />
                                     </div>
                                 ) : (
                                     <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center animate-pulse">
                                         <Clock size={36} strokeWidth={2.5} />
                                     </div>
                                 )}
                                 <div className="space-y-1">
                                     <div className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
                                         {tx.status.confirmed ? 'Ledger Validated' : 'Pending Resolution'}
                                     </div>
                                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                         {tx.status.confirmed 
                                             ? `Index Height: ${safeToLocaleString(tx.status.block_height)}` 
                                             : 'Waiting for miner acknowledgment'}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950 p-12 rounded-[3.5rem] flex flex-col justify-center space-y-2 relative overflow-hidden shadow-2xl shadow-slate-200">
                         <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Dispersed Volume</div>
                         <div className="text-3xl font-black text-white font-mono tracking-tighter">
                             {(tx.vout.reduce((a: number, c: any) => a + c.value, 0) / 100000000).toFixed(8)} <span className="text-indigo-400 text-lg">BTC</span>
                         </div>
                    </div>
                </div>

                {/* Data Flow Graph (Simplified List) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Source Origins */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                             <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                <ArrowDownRight size={20} strokeWidth={3} />
                             </div>
                             <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Source Origins</h3>
                        </div>
                        <div className="space-y-4">
                            {tx.vin.map((input: any, i: number) => (
                                <div key={i} className="bg-black/5/50 border border-transparent p-6 rounded-[2rem] hover:bg-white hover:border-slate-100 transition-all duration-300">
                                     <div className="flex justify-between items-center">
                                         <div className="min-w-0 flex-1 mr-4">
                                             <Link href={`/network/address/${input.prevout?.scriptpubkey_address}`} className="text-slate-950 font-black font-mono text-sm hover:text-indigo-600 transition-colors block truncate uppercase tracking-widest">
                                                 {input.prevout?.scriptpubkey_address || 'Initial Issuance (Genesis)'}
                                             </Link>
                                             <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                                                 Script Verification Path: ACTIVE
                                             </div>
                                         </div>
                                         <div className="text-slate-950 font-black font-mono text-lg tracking-tighter shrink-0">
                                             {input.prevout ? safeToFixed(input.prevout.value / 100000000, 8) : '0.00'} <span className="text-[10px] text-slate-300 uppercase">BTC</span>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Destinations */}
                    <div className="space-y-8">
                         <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <ArrowUpRight size={20} strokeWidth={3} />
                             </div>
                             <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Target Destinations</h3>
                        </div>
                        <div className="space-y-4">
                            {tx.vout.map((output: any, i: number) => (
                                <div key={i} className="bg-black/5/50 border border-transparent p-6 rounded-[2rem] hover:bg-white hover:border-slate-100 transition-all duration-300">
                                     <div className="flex justify-between items-center">
                                         <div className="min-w-0 flex-1 mr-4">
                                             <Link href={`/network/address/${output.scriptpubkey_address}`} className="text-slate-950 font-black font-mono text-sm hover:text-indigo-600 transition-colors block truncate uppercase tracking-widest">
                                                 {output.scriptpubkey_address}
                                             </Link>
                                              <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                                                 Protocol Layer: {output.scriptpubkey_type.toUpperCase()}
                                             </div>
                                         </div>
                                         <div className="text-emerald-600 font-black font-mono text-lg tracking-tighter shrink-0">
                                             {safeToFixed(output.value / 100000000, 8)} <span className="text-[10px] text-slate-300 uppercase">BTC</span>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

