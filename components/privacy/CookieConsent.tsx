'use client';

/**
 * [PHASE 5 — CYPHERPUNK PRIVACY NOTICE]
 *
 * This is NOT a cookie consent banner. Whale Network does not collect analytics.
 * This is a one-time privacy notice that informs users of our zero-data architecture.
 *
 * Architecture: The notice is shown once, persisted in localStorage with key
 * `privacy-acknowledged`. Once dismissed, it never re-appears.
 * No server call is made. No consent is "stored" in a database.
 * Privacy is enforced at the cryptographic layer, not at the UI layer.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from './CookieContext';
import { Lock, X } from 'lucide-react';

export function CookieConsent() {
    const { showBanner, acceptAll } = useCookieConsent();

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-5 pointer-events-none"
            >
                <div className="w-full max-w-2xl mx-auto pointer-events-auto relative">
                    {/* Glow ring for visibility on any background */}
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/30 via-transparent to-emerald-500/10 pointer-events-none" />

                    <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.08)]"
                         style={{ background: 'rgba(8,8,10,0.97)', backdropFilter: 'blur(24px)' }}
                    >
                        {/* Subtle top accent line */}
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
                            {/* Icon + Label */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                                    <Lock size={15} className="text-emerald-400" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 whitespace-nowrap">
                                    Zero Data Policy
                                </p>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-white/70 leading-relaxed font-mono">
                                    This platform collects{' '}
                                    <strong className="text-white font-black">zero analytics</strong>{' '}
                                    and{' '}
                                    <strong className="text-white font-black">zero marketing data</strong>.
                                    {' '}Your state is sealed cryptographically before reaching any network layer.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                <button
                                    onClick={acceptAll}
                                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] bg-white text-[#050505] hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    Understood
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
                                    aria-label="Dismiss"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
