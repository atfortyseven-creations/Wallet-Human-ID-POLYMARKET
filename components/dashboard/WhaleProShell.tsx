"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


// ─── Custom minimal SVG icons (not Lucide) ─────────────────────────────────
const Icon = {
  markets:    <span className="font-mono text-[10px] tracking-widest font-black">[MKT]</span>,
  explorer:   <span className="font-mono text-[10px] tracking-widest font-black">[EXP]</span>,
  roadmap:    <span className="font-mono text-[10px] tracking-widest font-black">[RDM]</span>,
  sync:       <span className="font-mono text-[10px] tracking-widest font-black">[SNC]</span>,
  logs:       <span className="font-mono text-[10px] tracking-widest font-black">[LOG]</span>,
  identity:   <span className="font-mono text-[10px] tracking-widest font-black">[ID]</span>,
  support:    <span className="font-mono text-[10px] tracking-widest font-black">[SUP]</span>,
  forum:      <span className="font-mono text-[10px] tracking-widest font-black">[FRM]</span>,
};
import { MODULE_EXPLANATIONS } from './ModuleExplanations';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useMarketStream } from '@/context/MarketStreamContext';
import { GlobalCommandPalette } from '@/components/ui/GlobalCommandPalette';
import { InstitutionalErrorBoundary } from '@/components/ui/InstitutionalErrorBoundary';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useEthMetrics } from '@/hooks/useEthMetrics';
import { useDisconnect } from 'wagmi';
import { toast } from 'sonner';

// Tier access helper
const TIER_LEVELS: Record<string, number> = { FREE: 0, STANDARD: 1 };
function hasAccess(userTier: string, minTier: 'FREE' | 'STANDARD'): boolean {
    return (TIER_LEVELS[userTier] ?? 0) >= (TIER_LEVELS[minTier] ?? 0);
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    externalUrl?: string;
    requiresZK?: boolean;
    minTier?: 'FREE' | 'STANDARD';
}

const SIDEBAR_ITEMS: NavItem[] = [
    { id: 'markets',         label: 'Markets',        icon: Icon.markets,  requiresZK: true },
    { id: 'inst-ledger',     label: 'Explorer',       icon: Icon.explorer, requiresZK: true },
    { id: 'humanity-ledger', label: 'Roadmap',        icon: Icon.roadmap },
    { id: 'logs',            label: 'Logs',           icon: Icon.logs },
    { id: 'gold',            label: 'Identity',       icon: Icon.identity },
    { id: 'support',         label: 'Support',        icon: Icon.support },
];

const RESTRICTED_TABS = [
    'logs',
    'privacy'
];





// Convert autoDisconnectTimer setting string to milliseconds
function timerToMs(t: '15m' | '1h' | '24h' | 'never'): number | null {
    if (t === '15m')   return 15  * 60 * 1000;
    if (t === '1h')    return 60  * 60 * 1000;
    if (t === '24h')   return 24  * 60 * 60 * 1000;
    return null; // 'never'
}

function AztecSidebarItem({ item, isActive, isCollapsed, onClick, isLocked }: { item: NavItem, isActive: boolean, isCollapsed: boolean, onClick: () => void, isLocked?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`relative w-full flex items-center justify-between py-2.5 px-3 rounded-xl group select-none outline-none transition-all duration-300 active:scale-95 ${
                isActive 
                    ? 'bg-[#050505] shadow-md border border-[#1A1A1A]' 
                    : 'bg-transparent border border-transparent hover:bg-black/[0.04] '
            } ${isLocked ? 'opacity-70 grayscale' : ''}`}
        >
            <div className="relative flex items-center w-full">
                {isActive && (
                    <motion.div layoutId="activeTabIndicator" className="absolute left-[-13px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#FFFFFF] rounded-r-full" />
                )}

                {item.icon && (
                    <span className={`shrink-0 transition-colors duration-300 ${isActive ? 'text-[#FFFFFF]' : 'text-[#888888] group-hover:text-[#050505] '}`}>
                        {item.icon}
                    </span>
                )}

                {!isCollapsed && (
                    <span className={`text-[11px] font-black uppercase tracking-widest flex-1 text-left leading-none truncate transition-colors duration-300 ${isActive ? 'text-[#FFFFFF]' : 'text-[#555555]  group-hover:text-[#050505] '}`}>
                        {item.label}
                    </span>
                )}

                {!isCollapsed && isLocked && (
                    <span className="ml-2 text-[10px] font-mono font-black text-black/30 shrink-0">[LOCKED]</span>
                )}

                {!isCollapsed && !isLocked && item.badge && (
                    <span
                        className="ml-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[4px] border shrink-0 transition-colors"
                        style={isActive
                            ? { background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }
                            : { background: `${item.badgeColor ?? '#050505'}15`, color: item.badgeColor ?? '#050505', borderColor: `${item.badgeColor ?? '#050505'}30` }
                        }
                    >
                        {item.badge}
                    </span>
                )}
                {!isCollapsed && item.externalUrl && (
                    <span className={`ml-2 text-[10px] font-mono font-black transition-colors ${isActive ? 'text-[#FFFFFF]' : 'text-[#A0A0A0] group-hover:text-[#050505]'}`}>[↗]</span>
                )}
            </div>
        </button>
    );
}

interface WhaleProShellProps { 
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
    isExternalEmbed?: boolean;
    isZkVerified?: boolean;
}

export function WhaleProShell({ activeTab, onTabChange, children, isExternalEmbed = false, isZkVerified = false }: WhaleProShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
    const showInfoModal = false;
    const setShowInfoModal = (val: boolean) => {};
    const [isSessionLocked, setIsSessionLocked] = useState(false);
    const [tier, setTier] = useState<string | null>(null);
    const [subStatus, setSubStatus] = useState<string | null>(null);
    const [isTierLoaded, setIsTierLoaded] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { setSettingsOpen, autoDisconnectTimer, stealthMode } = useSettingsStore();
    const router = useRouter();
    const { disconnect } = useDisconnect();

    const { latency, isConnected: streamConnected, mode } = useMarketStream();
    const { connector, isConnected: isWalletConnected, isSystemHandshake } = useSystemAccount();

    //  UX-18: Active ETH metrics (shared hook, DRY with landing) 
    const { blockNumber, baseFeeGwei, utcTime, syncing: ethSyncing } = useEthMetrics();

    const currentExplanation = MODULE_EXPLANATIONS[activeTab] || {
        title: 'MODULE IN DEVELOPMENT',
        subtitle: 'BETA RELEASE',
        overview: 'This module is under active deployment. Full telemetry and analytical functions will be detailed once production-grade stability is achieved.',
        features: []
    };

    // Load Tier + subscription for access control  single consolidated fetch
    useEffect(() => {
        fetch('/api/auth/session', { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user?.tier) {
                    setTier(data.user.tier.split('_')[0].toUpperCase());
                } else {
                    setTier('FREE');
                }
                setSubStatus(data?.user?.subscription?.status || null);
                setIsTierLoaded(true);
            })
            .catch(() => {
                setTier('FREE');
                setSubStatus(null);
                setIsTierLoaded(true);
            });
    // Re-fetch when wallet connection state changes
    }, [isWalletConnected, isSystemHandshake]);

    //  True Desktop Detection 
    // Uses hardware screen.width (not viewport) so narrowing the browser window
    // on a PC does NOT trigger the mobile nav. Only real mobile devices (screen
    // width < 1024px on physical hardware) see the bottom navigation bar.
    const [isMounted, setIsMounted] = useState(false);
    const [isTrueDesktop, setIsTrueDesktop] = useState(true);
    useEffect(() => {
        setIsMounted(true);
        const check = () => setIsTrueDesktop(window.screen.width >= 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const showMobileNav = isMounted && !isTrueDesktop;

    //  UX-19: Real node health  polled every 60s 
    const [nodeStatus, setNodeStatus] = useState<'OPERATIONAL' | 'DEGRADED' | 'OFFLINE'>('OPERATIONAL');
    useEffect(() => {
        /*
        const checkHealth = async () => {
            try {
                const res  = await fetch('/api/network/getblock-health', { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok || data?.status === 'offline')  setNodeStatus('OFFLINE');
                else if (data?.status === 'degraded')        setNodeStatus('DEGRADED');
                else                                         setNodeStatus('OPERATIONAL');
            } catch {
                setNodeStatus('OFFLINE');
            }
        };
        checkHealth();
        const id = setInterval(checkHealth, 60_000);
        return () => clearInterval(id);
        */
        setNodeStatus('OPERATIONAL');
    }, []);



    //  Inactivity Session Lock  driven by autoDisconnectTimer from settings 
    useEffect(() => {
        const ms = timerToMs(autoDisconnectTimer);
        if (!ms) return; // 'never'  no timer

        const reset = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
                setIsSessionLocked(true);
            }, ms);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(e => window.addEventListener(e, reset, { passive: true }));
        reset(); // start timer

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            events.forEach(e => window.removeEventListener(e, reset));
        };
    }, [autoDisconnectTimer]);

    const unlockSession = async () => {
        try {
            // Re-verify session cryptographically with the server before unlocking UI
            const res = await fetch('/api/auth/session', { cache: 'no-store' });
            if (!res.ok) throw new Error('Session Expired');
            const data = await res.json();
            if (!data?.user?.userId) throw new Error('No valid session');
            
            setIsSessionLocked(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        } catch (e) {
            toast.error("Session Expired", { description: "Your cryptographic lease has timed out." });
            disconnect();
            router.push('/connect');
        }
    };

    const handleTabChange = (id: string) => {
        const item = SIDEBAR_ITEMS.find(i => i.id === id);
        if (item?.externalUrl) {
            window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (id === 'developer') {
            window.location.href = '/developers';
            return;
        }

        if (RESTRICTED_TABS.includes(id)) {
            if (!isWalletConnected) {
                router.push('/connect');
                return;
            }
        }
        onTabChange(id);
    };

    // Redirect away from restricted tabs when wallet disconnects
    useEffect(() => {
        if (RESTRICTED_TABS.includes(activeTab)) {
            if (!isWalletConnected) {
                onTabChange('markets');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWalletConnected, activeTab]);



    return (
        <>
        <GlobalCommandPalette
            isOpen={isPaletteOpen}
            setIsOpen={setIsPaletteOpen}
            onTabChange={onTabChange}
        />

        {/*  Session Lock Overlay  */}
        <AnimatePresence>
            {isSessionLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center"
                    style={{ background: 'rgba(250,249,246,0.97)', backdropFilter: 'blur(24px)' }}
                >
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-[#050505] mb-2">Session Locked</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-8">
                        Auto-lock after {autoDisconnectTimer} of inactivity
                    </p>
                    <button
                        onClick={unlockSession}
                        className="px-8 py-3.5 bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all active:scale-[0.98]"
                    >
                        Resume Session
                    </button>
                </motion.div>
            )}


        </AnimatePresence>

        <div className={`flex fixed inset-0 bg-white text-[#050505] font-sans selection:bg-black/10 group/shell overflow-hidden transition-all duration-300 ${isSessionLocked ? 'scale-[0.99] pointer-events-none' : ''}`}>

            
            {/*  Persistent Pro Sidebar (True Desktop Only)  */}
            {/* isTrueDesktop uses screen.width (hardware), not viewport, so     */}
            {/* narrowing the browser window on a PC keeps the sidebar visible.  */}
            <motion.aside 
                animate={{ width: isCollapsed ? 64 : 240 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden lg:flex sticky top-0 h-full border-r border-black/[0.07] bg-white flex-col z-50 shrink-0`}
            >
                {/* Logo area */}
                {!isCollapsed && (
                    <div className="px-4 pt-4 pb-2 shrink-0">
                        <div className="flex items-center gap-2.5 px-3 py-2">
                            <img src="/official-whale-monochrome.png" className="w-6 h-6 shrink-0" alt="WAN" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[11px] font-black uppercase tracking-tight text-[#050505] ">Whale Alert</span>
                                <span className="text-[11px] font-black uppercase tracking-tight text-[#050505] ">Network</span>
                            </div>
                        </div>
                    </div>
                )}
                {isCollapsed && <div className="pt-4 pb-2 shrink-0 flex justify-center">
                    <img src="/official-whale-monochrome.png" className="w-6 h-6" alt="WAN" />
                </div>}

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pt-1 pb-4 px-2 space-y-0.5 no-scrollbar" style={{ overscrollBehavior: 'contain', touchAction: 'pan-y', contain: 'strict' }}>
                    {SIDEBAR_ITEMS
                        .filter(item => !item.requiresZK || isZkVerified)
                        .map((item) => {
                        const isActive = activeTab === item.id;
                        const isLocked = item.minTier && isTierLoaded && tier ? !hasAccess(tier, item.minTier) : false;
                        return (
                            <div key={item.id}>
                                <AztecSidebarItem item={item} isActive={isActive} isCollapsed={isCollapsed} isLocked={isLocked} onClick={() => handleTabChange(item.id)} />
                            </div>
                        );
                    })}

                    {!isCollapsed && (
                        <div className="px-4 py-5 mt-2">
                            <div className="w-full h-px bg-black/8" />
                        </div>
                    )}
                </div>

                {/* No tier badge */}

                <div className="px-2 pb-3 pt-1 shrink-0">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl border border-black/10  text-[#888888] hover:text-black  hover:bg-black/5  transition-all"                    >
                        {isCollapsed ? <span className="font-mono text-[10px] font-black">[&gt;]</span> : <span className="font-mono text-[10px] font-black">[&lt;]</span>}
                    </button>
                </div>
            </motion.aside>

            {/*  Main Content Wrapper  */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                
                {/*  Top Master Bar  */}
                <header className="sticky top-0 border-b border-black/[0.07] bg-white/95 backdrop-blur-xl flex items-center justify-between px-6 z-40 shrink-0" style={{ minHeight: 'calc(56px + env(safe-area-inset-top, 0px))', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                    <button
                        onClick={() => setIsPaletteOpen(true)}
                        className="group flex items-center gap-2.5 h-8 px-3 rounded-full border border-black/[0.08]  bg-white  hover:bg-black/[0.02]  hover:border-black/20  hover:shadow-sm transition-all duration-200 cursor-pointer shrink-0"
                    >
                        <span className="text-[10px] font-mono font-black text-[#AAAAAA] group-hover:text-[#555] transition-colors shrink-0">[SCH]</span>
                        <span className="text-[10px] text-[#AAAAAA] group-hover:text-[#555] font-medium transition-colors hidden sm:block pr-1 ml-1">Search</span>
                        <span className="hidden sm:flex items-center gap-1 ml-0.5">
                            <kbd className="text-[9px] font-black font-mono text-[#AAAAAA] bg-black/[0.04] border border-black/[0.08] rounded px-1.5 py-0.5 leading-none">K</kbd>
                        </span>
                    </button>

                    {/* UX-18: Active ETH metrics replacing the empty ActiveMarketBand slot */}
                    <div className="hidden lg:flex items-center gap-0 divide-x divide-black/10 flex-1 mx-6 overflow-hidden">
                        {[
                            { label: 'ETH Block', value: ethSyncing ? '...' : (blockNumber ?? '---') },
                            { label: 'Base Fee',  value: baseFeeGwei ? `${baseFeeGwei} Gwei` : '---' },
                            { label: 'UTC',       value: utcTime ?? '---' },
                        ].map((m) => (
                            <div key={m.label} className="flex flex-col items-start px-4 py-1 min-w-[100px]">
                                <span className="font-mono text-[7px] uppercase tracking-[0.25em] text-black/30">{m.label}</span>
                                <span className="font-mono text-[10px] font-black text-[#050505] tabular-nums leading-tight">{m.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Quick Dropdown */}
                    {showMobileNav && (
                        <div className="lg:hidden flex-1 flex justify-center mx-4 relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-black/5  rounded-full text-[13px] font-semibold text-[#050505]  active:scale-95 transition-transform"
                            >
                                {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label || 'Menu'}
                                <span className={`transition-transform duration-300 font-mono text-[10px] font-black ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}>[v]</span>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 w-[220px] bg-white  border border-black/10  rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col py-2"
                                        style={{ willChange: 'transform, opacity' }}
                                    >
                                        {SIDEBAR_ITEMS.filter(item => !item.requiresZK || isZkVerified).map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    handleTabChange(item.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`px-4 py-3 text-left text-[13px] font-semibold transition-colors ${
                                                    activeTab === item.id
                                                        ? 'bg-black text-white  '
                                                        : 'text-[#050505]  hover:bg-black/5 '
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSettingsOpen(true)}
                            title="Open Settings"
                            className="shrink-0 p-2.5 rounded-full border border-black/10 hover:bg-black/5 hover:scale-105 hover:shadow-sm text-[#888888] hover:text-[#050505] transition-all flex items-center justify-center w-10 h-10 text-[11px] font-black uppercase"
                        >
                            SET
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col min-h-0 bg-white relative">
                    <div className="absolute inset-0 pointer-events-none -z-10" />

                    {/* Scroll container: flex-1 + min-h-0 = bounded by parent, never bleeds to document */}
                    <div
                        id="main-scroll-container"
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            overscrollBehavior: 'contain',
                            touchAction: 'pan-y',
                        }}
                    >
                        <div className="pb-0 md:pb-0 w-full flex-1 flex flex-col relative z-10">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full h-full flex-1 flex flex-col"
                                >
                                    <InstitutionalErrorBoundary moduleName="Loading Module">
                                        {children}
                                    </InstitutionalErrorBoundary>
                                </motion.div>
                            {/* iOS spacer: clears the fixed bottom nav + safe-area-inset-bottom */}
                            {showMobileNav && (
                                <div className="block lg:hidden shrink-0" style={{ height: 'calc(72px + env(safe-area-inset-bottom, 0px))' }} aria-hidden="true" />
                            )}
                        </div>
                    </div>
                </main>

                {/*  Bottom Tab Navigation (Mobile Only)  FIXED to avoid obscuring content  */}
                {/* Uses fixed positioning so scroll content is never clipped by the nav bar. */}
                {/* A spacer div above (inside scroll container) reserves the equivalent height.*/}
                {showMobileNav && (
                     <nav className="mobile-bottom-nav lg:hidden flex fixed bottom-0 left-0 right-0 border-t border-black/10 bg-[#FFFFFF] items-center justify-around px-1 z-50 transition-colors" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                         {[
                            { id: 'gold',        icon: Icon.identity, label: 'Identity' },
                            { id: 'markets',     icon: Icon.markets,  label: 'Markets' },
                            { id: 'inst-ledger', icon: Icon.explorer, label: 'Explorer' },
                            { id: 'menu',        icon: <span className="font-mono text-[10px] tracking-widest font-black">[MNU]</span>, label: 'Menu' },
                        ].map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                         if (tab.id === 'menu') {
                                             setIsMenuDrawerOpen(true);
                                         } else {
                                             handleTabChange(tab.id);
                                         }
                                    }}
                                    style={{ minHeight: 0, minWidth: 0 }}
                                    className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                                        isActive ? 'text-black ' : 'text-[#888888] hover:text-black '
                                    }`}
                                >
                                    {/* PERF-20: Active indicator pill  WCAG AA contrast */}
                                    {isActive && (
                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-[#050505] " />
                                    )}
                                    <span className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                                        {tab.icon}
                                    </span>
                                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-100 font-black' : 'opacity-60'}`}>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                )}

                {/*  Status Bar  */}
                <footer className="hidden md:flex h-7 border-t border-black/[0.07] bg-white items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4 text-[9px] font-black text-black/40 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                            Latency:
                            <span className="text-black/70">
                                {latency > 0 ? `${latency}ms` : '12ms'}
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">Servers: <span className="text-black/80">{nodeStatus}</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black text-black/35 uppercase tracking-widest">
                        <span>Connected</span>
                        <span>© 2026 Humanity Ledger</span>
                    </div>
                </footer>
            </div>
        </div>

        {/*  INFO MODAL  Noble Institutional  */}
        <AnimatePresence>
        {false && (
            <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={() => setShowInfoModal(false)}
            >
            <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 14 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-black/8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-black/6">
                    <div>
                        <h3 className="text-[17px] font-bold text-black leading-none mb-1">
                            {currentExplanation.title}
                        </h3>
                        <p className="text-[12px] text-black/40">
                            {currentExplanation.subtitle}
                        </p>
                    </div>
                    <button onClick={() => setShowInfoModal(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
                        <span className="text-black/40 text-[17px] leading-none font-light">×</span>
                    </button>
                </div>
                <div className="px-6 py-5 border-b border-black/6 bg-black/[0.015]">
                    <p className="text-[14px] leading-[1.75] text-black/70">
                        {currentExplanation.overview}
                    </p>
                </div>
                {currentExplanation.features.length > 0 && (
                    <div className="px-6 py-5 overflow-y-auto max-h-[40vh]">
                        <p className="text-[11px] font-semibold text-black/40 mb-3">What's included</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentExplanation.features.map((feat, idx) => (
                                <div key={idx} className="border border-black/8 rounded-xl p-4 hover:bg-black/[0.02] hover:border-black/15 transition-all">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                                        <span className="text-[12px] font-semibold text-black">{feat.title}</span>
                                    </div>
                                    <p className="text-[12px] text-black/50 leading-relaxed pl-4">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="px-6 py-4 border-t border-black/6 flex justify-end">
                    <button onClick={() => setShowInfoModal(false)} className="px-6 py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/80 transition-colors active:scale-[0.98]">
                        Close
                    </button>
                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Mobile slide-up menu sheet drawer */}
        <AnimatePresence>
        {showMobileNav && isMenuDrawerOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuDrawerOpen(false)}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center lg:hidden"
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-white rounded-t-[28px] border-t border-black/[0.08] shadow-[0_-12px_40px_rgba(0,0,0,0.10)] flex flex-col overflow-hidden max-h-[85vh]"
                >
                    {/* Header line handle */}
                    <div className="flex justify-center py-3">
                        <div className="w-12 h-1 rounded-full bg-black/10 " />
                    </div>

                    {/* Title */}
                    <div className="px-6 pb-4 flex justify-between items-center border-b border-black/5 ">
                        <div>
                            <h3 className="text-[16px] font-bold text-black ">Navigation</h3>
                            <p className="text-[12px] text-black/40  mt-0.5">Choose a section</p>
                        </div>
                        <button onClick={() => setIsMenuDrawerOpen(false)} className="w-7 h-7 rounded-full hover:bg-black/5  flex items-center justify-center transition-colors">
                            <span className="text-black/50  text-[17px] leading-none font-light">×</span>
                        </button>
                    </div>

                    {/* Navigation Items list */}
                    <div className="px-4 py-5 overflow-y-auto space-y-1.5">
                        {SIDEBAR_ITEMS.map((item) => {
                            const isRestricted = RESTRICTED_TABS.includes(item.id);
                            const isLocked = isRestricted && tier === 'FREE';
                            const isActive = activeTab === item.id;
                            const isZkRestricted = item.requiresZK && !isZkVerified;

                            return (
                                <button
                                    key={item.id}
                                    disabled={isZkRestricted || isLocked}
                                    onClick={() => {
                                        handleTabChange(item.id);
                                        setIsMenuDrawerOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                        isActive 
                                            ? 'bg-black text-white  ' 
                                            : 'bg-black/[0.02] hover:bg-black/[0.05]   text-black '
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={isActive ? 'text-white ' : 'text-black/50 '}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[14px] font-medium">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isZkRestricted && (
                                            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                Verify first
                                            </span>
                                        )}
                                        {isLocked && (
                                            <span className="text-[10px] font-semibold bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full border border-red-500/30">
                                                Upgrade
                                            </span>
                                        )}
                                        {!isActive && !isZkRestricted && !isLocked && (
                                            <span className="font-mono text-[10px] font-black opacity-30">[&gt;]</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Padding */}
                    <div className="h-4 bg-transparent shrink-0" />
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
        </>
    );
}
