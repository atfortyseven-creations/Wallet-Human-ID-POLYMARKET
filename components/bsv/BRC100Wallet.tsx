"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ArrowRight, TrendingUp, TrendingDown, Zap, Shield, Search, RefreshCw } from 'lucide-react';
import { BRC100Manager } from '@/lib/bsv/BRC100Manager';
import { useCWI } from '@/lib/bsv/CWIContext';
import { toast } from 'sonner';

/**
 * BRC-100 INSTITUTIONAL WALLET (Pillar 1 - Phase 2)
 * -----------------------------------------------
 * High-performance UI for managing BRC-100 token assets.
 * Integrates with the System Identity and CWI Substrate.
 */
export const BRC100Wallet = () => {
    const { identity } = useCWI();
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const mgr = React.useMemo(() => new BRC100Manager(), []);

    const loadTokens = async () => {
        if (!identity) return;
        setLoading(true);
        try {
            const address = identity.getAddress();
            const balances = await mgr.getBalances(address);
            setTokens(balances);
        } catch (e) {
            console.error('BRC-100 Load Error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTokens();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [identity]);

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <Coins className="text-[var(--aztec-chartreuse)]" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-aztec-serif uppercase tracking-tight">Institutional <span className="text-[var(--aztec-chartreuse)]">Assets</span></h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">BRC-100 Substrate v2</p>
                    </div>
                </div>
                <button 
                    onClick={loadTokens} 
                    disabled={loading}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Token Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                <AnimatePresence>
                    {tokens.map((token, i) => (
                        <motion.div
                            key={token.ticker}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.05] hover:border-[var(--aztec-chartreuse)]/30 transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Inner Glow */}
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--aztec-chartreuse)]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center font-bold text-xs">
                                            {token.ticker.slice(0, 1)}
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-white/40">{token.name}</div>
                                            <div className="text-xs font-bold text-[var(--aztec-chartreuse)]">{token.ticker}</div>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[9px] font-black ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {token.change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.abs(token.change24h)}%
                                    </div>
                                </div>

                                <div>
                                    <div className="text-2xl font-aztec-mono font-black tracking-tight">{token.balance}</div>
                                    <div className="text-[10px] text-white/20 font-aztec-mono truncate">Equity: ${(parseFloat(token.balance.replace(/,/g, '')) * token.priceUsd).toLocaleString()}</div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex gap-2">
                                        <Zap size={10} className="text-white/20" />
                                        <Shield size={10} className="text-white/20" />
                                    </div>
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        className="p-2 bg-white/5 rounded-lg text-white/30 group-hover:text-[var(--aztec-chartreuse)] transition-colors"
                                    >
                                        <ArrowRight size={14} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {tokens.length === 0 && !loading && (
                <div className="p-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                    <Search className="mx-auto text-white/10 mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">No BRC-100 Substrates Detected</p>
                </div>
            )}
        </div>
    );
};
