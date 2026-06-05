"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useActivePortfolio } from '@/hooks/useActivePortfolio';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, LayoutGrid } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useWalletStore } from '@/lib/store/wallet-store';

export function ActivePortfolio() {
    const { isConnected: isWagmiConnected } = useAccount();
    const { address: eoaAddress } = useSystemAccount();
    const { address: systemAddress } = useWalletStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    
    const isConnected = isWagmiConnected || !!eoaAddress || !!systemAddress;
    const { 
        usdcBalance, 
        totalPnl, 
        change24hUSD, 
        change24hPercent,
        polymarketPositions,
        assets,
        isLoading 
    } = useActivePortfolio();

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E5E5E5] rounded-[3.5rem] shadow-sm max-w-4xl mx-auto mt-8 text-center">
                <RefreshCcw size={32} className="text-[#888888] animate-spin mb-4 mx-auto" />
                <span className="text-sm font-black uppercase text-[#888888] tracking-widest">INITIALIZING VAULT...</span>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E5E5E5] rounded-[3.5rem] shadow-sm max-w-4xl mx-auto mt-8">
                <Wallet size={48} className="text-[#888888] mb-4 opacity-50" />
                <h3 className="text-xl font-black text-[#050505] uppercase tracking-tighter">WALLET DISCONNECTED</h3>
                <p className="text-sm font-bold text-[#888888] mt-2">Connect Web3 Wallet to view live on-chain balances</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E5E5E5] rounded-[2rem] shadow-sm max-w-4xl mx-auto mt-8 text-center">
                <RefreshCcw size={32} className="text-[#888888] animate-spin mb-4 mx-auto" />
                <span className="text-sm font-black uppercase text-[#888888] tracking-widest">PROCESSING ON-CHAIN DATA...</span>
            </div>
        );
    }

    const isPositive = change24hUSD >= 0;

    return (
        <div className="w-full h-auto flex flex-col items-center p-4">
        <div className="w-full max-w-4xl mx-auto space-y-6 shrink-0 pb-10">
            
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden">

                <h2 className="text-[11px] font-black text-[#888888] uppercase tracking-[0.2em] mb-3">Institutional Net Worth (USDC + Assets)</h2>
                <div className="flex items-end gap-6">
                    <h1 className="text-6xl font-black text-[#050505] font-mono tracking-tighter shadow-sm">
                        ${Number(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <div className={`flex items-center gap-2 mb-2 font-mono font-black ${isPositive ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                        {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        <span className="text-2xl">{isPositive ? '+' : ''}{change24hUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-sm opacity-60">({isPositive ? '+' : ''}{change24hPercent.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Spot Balances */}
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xs font-black text-[#111111] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Wallet size={16} className="text-[#888888]" />
                        Spot Balances
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-3">
                            <span className="text-sm font-bold text-[#111111] font-mono">USDC (Polygon Native)</span>
                            <span className="text-lg font-black text-[#111111] font-mono">${Number(usdcBalance).toLocaleString()}</span>
                        </div>
                        {assets?.slice(0, 3).map((asset: any) => (
                            asset.symbol !== 'USDC' && (
                                <div key={asset.symbol} className="flex justify-between items-center border-b border-[#E5E5E5] pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#111111] font-mono">{asset.symbol}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-[#111111] font-mono">${(asset.valueUSD || 0).toLocaleString()}</div>
                                        <div className="text-xs font-bold text-[#888888] font-mono">{parseFloat(asset.balanceFormatted).toFixed(4)}</div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Polymarket Positions */}
                <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-xs font-black text-[#111111] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <LayoutGrid size={16} className="text-[#888888]" />
                        Active Prediction Markets
                    </h3>
                    
                    {polymarketPositions.length === 0 ? (
                        <div className="text-center py-8 text-[#888888]">
                            <p className="text-xs font-bold uppercase tracking-widest">NO ACTIVE POSITIONS</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {polymarketPositions.map((pos: any, idx: number) => {
                                const isPosPnL = pos.pnl >= 0;
                                return (
                                    <div key={idx} className="border-b border-[#E5E5E5] pb-4 last:border-0 last:pb-0">
                                        <p className="text-xs font-bold text-[#111111] leading-tight mb-2 truncate max-w-[280px]">
                                            {pos.marketTitle}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${pos.outcome === "YES" ? 'bg-[#00C076]/10 text-[#00C076] border border-[#00C076]/20' : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'}`}>
                                                    {pos.outcome} <span className="opacity-50">({pos.shares.toFixed(2)} Shares)</span>
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-[#050505] font-mono">${pos.value.toFixed(2)}</div>
                                                <div className={`text-[10px] font-black font-mono ${isPosPnL ? 'text-[#00C076]' : 'text-[#FF3B30]'}`}>
                                                    {isPosPnL ? '+' : ''}{pos.pnl.toFixed(2)} ({isPosPnL ? '+' : ''}{pos.pnlPercent.toFixed(1)}%)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
        </div>
    );
}
