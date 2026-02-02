"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Zap, Loader2, PieChart, Users, Settings, X, Gift, CreditCard, Wifi, Shield } from 'lucide-react';
import { HumanCard } from '@/components/wallet/HumanCard';
import ReceiveHub from '@/components/wallet/ReceiveHub';
import QRScannerModal from '@/components/wallet/QRScannerModal';
import ReferralDashboard from '@/components/wallet/ReferralDashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AIConcierge from '@/components/wallet/AIConcierge';
import WhaleGroups from '@/components/wallet/WhaleGroups';
import FiatCardIssuance from '@/components/wallet/FiatCardIssuance';
import SecurityVault from '@/components/wallet/SecurityVault';
import NFCHardware from '@/components/wallet/NFCHardware';
import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletActions } from '@/components/wallet/WalletActions';
import { useRealWalletData } from '@/hooks/useRealWalletData';
import PortfolioDashboard from '@/components/wallet/PortfolioDashboard';
import SettingsPanel from '@/components/wallet/SettingsPanel';
import AddressBook from '@/components/wallet/AddressBook';
import AccountSwitcher from '@/components/wallet/AccountSwitcher';
import StakingDashboard from '@/components/wallet/StakingDashboard';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import WatchOnlyInput from '@/components/wallet/WatchOnlyInput';
import { getAccountColor, type WalletAccount } from '@/lib/wallet/accounts';
import { resolveENSName } from '@/lib/wallet/ens';
import { isAddress } from 'viem';

import LanguageSwitcher from '@/components/wallet/LanguageSwitcher';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';

export default function SuperWallet({ recentNews = [] }: { recentNews?: any[] }) {
    return (
        <LanguageProvider>
            <SuperWalletContent recentNews={recentNews} />
        </LanguageProvider>
    );
}

function SuperWalletContent({ recentNews = [] }: { recentNews?: any[] }) {
    const { t } = useLanguage();
    const [activeView, setActiveView] = useState<'dashboard' | 'portfolio' | 'earn' | 'activity' | 'contacts' | 'settings' | 'referrals' | 'whales' | 'cards' | 'vault' | 'nfc'>('dashboard');
    const [showWatchInput, setShowWatchInput] = useState(false);
    const [accounts, setAccounts] = useState<WalletAccount[]>([]);
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [accountBalances, setAccountBalances] = useState<Record<string, string>>({});

    const {
        usdcBalance,
        totalBalance,
        portfolioValue,
        positions,
        transactions,
        assets,
        isLoading,
        isConnected,
        change24hUSD,
        change24hPercent,
        address: hookAddress
    } = useRealWalletData(recentNews, currentAddress);

    // Load accounts from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('wallet_accounts');
        if (stored) {
            const loadedAccounts = JSON.parse(stored);
            setAccounts(loadedAccounts);
            if (loadedAccounts.length > 0 && !currentAddress) {
                setCurrentAddress(loadedAccounts[0].address);
            }
        } else if (hookAddress) {
            // Initialize with CONNECTED wallet only (Real Blockchain Wallet)
            const primaryAccount: WalletAccount = {
                address: hookAddress,
                name: 'Account 1', // Generic real name
                type: 'PRIMARY',
                index: 0,
                color: getAccountColor(hookAddress)
            };
            setAccounts([primaryAccount]);
            setCurrentAddress(hookAddress);
            localStorage.setItem('wallet_accounts', JSON.stringify([primaryAccount]));
        }
    }, [hookAddress]);

    const [showReceive, setShowReceive] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Save accounts to localStorage whenever they change
    useEffect(() => {
        if (accounts.length > 0) {
            localStorage.setItem('wallet_accounts', JSON.stringify(accounts));
        }
    }, [accounts]);

    // Background balance fetching for all accounts to support filtering
    useEffect(() => {
        if (accounts.length === 0) return;

        const fetchAllBalances = async () => {
            const balances: Record<string, string> = {};
            await Promise.all(accounts.map(async (acc) => {
                try {
                    const res = await fetch(`/api/user/wallet?address=${acc.address}`);
                    if (res.ok) {
                        const data = await res.json();
                        balances[acc.address.toLowerCase()] = data.balance || "0.00";
                    }
                } catch (e) {
                    console.error("Failed to fetch balance for", acc.address);
                }
            }));
            setAccountBalances(prev => ({ ...prev, ...balances }));
        };

        fetchAllBalances();
        const interval = setInterval(fetchAllBalances, 60000);
        return () => clearInterval(interval);
    }, [accounts]);

    const handleAddAccount = () => {
        const newIndex = accounts.filter(a => a.type === 'DERIVED').length + 1;
        
        // Use a more stable mock derivation based on the first account
        const primaryAccount = accounts.find(a => a.type === 'PRIMARY') || accounts[0];
        const baseAddr = primaryAccount?.address || '0x0000000000000000000000000000000000000000';
        
        // Simple deterministic simulation: offset the last bytes
        const mockAddress = baseAddr.slice(0, -2) + newIndex.toString(16).padStart(2, '0');
        
        const newAccount: WalletAccount = {
            address: mockAddress,
            name: `Account ${newIndex + 1}`,
            type: 'DERIVED',
            index: newIndex,
            color: getAccountColor(mockAddress)
        };

        setAccounts([...accounts, newAccount]);
        alert(`New account "${newAccount.name}" created! Note: Explorer visibility requires first transaction.`);
    };

    const handleAddWatchWallet = async (address: string, name?: string) => {
        try {
            let resolvedAddress = address;
            let ensName: string | undefined;

            // Try to resolve ENS
            if (address.endsWith('.eth')) {
                const resolved = await resolveENSName(address);
                if (resolved) {
                    resolvedAddress = resolved;
                    ensName = address;
                } else {
                    throw new Error('Could not resolve ENS name');
                }
            } else if (!isAddress(address)) {
                throw new Error('Invalid Ethereum address');
            }

            // Check if already exists
            if (accounts.some(a => a.address.toLowerCase() === resolvedAddress.toLowerCase())) {
                throw new Error('This address is already in your accounts');
            }

            const watchAccount: WalletAccount = {
                address: resolvedAddress,
                name: ensName || name || `Watch ${resolvedAddress.slice(0, 6)}...`,
                type: 'WATCH_ONLY',
                color: getAccountColor(resolvedAddress)
            };

            setAccounts([...accounts, watchAccount]);
            setShowWatchInput(false);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to add watch wallet');
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black rounded-full blur-[120px]" />
            </div>

            {/* Header Navigation */}
            <header className="px-4 py-4 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#EAEADF]/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {accounts.length > 0 && (
                        <AccountSwitcher 
                            currentAddress={displayAddress}
                            accounts={accounts.filter(acc => {
                                // Always show Primary and Currently Selected
                                if (acc.type === 'PRIMARY') return true;
                                if (acc.address === displayAddress) return true;
                                
                                // Show if balance is > 0 or unknown (to avoid flickering)
                                const balanceStr = accountBalances[acc.address.toLowerCase()];
                                if (balanceStr === undefined) return true;
                                return parseFloat(balanceStr) > 0;
                            })}
                            onSwitch={handleSwitchAccount}
                            onAddAccount={handleAddAccount}
                            onAddWatchOnly={() => setShowWatchInput(true)}
                        />
                    )}
                </div>
                
                {/* Center Tabs - ABSOLUTELY CENTERED FOR PERFECT ALIGNMENT WITH CARD */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/50 rounded-full p-1.5 border border-[#1F1F1F]/5 shadow-sm overflow-x-auto max-w-[600px] scrollbar-hide">
                    <ViewTab icon={<Wallet size={18}/>} label="Wallet" active={activeView==='dashboard'} onClick={()=>setActiveView('dashboard')} />
                    <ViewTab icon={<PieChart size={18}/>} label="Portfolio" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                    <ViewTab icon={<TrendingUp size={18}/>} label="Earn" active={activeView==='earn'} onClick={()=>setActiveView('earn')} />
                    <ViewTab icon={<Zap size={18}/>} label="Activity" active={activeView==='activity'} onClick={()=>setActiveView('activity')} />
                    <ViewTab icon={<Users size={18}/>} label="Whales" active={activeView==='whales'} onClick={()=>setActiveView('whales')} />
                    <ViewTab icon={<CreditCard size={18}/>} label="Cards" active={activeView==='cards'} onClick={()=>setActiveView('cards')} />
                    <ViewTab icon={<Gift size={18}/>} label="Referrals" active={activeView==='referrals'} onClick={()=>setActiveView('referrals')} />
                    <ViewTab icon={<Settings size={18}/>} label="Settings" active={activeView==='settings'} onClick={()=>setActiveView('settings')} />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <NotificationCenter />
                    <div className="hidden md:flex">
                        <ViewTab icon={<Settings size={18}/>} label="" active={activeView==='settings'} onClick={()=>setActiveView('settings')} />
                    </div>
                </div>
            </header>

             {/* Mobile Tab Bar (Bottom) */}
             <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-lg border border-[#1F1F1F]/5 shadow-2xl rounded-full p-2 flex gap-1">
                 <ViewTab icon={<Wallet size={20}/>} label="" active={activeView==='dashboard'} onClick={()=>setActiveView('dashboard')} />
                 <ViewTab icon={<PieChart size={20}/>} label="" active={activeView==='portfolio'} onClick={()=>setActiveView('portfolio')} />
                 <ViewTab icon={<Gift size={20}/>} label="" active={activeView==='referrals'} onClick={()=>setActiveView('referrals')} />
                 <ViewTab icon={<Settings size={20}/>} label="" active={activeView==='settings'} onClick={()=>setActiveView('settings')} />
            </div>

            <main className="max-w-4xl mx-auto p-6 space-y-8 relative z-10 min-h-[80vh]">

                {activeView === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                            <HumanCard 
                                address={displayAddress} 
                                balance={totalBalance} 
                                change24hUSD={change24hUSD}
                                change24hPercent={change24hPercent}
                            />

                        {/* Wallet Actions & Tabs */}
                        <WalletActions positions={positions} history={transactions} userAddress={displayAddress} assets={assets} />
                    </div>
                )}

                {activeView === 'portfolio' && displayAddress && (
                    <div className="animate-fade-in">
                        <PortfolioDashboard walletAddress={displayAddress} chainIds={[1, 137, 8453]} initialAssets={assets} />
                    </div>
                )}

                {activeView === 'earn' && (
                    <div className="animate-fade-in">
                        <StakingDashboard />
                    </div>
                )}

                {activeView === 'activity' && displayAddress && (
                    <div className="animate-fade-in">
                        <TransactionHistory authUserId={displayAddress} />
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

                {activeView === 'whales' && (
                    <div className="animate-fade-in">
                        <WhaleGroups />
                    </div>
                )}

                {activeView === 'cards' && (
                    <div className="animate-fade-in space-y-6">
                        <FiatCardIssuance />
                        
                        <div className="bg-[#1F1F1F] p-6 rounded-3xl text-[#EAEADF] relative overflow-hidden">
                             {/* Abstract Background */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                             
                             <h3 className="text-lg font-bold mb-2 relative z-10">Why store with Human DeFi?</h3>
                             <p className="text-sm opacity-70 leading-relaxed relative z-10">
                                Uncompromised security meets radical transparency. Unlike traditional banks, we provide verifiable, on-chain proof of reserves.  
                                Your assets are shielded by military-grade encryption and accessible only by you—no hidden fees, no frozen accounts, just pure financial sovereignty.
                             </p>
                        </div>
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

                {activeView === 'settings' && (
                    <div className="animate-fade-in">
                        <SettingsPanel />
                    </div>
                )}
                
                {/* MODALS */}
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

                {/* FEATURE: AI Financial Concierge */}
                <AIConcierge />

            </main>
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
