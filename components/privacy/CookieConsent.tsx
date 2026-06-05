'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from './CookieContext';

export function CookieConsent() {
    const { showBanner, acceptAll, rejectAll } = useCookieConsent();

    if (!showBanner) return null;

    const handleEssential = async () => {
        rejectAll();
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: { essential: true, analytics: false, marketing: false } })
            });
        } catch(e) {}
    };

    const handleAcceptAll = async () => {
        acceptAll();
        try {
            await fetch('/api/cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: { essential: true, analytics: true, marketing: true } })
            });
        } catch(e) {}
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="fixed bottom-0 left-0 right-0 z-[99999] p-3 sm:p-5 pointer-events-none"
            >
                {/*  Outer container  */}
                <div className="w-full max-w-2xl mx-auto pointer-events-auto relative">
                    {/* Card */}
                    <div
                        className="relative rounded-2xl overflow-hidden bg-white  border border-black/5  shadow-2xl"
                    >
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold text-black  mb-1.5">
                                    Cookie Preferences
                                </p>
                                <p className="text-[11px] text-black/60  leading-relaxed font-sans">
                                    We use essential cookies for session integrity and optional analytics to improve your experience. Your data is never sold.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <button
                                    onClick={handleEssential}
                                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 active:scale-[0.97] bg-black/5  text-black/60  hover:text-black hover: hover:bg-black/10 hover:"
                                >
                                    Essential Only
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 active:scale-[0.97] bg-black text-white   hover:opacity-90"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
