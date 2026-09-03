"use client";

import React, { useState, useEffect } from 'react';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { useUIStore } from '@/lib/store/ui-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'GENERAL', label: 'General' },
    { id: 'SECURITY', label: 'Security & Privacy' },
    { id: 'NETWORKS', label: 'Networks' },
    { id: 'CONTACTS', label: 'Contacts' },
    { id: 'ADVANCED', label: 'Advanced' }
] as const;

type TabId = typeof TABS[number]['id'];

export function SettingsView({ onBack }: { onBack: () => void }) {
    const {
        address, privateKey, mnemonic, isLocked, passwordHash,
        setupPassword, lockVault,
        activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl,
        displayCurrency, setDisplayCurrency
    } = useWalletStore();

    const [activeTab, setActiveTab] = useState<TabId>('GENERAL');
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[200] w-full md:w-[700px] bg-white border-l border-zinc-200 flex flex-col font-sans text-zinc-900 overflow-hidden shadow-2xl"
        >
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-white shrink-0">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900">Settings</h2>
                </div>
                <button onClick={onBack} className="px-6 py-2 border border-zinc-200 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                    Close
                </button>
            </header>

            {/* Layout container: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Tabs Sidebar */}
                <div className="w-[200px] shrink-0 border-r border-zinc-100 bg-zinc-50/50 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
                                activeTab === tab.id ? 'bg-white text-zinc-900 border-r-2 border-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            
                            {activeTab === 'GENERAL' && (
                                <GeneralModule 
                                    displayCurrency={displayCurrency || 'EUR'} 
                                    setDisplayCurrency={setDisplayCurrency} 
                                />
                            )}
                            
                            {activeTab === 'SECURITY' && (
                                <SecurityModule 
                                    passwordHash={passwordHash} 
                                    setupPassword={setupPassword} 
                                    lockVault={lockVault} 
                                    privateKey={privateKey} 
                                    mnemonic={mnemonic} 
                                />
                            )}
                            
                            {activeTab === 'NETWORKS' && (
                                <NetworkModule 
                                    activeNetwork={activeNetwork} 
                                    setNetwork={setNetwork} 
                                    customRpcUrl={customRpcUrl} 
                                    setCustomRpcUrl={setCustomRpcUrl} 
                                />
                            )}

                            {activeTab === 'CONTACTS' && (
                                <ContactsModule />
                            )}

                            {activeTab === 'ADVANCED' && (
                                <AdvancedModule address={address} activeNetwork={activeNetwork} />
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function GeneralModule({ displayCurrency, setDisplayCurrency }: any) {
    const [language, setLanguage] = useState('en');
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Currency Conversion</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Select your preferred fiat currency for displaying portfolio values.</p>
                <select 
                    value={displayCurrency} 
                    onChange={e => setDisplayCurrency(e.target.value)}
                    className="w-full p-4 rounded-lg border border-zinc-200 bg-white outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-[13px] font-medium"
                >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - United States Dollar</option>
                    <option value="BTC">BTC - Bitcoin</option>
                </select>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Primary Language</h3>
                <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full p-4 rounded-lg border border-zinc-200 bg-white outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-[13px] font-medium"
                >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
        </div>
    );
}

function SecurityModule({ passwordHash, setupPassword, lockVault, privateKey, mnemonic }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [showPk, setShowPk] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    if (!passwordHash) {
        return (
            <div className="space-y-6">
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-6">
                    <h3 className="text-[12px] font-black uppercase tracking-widest mb-2 text-amber-900">Vault Unlocked</h3>
                    <p className="text-[11px] mb-6 text-amber-800 leading-relaxed">Your keys are currently unencrypted in memory. Create a local password to secure your cryptographic vault.</p>
                    <input 
                        type="password" 
                        placeholder="Enter new password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="w-full border border-amber-300 rounded-lg px-4 py-3 text-[13px] mb-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" 
                    />
                    <button 
                        onClick={() => { setupPassword(newPassword); toast.success("Vault Secured"); }} 
                        disabled={!newPassword || newPassword.length < 8} 
                        className="w-full bg-amber-600 text-white rounded-lg text-[11px] font-black uppercase tracking-widest py-3 hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        Secure Vault
                    </button>
                    {newPassword && newPassword.length < 8 && <p className="text-[10px] text-amber-700 mt-2">Password must be at least 8 characters.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-900 mb-1">Vault Secured</h3>
                    <p className="text-[11px] text-emerald-800">Your keys are encrypted.</p>
                </div>
                <button 
                    onClick={lockVault} 
                    className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-lg px-6 py-3 hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                    Lock Session
                </button>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Backup Your Secrets</h3>
                
                <div className="space-y-4">
                    {privateKey && (
                        <div className="border border-zinc-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">Private Key</span>
                                <button 
                                    onClick={() => setShowPk(!showPk)} 
                                    className="text-[10px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-800"
                                >
                                    {showPk ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            {showPk ? (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-[11px] font-mono break-all text-zinc-800 selection:bg-blue-100">{privateKey}</div>
                            ) : (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-[12px] tracking-[0.4em] text-center text-zinc-400">••••••••••••••••••••••••••••••••••••••••</div>
                            )}
                        </div>
                    )}

                    {mnemonic && (
                        <div className="border border-zinc-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">Recovery Phrase</span>
                                <button 
                                    onClick={() => setShowMnemonic(!showMnemonic)} 
                                    className="text-[10px] uppercase font-bold tracking-widest text-blue-600 hover:text-blue-800"
                                >
                                    {showMnemonic ? 'Hide' : 'Reveal'}
                                </button>
                            </div>
                            {showMnemonic ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {mnemonic.split(' ').map((word: string, i: number) => (
                                        <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-center">
                                            <span className="text-[11px] font-mono text-zinc-800">{i+1}. {word}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {Array.from({ length: 12 }).map((_idx, i) => (
                                        <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-center text-zinc-400 text-[10px] tracking-widest">••••</div>
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
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Active Network</h3>
                <div className="space-y-3">
                    {Object.entries(NETWORKS).map(([id, net]) => {
                        const isActive = activeNetwork === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setNetwork(id as NetworkId)}
                                className={`w-full p-4 text-left flex items-center justify-between rounded-xl border transition-all ${
                                    isActive ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white hover:border-zinc-300'
                                }`}
                            >
                                <span className={`text-[12px] font-bold ${isActive ? 'text-white' : 'text-zinc-700'}`}>{net.name}</span>
                                <span className={`text-[10px] font-mono ${isActive ? 'text-zinc-300' : 'text-zinc-400'}`}>Chain ID: {net.chainId}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Custom RPC URL</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Override the default provider endpoint for the active network.</p>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="https://mainnet.infura.io/v3/..."
                        value={rpcInput}
                        onChange={e => setRpcInput(e.target.value)}
                        className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[12px] font-mono outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                    />
                    <div className="flex gap-3">
                        <button 
                            onClick={handleSaveRPC} 
                            className="flex-1 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest py-3 hover:bg-zinc-800 transition-colors"
                        >
                            Save RPC
                        </button>
                        <button 
                            onClick={() => { setRpcInput(''); setCustomRpcUrl(null); }} 
                            className="px-6 border border-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactsModule() {
    const [contacts, setContacts] = useState<Record<string, string>>({});
    const [newContactName, setNewContactName] = useState('');
    const [newContactAddress, setNewContactAddress] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('wallet_contacts');
            if (saved) setContacts(JSON.parse(saved));
        } catch (e) {}
    }, []);

    const saveContacts = (updated: Record<string, string>) => {
        setContacts(updated);
        localStorage.setItem('wallet_contacts', JSON.stringify(updated));
    };

    const handleAdd = () => {
        if (!newContactName || !newContactAddress) return;
        if (!newContactAddress.startsWith('0x') || newContactAddress.length !== 42) {
            toast.error("Invalid EVM Address");
            return;
        }
        saveContacts({ ...contacts, [newContactName]: newContactAddress });
        setNewContactName('');
        setNewContactAddress('');
        toast.success("Contact saved");
    };

    const handleRemove = (name: string) => {
        const updated = { ...contacts };
        delete updated[name];
        saveContacts(updated);
        toast.success("Contact removed");
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Address Book</h3>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-6">
                    <h4 className="text-[11px] font-bold text-zinc-700 mb-3">Add Contact</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" placeholder="Name (e.g. Satoshi)" 
                            value={newContactName} onChange={e => setNewContactName(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 text-[12px] outline-none focus:border-zinc-900"
                        />
                        <input 
                            type="text" placeholder="0x..." 
                            value={newContactAddress} onChange={e => setNewContactAddress(e.target.value)}
                            className="flex-[2] px-4 py-3 rounded-lg border border-zinc-200 text-[12px] font-mono outline-none focus:border-zinc-900"
                        />
                        <button 
                            onClick={handleAdd}
                            className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-bold text-[11px] hover:bg-zinc-800 transition-colors whitespace-nowrap"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {Object.entries(contacts).length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-[12px]">
                            No contacts saved.
                        </div>
                    ) : (
                        Object.entries(contacts).map(([name, addr]) => (
                            <div key={name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-200 rounded-xl gap-4 hover:border-zinc-300">
                                <div>
                                    <div className="text-[13px] font-bold text-zinc-900">{name}</div>
                                    <div className="text-[11px] font-mono text-zinc-500 mt-1">{addr}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(addr); toast.success("Copied address"); }}
                                        className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold uppercase hover:bg-zinc-50"
                                    >
                                        Copy
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(name)}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-md text-[10px] font-bold uppercase hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function AdvancedModule({ address, activeNetwork }: { address: string | null, activeNetwork: string }) {
    const handleDownloadLogs = () => {
        const logs = {
            timestamp: new Date().toISOString(),
            address,
            activeNetwork,
            userAgent: navigator.userAgent
        };
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ledger-state-logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("State Logs Downloaded");
    };

    const handleClearData = () => {
        if (confirm("Are you sure? This will clear all local activity, contacts, and preferences. Your keys will remain in your vault.")) {
            localStorage.removeItem('wallet_contacts');
            localStorage.removeItem('sys_set_currency');
            toast.success("Local data cleared");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Advanced State Management</h3>
                
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-zinc-200 rounded-xl gap-4">
                        <div>
                            <div className="text-[12px] font-bold text-zinc-900">State Logs</div>
                            <div className="text-[11px] text-zinc-500 mt-1">Download diagnostic logs for debugging connection issues.</div>
                        </div>
                        <button 
                            onClick={handleDownloadLogs}
                            className="px-6 py-3 bg-zinc-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors whitespace-nowrap"
                        >
                            Download
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-red-200 bg-red-50/50 rounded-xl gap-4">
                        <div>
                            <div className="text-[12px] font-bold text-red-900">Clear Activity & Data</div>
                            <div className="text-[11px] text-red-700/70 mt-1">Reset all local preferences and caches (does not delete keys).</div>
                        </div>
                        <button 
                            onClick={handleClearData}
                            className="px-6 py-3 border border-red-200 text-red-600 bg-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

