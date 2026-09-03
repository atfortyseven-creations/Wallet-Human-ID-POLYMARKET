import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet-store';
import { NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { toast } from 'sonner';

const TABS = [
    { id: 'GENERAL', label: 'General' },
    { id: 'ADVANCED', label: 'Advanced' },
    { id: 'CONTACTS', label: 'Contacts' },
    { id: 'SECURITY', label: 'Security & Privacy' },
    { id: 'NETWORKS', label: 'Networks' },
];

export function SettingsView({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const { 
        address, privateKey, mnemonic, passwordHash, 
        setupPassword, lockVault, activeNetwork, setNetwork, 
        customRpcUrl, setCustomRpcUrl, displayCurrency, setDisplayCurrency 
    } = useWalletStore();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:h-[600px] bg-white md:rounded-2xl md:shadow-2xl overflow-hidden flex flex-col font-sans border border-zinc-200"
        >
            {/* Header */}
            <header className="h-[60px] border-b border-zinc-100 flex items-center justify-between px-6 bg-zinc-50/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-900 leading-none">Settings</h2>
                        <p className="text-[10px] text-zinc-500 font-medium mt-1">Portfolio & Node Configuration</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
            </header>

            {/* Layout container */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-[200px] shrink-0 border-r border-zinc-100 bg-zinc-50/50 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={w-full text-left px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'GENERAL' && <GeneralModule displayCurrency={displayCurrency || 'USD'} setDisplayCurrency={setDisplayCurrency} />}
                            {activeTab === 'SECURITY' && <SecurityModule passwordHash={passwordHash} setupPassword={setupPassword} lockVault={lockVault} privateKey={privateKey} mnemonic={mnemonic} />}
                            {activeTab === 'NETWORKS' && <NetworkModule activeNetwork={activeNetwork} setNetwork={setNetwork} customRpcUrl={customRpcUrl} setCustomRpcUrl={setCustomRpcUrl} />}
                            {activeTab === 'CONTACTS' && <ContactsModule />}
                            {activeTab === 'ADVANCED' && <AdvancedModule address={address} activeNetwork={activeNetwork} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function GeneralModule({ displayCurrency, setDisplayCurrency }: any) {
    const [language, setLanguage] = useState('en');
    const [primaryCurrency, setPrimaryCurrency] = useState('fiat');
    const [theme, setTheme] = useState('system');
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Currency Conversion</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Select your preferred fiat currency for displaying portfolio values.</p>
                <select value={displayCurrency} onChange={e => setDisplayCurrency(e.target.value)} className="w-full p-4 rounded-lg border border-zinc-200 bg-white outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-[13px] font-medium">
                    <option value="USD">USD - United States Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="BTC">BTC - Bitcoin</option>
                </select>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Primary Currency</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Select native to prioritize displaying values in the native currency of the network (e.g. ETH).</p>
                <div className="flex gap-4">
                    <label className="flex items-center gap-3">
                        <input type="radio" name="primaryCurrency" value="fiat" checked={primaryCurrency === 'fiat'} onChange={() => setPrimaryCurrency('fiat')} className="accent-zinc-900" />
                        <span className="text-[13px] font-medium">Fiat</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="radio" name="primaryCurrency" value="native" checked={primaryCurrency === 'native'} onChange={() => setPrimaryCurrency('native')} className="accent-zinc-900" />
                        <span className="text-[13px] font-medium">Native</span>
                    </label>
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Current Language</h3>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-4 rounded-lg border border-zinc-200 bg-white outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-[13px] font-medium">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語 (Japanese)</option>
                </select>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Theme</h3>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-4 rounded-lg border border-zinc-200 bg-white outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-[13px] font-medium">
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
        </div>
    );
}

function SecurityModule({ passwordHash, setupPassword, lockVault, privateKey, mnemonic }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [autoLockTimer, setAutoLockTimer] = useState(5);
    const [revealMode, setRevealMode] = useState<'none' | 'mnemonic' | 'pk'>('none');
    const [authPassword, setAuthPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const savedTimer = localStorage.getItem('wallet_autolock_timer');
        if (savedTimer) setAutoLockTimer(Number(savedTimer));
    }, []);

    const handleSaveTimer = (val: number) => {
        setAutoLockTimer(val);
        localStorage.setItem('wallet_autolock_timer', val.toString());
        toast.success(Auto-lock set to  minutes);
    };

    const handleVerify = async () => {
        if (!authPassword) return;
        try {
            const { verifyPassword } = await import('@/lib/store/crypto-utils');
            const isValid = await verifyPassword(authPassword, passwordHash);
            if (isValid) {
                setIsAuthorized(true);
                toast.success('Identity verified');
            } else {
                toast.error('Incorrect password');
            }
        } catch (e) {
            toast.error('Verification failed');
        }
    };

    if (!passwordHash) {
        return (
            <div className="space-y-6">
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-6">
                    <h3 className="text-[12px] font-black uppercase tracking-widest mb-2 text-amber-900">Vault Unsecured</h3>
                    <p className="text-[11px] mb-6 text-amber-800 leading-relaxed">Protect your wallet by creating a local password. This is required before accessing sensitive keys.</p>
                    <input type="password" placeholder="New Password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-amber-300 rounded-lg px-4 py-3 text-[13px] mb-4 outline-none focus:border-amber-500" />
                    <button onClick={() => { setupPassword(newPassword); toast.success("Vault Secured"); }} disabled={!newPassword || newPassword.length < 8} className="w-full bg-amber-600 text-white rounded-lg text-[11px] font-black uppercase py-3 hover:bg-amber-700 disabled:opacity-50 transition-colors">Secure Vault</button>
                </div>
            </div>
        );
    }

    if (revealMode !== 'none') {
        return (
            <div className="space-y-6">
                <button onClick={() => { setRevealMode('none'); setIsAuthorized(false); setAuthPassword(''); }} className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 mb-2 flex items-center gap-2">← Back to Security</button>
                <div className="border border-red-200 bg-red-50 rounded-xl p-6">
                    <h3 className="text-[12px] font-black uppercase tracking-widest mb-2 text-red-900">Reveal {revealMode === 'mnemonic' ? 'Secret Recovery Phrase' : 'Private Key'}</h3>
                    <p className="text-[11px] mb-6 text-red-800 leading-relaxed">WARNING: Never disclose this key. Anyone with your keys can steal any assets held in your account.</p>
                    
                    {!isAuthorized ? (
                        <div className="space-y-4">
                            <input type="password" placeholder="Enter your local password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full border border-red-300 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-red-500" />
                            <button onClick={handleVerify} className="w-full bg-red-600 text-white rounded-lg text-[11px] font-black uppercase py-3 hover:bg-red-700 transition-colors">Verify Password</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-white border border-red-200 rounded-lg break-all font-mono text-[12px] text-zinc-900 leading-loose">
                                {revealMode === 'mnemonic' ? mnemonic : privateKey}
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(revealMode === 'mnemonic' ? mnemonic : privateKey); toast.success("Copied to clipboard"); }} className="w-full bg-white border border-red-200 text-red-700 rounded-lg text-[11px] font-black uppercase py-3 hover:bg-red-100 transition-colors">Copy to Clipboard</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-900 mb-1">Vault Secured</h3>
                    <p className="text-[11px] text-emerald-800">Your keys are encrypted locally.</p>
                </div>
                <button onClick={lockVault} className="text-[10px] font-black uppercase bg-emerald-600 text-white rounded-lg px-6 py-3 hover:bg-emerald-700 transition-colors whitespace-nowrap">Lock Session</button>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Auto-Lock Timer</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Set the idle time in minutes before MetaMask automatically locks your session.</p>
                <div className="flex items-center gap-3">
                    <input type="number" min="1" max="120" value={autoLockTimer} onChange={e => setAutoLockTimer(Number(e.target.value))} className="w-24 p-3 rounded-lg border border-zinc-200 text-[13px] outline-none focus:border-zinc-900" />
                    <span className="text-[13px] font-medium text-zinc-600">minutes</span>
                    <button onClick={() => handleSaveTimer(autoLockTimer)} className="ml-auto px-6 py-3 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-200">Save</button>
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Backup Secrets</h3>
                <div className="space-y-4">
                    <button onClick={() => setRevealMode('mnemonic')} className="w-full flex items-center justify-between p-5 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors group">
                        <div className="text-left">
                            <div className="text-[12px] font-bold text-zinc-900">Reveal Secret Recovery Phrase</div>
                            <div className="text-[11px] text-zinc-500 mt-1">12-word seed used to restore your wallet.</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-900">→</div>
                    </button>
                    <button onClick={() => setRevealMode('pk')} className="w-full flex items-center justify-between p-5 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors group">
                        <div className="text-left">
                            <div className="text-[12px] font-bold text-zinc-900">Reveal Private Key</div>
                            <div className="text-[11px] text-zinc-500 mt-1">Raw 64-character hexadecimal key for this account.</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-900">→</div>
                    </button>
                </div>
            </div>
        </div>
    );
}

function NetworkModule({ activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl }: any) {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [rpcInput, setRpcInput] = useState(customRpcUrl || '');
    const [newNetName, setNewNetName] = useState('');
    const [newChainId, setNewChainId] = useState('');
    const [newSymbol, setNewSymbol] = useState('');
    const [newExplorer, setNewExplorer] = useState('');

    const handleSaveRPC = () => {
        if (!rpcInput) return;
        try {
            if (!rpcInput.startsWith('http')) throw new Error('HTTP/HTTPS required');
            new URL(rpcInput);
            setCustomRpcUrl(rpcInput);
            toast.success("Provider Saved", { description: "Custom network provider is now active." });
            setView('list');
        } catch (err) {
            toast.error("Invalid URL");
        }
    };

    if (view === 'add') {
        return (
            <div className="space-y-6">
                <button onClick={() => setView('list')} className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 mb-2 flex items-center gap-2">← Back to Networks</button>
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Add a Network</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-2">Network Name</label>
                            <input type="text" placeholder="e.g. Polygon Mainnet" value={newNetName} onChange={e => setNewNetName(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-zinc-900" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-2">New RPC URL</label>
                            <input type="text" placeholder="https://polygon-rpc.com" value={rpcInput} onChange={e => setRpcInput(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-zinc-900" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-2">Chain ID</label>
                            <input type="text" placeholder="137" value={newChainId} onChange={e => setNewChainId(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-zinc-900" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-2">Currency Symbol</label>
                            <input type="text" placeholder="MATIC" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-zinc-900" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-700 mb-2">Block Explorer URL (Optional)</label>
                            <input type="text" placeholder="https://polygonscan.com" value={newExplorer} onChange={e => setNewExplorer(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-[13px] outline-none focus:border-zinc-900" />
                        </div>
                        <button onClick={handleSaveRPC} className="w-full bg-zinc-900 text-white rounded-lg text-[11px] font-black uppercase py-4 hover:bg-zinc-800 transition-colors mt-4">Save Custom Network</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-5">
                <h3 className="text-[12px] font-black uppercase tracking-widest">Active Networks</h3>
                <button onClick={() => setView('add')} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase">+ Add Network</button>
            </div>
            
            <div className="space-y-3">
                {Object.entries(NETWORKS).map(([id, net]) => {
                    const isActive = activeNetwork === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setNetwork(id as NetworkId)}
                            className={w-full p-4 text-left flex flex-col rounded-xl border transition-all }
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: net.color || '#ccc' }}></div>
                                    <span className={	ext-[13px] font-bold }>{net.name}</span>
                                </div>
                                {isActive && <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase">Active</span>}
                            </div>
                            <div className="mt-2 text-[11px] text-zinc-500 font-mono ml-5">
                                Chain ID: {net.chainId} {isActive && customRpcUrl && • Custom RPC}
                            </div>
                        </button>
                    );
                })}
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

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Address Book</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Build your contact list of frequently used Ethereum addresses.</p>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-6">
                    <div className="flex flex-col gap-3">
                        <input type="text" placeholder="Name (e.g. Alice)" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-[12px] outline-none focus:border-zinc-900" />
                        <input type="text" placeholder="0x..." value={newContactAddress} onChange={e => setNewContactAddress(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-[12px] font-mono outline-none focus:border-zinc-900" />
                        <button onClick={handleAdd} className="w-full py-3 bg-zinc-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-colors">Save Contact</button>
                    </div>
                </div>

                <div className="space-y-3">
                    {Object.entries(contacts).length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-[12px]">No contacts saved.</div>
                    ) : (
                        Object.entries(contacts).map(([name, addr]) => (
                            <div key={name} className="flex flex-col p-4 border border-zinc-200 rounded-xl gap-2 hover:border-zinc-300 group">
                                <div className="flex justify-between items-center">
                                    <div className="text-[13px] font-bold text-zinc-900">{name}</div>
                                    <button onClick={() => { const up = {...contacts}; delete up[name]; saveContacts(up); toast.success("Removed"); }} className="text-[10px] font-bold uppercase text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                </div>
                                <div className="text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                                    {addr}
                                    <button onClick={() => { navigator.clipboard.writeText(addr); toast.success("Copied"); }} className="text-blue-600 hover:text-blue-800">Copy</button>
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
    const [hexEnabled, setHexEnabled] = useState(false);
    const [gasControls, setGasControls] = useState(false);

    useEffect(() => {
        setHexEnabled(localStorage.getItem('wallet_hex_data') === 'true');
        setGasControls(localStorage.getItem('wallet_adv_gas') === 'true');
    }, []);

    const toggleHex = () => {
        const val = !hexEnabled;
        setHexEnabled(val);
        localStorage.setItem('wallet_hex_data', String(val));
    };

    const toggleGas = () => {
        const val = !gasControls;
        setGasControls(val);
        localStorage.setItem('wallet_adv_gas', String(val));
    };

    const handleClearData = () => {
        if (confirm("Are you sure? This will clear all local activity, pending transactions, and caches. Your keys will remain safe.")) {
            localStorage.removeItem('wallet_contacts');
            localStorage.removeItem('sys_set_currency');
            localStorage.removeItem('wallet_hex_data');
            localStorage.removeItem('wallet_adv_gas');
            toast.success("Account Reset Successful");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">Advanced Settings</h3>
                
                <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-[13px] font-bold text-zinc-900">Show Hex Data</div>
                            <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Select this to display the hex data field on the send screen.</div>
                        </div>
                        <button onClick={toggleHex} className={elative w-12 h-6 rounded-full transition-colors }>
                            <div className={bsolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform } />
                        </button>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-[13px] font-bold text-zinc-900">Advanced Gas Controls</div>
                            <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Select this to show gas price and limit controls directly on the send and confirm screens.</div>
                        </div>
                        <button onClick={toggleGas} className={elative w-12 h-6 rounded-full transition-colors }>
                            <div className={bsolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform } />
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-5">State Management</h3>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-zinc-200 rounded-xl gap-4">
                        <div>
                            <div className="text-[12px] font-bold text-zinc-900">State Logs</div>
                            <div className="text-[11px] text-zinc-500 mt-1">Download diagnostic logs for debugging.</div>
                        </div>
                        <button onClick={() => toast.success("Logs exported")} className="px-6 py-3 border border-zinc-200 text-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 whitespace-nowrap">Download</button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-red-200 bg-red-50/50 rounded-xl gap-4">
                        <div>
                            <div className="text-[12px] font-bold text-red-900">Clear Activity Tab Data</div>
                            <div className="text-[11px] text-red-700/70 mt-1">Resets account history and clears pending txs. Keys are preserved.</div>
                        </div>
                        <button onClick={handleClearData} className="px-6 py-3 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 whitespace-nowrap shadow-sm">Reset Account</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
