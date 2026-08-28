"use client";

import React, { useState, useEffect } from 'react';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useUIStore } from '@/lib/store/ui-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

const TABS = [
    { id: 'VAULT', label: 'Personal Vault' },
    { id: 'LOGS', label: 'Connection Log' },
    { id: 'DEVICES', label: 'Active Devices' },
    { id: 'WORKSPACES', label: 'Workspaces' },
    { id: 'ALERTS', label: 'Alerts & Sounds' },
    { id: 'PRIVACY', label: 'Privacy Engine' },
    { id: 'STORAGE', label: 'Data & Storage' },
    { id: 'AESTHETICS', label: 'Aesthetics' },
    { id: 'LANGUAGE', label: 'Language' },
    { id: 'GHOST', label: 'AI Ghost Mode' },
    { id: 'INTELLIGENCE', label: 'Ledger Intelligence' },
    { id: 'NETWORKS', label: 'Network Protocol' },
    { id: 'PRO', label: 'Ledger Network Pro' },
    { id: 'CAPACITY', label: 'Max Capacity' },
    { id: 'QUANTUM', label: 'Quantum Dots' },
] as const;

type TabId = typeof TABS[number]['id'];

export function SettingsView({ onBack }: { onBack: () => void }) {
    const {
        address, privateKey, mnemonic, isLocked, passwordHash,
        setupPassword, lockVault,
        activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl,
        btcAddress, btcBalance
    } = useWalletStore();

    const ui = useUIStore();

    const [activeTab, setActiveTab] = useState<TabId>('VAULT');
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[200] w-full md:w-[700px] bg-white border-l border-black flex flex-col font-mono text-black overflow-hidden"
        >
            {/* Header */}
            <header className="flex items-center justify-between px-6 border-b border-black bg-white shrink-0" style={{ paddingTop: 'max(24px, env(safe-area-inset-top, 24px))', paddingBottom: '24px' }}>
                <div>
                    <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-black leading-none">System Settings</h2>
                    {address && <p className="text-[10px] text-black mt-2 uppercase tracking-widest">{address.slice(0, 10)}...{address.slice(-8)}</p>}
                </div>
                <button onClick={onBack} className="px-6 py-2 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                    CLOSE
                </button>
            </header>

            {/* Layout container: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Tabs Sidebar */}
                <div className="w-[200px] shrink-0 border-r border-black overflow-y-auto bg-black/5" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b border-black/10 last:border-b-0 ${
                                activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-black/10 text-black/60 hover:text-black'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="flex-1 overflow-y-auto p-8" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            
                            {activeTab === 'VAULT' && (
                                <VaultModule passwordHash={passwordHash} setupPassword={setupPassword} lockVault={lockVault} privateKey={privateKey} mnemonic={mnemonic} />
                            )}
                            {activeTab === 'LOGS' && <PlaceholderModule title="Connection Log" desc="Audit trail of all incoming and outgoing connections across the mesh network." />}
                            {activeTab === 'DEVICES' && <PlaceholderModule title="Active Devices" desc="Manage active cross-device cryptographic sessions." />}
                            {activeTab === 'WORKSPACES' && <PlaceholderModule title="Workspaces" desc="Configure your isolated network workspaces and sandbox environments." />}
                            
                            {activeTab === 'ALERTS' && (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">Alerts & Sounds</h3>
                                    <label className="flex items-center justify-between p-4 border border-black cursor-pointer hover:bg-black/5">
                                        <span className="text-[11px] font-black tracking-widest uppercase">Enable UI Sounds</span>
                                        <input type="checkbox" checked={ui.soundsEnabled} onChange={(e) => ui.setSoundsEnabled(e.target.checked)} className="accent-black w-4 h-4" />
                                    </label>
                                </div>
                            )}

                            {activeTab === 'PRIVACY' && (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">Privacy Engine</h3>
                                    <div className="space-y-2">
                                        {(['standard', 'strict'] as const).map(level => (
                                            <button key={level} onClick={() => ui.setPrivacyLevel(level)} className={`w-full p-4 border text-left flex items-center justify-between uppercase tracking-widest text-[11px] font-black ${ui.privacyLevel === level ? 'bg-black text-white border-black' : 'border-black hover:bg-black/10'}`}>
                                                {level} Mode {ui.privacyLevel === level && '✓'}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-black/50 leading-relaxed uppercase tracking-widest">
                                        Strict mode requires mandatory signatures for all incoming requests and hides metadata entirely.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'STORAGE' && <PlaceholderModule title="Data & Storage" desc="Manage local database allocation and cache clearing." />}
                            
                            {activeTab === 'AESTHETICS' && (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">Aesthetics</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(['system', 'light', 'dark'] as const).map(theme => (
                                            <button key={theme} onClick={() => ui.setTheme(theme)} className={`p-4 border text-left flex items-center justify-between uppercase tracking-widest text-[11px] font-black ${ui.theme === theme ? 'bg-black text-white border-black' : 'border-black hover:bg-black/10'}`}>
                                                {theme} Theme {ui.theme === theme && '✓'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'LANGUAGE' && (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">Language</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['en', 'es'] as const).map(lang => (
                                            <button key={lang} onClick={() => ui.setLanguage(lang)} className={`p-4 border uppercase tracking-widest text-[11px] font-black text-center ${ui.language === lang ? 'bg-black text-white border-black' : 'border-black hover:bg-black/10'}`}>
                                                {lang === 'en' ? 'English' : 'Español'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'GHOST' && (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">AI Ghost Mode</h3>
                                    <label className="flex flex-col gap-2 p-6 border border-black cursor-pointer hover:bg-black/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black tracking-widest uppercase">Enable AI Auto-Replies</span>
                                            <input type="checkbox" checked={ui.ghostMode} onChange={(e) => ui.setGhostMode(e.target.checked)} className="accent-black w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] text-black/50 tracking-widest uppercase mt-2">When enabled, incoming messages from unknown peers are handled autonomously.</span>
                                    </label>
                                </div>
                            )}

                            {activeTab === 'INTELLIGENCE' && <PlaceholderModule title="Ledger Intelligence Tools" desc="Configure advanced on-chain analysis and automated sweeping." />}
                            
                            {activeTab === 'NETWORKS' && (
                                <NetworkModule activeNetwork={activeNetwork} setNetwork={setNetwork} customRpcUrl={customRpcUrl} setCustomRpcUrl={setCustomRpcUrl} />
                            )}
                            
                            {activeTab === 'PRO' && <PlaceholderModule title="Ledger Network Pro" desc="Upgrade to access dedicated RPC nodes and premium relayers." />}
                            {activeTab === 'CAPACITY' && <PlaceholderModule title="Unlock Maximum Capacity" desc="Increase storage and processing limits by staking tokens." />}
                            {activeTab === 'QUANTUM' && <QuantumSwapModule btcAddress={btcAddress} btcBalance={btcBalance} />}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 border-t border-black bg-white flex items-center justify-between gap-4" style={{ paddingTop: '20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-black/40">SYSTEM CONFIGURED</span>
            </div>
        </motion.div>
    );
}

function PlaceholderModule({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4">{title}</h3>
            <div className="p-8 border border-black/20 bg-black/5 text-center">
                <p className="text-[10px] tracking-widest uppercase text-black/50 mb-4">{desc}</p>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-black bg-white border border-black px-4 py-2 inline-block">AVAILABLE NEXT UPDATE</span>
            </div>
        </div>
    );
}

function QuantumSwapModule({ btcAddress, btcBalance }: any) {
    const [amount, setAmount] = useState('');
    const [swapping, setSwapping] = useState(false);

    const handleSwap = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        setSwapping(true);
        setTimeout(() => {
            setSwapping(false);
            toast.success("Transaction Submitted", { description: "Quantum Dots will be credited shortly." });
            setAmount('');
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Quantum Dots Purchase</h3>
            
            <div className="border border-black p-6 space-y-4 bg-black/5">
                <div className="flex justify-between items-center border-b border-black/20 pb-4">
                    <span className="text-[10px] uppercase font-black tracking-widest">TREASURY WALLET</span>
                    <span className="text-[11px] tracking-widest truncate max-w-[200px]">0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-widest">YOUR ETH BALANCE</span>
                    <span className="text-[14px] font-black">--- ETH</span>
                </div>
            </div>

            <div className="space-y-4">
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="QUANTUM DOTS TO PURCHASE"
                    className="w-full border border-black px-6 py-5 text-[14px] uppercase tracking-widest outline-none focus:bg-black focus:text-white transition-colors"
                />
                <button
                    onClick={handleSwap}
                    disabled={swapping || !amount}
                    className="w-full bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] py-6 hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
                >
                    {swapping ? 'PROCESSING...' : 'PAY WITH ETHEREUM'}
                </button>
                <p className="text-[9px] text-center uppercase tracking-widest text-black/50 mt-4">Payments strictly in Ethereum directly to Treasury.</p>
            </div>
        </div>
    );
}

function NetworkModule({ activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl }: any) {
    const [rpcInput, setRpcInput] = useState(customRpcUrl || '');

    const handleSaveRPC = () => {
        if (!rpcInput) return;
        try {
            if (!rpcInput.startsWith('http')) throw new Error('HTTP/HTTPS required');
            new URL(rpcInput);
            setCustomRpcUrl(rpcInput);
            toast.success("Provider Saved", { description: "Custom network provider is now active." });
        } catch (err: any) {
            toast.error("Invalid URL", { description: "Please enter a valid HTTP/HTTPS URL." });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Network Selection</h3>
                <div className="space-y-4">
                    {Object.entries(NETWORKS).map(([id, net]) => {
                        const isActive = activeNetwork === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { setNetwork(id as NetworkId); }}
                                className={`w-full p-4 text-left flex items-center justify-between border transition-all ${
                                    isActive ? 'border-black bg-black text-white' : 'border-black hover:bg-black/10'
                                }`}
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{net.name}</span>
                                <span className={`text-[9px] uppercase tracking-widest ${isActive ? 'text-white/50' : 'text-black/50'}`}>Chain {net.chainId}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Custom Provider URL</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="https://..."
                        value={rpcInput}
                        onChange={e => setRpcInput(e.target.value)}
                        className="w-full border border-black px-6 py-4 text-[11px] tracking-widest outline-none focus:bg-black focus:text-white transition-colors"
                    />
                    <div className="flex gap-4">
                        <button onClick={handleSaveRPC} className="flex-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 border border-black hover:bg-white hover:text-black transition-colors">Save Provider</button>
                        <button onClick={() => { setRpcInput(''); setCustomRpcUrl(null); }} className="px-8 border border-black text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/10 transition-colors">Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VaultModule({ passwordHash, setupPassword, lockVault, privateKey, mnemonic }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [showPk, setShowPk] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    if (!passwordHash) {
        return (
            <div className="space-y-6">
                <div className="border border-black p-6">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 text-black">Vault Unlocked</h3>
                    <p className="text-[10px] tracking-widest mb-6 uppercase">Create a local password to secure your cryptographic keys.</p>
                    <input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-black px-4 py-4 text-[12px] tracking-widest mb-4 outline-none focus:bg-black focus:text-white transition-colors" />
                    <button onClick={() => { setupPassword(newPassword); toast.success("Vault Secured"); }} disabled={!newPassword || newPassword.length < 8} className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50">Secure Vault</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border border-black p-6 flex items-center justify-between bg-black text-white">
                <div><p className="text-[12px] font-black uppercase tracking-[0.2em]">Vault Secured</p></div>
                <button onClick={lockVault} className="text-[10px] font-black uppercase tracking-widest bg-white text-black border border-white px-6 py-3 hover:bg-black hover:text-white transition-colors">Lock Now</button>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Backup Keys</h3>
                <div className="space-y-6">
                    {privateKey && (
                        <div className="border border-black p-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Private Key</span>
                                <button onClick={() => setShowPk(!showPk)} className="text-[10px] uppercase font-black tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">{showPk ? 'Hide' : 'Reveal'}</button>
                            </div>
                            {showPk ? <div className="border border-black p-4 text-[12px] break-all uppercase text-center font-black">{privateKey}</div> : <div className="border border-black p-4 text-[12px] tracking-[0.5em] text-center">••••••••••••••••••••••••••••••••</div>}
                        </div>
                    )}
                    {mnemonic && (
                        <div className="border border-black p-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recovery Phrase</span>
                                <button onClick={() => setShowMnemonic(!showMnemonic)} className="text-[10px] uppercase font-black tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">{showMnemonic ? 'Hide' : 'Reveal'}</button>
                            </div>
                            {showMnemonic ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {mnemonic.split(' ').map((word: string, i: number) => (
                                        <div key={i} className="border border-black p-3 text-center"><span className="text-[11px] font-black uppercase tracking-widest">{word}</span></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: 12 }).map((_idx, i) => (
                                        <div key={i} className="border border-black p-3 text-center"><span className="text-[11px] tracking-widest">••••</span></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
