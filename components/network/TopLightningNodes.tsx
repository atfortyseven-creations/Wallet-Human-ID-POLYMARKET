"use client";

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';

interface LightningNode {
    publicKey: string;
    alias: string;
    capacity: number;
    channels: number;
    city: { en: string; ru: string };
    country: { en: string; zh: string };
}

export function TopLightningNodes({ theme = 'default' }: { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
    const { data: nodes, isLoading } = useQuery<LightningNode[]>({
        queryKey: ['network', 'lightning', 'top-nodes'],
        queryFn: async () => {
            const res = await fetch('/api/network/v1/lightning/nodes/rankings/liquidity');
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-600 animate-spin rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auditing Node Liquidity...</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Table header */}
            <div className={`grid grid-cols-[3rem_1.5fr_1fr_0.8fr_1fr] gap-6 px-6 pb-6 border-b ${isArctic ? 'border-indigo-100' : 'border-slate-100'}`}>
                {[
                  { label: "Index", icon: null },
                  { label: "Node (Alias)", icon: null },
                  { label: "Liquidity (BTC)", icon: null },
                  { label: "Channels", icon: null },
                  { label: "Geolocation", icon: null }
                ].map(col => (
                    <span key={col.label} className={`text-[10px] font-black uppercase tracking-[0.2em] ${isArctic ? 'text-indigo-400' : 'text-slate-300'}`}>{col.label}</span>
                ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
                {nodes?.slice(0, 10).map((node, i) => (
                    <motion.div
                        key={node.publicKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`grid grid-cols-[3rem_1.5fr_1fr_0.8fr_1fr] gap-6 items-center px-6 py-6 transition-all duration-300 group ${isArctic ? 'hover:bg-indigo-50/30' : 'hover:bg-black/5/50'}`}
                    >
                        <span className="text-[10px] font-black font-mono text-slate-300 group-hover:text-indigo-600 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>

                        <div className="min-w-0">
                            <div className="text-sm font-black text-slate-950 truncate">{node.alias || 'IDENTIFIED_NODE'}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-300 truncate mt-1 uppercase tracking-widest">
                                {node.publicKey.slice(0, 24)}
                            </div>
                        </div>

                        <div className="text-left">
                            <div className="text-base font-black font-mono text-slate-950 tracking-tighter">
                                {safeToFixed(node.capacity / 1e8, 2)}
                            </div>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Resolved capacity</div>
                        </div>

                        <div className="text-left">
                            <div className="text-sm font-black font-mono text-slate-950">
                                {safeToLocaleString(node.channels)}
                            </div>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Verified routes</div>
                        </div>

                        <div className="text-left">
                            <div className="text-[11px] font-bold text-slate-400 leading-tight">
                                {node.city?.en && node.country?.en
                                    ? `${node.city.en}, ${node.country.en}`
                                    : <span className="text-slate-200">LOCATION_UNDEF</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
