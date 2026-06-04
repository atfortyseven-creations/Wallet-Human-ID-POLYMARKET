"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Users, Settings, X, Gift, CreditCard, Wifi, Shield, Zap, Network, BarChart2, Activity, Search, FileText, LifeBuoy } from 'lucide-react';

import ReceiveHub from '@/components/wallet/ReceiveHub';
import QRScannerModal from '@/components/wallet/QRScannerModal';
import FiatOnRamp from '@/components/wallet/FiatOnRamp';
import PortfolioDashboard from '@/components/dashboard/PortfolioDashboard';
import WalletAnalyticsPanel from '@/components/premium/WalletAnalyticsPanel';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import ReferralDashboard from '@/components/wallet/ReferralDashboard';
import useSWR, { mutate } from 'swr';
import { useOmniInfrastructure } from '@/lib/api-client';
import AIConcierge from '@/components/wallet/AIConcierge';
import SecurityVault from '@/components/wallet/SecurityVault';
import NFCHardware from '@/components/wallet/NFCHardware';
import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletActions } from '@/components/wallet/WalletActions';
import { useRealWalletData } from '@/hooks/useRealWalletData';
import SettingsPanel from '@/components/wallet/SettingsPanel';
import AddressBook from '@/components/wallet/AddressBook';
import AccountSwitcher from '@/components/wallet/AccountSwitcher';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import WatchOnlyInput from '@/components/wallet/WatchOnlyInput';
import AppChainStatus from '@/components/dashboard/AppChainStatus';
import { getAccountColor, type WalletAccount } from '@/lib/wallet/accounts';
import { resolveENSName } from '@/lib/wallet/ens';
import { isAddress } from 'viem';
import { type NewsItem } from '@/types/wallet';

import LanguageSwitcher from '@/components/wallet/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// [PRODUCTION] Strict typing for news items from external feeds
export default function SuperWallet({ recentNews = [] }: { recentNews?: NewsItem[] }) {
    return (
        <LanguageProvider>
            <SuperWalletContent recentNews={recentNews} />
        </LanguageProvider>
    );
}

function SuperWalletContent({ recentNews = [] }: { recentNews?: NewsItem[] }) {
    const { t } = useLanguage();
    const [activeView, setActiveView] = useState<'ticket_mint' | 'portfolio' | 'billing' | 'top_markets' | 'new_listings' | 'whale_ledger' | 'mass_transfers' | 'block_explorer' | 'aztec_pipeline' | 'session_logs' | 'support' | 'analytics' | 'activity' | 'contacts' | 'referrals' | 'vault' | 'nfc' | 'network' | 'settings'>('portfolio');
    const [showWatchInput, setShowWatchInput] = useState(false);
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [currentAddress, setCurrentAddress] = useState<string>('');

    const [liveNews, setActiveNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
                const data = await res.json();
                const realNews = (data?.Data || []).slice(0, 10).map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    summary: a.body,
                    url: a.url,
                    source: a.source_info?.name || 'Intel Desk',
                    publishedAt: new Date(a.published_on * 1000).toISOString(),
                }));
                setActiveNews(realNews);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNews();
    }, []);

    const news: NewsItem[] = liveNews.length > 0 ? liveNews : recentNews;


    const {
        usdcBalance,
        totalBalance,
        portfolioValue,
        positions,
        transactions,
        stats,
        assets,
        perps,
        predictions,
        claimables,
        isLoading,
        isAssetsLoading,
        isHistoryLoading,
        isConnected,
        change24hUSD,
        change24hPercent,
        legendaryScore,
        strategicInsight,
        address: hookAddress,
        backendAccounts
    } = useRealWalletData(news, currentAddress);

    const [isInitialized, setIsInitialized] = useState(false);

    //  GLOBAL REACTIVE SYNC: Using SWR for watched wallets
    const { data: premiumData, mutate: globalMutate } = useSWR(
        hookAddress ? `/api/premium/watched-wallets?address=${hookAddress}` : null,
        async (url) => {
            const res = await fetch(url, {
                headers: { 'x-web3-address': hookAddress! }
            });
            return res.json();
        }
    );

    // 0. [LEGENDARY] Auto-Creation Guard: Create wallet on signup if missing
    useEffect(() => {
        const autoCreateWallet = async () => {
            // Only auto-create if authenticated and no address found yet
            if (isLoading === false && !hookAddress && isConnected === false) {
                console.log("[Auto-Creation] No managed wallet found. Initiating secure generation...");
                try {
                    const res = await fetch('/api/wallet/create', { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        console.log("[Auto-Creation] Wallet created successfully:", data.address);
                        // Trigger a global revalidation
                        mutate('/api/user/wallet');
                        window.location.reload(); // Hard reload to sync entire stack for the first time
                    }
                } catch (e) {
                    console.error("[Auto-Creation] Failed to auto-generate wallet:", e);
                }
            }
        };

        if (!isLoading) {
            autoCreateWallet();
        }
    }, [hookAddress, isLoading, isConnected]);

    // 1. Initial Load: Sync SWR data into local accounts state
    useEffect(() => {
        if (!premiumData?.wallets) return;

        const dbWallets = premiumData.wallets.map((w: any) => ({
            id: w.id,
            address: w.address,
            name: w.label,
            type: (w.isWhale || w.isSmart) ? 'WATCH_ONLY' : 'DERIVED', // Heuristic mapping
            color: getAccountColor(w.address)
        }));

        // Merge and deduplicate
        setAccounts(prev => {
            const merged = [...dbWallets];
            prev.filter(p => p.type === 'PRIMARY' || p.type === 'DERIVED').forEach(local => {
                if (!merged.some(m => m.address.toLowerCase() === local.address.toLowerCase())) {
                    merged.push(local);
                }
            });

            // Ensure primary is present, only if we have a real address
            if (hookAddress && !merged.some(m => m.address.toLowerCase() === hookAddress.toLowerCase())) {
                merged.unshift({
                    address: hookAddress,
                    name: 'Main Vault (Primary)',
                    type: 'PRIMARY' as const,
                    index: 0,
                    color: getAccountColor(hookAddress)
                });
            }
            return merged;
        });

        if (!currentAddress && dbWallets.length > 0) {
            setCurrentAddress(dbWallets[0].address);
        }
        setIsInitialized(true);
    }, [premiumData, hookAddress]);

    // 2. Persistence: Save to Storage whenever accounts change (Legacy fallback)
    useEffect(() => {
        if (isInitialized && accounts.length > 0) {
            localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
        }
    }, [accounts, isInitialized]);

    const [showReceive, setShowReceive] = useState(false);
    const [showScanner, setShowScanner] = useState(false);


    const handleAddAccount = async () => {        
        // [INSTITUTIONAL GRADE] Erradicación de Mocking. Ya no generamos strings falsos.
        // Llamada real al backend para generar un nuevo Managed Wallet asociado a este usuario.
        try {
            const res = await fetch('/api/wallet/create', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create real wallet');
            
            const data = await res.json();
            if (!data.address) throw new Error('No address returned');
            
            const newAccount: WalletAccount = {
                address: data.address,
                name: `System Vault ${accounts.length + 1}`,
                type: 'DERIVED',
                index: accounts.length,
                color: getAccountColor(data.address)
            };

            const updated = [...accounts, newAccount];
            setAccounts(updated);
            setCurrentAddress(data.address);
            localStorage.setItem('wallet_accounts', JSON.stringify(updated));
            
            // Force global mutation to align everything
            globalMutate();
            mutate('/api/user/wallet');
        } catch (e) {
            console.error("[CRITICAL_FAILURE] Failed to provision real managed wallet:", e);
            alert("No se pudo generar una cartera on-chain real.");
        }
    };

    const handleAddWatchWallet = async (address: string, name?: string) => {
        try {
            let resolvedAddress = address;
            let displayLabel = name;

            if (address.toLowerCase().endsWith('.eth')) {
                const resolved = await resolveENSName(address);
                if (resolved && isAddress(resolved)) {
                    resolvedAddress = resolved;
                    displayLabel = address;
                } else {
                    alert('Could not resolve ENS name.');
                    return;
                }
            } else if (!isAddress(address)) {
                alert('Please enter a valid address.');
                return;
            }

            if (accounts.some(a => a.address.toLowerCase() === resolvedAddress.toLowerCase())) {
                alert('Account already exists.');
                return;
            }

            const watchAccount: WalletAccount = {
                address: resolvedAddress,
                name: displayLabel || `Watch ${resolvedAddress.slice(0, 6)}...`,
                type: 'WATCH_ONLY',
                color: getAccountColor(resolvedAddress)
            };

            // [PERSISTENCE] Save watch wallet to premium backend
            try {
                // CSRF Handshake
                const csrfRes = await fetch('/api/auth/csrf', {
                    headers: { 'x-web3-address': hookAddress }
                });
                const { token: csrfToken } = await csrfRes.json();

                const res = await fetch('/api/premium/watched-wallets', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-web3-address': hookAddress,
                        'x-csrf-token': csrfToken
                    },
                    body: JSON.stringify({
                        address: resolvedAddress,
                        label: watchAccount.name
                    })
                });
                const data = await res.json();
                if (data.id) {
                    watchAccount.id = data.id;
                    //  INSTANT GLOBAL SYNC
                    globalMutate();
                }
            } catch (e) {
                console.error("Failed to persist watch wallet", e);
            }

            const updatedAccounts = [...accounts, watchAccount];
            setAccounts(updatedAccounts);
            setCurrentAddress(resolvedAddress);
            setShowWatchInput(false);
            localStorage.setItem('wallet_accounts', JSON.stringify(updatedAccounts));
        } catch (error) {
            alert('Failed to add wallet');
        }
    };

    const handleDeleteAccount = async (address: string) => {
        const account = accounts.find(a => a.address.toLowerCase() === address.toLowerCase());
        if (!account) return;

        if (!confirm(`Remove account "${account.name}"?`)) return;

        try {
            // If it has a DB ID, use the correct DELETE endpoint
            if (account.id) {
                // CSRF Handshake
                const csrfRes = await fetch('/api/auth/csrf', {
                    headers: { 'x-web3-address': hookAddress }
                });
                const { token: csrfToken } = await csrfRes.json();

                const res = await fetch(`/api/premium/watched-wallets?id=${account.id}`, {
                    method: 'DELETE',
                    headers: {
                        'x-web3-address': hookAddress,
                        'x-csrf-token': csrfToken
                    }
                });
                if (!res.ok) throw new Error("Backend deletion failed");
                //  INSTANT GLOBAL SYNC
                globalMutate();
            }

            const updated = accounts.filter(a => a.address.toLowerCase() !== address.toLowerCase());
            setAccounts(updated);
            localStorage.setItem('wallet_accounts', JSON.stringify(updated));
            
            if (currentAddress.toLowerCase() === address.toLowerCase()) {
                setCurrentAddress(updated[0]?.address || hookAddress);
            }
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete account from server. It might still reappear on refresh.");
        }
    };

    const handleSwitchAccount = (address: string) => {
        setCurrentAddress(address);
    };

    // Use current address or fallback to connected address
    const displayAddress = currentAddress || hookAddress || '';

    // Always show the wallet interface
    return (
        <div className="min-h-screen bg-[#EAEADF] text-[#1F1F1F] font-sans selection:bg-[#1F1F1F] selection:text-[#EAEADF] pb-20 relative overflow-hidden">
             {/* Background Noise/Void Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
            </div>

            {/* Header Navigation */}
            <header className="px-4 py-4 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#EAEADF]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {/* Account Switcher Removed per User Request for Clean UI */}
                </div>
                
                {/* Center Tabs - ABSOLUTELY CENTERED FOR PERFECT ALIGNMENT WITH CARD */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/50 rounded-full p-1 border border-[#1F1F1F]/5 shadow-sm overflow-x-auto max-w-[1800px] w-max scrollbar-hide">
                    <ViewTab icon={<Gift size={18}/>} label="Ticket Mint" active={activeView==='ticket_mint'} onClick={()=>setActiveView('ticket_mint')} />
                    <ViewTab icon={<PieChart size={18}/>} label="Main Portfolio" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                    <ViewTab icon={<CreditCard size={18}/>} label="Billing & Plan" active={activeView==='billing'} onClick={()=>setActiveView('billing')} />
                    <ViewTab icon={<BarChart2 size={18}/>} label="Top Markets" active={activeView==='top_markets'} onClick={()=>setActiveView('top_markets')} />
                    <ViewTab icon={<Activity size={18}/>} label="New Listings" active={activeView==='new_listings'} onClick={()=>setActiveView('new_listings')} />
                    <ViewTab icon={<Zap size={18}/>} label="Whale Ledger" active={activeView==='whale_ledger'} onClick={()=>setActiveView('whale_ledger')} />
                    <ViewTab icon={<Network size={18}/>} label="Mass Transfers" active={activeView==='mass_transfers'} onClick={()=>setActiveView('mass_transfers')} />
                    <ViewTab icon={<Search size={18}/>} label="Block Explorer" active={activeView==='block_explorer'} onClick={()=>setActiveView('block_explorer')} />
                    <ViewTab icon={<Shield size={18}/>} label="Aztec Pipeline" active={activeView==='aztec_pipeline'} onClick={()=>setActiveView('aztec_pipeline')} />
                    <ViewTab icon={<FileText size={18}/>} label="Session Logs" active={activeView==='session_logs'} onClick={()=>setActiveView('session_logs')} />
                    <ViewTab icon={<LifeBuoy size={18}/>} label="Support" active={activeView==='support'} onClick={()=>setActiveView('support')} />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <NotificationCenter />
                </div>
            </header>

             {/* Mobile Tab Bar (Bottom) */}
             <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-lg border border-[#1F1F1F]/5 shadow-2xl rounded-full p-2 flex gap-1 overflow-x-auto w-[90vw] scrollbar-hide">
                 <ViewTab icon={<PieChart size={20}/>} label="Portfolio" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                 <ViewTab icon={<Zap size={20}/>} label="Ledger" active={activeView==='whale_ledger'} onClick={()=>setActiveView('whale_ledger')} />
                 <ViewTab icon={<Shield size={20}/>} label="Aztec" active={activeView==='aztec_pipeline'} onClick={()=>setActiveView('aztec_pipeline')} />
                 <ViewTab icon={<CreditCard size={20}/>} label="Billing" active={activeView==='billing'} onClick={()=>setActiveView('billing')} />
                 <ViewTab icon={<LifeBuoy size={20}/>} label="Support" active={activeView==='support'} onClick={()=>setActiveView('support')} />
            </div>

            <main className="max-w-[2560px] text-left mx-auto p-4 space-y-4 relative z-10 min-h-[80vh]">

                {activeView === 'portfolio' && displayAddress && (
                    <div className="animate-fade-in space-y-12">
                        {/* Elite Analytics Section - Expanded Width */}
                        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                            <div className="w-full mx-auto px-4 pt-12">
                                <PortfolioDashboard walletAddress={displayAddress} />
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'analytics' && displayAddress && (
                    <div className="animate-fade-in space-y-6">
                        <WalletAnalyticsPanel 
                            address={displayAddress} 
                            label={accounts.find(a => a.address === displayAddress)?.name || "Wallet Analytics"}
                            onClose={() => setActiveView('portfolio')}
                        />
                    </div>
                )}

                {activeView === 'activity' && displayAddress && (
                    <div className="animate-fade-in shadow-sm bg-white p-6 rounded-2xl border border-[#1F1F1F]/5">
                        <TransactionHistory 
                            authUserId={displayAddress} 
                            transactions={transactions}
                            stats={stats}
                            isLoading={isLoading} 
                        />
                    </div>
                )}

                {activeView === 'contacts' && displayAddress && (
                    <div className="animate-fade-in">
                        <AddressBook authUserId={displayAddress} />
                    </div>
                )}

                {activeView === 'referrals' && (
                    <div className="animate-fade-in">
                        <ReferralDashboard />
                    </div>
                )}
                
                {activeView === 'vault' && (
                    <div className="animate-fade-in">
                        <SecurityVault />
                    </div>
                )}

                 {activeView === 'nfc' && (
                    <div className="animate-fade-in">
                        <NFCHardware />
                    </div>
                )}

                 {activeView === 'network' && (
                    <div className="animate-fade-in pt-8 pb-12">
                        <AppChainStatus />
                    </div>
                )}

                {activeView === 'settings' && (
                    <div className="animate-fade-in">
                        <SettingsPanel />
                    </div>
                )}
            </main>

            {/* MODALS - Outside main to avoid z-index trapping */}
            {showWatchInput && (
                <WatchOnlyInput 
                    onAdd={handleAddWatchWallet} 
                    onCancel={() => setShowWatchInput(false)} 
                />
            )}

            {showReceive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowReceive(false)}>
                    <div className="w-full max-w-4xl bg-[#EAEADF] rounded-[40px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold ml-4">Receive Assets</h2>
                            <button onClick={() => setShowReceive(false)} className="p-2 rounded-full hover:bg-black/5"><X size={24}/></button>
                        </div>
                        <ReceiveHub addresses={[
                            { network: 'Ethereum', address: displayAddress, token: 'ETH', chainId: 1 },
                            { network: 'Base', address: displayAddress, token: 'ETH', chainId: 8453 },
                            { network: 'Polygon', address: displayAddress, token: 'MATIC', chainId: 137 },
                        ]} />
                    </div>
                </div>
            )}

            <QRScannerModal 
                isOpen={showScanner} 
                onClose={() => setShowScanner(false)}
                onScan={(data) => {
                    console.log("Scanned:", data);
                    alert(`Scanned: ${data}`);
                    setShowScanner(false);
                }}
            />

            <AIConcierge 
                portfolioData={{
                    assets,
                    totalValue: parseFloat(totalBalance),
                    legendaryScore,
                    strategicInsight
                }} 
            />
        </div>
    );
}


function ViewTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
           onClick={onClick}
           className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${active ? 'bg-[#1F1F1F] text-[#EAEADF] shadow-md' : 'text-[#1F1F1F]/50 hover:bg-white/80'}`}
           title={label}
        >
            {icon}
            {active && <span className="text-xs font-bold pr-1 hidden md:block">{label}</span>}
        </button>
    )
}

