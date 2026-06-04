"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-full bg-white/50 border border-[#1F1F1F]/5 text-[#1F1F1F]/70 hover:bg-white hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
                <Globe size={20} />
                <span className="text-xs font-bold uppercase">{locale}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-[#1F1F1F]/10 z-50 overflow-hidden"
                        >
                            <button 
                                onClick={() => { setLocale('en'); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-[#F5F5F0] transition-colors flex justify-between items-center ${locale === 'en' ? 'text-[#1F1F1F]' : 'text-[#1F1F1F]/50'}`}
                            >
                                English
                                {locale === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

