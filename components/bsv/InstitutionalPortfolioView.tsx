"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useVIPStore } from '@/lib/vip-store';
import { SettingsView } from '@/components/settings/SettingsView';
import { ethers } from 'ethers';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { useFeeData } from 'wagmi';
import { useSystemAccount } from '@/hooks/useSystemAccount';

import ReceiveHub from '@/components/wallet/ReceiveHub';
import QRScannerModal from '@/components/wallet/QRScannerModal';
import SecurityVault from '@/components/wallet/SecurityVault';
import SettingsPanel from '@/components/wallet/SettingsPanel';
import UnifiedWalletModal from '@/components/wallet/UnifiedWalletModal';
import { useRealWalletData } from '@/hooks/useRealWalletData';

import { QRCodeSVG } from 'qrcode.react';
import { OmniLayerTerminal } from '@/components/dashboard/OmniLayerTerminal';
import { MetaMaskNetworkSelector } from '@/components/portfolio/MetaMaskNetworkSelector';

import { QuantumHoldingsEngine } from '@/components/portfolio/QuantumHoldingsEngine';

import { AztecPrivacyTerminal } from '@/components/portfolio/AztecPrivacyTerminal';
import { SecurityAllowances } from '@/components/portfolio/SecurityAllowances';
import { ContractDeployerView } from '@/components/portfolio/ContractDeployerView';
import { TransactionManagerView } from '@/components/portfolio/TransactionManager';
import { HDAccountManager } from '@/components/portfolio/HDAccountManager';
import { SmartAccountTerminal } from '@/components/portfolio/SmartAccountTerminal';
import { OmnichainBridgeView } from '@/components/portfolio/OmnichainBridgeView';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';
import { QuantumDeFiPositions } from '@/components/portfolio/QuantumDeFiPositions';

// Original minimalist VaultUnlockScreen (internal)
function VaultUnlockScreen({ unlockVault }: { unlockVault: (pwd: string) => boolean }) {
    const [pwd, setPwd] = useState("");
    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white text-black p-4">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] mb-2">Vault Locked</h1>
            <p className="text-[10px] text-black/50 font-mono mb-8 text-center max-w-sm">
                Your cryptographic identity is secured. Enter your master password to decrypt the local keystore.
            </p>
            <input 
                type="password" 
                value={pwd} 
                onChange={e => setPwd(e.target.value)}
                placeholder="Master Password" 
                className="w-full max-w-xs border-b border-black/20 p-4 text-center text-xl tracking-widest outline-none focus:border-black transition-colors mb-6 font-mono"
            />
            <button 
                onClick={() => {
                    if (!unlockVault(pwd)) toast.error("Invalid password");
                }}
                className="w-full max-w-xs bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 hover:bg-black/80 transition-colors"
            >
                Decrypt Vault
            </button>
        </div>
    );
}

const truncate = (str: string, len: number) => {
    if (!str) return '';
    if (str.length <= len) return str;
    const charsToShow = len - 3;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return str.substring(0, frontChars) + '...' + str.substring(str.length - backChars);
};

export function InstitutionalPortfolioView() {
    const { balance, updateBalance, activeNetwork, restoreFromCloud, isLocked, unlockVault, passwordHash } = useWalletStore();
    const { address } = useSystemAccount();
    const { assets } = useRealWalletData([], address || undefined);
    
    // We keep 'HOME' as the main view, and overlay modals for actions
    const [view, setView] = useState<'HOME'|'NETWORK'|'CREATE'|'SHIELD'|'SECURITY'|'DEPLOY'|'MEMPOOL'|'SMART_ACCOUNT'|'OMNICHAIN'>('HOME');
    
    // Modal states for full universal capability
    const [unifiedActionTab, setUnifiedActionTab] = useState<'SEND'|'SWAP'|'BRIDGE'|'BUY'|null>(null);
    const [showReceive, setShowReceive] = useState(false);
    const [showScan, setShowScan] = useState(false);
    const [showAccounts, setShowAccounts] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const [prefilledAddress, setPrefilledAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    const refreshBalance = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            await updateBalance();
        } catch (e) {
            console.error('[PORTFOLIO] On-chain sync failure:', e);
        } finally {
            setLoading(false);
        }
    }, [address, updateBalance]);

    // INFINITE LOOP FIX 1: restoreFromCloud is not a stable reference from Zustand.
    // Depending on [address, restoreFromCloud] caused it to re-fire every render.
    // Use a ref guard to call it only once on mount.
    const hasRestoredRef = useRef(false);
    useEffect(() => {
        setIsHydrated(true);
        if (!hasRestoredRef.current) {
            hasRestoredRef.current = true;
            if (!address) restoreFromCloud();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // INFINITE LOOP FIX 2: refreshBalance is a useCallback that depends on [address, updateBalance].
    // updateBalance from Zustand is not a stable reference, so refreshBalance gets a new identity
    // on every render, causing this effect to fire continuously.
    // Fix: depend only on [isHydrated, address] which are stable primitives.
    useEffect(() => {
        if (isHydrated && address) {
            refreshBalance();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHydrated, address]);

    const ethPrice = useVIPStore(s => s.ethPrice);

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh] bg-white text-black text-[10px] uppercase tracking-widest font-bold">
                Loading...
            </div>
        );
    }

    if (isLocked && passwordHash) {
        return <VaultUnlockScreen unlockVault={unlockVault} />;
    }

    const getScannerBase = (netId: string) => {
        switch(netId) {
            case 'polygon': return 'https://polygonscan.com';
            case 'arbitrum': return 'https://arbiscan.io';
            case 'optimism': return 'https://optimistic.etherscan.io';
            case 'base': return 'https://basescan.org';
            case 'bsc': return 'https://bscscan.com';
            case 'worldchain': return 'https://worldscan.org';
            default: return 'https://etherscan.io';
        }
    };
    const scannerBase = getScannerBase(activeNetwork);
    const priceOracle = ethPrice > 0 ? ethPrice : 3100;
    const balanceFiat = `${(parseFloat(balance || "0") * priceOracle).toFixed(2)}`;

    return (
        <div className="flex flex-col relative text-black selection:bg-black/10 min-h-[100dvh] bg-white font-sans">
            <AnimatePresence mode="wait">
                {view === 'HOME' && (
                    <HomeView key="home"
                        address={address}
                        balance={balance}
                        balanceFiat={balanceFiat}
                        loading={loading}
                        activeNetwork={activeNetwork}
                        onRefresh={refreshBalance}
                        onSend={() => setUnifiedActionTab('SEND')}
                        onReceive={() => setShowReceive(true)}
                        onScan={() => setShowScan(true)}
                        onCreate={() => setView('CREATE')}
                        onBuy={() => setUnifiedActionTab('BUY')}
                        onSwap={() => setUnifiedActionTab('SWAP')}
                        onBridge={() => setUnifiedActionTab('BRIDGE')}
                        onNetworkClick={() => setView('NETWORK')}
                        onSettingsClick={() => setShowSettings(true)}
                        onAccountsClick={() => setShowAccounts(true)}
                        scannerBase={scannerBase}
                        onShield={() => setView('SHIELD')}
                        onSecurity={() => setView('SECURITY')}
                        onSmartAccount={() => setView('SMART_ACCOUNT')}
                        onDeploy={() => setView('DEPLOY')}
                        onOmnichain={() => setView('OMNICHAIN')}
                        onMempool={() => setView('MEMPOOL')}
                        assets={assets || []}
                    />
                )}
                {/* Embedded older views for deep protocol interactions */}
                {view === 'NETWORK' && <NetworkView key="network" onBack={() => setView('HOME')} />}

                {view === 'SHIELD' && <AztecPrivacyTerminal key="shield" onBack={() => setView('HOME')} />}
                {view === 'SECURITY' && <SecurityAllowances key="security" onBack={() => setView('HOME')} />}
                {view === 'DEPLOY' && <ContractDeployerView key="deploy" onBack={() => setView('HOME')} />}
                {view === 'MEMPOOL' && <TransactionManagerView key="mempool" onBack={() => setView('HOME')} />}
                {view === 'SMART_ACCOUNT' && <SmartAccountTerminal key="smart_account" onBack={() => setView('HOME')} />}
                {view === 'OMNICHAIN' && <OmnichainBridgeView key="omnichain" onBack={() => setView('HOME')} />}
            </AnimatePresence>

            {/* Universal On-Chain Modals for ALL Users */}
            <UnifiedWalletModal 
                isOpen={!!unifiedActionTab} 
                initialTab={unifiedActionTab || 'SEND'} 
                onClose={() => setUnifiedActionTab(null)} 
                userAssets={assets || []}
            />
            
            {showReceive && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm" onClick={() => setShowReceive(false)}>
                    <div className="w-full max-w-5xl max-h-[90vh] bg-white border border-black/10 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-5 border-b border-black/10">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Receive Assets</h2>
                            <button onClick={() => setShowReceive(false)} className="font-black text-[9px] uppercase tracking-widest text-black/40 hover:text-black transition-colors border border-black/10 px-3 py-2">[CLOSE]</button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <ReceiveHub addresses={[
                                { network: 'Ethereum', address: address || '0x...', token: 'ETH', chainId: 1 },
                                { network: 'Polygon', address: address || '0x...', token: 'MATIC', chainId: 137 },
                                { network: 'Arbitrum', address: address || '0x...', token: 'ETH', chainId: 42161 },
                                { network: 'Base', address: address || '0x...', token: 'ETH', chainId: 8453 },
                                { network: 'Optimism', address: address || '0x...', token: 'ETH', chainId: 10 },
                            ]} />
                        </div>
                    </div>
                </div>
            )}

            <QRScannerModal 
                isOpen={showScan} 
                onClose={() => setShowScan(false)}
                onScan={(data) => {
                    const addr = data.startsWith('ethereum:') ? data.replace('ethereum:', '').split('@')[0].split('?')[0] : data;
                    setShowScan(false);
                    toast.success(`Scanned: ${addr}`);
                    setTimeout(() => setUnifiedActionTab('SEND'), 500);
                }}
            />

            <AnimatePresence>
                {showSettings && <SettingsView onBack={() => setShowSettings(false)} />}
            </AnimatePresence>
            {showAccounts && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4" onClick={() => setShowAccounts(false)}>
                    <div className="w-full max-w-4xl bg-white border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-black/10 flex justify-between items-center bg-black/5">
                            <h2 className="text-lg font-black uppercase tracking-widest text-black">Account Manager</h2>
                            <button onClick={() => setShowAccounts(false)} className="text-black/40 hover:text-black font-bold text-xs uppercase">Close</button>
                        </div>
                        <div className="overflow-y-auto p-4">
                            <SecurityVault />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function HomeView({ address, balance, balanceFiat, activeNetwork, loading, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onSwap, onBridge, onNetworkClick, onSettingsClick, onAccountsClick, scannerBase, onShield, onSecurity, onSmartAccount, onDeploy, onOmnichain, onMempool, assets }: any) {
    const [copied, setCopied] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [activeTab, setActiveTab] = useState<'TOKENS'|'DEFI'|'ACTIVITY'>('TOKENS');
    const { nuclearDisconnect } = useSystemSignOut();
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.polygon;

    const activeChainId = NETWORKS[activeNetwork as NetworkId]?.chainId || 1;
    const { data: feeData } = useFeeData({ chainId: activeChainId });
    
    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        await nuclearDisconnect();
    };

    const copy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Address Captured");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full min-h-[100dvh] bg-white">

            {/* Disconnecting overlay */}
            {isDisconnecting && (
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/50">Signing out...</p>
                </div>
            )}

            {/* ── Top Navigation Bar ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-10 py-5 border-b border-black/10 bg-white">
                <div className="flex flex-col gap-1 items-start">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-black/30">Network</span>
                    <MetaMaskNetworkSelector 
                        activeNetworkId={activeChainId}
                        onNetworkChange={(id) => {
                            const networkEntries = Object.entries(NETWORKS);
                            const found = networkEntries.find(([_, config]) => config.chainId === id);
                            if (found) {
                                useWalletStore.getState().setNetwork(found[0] as NetworkId);
                            }
                        }} 
                    />
                </div>

                <div className="hidden md:flex flex-col items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">Humanity Ledger</span>
                </div>

                {address && (
                    <div className="flex flex-wrap gap-2 items-center justify-end mt-3 md:mt-0">
                        <button onClick={onRefresh} disabled={loading} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors px-3 py-1.5 border border-transparent hover:border-black/10">
                            {loading ? 'Refreshing…' : 'Refresh'}
                        </button>
                        <button onClick={onSettingsClick} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors px-3 py-1.5 border border-transparent hover:border-black/10">
                            Settings
                        </button>
                        <button onClick={onAccountsClick} className="border border-black/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors">
                            Accounts
                        </button>
                        <button onClick={handleDisconnect} className="border border-red-300 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            Disconnect
                        </button>
                    </div>
                )}
            </header>

            {/* ── Balance Hero Section ── */}
            <section className="w-full flex flex-col items-center text-center px-6 pt-16 pb-14 border-b border-black/5 bg-white">
                <div className="relative inline-flex items-baseline justify-center mb-3">
                    <h1 className="font-light tracking-tighter text-black" style={{ fontSize: 'clamp(3.5rem, 11vw, 7rem)' }}>
                        {balance || '0.0000'}
                    </h1>
                    <span className="absolute left-full ml-3 md:ml-5 font-black uppercase tracking-[0.2em] text-black/25 flex flex-col items-start" style={{ bottom: '0.8rem' }}>
                        <span style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>{networkInfo.currency}</span>
                        <span className="text-[10px] text-black/40 tracking-[0.3em] mt-1 bg-black/5 px-2 py-0.5 rounded-sm">{networkInfo.name}</span>
                    </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    <p className="text-[12px] tracking-[0.18em] font-mono text-black/50 border border-black/10 px-5 py-2">{balanceFiat} USD</p>
                    <span className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest">Live</span>
                </div>

                {address ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
                        <button onClick={copy} className="w-full bg-black text-white px-6 py-4 flex items-center justify-between hover:bg-black/80 transition-all group">
                            <div className="flex flex-col items-start">
                                <span className="text-[8px] uppercase tracking-[0.3em] opacity-40 mb-1">Your Address</span>
                                <code className="text-sm font-mono tracking-wider">{truncate(address, 26)}</code>
                            </div>
                            <span className="text-[9px] uppercase font-black tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <a href={`${scannerBase}/address/${address}`} target="_blank" rel="noopener noreferrer"
                            className="w-full border border-black/10 bg-white px-6 py-3 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-black/5 transition-all">
                            View on Explorer
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-5 mt-4 p-10 bg-white border border-black/10 max-w-sm mx-auto">
                        <h4 className="text-sm font-black uppercase tracking-wider text-black">No Wallet Connected</h4>
                        <p className="text-xs text-black/40 leading-relaxed text-center">Create or import a wallet to start using the portfolio.</p>
                        <button onClick={onCreate} className="w-full bg-black text-white px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-black hover:bg-black/80 transition-all">
                            Connect Wallet
                        </button>
                    </div>
                )}
            </section>

            {/* ── Main Grid: Actions + Portfolio Tabs ── */}
            {address && (
                <section className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left sidebar – actions */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white border border-black/10 p-5">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 border-b border-black/10 pb-3 mb-4 block">
                                ACTIONS
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <ActionBtn label="Deposit" onClick={onBuy} />
                                <ActionBtn label="Swap" onClick={onSwap} />
                                <ActionBtn label="Bridge" onClick={onBridge} />
                                <ActionBtn label="Send" onClick={onSend} />
                                <ActionBtn label="Receive" onClick={onReceive} />
                                <ActionBtn label="Scan" onClick={onScan} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Tabs panel */}
                    <div className="lg:col-span-9">
                        <div className="bg-white border border-black/10 overflow-hidden flex flex-col min-h-[520px]">
                            <div className="flex border-b border-black/10 overflow-x-auto">
                                {(['TOKENS', 'DEFI', 'ACTIVITY'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                            activeTab === t
                                                ? 'bg-black text-white'
                                                : 'text-black/50 hover:text-black hover:bg-black/[0.03] border-r border-black/10'
                                        }`}
                                    >
                                        {t === 'TOKENS' ? 'Assets' : t === 'DEFI' ? 'DeFi' : 'History'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 bg-white flex flex-col">
                                {activeTab === 'TOKENS' && <QuantumHoldingsEngine address={address} activeNetwork={activeNetwork} scannerBase={scannerBase} userAssets={assets} />}
                                {activeTab === 'DEFI' && <QuantumDeFiPositions address={address} activeNetwork={activeNetwork} />}
                                {activeTab === 'ACTIVITY' && <TransactionHistory address={address} scannerBase={scannerBase} activeNetwork={activeNetwork} />}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Downpage Footer ── */}
            <div className="relative mt-auto pt-32 pb-0 overflow-hidden border-t border-black/[0.06]">
                {/* Footer band */}
                <div className="relative z-10 border-t border-black/10 bg-white px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 font-bold">
                        Humanity Ledger · End-to-end encrypted · Zero data stored
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-black/30 text-center md:text-right">
                        All transactions confirmed on-chain
                    </span>
                </div>
            </div>

        </motion.div>
    );
}

function ActionBtn({ label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 border border-black/5 hover:border-black hover:bg-black hover:text-white hover:shadow-xl transition-all duration-300 group bg-black/[0.02]"
        >
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </button>
    );
}

function ModalView({ title, onBack, children }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col max-w-xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-full flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
                <h2 className="text-lg font-black uppercase tracking-widest text-black">{title}</h2>
                <button onClick={onBack} className="text-[10px] uppercase tracking-widest font-bold text-black/40 hover:text-black transition-colors border border-black/10 px-3 py-1">
                    CLOSE
                </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </motion.div>
    );
}

function NetworkView({ onBack }: any) {
    const { activeNetwork, setNetwork } = useWalletStore();
    return (
        <ModalView title="Protocol Selection" onBack={onBack}>
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(NETWORKS).map(([id, data]) => (
                    <button key={id} onClick={() => { setNetwork(id as NetworkId); onBack(); }} className={`flex items-center justify-between p-5 border transition-all ${activeNetwork === id ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/30 bg-white text-black'}`}>
                        <div className="flex items-center gap-4">
                            <span className="font-bold uppercase tracking-widest text-xs">{data.name}</span>
                        </div>
                        <span className={`text-[10px] tracking-widest ${activeNetwork === id ? 'opacity-50' : 'opacity-30'}`}>{data.currency}</span>
                    </button>
                ))}
            </div>
        </ModalView>
    );
}
