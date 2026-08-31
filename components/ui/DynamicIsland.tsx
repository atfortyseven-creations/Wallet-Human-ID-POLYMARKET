"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicIsland } from '@/lib/store/dynamic-island-store';
import { Phone, Shield, Wallet, Loader2, Bell, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// Routes where DynamicIsland is allowed to appear
const ISLAND_ALLOWLIST = [
  '/chat', '/portfolio', '/studio', '/settings',
  '/hub', '/ledger', '/terminal', '/scan', '/passport',
];

export function DynamicIsland() {
  // ─── ALL HOOKS MUST BE UNCONDITIONAL (React Rules of Hooks) ───────────────
  const { activeState, payload, expanded, setExpanded, dismiss } = useDynamicIsland();
  const pathname = usePathname();
  const router   = useRouter();

  // Call/recording timer — always declared, activated only when needed
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeState === 'calling' || activeState === 'recording') {
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [activeState]);

  // Reset expanded state when island becomes idle
  useEffect(() => {
    if (activeState === 'idle') setExpanded(false);
  }, [activeState, setExpanded]);

  // ─── CONDITIONAL RENDER (after all hooks) ─────────────────────────────────
  const isAppRoute = ISLAND_ALLOWLIST.some(r => pathname?.startsWith(r));
  if (!isAppRoute) return null;
  if (activeState === 'idle') return null;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const handleTap = () => setExpanded(!expanded);
  const handleOpenChat = (e: React.MouseEvent) => { e.stopPropagation(); router.push('/chat'); dismiss(); };

  // ─── Dimensions ───────────────────────────────────────────────────────────
  const w = expanded ? 340 : 200;
  const h = expanded
    ? (activeState === 'notification' ? 90 : activeState === 'tx_processing' ? 100 : 80)
    : 36;

  return (
    <div className="fixed top-2 md:top-4 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
      <motion.div
        layout
        onClick={handleTap}
        initial={{ y: -60, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1, width: w, height: h, borderRadius: 20 }}
        exit={{ y: -50, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
        className="relative bg-black text-white overflow-hidden shadow-2xl flex items-center pointer-events-auto cursor-pointer select-none"
        style={{ boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07) inset' }}
      >
        <AnimatePresence mode="wait">

          {/* CALLING */}
          {activeState === 'calling' && (
            <motion.div key="calling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                  <Phone size={12} fill="currentColor" />
                </div>
                {expanded ? (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Call</span>
                    <span className="text-[13px] font-semibold text-white">{payload?.title || 'Unknown'}</span>
                  </motion.div>
                ) : <span className="text-[12px] font-bold text-green-400">Call</span>}
              </div>
              <div className="flex items-center gap-2">
                {expanded && (
                  <div className="flex gap-[3px] items-end h-5 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} animate={{ height: [3, 14, 3] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.12 }}
                        className="w-[2px] bg-green-400 rounded-full" />
                    ))}
                  </div>
                )}
                <span className="text-[13px] font-mono text-green-400 font-bold tabular-nums">{fmt(timer)}</span>
              </div>
            </motion.div>
          )}

          {/* RECORDING */}
          {activeState === 'recording' && (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)] shrink-0" />
                {expanded
                  ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-mono uppercase tracking-widest text-white/70">Recording</motion.span>
                  : <span className="text-[11px] font-bold text-red-400">REC</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-[2px] items-end h-5">
                  {[...Array(7)].map((_, i) => (
                    <motion.div key={i} animate={{ height: [2, 6 + (i % 4) * 3, 2] }}
                      transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.07 }}
                      className="w-[2px] bg-red-500 rounded-full" />
                  ))}
                </div>
                <span className="text-[13px] font-mono text-red-400 font-bold tabular-nums ml-1">{fmt(timer)}</span>
              </div>
            </motion.div>
          )}

          {/* SYNCING */}
          {activeState === 'syncing' && (
            <motion.div key="syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center gap-3 px-4">
              <Loader2 size={14} className="text-blue-400 animate-spin shrink-0" />
              {expanded ? (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Network</span>
                  <span className="text-[12px] text-white/60 truncate">{payload?.subtitle || 'Syncing...'}</span>
                </motion.div>
              ) : <span className="text-[11px] font-mono text-blue-400 font-bold tracking-widest">SYNC</span>}
            </motion.div>
          )}

          {/* WALLET CONNECTED */}
          {activeState === 'wallet_connected' && (
            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Wallet size={12} />
                </div>
                {expanded ? (
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Wallet Linked</span>
                    <span className="text-[13px] font-semibold text-white truncate">{payload?.title || '0x...'}</span>
                  </motion.div>
                ) : <span className="text-[12px] font-mono font-bold">Linked</span>}
              </div>
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            </motion.div>
          )}

          {/* NOTIFICATION (incoming message from background chat) */}
          {activeState === 'notification' && (
            <motion.div key="notification" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center px-4 gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center overflow-hidden">
                {payload?.icon
                  ? <img src={payload.icon} alt="" className="w-full h-full object-cover" />
                  : <Bell size={13} className="text-white" />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-white truncate">{payload?.title || 'Message'}</span>
                  {!expanded && <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />}
                </div>
                {expanded && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[12px] text-white/55 truncate mt-0.5">
                    {payload?.subtitle || 'Tap to view'}
                  </motion.span>
                )}
              </div>
              {expanded && (
                <button onClick={handleOpenChat}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-blue-500 transition-colors"
                  aria-label="Open Ledger Chat">
                  <ChevronRight size={14} className="text-white" />
                </button>
              )}
            </motion.div>
          )}

          {/* TX PROCESSING (ZK proof) */}
          {activeState === 'tx_processing' && (
            <motion.div key="tx_processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col justify-center px-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Shield size={14} className="text-[#1c7aff] shrink-0" />
                  <span className="text-[13px] font-bold text-white">
                    {expanded ? (payload?.title || 'ZK Proof') : 'Proving...'}
                  </span>
                </div>
                <Loader2 size={13} className="text-[#1c7aff] animate-spin shrink-0" />
              </div>
              {expanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 w-full overflow-hidden">
                  <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full w-1/2 bg-[#1c7aff] rounded-full"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  {payload?.subtitle && (
                    <p className="text-[9px] font-mono uppercase tracking-widest text-white/35 mt-2 text-center truncate">
                      {payload.subtitle}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TX SUCCESS */}
          {activeState === 'tx_success' && (
            <motion.div key="tx_success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center gap-3 px-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-white" />
              </motion.div>
              <span className="text-[13px] font-bold text-white">{payload?.title || 'Verified'}</span>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
