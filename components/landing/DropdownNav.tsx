"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bell, Eye, EyeOff, Settings, Globe, Crown } from 'lucide-react';
import Link from 'next/link';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUIStore } from '@/lib/store/ui-store';
import { NotificationsMenu } from '@/components/notifications/NotificationsMenu';

export function DropdownNav() {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
    const { isStealthMode, toggleStealthMode } = useUIStore();
    const appKit = useAppKit();
    const { address, isConnected } = useAccount();

    const navLinks = [
        { name: t('nav.functions'), href: '/funciones', icon: null },
        { name: 'WHALE', href: '/vip', icon: <Crown size={16} className="text-[#D4AF37]" />, isVIP: true },
        { name: t('nav.developer'), href: '/developer', icon: null },
        { name: t('nav.human_card'), href: '/wallet', icon: null },
        { name: t('nav.support'), href: '/soporte', icon: null },
    ];

    return (
        <div className="relative z-50">
            {/* Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all shadow-lg hover:shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-lg font-black tracking-tight text-[#1F1F1F] dark:text-white">
                    Human DeFi
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-5 h-5 text-[#1F1F1F] dark:text-white" />
                </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-80 bg-white/95 dark:bg-[#1F1F1F]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-50"
                        >
                            {/* Navigation Links */}
                            <div className="p-6 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">
                                    Navegación
                                </p>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            link.isVIP
                                                ? 'bg-gradient-to-r from-black to-gray-900 text-white hover:scale-105 shadow-lg'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/10 text-[#1F1F1F] dark:text-white'
                                        }`}
                                    >
                                        {link.icon}
                                        <span className="font-bold text-sm">{link.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />

                            {/* Utility Buttons */}
                            <div className="p-6 space-y-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">
                                    Herramientas
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Notifications */}
                                    <div className="flex items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                                        <NotificationsMenu />
                                        <span className="ml-2 text-xs font-bold text-[#1F1F1F] dark:text-white">Alertas</span>
                                    </div>

                                    {/* Stealth Mode */}
                                    <button
                                        onClick={toggleStealthMode}
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    >
                                        {isStealthMode ? <EyeOff size={18} /> : <Eye size={18} />}
                                        <span className="text-xs font-bold text-[#1F1F1F] dark:text-white">
                                            {isStealthMode ? 'Visible' : 'Ocultar'}
                                        </span>
                                    </button>

                                    {/* Settings */}
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    >
                                        <Settings size={18} className="text-[#1F1F1F] dark:text-white" />
                                        <span className="text-xs font-bold text-[#1F1F1F] dark:text-white">Config</span>
                                    </Link>

                                    {/* Language */}
                                    <button
                                        onClick={toggleLanguage}
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                                    >
                                        <Globe size={18} className="text-[#1F1F1F] dark:text-white" />
                                        <span className="text-xs font-bold text-[#1F1F1F] dark:text-white uppercase">
                                            {language}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />

                            {/* Connect Button */}
                            <div className="p-6">
                                <button
                                    onClick={() => {
                                        appKit.open();
                                        setIsOpen(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-black to-gray-900 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    {isConnected ? (
                                        <>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                                            {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </>
                                    ) : (
                                        t('nav.start')
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
