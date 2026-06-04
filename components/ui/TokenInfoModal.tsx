"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, ExternalLink, Activity, Layers, Clock,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Database,
  TrendingUp, TrendingDown, Zap, BarChart2
} from 'lucide-react';
import { TokenLogo } from '@/components/ui/TokenLogo';

export interface TokenInfoPayload {
  symbol: string;
  name: string;
  network: string;
  netColor: string;
  price: number;
  pct: number;
  volume: number;
  onChainPrice?: number;
  getblockVerified?: boolean;
  priceChange?: { m5: number; h1: number; h6: number; h24: number };
  liquidity?: number;
  mcap?: number;
  fdv?: number;
  dex?: string;
  pairCreatedAt?: number;
}

interface Props {
  token: TokenInfoPayload | null;
  currency: 'USD' | 'EUR';
  eurRate: number;
  onClose: () => void;
}

//  Formatters 
const sym = (c: 'USD' | 'EUR') => c === 'EUR' ? '' : '$';

function fmtP(n: number, c: 'USD' | 'EUR', r: number): string {
  const v = n * (c === 'EUR' ? r : 1), s = sym(c);
  if (!v || isNaN(v)) return `${s}`;
  if (v >= 1000)  return `${s}${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (v >= 1)     return `${s}${v.toFixed(4)}`;
  if (v >= 0.01)  return `${s}${v.toFixed(6)}`;
  return `${s}${v.toFixed(8)}`;
}

function fmtL(n: number, c: 'USD' | 'EUR', r: number): string {
  const v = n * (c === 'EUR' ? r : 1), s = sym(c);
  if (!v || isNaN(v)) return '';
  if (v >= 1e12) return `${s}${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${s}${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${s}${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3)  return `${s}${(v / 1e3).toFixed(1)}K`;
  return `${s}${v.toFixed(2)}`;
}

function pctColor(v: number): string {
  return v >= 0 ? '#16a34a' : '#dc2626';
}

function pctFmt(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

//  Sub-components 

function DataRow({ label, value, mono = true, highlight = false }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/[0.05] last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">{label}</span>
      <span className={`${mono ? 'font-mono' : 'font-sans'} text-[13px] font-bold text-black ${highlight ? 'text-black' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function PctCell({ value }: { value: number }) {
  const c = pctColor(value);
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-1 font-mono text-[12px] font-bold" style={{ color: c }}>
      <Icon size={11} />
      {pctFmt(value)}
    </span>
  );
}

//  Main Modal 
export function TokenInfoModal({ token, currency, eurRate, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!token) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [token, onClose]);

  if (!mounted) return null;

  const explorerBase: Record<string, string> = {
    ethereum:  'https://etherscan.io/token',
    bsc:       'https://bscscan.com/token',
    polygon:   'https://polygonscan.com/token',
    arbitrum:  'https://arbiscan.io/token',
    avalanche: 'https://snowscan.xyz/token',
    solana:    'https://solscan.io',
    bitcoin:   'https://mempool.space',
  };

  const modal = (
    <AnimatePresence>
      {token && (
        <motion.div
          key="tok-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-[99999] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="tok-panel"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-black/8 rounded-2xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25)]"
            onClick={e => e.stopPropagation()}
          >
            {/*  HEADER  */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-black/6">
                <div className="flex items-center gap-4">
                <TokenLogo
                    symbol={token.symbol}
                    className="w-12 h-12 rounded-xl shadow"
                    fallbackClassName="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-black text-white shadow"
                />
                <div>
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-[20px] font-black tracking-tight text-black">{token.symbol}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded-md bg-black/5 text-black/50 border border-black/8">
                      {token.network.toUpperCase()}
                    </span>
                    {token.getblockVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md bg-black text-white">
                        <ShieldCheck size={9} /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-black/40 font-medium">{token.name}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-black/40" />
              </button>
            </div>

            {/*  PRICE HERO  */}
            <div className="px-7 py-6 border-b border-black/6 bg-black/[0.015]">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35 mb-2">Active Oracle Price</p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-[42px] font-black font-mono leading-none tracking-tighter text-black">
                  {fmtP(token.price, currency, eurRate)}
                </p>
                <div
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-[14px] font-mono"
                  style={{
                    color: pctColor(token.pct),
                    backgroundColor: `${pctColor(token.pct)}0f`,
                    border: `1px solid ${pctColor(token.pct)}20`,
                  }}
                >
                  {token.pct >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {pctFmt(token.pct)}
                  <span className="text-[9px] opacity-60 font-bold ml-0.5">24H</span>
                </div>
              </div>

              {/* On-Chain price source */}
              {token.onChainPrice && token.onChainPrice > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black/8 shadow-sm">
                  <Activity size={11} className="text-black/40" />
                  <span className="text-[10px] font-mono text-black/40">
                    On-Chain: <span className="font-bold text-black">{fmtP(token.onChainPrice, currency, eurRate)}</span>
                  </span>
                </div>
              )}
            </div>

            {/*  PRICE CHANGES GRID  */}
            {token.priceChange && (
              <div className="px-7 py-5 border-b border-black/6">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 mb-3 flex items-center gap-1.5">
                  <BarChart2 size={11} /> Price Performance
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: '5 MIN', value: token.priceChange.m5 },
                    { label: '1 HR',  value: token.priceChange.h1 },
                    { label: '6 HR',  value: token.priceChange.h6 },
                    { label: '24 HR', value: token.priceChange.h24 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-black/[0.02] border border-black/6 rounded-xl px-3 py-3 flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30">{label}</span>
                      <PctCell value={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  COMPLETE INDEXATION  */}
            <div className="px-7 py-5 border-b border-black/6">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 mb-3 flex items-center gap-1.5">
                <Database size={11} /> Complete Indexation
              </p>
              <div className="bg-black/[0.015] border border-black/6 rounded-xl px-5 py-1">
                <DataRow label="24H Volume"      value={fmtL(token.volume, currency, eurRate)} />
                <DataRow label="Market Cap"      value={token.mcap ? fmtL(token.mcap, currency, eurRate) : ''} />
                <DataRow label="Fully Diluted"   value={token.fdv ? fmtL(token.fdv, currency, eurRate) : ''} />
                <DataRow label="Liquidity Pool"  value={token.liquidity ? fmtL(token.liquidity, currency, eurRate) : ''} />
                {token.getblockVerified && (
                  <DataRow
                    label="On-Chain State"
                    value={
                      <span className="flex items-center gap-1.5 text-black font-mono text-[12px] font-bold">
                        <ShieldCheck size={13} className="text-black" /> Node-Verified
                      </span>
                    }
                  />
                )}
              </div>
            </div>

            {/*  DEX METADATA  */}
            {(token.dex || token.pairCreatedAt) && (
              <div className="px-7 py-4 border-b border-black/6">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30 mb-3 flex items-center gap-1.5">
                  <Layers size={11} /> Exchange & Listing
                </p>
                <div className="flex flex-wrap gap-3">
                  {token.dex && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/[0.025] border border-black/6 rounded-lg">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/35">DEX</span>
                      <span className="text-[11px] font-bold text-black">{token.dex}</span>
                    </div>
                  )}
                  {token.pairCreatedAt && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/[0.025] border border-black/6 rounded-lg">
                      <Clock size={11} className="text-black/35" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/35">Listed</span>
                      <span className="text-[11px] font-bold text-black">
                        {new Date(token.pairCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/*  FOOTER  */}
            <div className="px-7 py-4 flex items-center justify-between">
              <a
                href={explorerBase[token.network] || 'https://etherscan.io'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black transition-colors"
              >
                <ExternalLink size={12} /> View on Block Explorer
              </a>
              <div className="flex items-center gap-2 bg-black/[0.025] border border-black/6 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-black/40 uppercase tracking-widest">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
