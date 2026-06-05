"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, ExternalLink, Layers, Shield, Clock, BarChart3, Activity, Flame, Copy, Check
} from 'lucide-react';
import useSWR from 'swr';
import { TransactionHeatmap } from '../premium/TransactionHeatmap';
import { io } from 'socket.io-client';
import { safeToLocaleString, safeToFixed, safeCurrency } from '@/lib/utils/number-format';
import { toast } from 'sonner';
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { useCurrency } from '@/hooks/useCurrency';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface PortfolioViewProps {
  totalValue: number;
  balances: any[];
  prices: Record<string, number>;
  change24hValue: number;
  change24hPercent: number;
  onForceSync?: () => Promise<void>;
  address: string;
}

export default function PaperPortfolioView({ totalValue, balances, prices, change24hValue, change24hPercent, onForceSync, address }: PortfolioViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'ETH' | 'ERC20' | 'NFT'>('ALL');
  const [liveTxs, setActiveTxs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formatValue, currency } = useCurrency();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Identity Hash Synchronized');
    setTimeout(() => setCopied(false), 2000);
  };

  //  Real-time Asset Sync
  useEffect(() => {
    if (!address) return;
    const socket = io({ path: '/api/socket/io', reconnectionAttempts: 5, timeout: 10000 });
    socket.on('connect', () => console.log(' [Network Hub] Synchronized'));
    socket.on('vitals.tx.new', (tx) => {
        if (tx.to?.toLowerCase() === address.toLowerCase() || tx.from?.toLowerCase() === address.toLowerCase()) {
            setActiveTxs(prev => [tx, ...prev].slice(0, 10));
        }
    });
    return () => { if (socket) socket.disconnect(); };
  }, [address]);

  const { data: portfolio } = useSWR(address ? `/api/user/portfolio?address=${address}` : null, fetcher);
  const { data: intel } = useSWR(address ? `/api/user/analytics?address=${address}` : null, fetcher);

  const transactions = useMemo(() => {
    const hist = portfolio?.transactions || [];
    const merged = [...liveTxs, ...hist].slice(0, 50);
    if (filter === 'ALL') return merged;
    if (filter === 'ETH') return merged.filter((tx: any) => tx.type === 'TRANSFER' || !tx.token || tx.token === 'ETH');
    if (filter === 'ERC20') return merged.filter((tx: any) => tx.type === 'ERC20_TRANSFER' || tx.token);
    if (filter === 'NFT') return merged.filter((tx: any) => tx.type === 'NFT' || tx.type === 'ERC721_TRANSFER');
    return merged;
  }, [liveTxs, portfolio, filter]);

  const stats = useMemo(() => [
    { label: 'Portfolio Value', value: formatValue(totalValue), icon: Wallet, color: 'text-cyan-400' },
    { label: 'Activity Count', value: (portfolio?.totalTransactions ?? intel?.transactionCount ?? transactions?.length ?? 0)?.toLocaleString() || '0', icon: Activity, color: 'text-white/60' },
    { label: 'Active Age', value: intel?.activeAgeDays ? `${Math.floor(intel.activeAgeDays / 365)}Y ${intel.activeAgeDays % 365}D` : '0Y 0D', icon: Clock, color: 'text-white/60' },
    { label: 'Streak', value: intel?.longestStreakDays ? `${intel.longestStreakDays}D` : '0D', icon: Flame, color: 'text-rose-500' },
  ], [totalValue, intel, transactions.length, portfolio, formatValue]);

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--aztec-ink)] font-sans selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">

      <div className="relative z-10 w-full max-w-[2560px] mx-auto min-h-screen flex flex-col">
        {/* Institutional Header is handled by ClientLayout */}

        <main className="flex-1 max-w-[1400px] mx-auto w-full pt-12 pb-32 px-10 space-y-12 relative z-20">
        
        {/* Profile Identity & Global Performance - REDESIGNED FOR PERFECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 py-10 border-b border-slate-200 relative">
            <div className="space-y-6 max-w-2xl">
                <div className="flex flex-col gap-4">
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 font-web3-mono break-all leading-none">
                        {address?.toLowerCase()}
                    </h1>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-6 py-2.5 bg-black/5 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all group w-fit"
                    >
                        {copied ? (
                            <Check size={14} className="text-emerald-600" />
                        ) : (
                            <Copy size={14} className="text-slate-400 group-hover:text-slate-900" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 font-web3">
                            {copied ? 'Copied' : 'Copy Identity Hash'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12 bg-white/60 p-8 rounded-[2.5rem] border border-slate-100 backdrop-blur-3xl shadow-xl shadow-slate-200/50">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Recent Activity</span>
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 font-web3">Total Value</div>
                    <div className="text-3xl sm:text-4xl md:text-6xl font-black font-web3-mono tracking-tighter text-slate-900 leading-none">
                        {formatValue(totalValue)}
                    </div>
                </div>
                
                <div className="h-16 w-px bg-slate-100 hidden sm:block" />

                <div className={`flex items-center gap-4 py-2 transition-all ${change24hValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${change24hValue >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm' : 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm'}`}>
                        {change24hValue >= 0 ? <ArrowUpRight size={28} strokeWidth={3} /> : <ArrowDownLeft size={28} strokeWidth={3} />}
                    </div>
                    <div>
                        <div className={`font-black text-3xl font-web3-mono leading-none ${change24hValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {change24hValue >= 0 ? '+' : ''}{formatValue(Math.abs(change24hValue))}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.3em] font-black mt-2 text-slate-400 whitespace-nowrap font-web3">
                            24H CHANGE <span className={`ml-2 ${change24hValue >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>({safeToFixed(change24hPercent, 2)}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Core Metrics Grid - Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white/80 border border-slate-200 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-lg shadow-slate-200/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="mb-0 relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-black/5 border border-slate-100 mb-8 ${stat.color}`}>
                   <stat.icon size={20} className="opacity-80" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-950 tracking-tighter font-web3-mono relative z-10">{stat.value}</div>
              <div className="text-[10px] text-slate-400 mt-3 uppercase tracking-[0.3em] font-black relative z-10 font-web3">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12">
            {/* Extended Ledger & Allocation */}
            <div className="space-y-12">
                
                {/* Asset Portfolio Table - INSTITUTIONAL GRADE */}
                <div className="bg-white/80 border border-slate-200 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-xl shadow-slate-200/50">
                    <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200/40">
                                <Wallet size={20} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight font-web3">Asset Distribution</h2>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/5/50 text-[10px] text-slate-400 uppercase font-black tracking-[0.4em] font-web3">
                                <tr>
                                    <th className="px-12 py-7">Asset</th>
                                    <th className="px-12 py-7">Allocation</th>
                                    <th className="px-12 py-7">Balance</th>
                                    <th className="px-12 py-7 text-right">Value ({currency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {balances.map((token: any) => {
                                    const share = totalValue > 0 ? (token.valueUsd / totalValue) * 100 : 0;
                                    return (
                                        <tr key={`${token.symbol}-${token.chainId}`} className="group hover:bg-black/5/50 transition-all">
                                            <td className="px-12 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        {token.logo ? (
                                                            <img src={token.logo} alt={token.symbol} className="w-12 h-12 rounded-2xl border border-slate-200 bg-white shadow-md group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                                                                <Layers size={20} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-lg text-slate-950 uppercase tracking-tight group-hover:text-emerald-500 transition-colors font-web3">{token.symbol}</div>
                                                        <div className="text-[10px] text-slate-400 font-black tracking-[0.25em] uppercase font-web3">{token.name || 'Protocol Asset'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-8">
                                                <div className="w-64 space-y-3">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-web3">
                                                        <span>Allocation</span>
                                                        <span className="text-emerald-500">{share.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-[1px] relative">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                            style={{ width: `${share}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-8">
                                                <div className="font-web3-mono text-base font-black text-slate-600 tracking-tight">
                                                    {token.balanceFormatted}
                                                </div>
                                                <div className="text-[10px] text-slate-300 font-black tracking-widest uppercase mt-1 font-web3">Confirmed Source</div>
                                            </td>
                                            <td className="px-12 py-8 text-right">
                                                <div className="font-black text-2xl font-web3-mono text-slate-900 tracking-tighter">
                                                    {formatValue(token.valueUsd)}
                                                </div>
                                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 font-web3 ${token.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {token.change24h >= 0 ? '+' : ''}{token.change24h?.toFixed(2)}% <span className="opacity-40">(24H)</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ledger / Chain Transactions - PREMIUM SYNC VIEW */}
                <div className="bg-white/80 border border-slate-200 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-xl shadow-slate-200/50">
                    <div className="p-10 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="flex gap-2 bg-slate-100/50 p-2 rounded-[1.5rem] border border-slate-200 backdrop-blur-3xl">
                            {['ALL', 'ETH', 'ERC20', 'NFT'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.25em] transition-all uppercase font-web3 ${
                                        filter === f ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/5 text-[10px] text-slate-400 uppercase font-black tracking-[0.45em] hidden md:table-header-group font-web3">
                                <tr>
                                    <th className="px-12 py-7">Transaction Hash</th>
                                    <th className="px-12 py-7">Type</th>
                                    <th className="px-12 py-7">From / To</th>
                                    <th className="px-12 py-7 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-900">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.hash} className="group hover:bg-black/5 transition-colors border-b border-slate-100">
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-2">
                                                <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" className="font-web3-mono text-base font-black text-emerald-700 group-hover:text-emerald-500 transition-colors uppercase leading-none tracking-tight">
                                                    {tx.hash.slice(0, 16)}<span className="opacity-10 scale-90 inline-block px-1">...</span>{tx.hash.slice(-10)}
                                                </a>
                                                <div className="flex items-center gap-4 text-[11px] text-slate-300 font-black uppercase tracking-[0.2em] font-web3">
                                                    <span className="text-slate-400">Block {tx.blockNumber || '---'}</span>
                                                    <span className="w-2 h-px bg-slate-200" />
                                                    <span>{formatRelativeTime(tx.timestamp)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border font-web3 ${
                                                tx.type === 'TRANSFER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                                                tx.type === 'ERC20_TRANSFER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-black/5 text-slate-400 border-slate-100'
                                            }`}>
                                                {tx.type || 'SYNC'}
                                            </span>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 font-web3">
                                                    <span className="text-slate-300 w-10">FROM</span> 
                                                    <span className="text-slate-600 font-web3-mono tracking-tighter bg-black/5 px-3 py-1 rounded-lg">{tx.from?.slice(0,10)}...</span>
                                                </div>
                                                <div className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 font-web3">
                                                    <span className="text-slate-300 w-10">TO</span> 
                                                    <span className="text-slate-600 font-web3-mono tracking-tighter bg-black/5 px-3 py-1 rounded-lg">{tx.to ? `${tx.to.slice(0,10)}...` : 'CONTRACT'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <div className={`font-black text-3xl font-web3-mono tracking-tighter ${tx.direction === 'IN' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.direction === 'IN' ? '+' : '-'}{parseFloat(tx.value || '0').toFixed(4)} <span className="text-[12px] opacity-20 ml-2">ETH</span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-2 font-web3">Confirmed Layer 1</div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-12 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Activity size={48} strokeWidth={1} className="animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] font-web3">No synchronization units detected in current epoch</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        </main>

        <footer className="h-20 border-t border-slate-100 flex items-center justify-between px-12 bg-white/80 backdrop-blur-3xl relative z-20">
            <div className="flex items-center gap-12">
            </div>
            <div className="flex items-center gap-4">
            </div>
        </footer>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: string | number) {
  const now = new Date().getTime();
  const ts = new Date(timestamp).getTime();
  const diff = Math.floor((now - ts) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
