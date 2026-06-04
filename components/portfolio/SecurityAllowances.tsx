"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, XCircle, Search, RefreshCw, Key } from 'lucide-react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useWalletStore } from '@/lib/store/wallet-store';
import { fetchOnChainAllowances, executeOnChainApproval } from '@/lib/onchain-engine';

export function SecurityAllowances({ onBack }: { onBack: () => void }) {
    const getConnectedWallet = useWalletStore(s => s.getConnectedWallet);
    const [allowances, setAllowances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [revokingIdx, setRevokingIdx] = useState<number | null>(null);

    const loadAllowances = async () => {
        setIsLoading(true);
        try {
            const wallet = await getConnectedWallet();
            if (!wallet) return;

            // These are hardcoded testing addresses. In a full production app, 
            // you'd index Transfer events or use an indexing API (e.g., Covalent).
            // Here, we strictly perform on-chain view calls.
            const tokens = [
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT
            ];
            const spenders = [
                "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Uniswap Router
                "0xFF1F2B4ADb9dF6FC8eAFecDcbF96A2B351680455"  // Aztec Rollup
            ];

            const results = await fetchOnChainAllowances(wallet.provider!, wallet.address, tokens, spenders);
            setAllowances(results);
        } catch (e) {
            console.error("Failed to fetch allowances", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllowances();
    }, []);

    const handleRevoke = async (idx: number, token: string, spender: string) => {
        setRevokingIdx(idx);
        try {
            const wallet = await getConnectedWallet();
            if (!wallet) throw new Error("Wallet not connected");

            toast.info("Broadcasting Revoke Transaction...");
            const receipt = await executeOnChainApproval(wallet, token, spender, 0n);
            
            toast.success(`Allowance revoked in block ${receipt?.blockNumber}`);
            
            // Remove from list
            setAllowances(prev => prev.filter((_, i) => i !== idx));
        } catch (err: any) {
            console.error(err);
            toast.error("Revocation Failed", { description: err.message?.substring(0, 50) });
        } finally {
            setRevokingIdx(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col max-w-2xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-[600px] flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <h2 className="text-lg font-black uppercase tracking-widest text-black flex items-center gap-3">
                    <ShieldAlert size={20} className="text-black" />
                    Security Allowances
                </h2>
                <div className="flex gap-2">
                    <button onClick={loadAllowances} disabled={isLoading} className="text-[10px] uppercase tracking-widest font-bold text-black hover:text-black transition-colors border border-black/10 px-3 py-1 flex items-center gap-1">
                        <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} /> REFRESH
                    </button>
                    <button onClick={onBack} className="text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors border border-black/10 px-3 py-1">
                        CLOSE
                    </button>
                </div>
            </div>

            <div className="bg-black text-white p-6 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Key size={140} strokeWidth={1} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldAlert size={16} /> Token Spend Permissions
                </h3>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-sm">
                    Manage and revoke smart contract spending limits. This is a direct on-chain readout. Revoking will broadcast a 0-approval transaction to the Ethereum network.
                </p>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-black/30 gap-4">
                        <RefreshCw size={24} className="animate-spin" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Querying Blockchain State...</span>
                    </div>
                ) : allowances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-black/30 gap-4 border border-black/5 bg-[#FAFAFA]">
                        <Search size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">No Active Allowances Found</span>
                    </div>
                ) : (
                    allowances.map((al, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-black/10 bg-white hover:border-black/30 transition-colors gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    {al.token.slice(0,6)}...{al.token.slice(-4)}
                                </span>
                                <span className="text-[10px] font-bold text-black/50">Spender: {al.spender.slice(0,6)}...{al.spender.slice(-4)}</span>
                                <span className="text-[9px] uppercase tracking-widest text-black/30">Auth: {al.allowance} TOKENS</span>
                            </div>
                            <button 
                                onClick={() => handleRevoke(i, al.token, al.spender)}
                                disabled={revokingIdx !== null}
                                className="px-6 py-3 bg-[#FAFAFA] border border-black/10 hover:border-black text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-black hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                {revokingIdx === i ? <RefreshCw size={12} className="animate-spin" /> : <XCircle size={12} />}
                                {revokingIdx === i ? 'REVOKING...' : 'REVOKE'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
