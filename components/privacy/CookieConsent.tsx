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
import { Lock } from 'lucide-react';

export function CookieConsent() {
    const { showBanner, acceptAll } = useCookieConsent();

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-5 pointer-events-none"
            >
                <div className="w-full max-w-2xl mx-auto pointer-events-auto relative">
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
                            {/* Icon */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <Lock size={14} className="text-emerald-400" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
                                    Zero Data Policy
                                </p>
                            </div>
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-white/60 leading-relaxed font-mono">
                                    This platform collects <strong className="text-white">zero analytics</strong> and <strong className="text-white">zero marketing data</strong>. Your state is sealed cryptographically before reaching any network layer. Privacy is enforced by architecture, not by policy.
                                </p>
                            </div>
                            {/* Dismiss button */}
                            <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <button
                                    onClick={acceptAll}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.97] bg-white text-black hover:bg-white/90"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
