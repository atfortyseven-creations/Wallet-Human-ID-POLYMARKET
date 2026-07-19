"use client";

import React, { useState, useEffect } from 'react';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

export function SettingsView({ onBack }: { onBack: () => void }) {
    const {
        address, privateKey, mnemonic, isLocked, passwordHash,
        setupPassword, lockVault, contacts, addContact, removeContact,
        activeNetwork, setNetwork, customRpcUrl, setCustomRpcUrl,
        btcAddress, btcBalance
    } = useWalletStore();

    const [activeTab, setActiveTab] = useState<'SECURITY' | 'NETWORKS' | 'CONTACTS' | 'SESSIONS' | 'PROTOCOLS' | 'QUANTUM'>('SECURITY');
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const TABS: { id: typeof activeTab; label: string; }[] = [
        { id: 'SECURITY',  label: 'Security' },
        { id: 'NETWORKS',  label: 'Networks' },
        { id: 'CONTACTS',  label: 'Contacts' },
        { id: 'SESSIONS',  label: 'Sessions' },
        { id: 'PROTOCOLS', label: 'Protocols' },
        { id: 'QUANTUM',   label: 'Quantum Swap' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[200] w-full md:w-[700px] bg-white border-l border-black flex flex-col font-mono text-black overflow-hidden"
        >
            <header className="flex items-center justify-between px-8 py-6 border-b border-black bg-white shrink-0">
                <div>
                    <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-black leading-none">System Settings</h2>
                    {address && (
                        <p className="text-[10px] text-black mt-2 uppercase tracking-widest">
                            {address.slice(0, 10)}...{address.slice(-8)}
                        </p>
                    )}
                </div>
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                    CLOSE
                </button>
            </header>

            <div className="flex border-b border-black bg-white shrink-0 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-r border-black last:border-r-0 ${
                            activeTab === tab.id
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-black/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
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
                            <ContactsModule
                                contacts={contacts}
                                addContact={addContact}
                                removeContact={removeContact}
                            />
                        )}
                        {activeTab === 'SESSIONS' && <SessionsModule />}
                        {activeTab === 'PROTOCOLS' && <ProtocolsModule />}
                        {activeTab === 'QUANTUM' && <QuantumSwapModule btcAddress={btcAddress} btcBalance={btcBalance} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="shrink-0 px-8 py-5 border-t border-black bg-white flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-black/40">
                    ABYSSAL CAPACITY ACTIVE
                </span>
                <button
                    onClick={onBack}
                    className="px-8 py-3 border border-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                >
                    ← BACK
                </button>
            </div>
        </motion.div>
    );
}

const PROTOCOL_LIST = [
    {
        id: 'PRIVACY',
        label: 'Privacy Shield',
        desc: 'Manage shielded transactions and configure your privacy settings. Control which addresses can see your activity.',
    },
    {
        id: 'ALLOWANCES',
        label: 'Allowances',
        desc: 'Review and revoke token spending permissions granted to external protocols. Keep your approvals under control.',
    },
    {
        id: 'SMART_ACCOUNT',
        label: 'Smart Account',
        desc: 'Configure account abstraction, session keys, and automated signing rules for this wallet.',
    },
    {
        id: 'DEPLOYER',
        label: 'Contract Deployer',
        desc: 'Deploy and manage smart contracts directly from your wallet across all supported networks.',
    },
    {
        id: 'CROSS_CHAIN',
        label: 'Cross Chain',
        desc: 'Bridge and transfer assets across all supported networks using native and third-party bridge protocols.',
    },
    {
        id: 'MEMPOOL',
        label: 'Transaction Monitor',
        desc: 'Monitor pending transactions, inspect the mempool, and adjust gas settings for speed and cost.',
    },
];

function ProtocolsModule() {
    const [selected, setSelected] = useState<string | null>(null);

    const proto = PROTOCOL_LIST.find(p => p.id === selected);

    if (selected && proto) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelected(null)}
                    className="text-[10px] font-black uppercase tracking-[0.2em] border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors"
                >
                    Back
                </button>

                <div className="border border-black p-8">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] mb-3">{proto.label}</h3>
                    <p className="text-[11px] tracking-widest leading-relaxed text-black/60 mb-10 uppercase">{proto.desc}</p>

                    <div className="py-14 text-center border border-black/20">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30">AVAILABLE IN NEXT RELEASE</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Core Protocols</h3>
            <div className="grid grid-cols-2 gap-4">
                {PROTOCOL_LIST.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        className="p-7 border border-black hover:bg-black hover:text-white transition-all text-left group"
                    >
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] block mb-2">{p.label}</span>
                        <span className="text-[9px] uppercase tracking-widest text-black/40 group-hover:text-white/60 block leading-relaxed">{p.desc}</span>
                    </button>
                ))}
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
            toast.success("Swap Submitted", { description: "BTC routed to ETH via the cross-chain bridge." });
            setAmount('');
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">Native Swap (BTC to ETH)</h3>
            
            <div className="border border-black p-6 space-y-4 bg-black/5">
                <div className="flex justify-between items-center border-b border-black/20 pb-4">
                    <span className="text-[10px] uppercase font-black tracking-widest">NATIVE BTC ADDRESS</span>
                    <span className="text-[11px] tracking-widest">{btcAddress || "NOT GENERATED"}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-widest">BTC BALANCE</span>
                    <span className="text-[14px] font-black">{btcBalance} BTC</span>
                </div>
            </div>

            <div className="space-y-4">
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="AMOUNT OF BTC TO SWAP"
                    className="w-full border border-black px-6 py-5 text-[14px] uppercase tracking-widest outline-none focus:bg-black focus:text-white transition-colors"
                />
                
                <button
                    onClick={handleSwap}
                    disabled={swapping || !amount}
                    className="w-full bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] py-6 hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
                >
                    {swapping ? 'ROUTING THROUGH AZTEC...' : 'EXECUTE NATIVE SWAP'}
                </button>
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
                <div className="border border-black p-6">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 text-black">VAULT UNSECURED</h3>
                    <p className="text-[10px] tracking-widest mb-6 uppercase">Define a master passphrase immediately to enforce AES-256-GCM encryption.</p>
                    <input
                        type="password"
                        placeholder="ENTER NEW PASSPHRASE"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full border border-black px-4 py-4 text-[12px] tracking-widest mb-4 outline-none focus:bg-black focus:text-white transition-colors"
                    />
                    <button
                        onClick={() => { setupPassword(newPassword); toast.success("VAULT ENCRYPTED"); }}
                        disabled={!newPassword || newPassword.length < 8}
                        className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 border border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                    >
                        INITIALIZE ENCRYPTION
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border border-black p-6 flex items-center justify-between bg-black text-white">
                <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em]">AES-256-GCM ACTIVE</p>
                </div>
                <button
                    onClick={lockVault}
                    className="text-[10px] font-black uppercase tracking-widest bg-white text-black border border-white px-6 py-3 hover:bg-black hover:text-white transition-colors"
                >
                    LOCK NOW
                </button>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">RAW ENTROPY EXPORT</h3>
                <div className="space-y-6">
                    {privateKey && (
                        <div className="border border-black p-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">ECDSA PRIVATE KEY</span>
                                <button
                                    onClick={() => setShowPk(!showPk)}
                                    className="text-[10px] uppercase font-black tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                                >
                                    {showPk ? 'HIDE' : 'REVEAL'}
                                </button>
                            </div>
                            {showPk ? (
                                <div className="border border-black p-4 text-[12px] break-all uppercase text-center font-black">
                                    {privateKey}
                                </div>
                            ) : (
                                <div className="border border-black p-4 text-[12px] tracking-[0.5em] text-center">
                                    ••••••••••••••••••••••••••••••••
                                </div>
                            )}
                        </div>
                    )}
                    {mnemonic && (
                        <div className="border border-black p-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">BIP-39 MNEMONIC</span>
                                <button
                                    onClick={() => setShowMnemonic(!showMnemonic)}
                                    className="text-[10px] uppercase font-black tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                                >
                                    {showMnemonic ? 'HIDE' : 'REVEAL'}
                                </button>
                            </div>
                            {showMnemonic ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {mnemonic.split(' ').map((word: string, i: number) => (
                                        <div key={i} className="border border-black p-3 text-center">
                                            <span className="text-[11px] font-black uppercase tracking-widest">{word}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: 12 }).map((_idx, i) => (
                                        <div key={i} className="border border-black p-3 text-center">
                                            <span className="text-[11px] tracking-widest">••••</span>
                                        </div>
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

    const handleSaveRPC = async () => {
        if (!rpcInput) return;
        try {
            if (!rpcInput.startsWith('http')) throw new Error('HTTP/HTTPS required');
            new URL(rpcInput);
            setCustomRpcUrl(rpcInput);
            toast.success("RPC ENDPOINT INJECTED");
        } catch (err: any) {
            toast.error("INVALID RPC URL");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">CONSENSUS LAYER</h3>
                <div className="space-y-4">
                    {Object.entries(NETWORKS).map(([id, net]) => {
                        const isActive = activeNetwork === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { setNetwork(id as NetworkId); }}
                                className={`w-full p-6 text-left flex items-center justify-between border transition-all ${
                                    isActive ? 'border-black bg-black text-white' : 'border-black hover:bg-black hover:text-white'
                                }`}
                            >
                                <span className="text-[12px] font-black uppercase tracking-[0.2em]">{net.name}</span>
                                <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-white/50' : 'text-black/50'}`}>CHAIN {net.chainId}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">CUSTOM RPC INJECTION</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="HTTPS://..."
                        value={rpcInput}
                        onChange={e => setRpcInput(e.target.value)}
                        className="w-full border border-black px-6 py-4 text-[11px] tracking-widest outline-none focus:bg-black focus:text-white transition-colors uppercase"
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={handleSaveRPC}
                            className="flex-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 border border-black hover:bg-white hover:text-black transition-colors"
                        >
                            INJECT NODE
                        </button>
                        <button
                            onClick={() => { setRpcInput(''); setCustomRpcUrl(null); }}
                            className="px-8 border border-black text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                        >
                            RESET
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactsModule({ contacts, addContact, removeContact }: any) {
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');

    const handleSave = () => {
        if (!ethers.isAddress(newAddress)) return toast.error("INVALID ADDRESS FORMAT");
        addContact(newName.toUpperCase(), newAddress);
        setNewName('');
        setNewAddress('');
        toast.success("ENTITY REGISTERED");
    };

    return (
        <div className="space-y-8">
            <div className="border border-black p-6 space-y-4">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4">REGISTER ENTITY</h3>
                <input
                    type="text"
                    placeholder="LABEL"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full border border-black px-6 py-4 text-[11px] tracking-widest outline-none uppercase"
                />
                <input
                    type="text"
                    placeholder="ADDRESS 0x..."
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    className="w-full border border-black px-6 py-4 text-[11px] tracking-widest outline-none uppercase"
                />
                <button
                    onClick={handleSave}
                    disabled={!newName || !newAddress}
                    className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
                >
                    COMMIT TO REGISTRY
                </button>
            </div>

            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">VERIFIED REGISTRY ({contacts.length})</h3>
                {contacts.length === 0 ? (
                    <div className="py-12 text-center border border-black">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">REGISTRY EMPTY</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contacts.map((c: any) => (
                            <div key={c.address} className="border border-black p-6 flex justify-between items-center hover:bg-black hover:text-white transition-colors group">
                                <div>
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em]">{c.name}</p>
                                    <p className="text-[10px] tracking-widest mt-2 opacity-50">{c.address}</p>
                                </div>
                                <button
                                    onClick={() => removeContact(c.address)}
                                    className="px-4 py-2 border border-black group-hover:border-white text-[10px] uppercase font-black tracking-widest"
                                >
                                    REMOVE
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SessionsModule() {
    return (
        <div className="space-y-6">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] border-b border-black pb-4 mb-6">ACTIVE SESSIONS</h3>
            <div className="py-12 text-center border border-black">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">NO EXTERNAL SESSIONS ACTIVE</span>
            </div>
        </div>
    );
}
