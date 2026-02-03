"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bell, Eye, EyeOff, Settings, Globe, Crown, X, Wallet, PieChart, TrendingUp, Zap, Users as UsersIcon, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUIStore } from '@/lib/store/ui-store';
import useSWR, { mutate } from 'swr';
import { getAccountColor, type WalletAccount } from '@/lib/wallet/accounts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function DropdownNav() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
    const { isStealthMode, toggleStealthMode } = useUIStore();
    const appKit = useAppKit();
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch notifications
    const { data } = useSWR(`/api/user/notifications?address=${address || ''}`, fetcher, { refreshInterval: 30000 });
    const notifications = data?.notifications || [];
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    // Account Management State (Synced with SuperWallet logic)
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [currentAddress, setCurrentAddress] = useState<string>('');

    useEffect(() => {
        if (!address) return;
        const stored = localStorage.getItem('wallet_accounts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setAccounts(parsed);
                if (!currentAddress) setCurrentAddress(parsed[0]?.address || address);
            } catch (e) {
                console.error(e);
            }
        }
    }, [address]);

    const handleSwitchAccount = (addr: string) => {
        setCurrentAddress(addr);
        localStorage.setItem('wallet_current_address', addr);
        window.dispatchEvent(new Event('storage')); // Notify other components
    };

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
                body: JSON.stringify({ read: true, address })
            });
            mutate(`/api/user/notifications?address=${address || ''}`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div className="relative z-50 flex flex-col items-center">
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
                    <span className="text-lg font-black tracking-tight text-white">
                        Human DeFi
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-5 h-5 text-white" />
                    </motion.div>
                </motion.button>

                {/* Dropdown Menu - Refactored for absolute reliability */}
                {mounted && createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <div key="nav-portal-wrapper" className="fixed inset-0 z-[2147483647]">
                                {/* Backdrop */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" 
                                    onClick={() => setIsOpen(false)} 
                                />

                                {/* Menu Panel */}
                                <motion.div
                                    key="nav-menu-panel"
                                    initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                    exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
                                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                                    style={{
                                        position: 'fixed',
                                        top: '100px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        transformOrigin: 'top center'
                                    }}
                                    className="w-[95vw] max-w-5xl bg-zinc-900/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden p-2"
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-4 py-2">
                                        
                                         {/* Left: Branding */}
                                         <Link 
                                            href="/"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push('/');
                                                setIsOpen(false);
                                            }}
                                            className="hidden lg:flex items-center gap-3 pr-6 border-r border-white/10 shrink-0 hover:opacity-80 transition-all active:scale-95"
                                         >
                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                                 <span className="text-black font-black text-xl italic">H</span>
                                            </div>
                                            <div className="flex flex-col">
                                                 <span className="text-sm font-black text-white leading-none tracking-tight">HUMAN</span>
                                                 <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Nav</span>
                                            </div>
                                         </Link>

                                        {/* Center: Navigation Links */}
                                        <nav className="flex items-center gap-1 flex-1 justify-center overflow-x-auto no-scrollbar">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all whitespace-nowrap group/link ${
                                                        link.isVIP
                                                            ? 'bg-white text-black hover:scale-105 shadow-xl'
                                                            : 'hover:bg-white/10 text-white font-bold text-sm tracking-tight'
                                                    }`}
                                                >
                                                    {link.isVIP && <div className="animate-pulse">{link.icon}</div>}
                                                    <span>{link.name}</span>
                                                </Link>
                                            ))}
                                        </nav>

                                        {/* Right: Tools & Connect */}
                                        <div className="flex items-center gap-4 pl-6 border-l border-white/10 shrink-0">
                                            <div className="flex gap-1">
                                                <NavToolButton 
                                                    onClick={() => { router.push('/soporte'); setIsOpen(false); }}
                                                    icon={<LifeBuoy size={18} />} 
                                                    label="Soporte" 
                                                />
                                                <NavToolButton 
                                                    onClick={() => { setShowNotifications(true); setIsOpen(false); }}
                                                    icon={<Bell size={18} />}
                                                    badge={unreadCount > 0}
                                                    label="Alertas"
                                                />
                                                <NavToolButton 
                                                    onClick={toggleStealthMode}
                                                    icon={isStealthMode ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    label={isStealthMode ? 'Visible' : 'Ocultar'}
                                                />
                                                <NavToolButton 
                                                    onClick={() => { router.push('/settings'); setIsOpen(false); }}
                                                    icon={<Settings size={18} />} 
                                                    label="Config" 
                                                />
                                                <NavToolButton onClick={toggleLanguage} icon={<Globe size={18} />} label={language} />
                                            </div>

                                            <button
                                                onClick={() => {
                                                    appKit.open();
                                                    setIsOpen(false);
                                                }}
                                                className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 whitespace-nowrap"
                                            >
                                                {isConnected ? (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="font-mono">{address?.slice(0, 4)}...{address?.slice(-4)}</span>
                                                    </>
                                                ) : (
                                                    t('nav.start')
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Wallet Context & Sub-links (Visible when connected) */}
                                    {isConnected && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 p-2 bg-white/5 rounded-[2rem] flex items-center justify-between gap-4 border-t border-white/5"
                                        >
                                            {/* Account Switcher Integration */}
                                            <div className="flex items-center gap-2 pl-4">
                                                <div 
                                                    className="w-8 h-8 rounded-full border-2 border-white/20 shadow-sm flex items-center justify-center text-white text-[10px] font-black"
                                                    style={{ background: getAccountColor(currentAddress || address || '') }}
                                                >
                                                    {(accounts.find(a => a.address === currentAddress)?.name?.[0] || 'H').toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-white leading-tight">
                                                        {accounts.find(a => a.address === currentAddress)?.name || 'Human Wallet'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-gray-400 tabular-nums">
                                                        {(currentAddress || address || '').slice(0, 6)}...{(currentAddress || address || '').slice(-4)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Wallet Sub-Tabs */}
                                            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl">
                                                <SubNavLink href="/wallet" icon={<Wallet size={14} />} label="Wallet" />
                                                <SubNavLink href="/wallet?view=portfolio" icon={<PieChart size={14} />} label="Portfolio" />
                                                <SubNavLink href="/wallet?view=earn" icon={<TrendingUp size={14} />} label="Earn" />
                                                <SubNavLink href="/wallet?view=activity" icon={<Zap size={14} />} label="Activity" />
                                                <SubNavLink href="/vip" icon={<UsersIcon size={14} />} label="Whales" />
                                            </div>

                                            {/* Switch Account Trigger (Small) */}
                                            <button 
                                                onClick={() => { router.push('/wallet'); setIsOpen(false); }}
                                                className="px-4 py-2 bg-white/10 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-sm hover:scale-105 transition-all mr-2"
                                            >
                                                Switch
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>

            {/* Notifications Modal */}
            {mounted && showNotifications && createPortal(
                <AnimatePresence mode="wait">
                    <div className="fixed inset-0 z-[1000] isolate">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowNotifications(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute right-4 top-4 bottom-4 w-[calc(100%-2rem)] max-w-96 bg-white dark:bg-[#1F1F1F] rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notificaciones</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllRead}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        Marcar leídas
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Bell size={32} className="opacity-40 mb-2" />
                                        <p>No hay notificaciones</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notifications.map((n: any) => (
                                            <div 
                                                key={n.id} 
                                                className={`p-4 rounded-xl border transition-all ${
                                                    !n.read 
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50' 
                                                        : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10'
                                                }`}
                                            >
                                                <h4 className={`text-sm mb-1 ${!n.read ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

function NavToolButton({ icon, onClick, label, badge = false }: { icon: React.ReactNode, onClick?: () => void, label: string, badge?: boolean }) {
    return (
        <button
            onClick={onClick}
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-[#1F1F1F] dark:text-white"
            title={label}
        >
            <div className="relative">
                {icon}
                {badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1F1F1F]" />
                )}
            </div>
            {/* Tooltip on hover */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap z-[60]">
                {label}
            </span>
        </button>
    );
}

function SubNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link 
            href={href}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"
        >
            {icon}
            <span className="text-[10px] font-black uppercase tracking-tight hidden sm:block">{label}</span>
        </Link>
    );
}
