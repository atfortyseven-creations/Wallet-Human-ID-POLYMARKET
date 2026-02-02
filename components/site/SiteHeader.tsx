'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Settings, Bell, Crown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useGateState } from '@/components/layout/TitaniumGate';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationsMenu } from '@/components/notifications/NotificationsMenu';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUIStore } from '@/lib/store/ui-store';

export function SiteHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Auth Hooks
    const { isAuthenticated } = useAuth();
    
    // AppKit hooks - Moved out of try-catch to fix Error #310
    const appKit = useAppKit();
    const account = useAppKitAccount();
    const wagmiAccount = useAccount();
    
    const { open } = appKit;
    const { isConnected } = account;
    const { address } = wagmiAccount;

    // i18n
    const { t, language, toggleLanguage } = useLanguage();
    const { state } = useGateState();
    const { isStealthMode, toggleStealthMode } = useUIStore();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Don't render header during INTRO or AUTH states
    if (state !== 'APP') {
        return null;
    }

    const navLinks = [
        { name: t('nav.functions'), href: '/funciones' },
        { name: 'VIP MEMBER', href: '/vip', isVIP: true },
        { name: t('nav.developer'), href: '/developer' }, 
        { name: t('nav.human_card'), href: '/wallet' },
        { name: t('nav.support'), href: '/soporte' },
    ];

    return (
        <>
            <header className={`fixed top-6 left-0 right-0 z-[100] transition-all duration-300 pointer-events-none flex justify-center px-4`}>
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`
                        pointer-events-auto
                        flex items-center justify-between 
                        w-full max-w-[1300px] 
                        h-[72px] px-8 rounded-full 
                        bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                        border border-black/5
                        relative
                    `}
                >
                    {/* LOGO */}
                    <div className="w-[180px] lg:w-[250px] flex justify-start items-center gap-1">
                        <Link href="/" className="flex items-center gap-2 group relative z-50 pointer-events-auto">
                            <span className="text-xl font-black tracking-tight text-gray-900 font-sans group-hover:text-black transition-colors">
                                Human DeFi
                            </span>
                        </Link>
                    </div>

                    {/* DESKTOP NAV */}
                    <nav className="flex-1 hidden xl:flex items-center gap-1 justify-center relative z-50 pointer-events-auto">
                        {navLinks.map((link) => (
                            <div key={link.href} className="relative group">
                                <Link 
                                    href={link.href}
                                    className={`relative z-10 px-4 lg:px-5 py-2 text-[13px] lg:text-[14px] font-black transition-all rounded-lg tracking-widest uppercase font-sans whitespace-nowrap flex items-center gap-2 ${
                                        link.isVIP 
                                            ? 'bg-black text-white border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]' 
                                            : 'text-gray-800 hover:text-black hover:bg-gray-100/50'
                                    }`}
                                >
                                    {link.isVIP && <Crown size={16} className="text-[#D4AF37]" />}
                                    {link.isVIP ? "HERRAMIENTA DE PAGO" : link.name}
                                </Link>
                                
                                {/* Stickers for VIP Button */}
                                {link.isVIP && (
                                    <>
                                        {/* Rocket - Left/Bottom */}
                                        <img 
                                            src="/models/5ec47565-dec1-46e9-ab91-67e1e759705e.png" 
                                            alt="Rocket"
                                            className="absolute -left-8 -bottom-6 w-12 h-12 object-contain pointer-events-none z-20 drop-shadow-md transform -rotate-12 group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {/* Star - Right/Top */}
                                        <img 
                                            src="/models/421ed50f-ed5f-45e1-bbdb-575b26e45707.png" 
                                            alt="Star"
                                            className="absolute -right-6 -top-5 w-10 h-10 object-contain pointer-events-none z-20 drop-shadow-md transform rotate-12 group-hover:rotate-45 transition-transform duration-300"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* TABLET/SMALL DESKTOP NAV - Horizontal Scroll on smaller screens */}
                    <nav className="flex-1 hidden md:flex xl:hidden items-center justify-start relative z-50 pointer-events-auto overflow-x-auto scrollbar-hide px-2">
                        <div className="flex items-center gap-2">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 text-[11px] font-black transition-all rounded-lg tracking-wider uppercase font-sans whitespace-nowrap flex items-center gap-1 ${
                                        link.isVIP 
                                            ? 'bg-black text-white border border-[#D4AF37]' 
                                            : 'text-gray-800 hover:text-black hover:bg-gray-100/50'
                                    }`}
                                >
                                    {link.isVIP && <Crown size={12} className="text-[#D4AF37]" />}
                                    {link.isVIP ? "VIP" : link.name.split(' ')[0]}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* RIGHT ACTIONS */}
                    <div className="hidden md:flex w-[350px] lg:w-[500px] justify-end items-center gap-4 relative z-50 pointer-events-auto">
                        {/* Grouped Icons: Bell, Settings, Language, Stealth */}
                        {/* Grouped Icons: Bell, Settings, Language, Stealth */}
                        <div className="flex items-center gap-2 pr-6 border-r border-gray-200">
                             <div className="scale-100 hover:scale-110 transition-transform">
                                <NotificationsMenu />
                             </div>
                             
                             <button 
                                onClick={toggleStealthMode}
                                className={`p-2.5 rounded-full transition-colors group relative z-10 ${isStealthMode ? 'bg-[#1F1F1F] text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'}`}
                                title={isStealthMode ? "Disable Stealth Mode" : "Enable Stealth Mode"}
                            >
                                {isStealthMode ? (
                                    <EyeOff size={22} />
                                ) : (
                                    <Eye size={22} />
                                )}
                             </button>

                             <Link href="/settings" className="p-2.5 rounded-full hover:bg-black/5 transition-colors group relative z-10">
                                <Settings size={22} className="text-gray-400 group-hover:text-black transition-colors" />
                             </Link>

                             <button 
                                onClick={toggleLanguage}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-black/5 transition-all group relative z-10"
                                title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                            >
                                <Globe size={22} className="text-gray-400 group-hover:text-black transition-colors" />
                                <span className="text-[10px] font-black text-gray-400 group-hover:text-black uppercase tracking-tighter">
                                    {language}
                                </span>
                            </button>
                        </div>

                        {/* CTA / Connect Button */}
                        <button 
                            onClick={() => open()}
                            className="
                                relative z-10
                                bg-black text-white 
                                px-8 py-3 rounded-full 
                                font-black text-[11px] tracking-[0.2em] uppercase
                                hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] 
                                transition-all shadow-lg min-w-[150px]
                            "
                        >
                            {isConnected ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                    {address?.slice(0,6)}...
                                </span>
                            ) : (
                                t('nav.start')
                            )}
                        </button>
                    </div>

                    {/* MOBILE MENU BTN */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 md:hidden flex flex-col items-stretch gap-4 overflow-y-auto"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {/* Navigation Links - Stacked Vertically */}
                        <div className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href} 
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`w-full py-4 px-6 rounded-2xl font-black text-center uppercase tracking-wider transition-all ${
                                        link.isVIP 
                                            ? 'bg-black text-white border-2 border-[#D4AF37] shadow-lg' 
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {link.isVIP && <Crown size={18} className="inline mr-2 text-[#D4AF37]" />}
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                         
                         <div className="flex flex-col gap-4 mt-4">
                             <div className="grid grid-cols-2 gap-4">
                                <button onClick={toggleStealthMode} className="p-4 rounded-2xl bg-gray-100 hover:bg-gray-200 flex flex-col items-center gap-2">
                                    {isStealthMode ? <EyeOff size={24} /> : <Eye size={24} />}
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Stealth</span>
                                </button>
                                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-2xl bg-gray-100 hover:bg-gray-200 flex flex-col items-center gap-2">
                                    <Settings size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                                </Link>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <button onClick={toggleLanguage} className="p-4 rounded-2xl bg-gray-100 hover:bg-gray-200 font-black uppercase tracking-widest flex flex-col items-center gap-2">
                                    <Globe size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{language === 'en' ? 'ESPAÑOL' : 'ENGLISH'}</span>
                                </button>
                                <div className="p-4 rounded-2xl bg-gray-100 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                                    <Bell size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Alerts</span>
                                </div>
                             </div>
                         </div>

                         <button 
                            onClick={() => { open(); setIsMobileMenuOpen(false); }}
                            className="w-full bg-black text-white px-8 py-5 rounded-2xl font-black text-lg mt-auto mb-8 uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-transform"
                        >
                            {isConnected ? t('nav.wallet_settings') : t('nav.start')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
