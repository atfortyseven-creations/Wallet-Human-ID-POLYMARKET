"use client";

import React, { useState, useEffect } from 'react';
import { 
    Menu, 
    X, 
    Bell, 
    Settings, 
    LifeBuoy, 
    Anchor, 
    Network, 
    Trophy,
    HelpCircle,
    User,
    LogOut,
    Eye,
    EyeOff,
    Search,
    ChevronDown,
    Globe,
    Zap,
    TrendingUp,
    Shield,
    LayoutDashboard,
    MessageCircle,
    Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAccount } from 'wagmi';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { useAppKit } from '@reown/appkit/react';

interface NavLinkProps {
    href: string;
    label: string;
    icon: any;
    badge?: string;
    isActive?: boolean;
}

function NavLink({ href, label, icon: Icon, badge, isActive }: NavLinkProps) {
    return (
        <Link href={href} className="relative group">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-[0_0_15px_-5px_rgba(79,70,229,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
                <Icon size={18} className={isActive ? 'text-indigo-500' : 'group-hover:text-indigo-400 transition-colors'} />
                <span className="text-sm font-bold tracking-tight">{label}</span>
                {badge && (
                    <span className="bg-indigo-500 text-[10px] font-black px-1.5 py-0.5 rounded-md text-white animate-pulse">
                        {badge}
                    </span>
                )}
            </div>
            {isActive && (
                <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 left-2 right-2 h-[2px] bg-indigo-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
        </Link>
    );
}

export function DropdownNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();
    const { address, isConnected } = useAccount();
    const { nuclearDisconnect } = useSystemSignOut();
    const { open } = useAppKit();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isStealthMode, setIsStealthMode] = useState(false);

    // Mock unread notifications count
    const unreadCount = 3;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleStealthMode = () => {
        setIsStealthMode(!isStealthMode);
        // Add actual stealth mode logic here if needed (e.g., masking addresses)
    };

    const signOut = async () => {
        await nuclearDisconnect();
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
            isScrolled || isMenuOpen ? 'py-3' : 'py-6'
        }`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
                <div className={`relative flex items-center justify-between p-2 rounded-2xl transition-all duration-500 ${
                    isScrolled 
                    ? 'bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl' 
                    : 'bg-transparent border border-transparent'
                }`}>
                    
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-4 px-4 group">
                        <div className="relative w-14 h-14 shrink-0">
                            <img 
                                src="/official-whale-legendary.png"
                                alt="Humanity Ledger"
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(192,86,221,0.6)]"
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-aztec-h2 text-[15px] uppercase tracking-[0.12em] text-white leading-tight">Humanity Ledger</span>
                            <span className="font-aztec-h2 text-[11px] uppercase tracking-[0.3em] text-[var(--aztec-orchid)] leading-tight">Corporation.</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        <NavLink href="/terminal" label="Dashboard" icon={LayoutDashboard} isActive={pathname === '/terminal'} />
                        <NavLink href="/portfolio" label="Portfolio" icon={TrendingUp} isActive={pathname === '/portfolio'} />
                        <NavLink href="/chat" label="Whale Chat" icon={MessageCircle} isActive={pathname === '/chat'} />
                        <NavLink href="/registry" label="Registry" icon={Map} isActive={pathname === '/registry'} badge="LIVE" />
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-3 px-2">
                        
                        <div className="h-6 w-px bg-white/10 mx-1" />

                        {/* Support */}
                        <button
                            onClick={() => router.push('/support')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Support"
                        >
                            <HelpCircle size={18} className="text-gray-400 hover:text-white transition-colors" />
                        </button>

                        {/* Notifications */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
                            title="Notifications"
                        >
                            <Bell size={18} className="text-gray-400 hover:text-white transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                            )}
                        </button>

                        {/* Stealth Mode */}
                        <button
                            onClick={toggleStealthMode}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title={isStealthMode ? 'Stealth Mode Active' : 'Activate Stealth Mode'}
                        >
                            {isStealthMode ? (
                                <EyeOff size={18} className="text-indigo-400" />
                            ) : (
                                <Eye size={18} className="text-gray-400 hover:text-white transition-colors" />
                            )}
                        </button>

                        {/* Profile/Settings Menu */}
                        {isConnected ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-1 rounded-full border border-white/20 hover:border-indigo-500/50 transition-all overflow-hidden"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center text-white font-black text-xs uppercase">
                                        {address?.slice(2, 4)}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-72 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-2 z-[200]"
                                        >
                                            <div className="p-4 border-b border-white/5 bg-white/5 rounded-t-2xl mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black">
                                                        {address?.slice(2, 4)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-0.5">VIP Member</div>
                                                        <div className="text-sm font-bold text-white tabular-nums">
                                                            {address?.slice(0, 8)}...{address?.slice(-6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        setShowSettings(false);
                                                        router.push('/ledger');
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                            <Globe size={18} className="text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold">Whale Ledger</span>
                                                    </div>
                                                </button>

                                                <div className="h-px bg-white/5 mx-4 my-1" />

                                                {/* Legend Action: Inline User Profile */}
                                                <button
                                                    onClick={() => {
                                                        setShowSettings(false);
                                                        window.location.href = '/settings'; // Clerk profile management
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                            <Settings size={18} className="text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold">Manage Profile</span>
                                                    </div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                                
                                                <button
                                                    onClick={async () => {
                                                        setShowSettings(false);
                                                        await signOut();
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                            <User size={18} className="text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold">Switch Account</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setShowSettings(false);
                                                        router.push('/?login=true');
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                            <HelpCircle size={18} className="text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold">Register New Account</span>
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Legend Exit: Robust Sign Out */}
                                            <div className="p-2 mt-1 border-t border-white/5">
                                                <button
                                                    onClick={async () => {
                                                        setShowSettings(false);
                                                        await signOut();
                                                    }}
                                                    className="w-full px-4 py-4 text-left text-sm text-red-500 hover:bg-indigo-500/10 rounded-2xl transition-all flex items-center gap-3 group"
                                                >
                                                    <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                                        <User size={18} className="text-indigo-400" />
                                                    </div>
                                                    <span className="font-black uppercase tracking-widest text-xs">Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => open()}
                                className="px-4 py-2 bg-indigo-600 border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2"
                            >
                                <Zap size={14} className="fill-current text-white" />
                                Connect Wallet
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden mt-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <div className="flex flex-col p-4 gap-2">
                                <Link 
                                    href="/terminal" 
                                    className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-xl text-white font-bold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard size={20} className="text-indigo-500" />
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/portfolio" 
                                    className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-xl text-white font-bold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <TrendingUp size={20} className="text-indigo-500" />
                                    Portfolio
                                </Link>
                                <Link 
                                    href="/chat" 
                                    className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-xl text-white font-bold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <MessageCircle size={20} className="text-indigo-500" />
                                    Whale Chat
                                </Link>
                                <Link 
                                    href="/registry" 
                                    className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-xl text-white font-bold border border-indigo-500/20"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Map size={20} className="text-indigo-500" />
                                    Registry
                                    <span className="ml-auto bg-indigo-500 text-[10px] font-black px-2 py-0.5 rounded text-white animate-pulse">LIVE</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
