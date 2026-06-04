"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X } from 'lucide-react';
import { SystemBridge } from '@/components/premium/SystemBridge';

export default function BridgePanel() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 border border-[var(--aztec-orchid)]/20 backdrop-blur-md hover:bg-[var(--aztec-orchid)]/10 hover:border-[var(--aztec-orchid)]/40 transition-all group"
                title="Device Bridge QR"
            >
                <QrCode size={14} className="text-[var(--aztec-orchid)]" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                    Device Bridge
                </span>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-12 right-0 w-80 p-6 rounded-3xl bg-[#0d0d0d]/95 border border-white/10 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] z-50"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-mono text-[11px] uppercase tracking-widest text-white font-bold">Device Bridge</h4>
                                <p className="text-[9px] font-mono text-white/30 tracking-wide mt-0.5">Generate QR  Scan on mobile</p>
                            </div>
                            <button onClick={() => setOpen(false)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X size={13} className="text-white/50" />
                            </button>
                        </div>
                        <SystemBridge />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
