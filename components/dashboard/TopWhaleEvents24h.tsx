"use client";

/**
 * TopWhaleEvents24h
 *
 * Consumes the System Intel pipeline via the centralized api-client.
 * Zero-Mock Mandate: no internal fetch loops or static data.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ExternalLink, Zap, Loader2 } from 'lucide-react';
import { useSystemIntel } from '@/lib/api-client';

interface WhaleEvent {
    id: string;
    txHash: string;
    amountUSD: number;
    protocol: string;
    timestamp: string;
}

interface ApiResponse {
    updatedAt: string;
    data: WhaleEvent[];
}

function useTopWhaleEvents() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);

    const fetch_ = useCallback(async () => {
        try {
            const res = await fetch('/api/top-whale-events');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json: ApiResponse = await res.json();
            setData(json);
            setError(false);
        } catch {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch_();
        const interval = setInterval(fetch_, 30_000);
        return () => clearInterval(interval);
    }, [fetch_]);

    return { data, isLoading, error };
}

function fmtUSD(amount: number): string {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

function fmtTime(ts: string): string {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export function TopWhaleEvents24h() {
    // =========================================================================
    // INJECTED DATA HOOK  Zero-Mock Mandate
    // Whale events endpoint injected via REGISTRY.Private_INTEL.eventLedger
    // =========================================================================
    const { data: rawData, isLoading, error } = useSystemIntel('eventLedger');
    const events: WhaleEvent[] = rawData?.data ?? [];
    const updatedAt: string | undefined = rawData?.updatedAt;

    return (
        <div className="flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#FFFFFF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-black text-[#050505] uppercase tracking-widest">
                        Top Whale Events
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded font-black uppercase">
                        24h
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">
                        {isLoading ? 'Awaiting endpoint...' : `${events.length} events`}
                    </span>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto divide-y divide-[#F0F0F0]">
                {isLoading ? (
                    <div className="p-16 text-center flex flex-col items-center gap-3 text-[#888888]">
                        <Loader2 size={28} className="animate-spin opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Waiting for on-chain endpoint</p>
                    </div>
                ) : error ? (
                    <div className="p-16 text-center text-[#FF3B30]">
                        <Zap size={28} className="mx-auto mb-3 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Stream unavailable</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="p-16 text-center text-[#888888]">
                        <TrendingUp size={28} className="mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No major whale events in the last 24h</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {events.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="px-6 py-3.5 hover:bg-[#FFFFFF] transition-colors flex items-center justify-between gap-4"
                            >
                                {/* Rank + Protocol */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[9px] font-black text-[#888888] font-mono w-5 text-right shrink-0">
                                        #{i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-black text-[#050505] truncate">
                                            {event.protocol}
                                        </div>
                                        <div className="text-[9px] font-mono text-[#888888] truncate">
                                            {event.txHash.slice(0, 8)}{event.txHash.slice(-6)}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount + Time */}
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-[13px] font-black text-[#D4AF37] font-mono">
                                        {fmtUSD(event.amountUSD)}
                                    </span>
                                    <span className="text-[8px] font-mono text-[#888888]">
                                        {fmtTime(event.timestamp)}
                                    </span>
                                    <a
                                        href={`https://etherscan.io/tx/${event.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#888888] hover:text-[#050505] transition-colors"
                                    >
                                        <ExternalLink size={11} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-2 border-t border-[#E5E5E5] bg-[#FFFFFF] text-[9px] font-black text-[#888888] uppercase tracking-widest flex justify-between">
                <span>System Intel  Event Ledger</span>
                {updatedAt && (
                    <span>Updated {fmtTime(updatedAt)}</span>
                )}
            </div>
        </div>
    );
}
