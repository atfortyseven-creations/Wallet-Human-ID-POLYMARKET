"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bell, Eye, EyeOff, Settings, Globe, Crown, X } from 'lucide-react';
import Link from 'next/link';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUIStore } from '@/lib/store/ui-store';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DropdownNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
    const { isStealthMode, toggleStealthMode } = useUIStore();
    const appKit = useAppKit();
    const { address, isConnected } = useAccount();

    // Fetch notifications
    const { data } = useSWR(`/api/user/notifications?address=${address || ''}`, fetcher, { refreshInterval: 30000 });
    const notifications = data?.notifications || [];
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    const navLinks = [
        { name: t('nav.functions'), href: '/funciones', icon: null },
        { name: 'WHALE', href: '/vip', icon: <Crown size={16} className="text-[#D4AF37]" />, isVIP: true },
        { name: t('nav.developer'), href: '/developer', icon: null },
        { name: t('nav.human_card'), href: '/wallet', icon: null },
        { name: t('nav.support'), href: '/soporte', icon: null },
    ];

    const markAllRead = async () => {
        try {
            await fetch('/api/user/notifications', {
                method: 'PUT',
                body: JSON.stringify({ read: true })
            });
            mutate(`/api/user/notifications?address=${address || ''}`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div className="relative z-50">
                {/* Trigger Button - always visible with elegant animation */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all shadow-lg hover:shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                        backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="text-lg font-black tracking-tight text-[#1F1F1F] ">
                        Whale Alert Network
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-5 h-5 text-[#1F1F1F] " />
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
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Menu Panel with elegant slide animation */}
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-80 bg-white/95  backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-50"
                            >
                                {/* Exit Button */}
                                <div className="p-4 border-b border-gray-200  flex justify-between items-center">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Menú</h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100  transition-colors group"
                                        aria-label="Cerrar menú"
                                    >
                                        <X size={20} className="text-gray-400 group-hover:text-[#1F1F1F]  transition-colors" />
                                    </button>
                                </div>

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
                                                    : 'hover:bg-gray-100  text-[#1F1F1F] '
                                            }`}
                                        >
                                            {link.icon}
                                            <span className="font-bold text-sm">{link.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-300  to-transparent" />

                                {/* Utility Buttons */}
                                <div className="p-6 space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">
                                        Herramientas
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Notifications */}
                                        <button
                                            onClick={() => {
                                                const { setActivePanel } = useUIStore.getState();
                                                setActivePanel('notifications');
                                                setIsOpen(false);
                                            }}
                                            className="relative flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100  hover:bg-gray-200  transition-all"
                                        >
                                            <Bell size={18} className="text-[#1F1F1F] " />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                                            )}
                                            <span className="text-xs font-bold text-[#1F1F1F] ">Alertas</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
