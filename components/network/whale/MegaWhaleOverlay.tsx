"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ExternalLink } from 'lucide-react';

interface MegaWhaleTx {
    id: string;
    hash: string;
    chain: string;
    chainColor?: string;
    chainIcon?: string;
    asset: string;
    amount: number;
    usdValue: number;
    from: string;
    to: string;
    timestamp: number;
    sentiment?: string;
    sentimentColor?: string;
    walletProfile?: string;
}

interface MegaWhaleOverlayProps {
    tx: MegaWhaleTx | null;
    onDismiss: () => void;
}

//  Web Audio API sonic impact engine 
function playMegaWhaleSound(usdValue: number) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Deep sub-bass pulse
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(40, ctx.currentTime);
        sub.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 2);
        subGain.gain.setValueAtTime(0, ctx.currentTime);
        subGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.05);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start();
        sub.stop(ctx.currentTime + 2.5);

        // Mid impact transient
        const impact = ctx.createOscillator();
        const impactGain = ctx.createGain();
        impact.type = 'sawtooth';
        impact.frequency.setValueAtTime(120, ctx.currentTime);
        impact.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
        impactGain.gain.setValueAtTime(0, ctx.currentTime);
        impactGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        impactGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        // Scale tone pitch with USD value (larger = deeper rumble)
        const pitch = usdValue > 1_000_000_000 ? 55 : usdValue > 100_000_000 ? 75 : 100;
        const tone = ctx.createOscillator();
        const toneGain = ctx.createGain();
        tone.type = 'sine';
        tone.frequency.setValueAtTime(pitch, ctx.currentTime + 0.1);
        tone.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.8);
        toneGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        toneGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
        toneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        impact.connect(impactGain);
        tone.connect(toneGain);
        impactGain.connect(ctx.destination);
        toneGain.connect(ctx.destination);
        impact.start();
        impact.stop(ctx.currentTime + 0.5);
        tone.start(ctx.currentTime + 0.1);
        tone.stop(ctx.currentTime + 1.5);

        // Auto-close AudioContext after done
        setTimeout(() => { try { ctx.close(); } catch(_) {} }, 3000);
    } catch (_) {
        // Silently fail if AudioContext not available (e.g. server-side)
    }
}

function getExplorerUrl(hash: string, chain: string): string {
    if (chain === 'BITCOIN') return `https://mempool.space/tx/${hash}`;
    if (chain === 'ETHEREUM' || chain === 'ETH') return `https://etherscan.io/tx/${hash}`;
    if (chain === 'BSC' || chain === 'BNB') return `https://bscscan.com/tx/${hash}`;
    if (chain === 'BASE') return `https://basescan.org/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
}

export function MegaWhaleOverlay({ tx, onDismiss }: MegaWhaleOverlayProps) {
    const soundFired = useRef<string | null>(null);

    useEffect(() => {
        if (tx && tx.id !== soundFired.current) {
            soundFired.current = tx.id;
            playMegaWhaleSound(tx.usdValue);
        }
    }, [tx]);

    // Auto-dismiss after 18 seconds
    useEffect(() => {
        if (!tx) return;
        const t = setTimeout(onDismiss, 18000);
        return () => clearTimeout(t);
    }, [tx, onDismiss]);

    const usdFormatted = tx ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tx.usdValue) : '';
    const amountFormatted = tx ? `${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${tx.asset}` : '';
    const isBullish = tx?.sentiment?.includes('BULLISH');
    const accentColor = isBullish ? '#00ff9d' : '#ef4444';

    return (
        <AnimatePresence>
            {tx && (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    onClick={onDismiss}
                >
                    {/* Immersive dark backdrop with radial glow */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse at center, ${accentColor}08 0%, rgba(0,0,0,0.97) 70%)`,
                        }}
                        animate={{
                            background: [
                                `radial-gradient(ellipse at center, ${accentColor}06 0%, rgba(0,0,0,0.97) 70%)`,
                                `radial-gradient(ellipse at center, ${accentColor}12 0%, rgba(0,0,0,0.97) 70%)`,
                                `radial-gradient(ellipse at center, ${accentColor}06 0%, rgba(0,0,0,0.97) 70%)`,
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Ripple rings */}
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border pointer-events-none"
                            style={{ borderColor: `${accentColor}20` }}
                            initial={{ width: 0, height: 0, opacity: 0.8 }}
                            animate={{ width: '120vw', height: '120vw', opacity: 0 }}
                            transition={{ duration: 4, delay: i * 0.6, repeat: Infinity, repeatDelay: 1.5 }}
                        />
                    ))}

                    {/* Main card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="relative z-10 w-full max-w-2xl mx-6 rounded-[2.5rem] overflow-hidden"
                        style={{
                            background: 'rgba(4,4,8,0.98)',
                            border: `1px solid ${accentColor}25`,
                            boxShadow: `0 0 80px ${accentColor}12, 0 40px 120px rgba(0,0,0,0.8)`,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header bar */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                {/* Blinking alert indicator */}
                                <motion.div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: accentColor }}
                                    animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/50">
                                    Mega Whale Detected
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                    style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
                                >
                                    {tx.chainIcon || tx.chain}
                                </span>
                                <button
                                    onClick={onDismiss}
                                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X size={12} className="text-white/40" />
                                </button>
                            </div>
                        </div>

                        {/* Core data */}
                        <div className="px-8 py-10">
                            {/* USD headline */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-2"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                                    Valor transferido
                                </span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-6xl font-black font-mono tracking-tight mb-1"
                                style={{ color: accentColor }}
                            >
                                {usdFormatted}
                            </motion.div>
                            <div className="text-xl font-black font-mono text-white/50 mb-10">
                                {amountFormatted}
                            </div>

                            {/* from  to row */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 mb-6 font-mono text-[11px]"
                            >
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Origen</span>
                                    <span className="text-white/90 truncate" title={tx.from}>{tx.from.slice(0,10)}...{tx.from.slice(-8)}</span>
                                </div>
                                <ArrowRight size={14} className="text-white/40 shrink-0" />
                                <div className="flex flex-col min-w-0 flex-1 text-right">
                                    <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Destino</span>
                                    <span className="text-white/90 truncate" title={tx.to}>{tx.to.slice(0,10)}...{tx.to.slice(-8)}</span>
                                </div>
                            </motion.div>

                            {/* Metadata row */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 gap-4 mb-8"
                            >
                                {tx.walletProfile && (
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Perfil</span>
                                        <span className="text-sm font-bold text-white/80">{tx.walletProfile}</span>
                                    </div>
                                )}
                                {tx.sentiment && (
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">Señal</span>
                                        <span className={`text-sm font-black ${tx.sentimentColor || 'text-white/80'}`}>{tx.sentiment}</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Hash + explorer link */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center justify-between border-t border-white/[0.05] pt-6"
                            >
                                <span className="text-[9px] font-mono text-white/20 truncate max-w-xs">
                                    {tx.hash.slice(0, 22)}
                                </span>
                                <a
                                    href={getExplorerUrl(tx.hash, tx.chain)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                                    style={{ color: accentColor }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    Verificar <ExternalLink size={10} />
                                </a>
                            </motion.div>
                        </div>

                        {/* Progress bar auto-dismiss */}
                        <motion.div
                            className="h-[2px] w-full"
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 18, ease: 'linear' }}
                            style={{ transformOrigin: 'left', background: accentColor, opacity: 0.4 }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
