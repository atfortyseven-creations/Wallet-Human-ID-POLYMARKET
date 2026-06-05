"use client";

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, ArrowRight, DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface MempoolTx {
    txid: string;
    fee: number;
    vsize: number;
    value: number;
    time: number;
}

export function WhaleWatch({ hideHeader = false, theme = 'default' }: { hideHeader?: boolean, theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { t } = useLanguage();
    const { unifiedWhaleFeed, isLoading } = useWhaleFeed();
    
    const cardClass = isArctic
        ? `bg-white/60 backdrop-blur-3xl border border-slate-100 shadow-sm relative overflow-hidden h-full flex flex-col ${hideHeader ? 'p-0 border-none bg-transparent shadow-none' : 'p-8'}`
        : `bg-white border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col ${hideHeader ? 'p-0 border-none bg-transparent shadow-none' : 'p-6'}`;

    const itemClass = isArctic
        ? "bg-white/60 hover:bg-white border border-slate-100 rounded-xl p-4 relative group transition-all shadow-sm hover:shadow-md"
        : "bg-black/5 hover:bg-white border border-slate-100 rounded-xl p-4 relative group transition-all";

    // Take top 10 for the radar view
    const displayTxs = unifiedWhaleFeed.slice(0, 10);

    if (isLoading) {
        return (
            <Card className={`${isArctic ? 'bg-white/60 backdrop-blur-3xl border-slate-100' : 'bg-black/5 border-slate-100'} p-8 h-full flex flex-col items-center justify-center rounded-[2.5rem]`}>
                 <div className="animate-spin text-indigo-600 mb-4"><Radar size={32} /></div>
                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Scanning Multi-Chain Grid...</span>
            </Card>
        );
    }

    return (
        <Card className={cardClass}>
            {!hideHeader && (
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Radar className="text-emerald-500" size={14} />
                    Cross-Chain <span className="text-slate-400">Radar</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
                </div>
            </h3>
            )}

            <div className="space-y-2 overflow-y-auto pr-1 scrollbar-none flex-grow min-h-0">
                <AnimatePresence mode="popLayout">
                {displayTxs.map((tx: any) => (
                    <motion.div 
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={itemClass}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600" style={{ color: tx.chainColor }}>
                                    {tx.chainIcon}
                                </span>
                                <a 
                                    href={tx.chain === 'BITCOIN' ? `https://mempool.space/tx/${tx.hash}` : `https://${tx.chain === 'ETH' ? 'etherscan.io' : 'bscscan.com'}/tx/${tx.hash}`}
                                    target="_blank"
                                    className="text-[10px] font-black font-mono text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                                >
                                    {tx.hash.slice(0, 10)}...
                                </a>
                            </div>
                            <span className="text-slate-400 font-black text-[9px] uppercase tracking-widest">
                                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="text-lg font-black font-mono text-slate-900 tracking-tighter">
                                {safeToLocaleString(tx.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 uppercase">{tx.asset}</span>
                            </div>
                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                ${safeToLocaleString(tx.usdValue, { maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        {/* Chain Indicator */}
                        <div className="absolute top-0 right-0 w-1 h-full opacity-20 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: tx.chainColor }} />
                    </motion.div>
                ))}
                </AnimatePresence>
                
                {displayTxs.length === 0 && (
                     <div className="text-center text-slate-400 py-12 text-[10px] font-black uppercase tracking-[0.2em]">
                        Waiting for Elite flows...
                    </div>
                )}
            </div>
            
            <Link 
                href="/terminal" 
                className="mt-4 py-3 bg-black/5 hover:bg-slate-100 rounded-xl text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all border border-slate-200"
            >
                Deep Dive Terminal <ArrowRight size={10} className="inline ml-1" />
            </Link>
        </Card>
    );
}

