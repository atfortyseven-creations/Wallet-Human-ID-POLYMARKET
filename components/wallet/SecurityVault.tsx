"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers, Wallet, HDNodeWallet } from 'ethers';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, Key, Shield, Plus, Copy, Lock, Unlock } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';

export default function SecurityVault() {
    const isLocked = useWalletStore(s => s.isLocked);
    const unlockVault = useWalletStore(s => s.unlockVault);
    const mnemonic = useWalletStore(s => s.mnemonic);
    const accounts = useWalletStore(s => s.accounts);
    const address = useWalletStore(s => s.address);
    const setupPassword = useWalletStore(s => s.setupPassword);
    const switchAccount = useWalletStore(s => s.switchAccount);
    const removeAccount = useWalletStore(s => s.removeAccount);
    const [password, setPassword] = useState('');
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUnlock = async () => {
        if (!password) {
            toast.error("Enter password to unlock");
            return;
        }
        setIsProcessing(true);
        toast.loading("Decrypting...", { id: 'decrypt' });
        try {
            const success = await unlockVault(password);
            if (success) {
                toast.success("Accounts Unlocked!", { id: 'decrypt' });
                setPassword('');
            } else {
                toast.error("Incorrect password", { id: 'decrypt' });
            }
        } catch (error) {
            console.error(error);
            toast.error("Decryption failed", { id: 'decrypt' });
        } finally {
            setIsProcessing(false);
        }
    };

    const deriveNewAccount = () => {
        if (isLocked || !mnemonic) {
            toast.error("Must be unlocked and have a seed phrase");
            return;
        }
        try {
            const nextIndex = accounts.length;
            const path = `m/44'/60'/0'/0/${nextIndex}`;
            const newWallet = HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path);
            
            // Add to wallet store via setupPassword wrapper or just rely on a new store function. 
            // Wait, there's importWallet in the store to add raw keys.
            const { importWallet } = useWalletStore.getState();
            importWallet(newWallet.privateKey, `Account ${nextIndex}`);
            toast.success(`Derived Account #${nextIndex}`);
        } catch(e) {
            console.error(e);
            toast.error("Failed to derive account");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="space-y-6 text-black">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Auth Panel */}
                <div className="bg-white rounded-[32px] p-8 border border-black/10 shadow-sm">
                    {isLocked ? (
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest mb-4">Unlock</h3>
                            <div className="space-y-4">
                                <input 
                                    type="password" 
                                    placeholder="Master Password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-black/5 border border-black/10 rounded-xl p-4 outline-none focus:border-black font-mono text-sm"
                                />
                                <button 
                                    onClick={handleUnlock}
                                    disabled={isProcessing}
                                    className="w-full bg-black text-white font-black uppercase tracking-widest rounded-xl p-4 hover:bg-black/80 transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Lock className="animate-spin w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                    {isProcessing ? 'Decrypting...' : 'Unlock'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest mb-4 flex justify-between items-center">
                                Secret Recovery Phrase
                                <button onClick={() => setShowMnemonic(!showMnemonic)} className="p-2 bg-black/5 rounded-full hover:bg-black/10">
                                    {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </h3>
                            <div className="bg-black/5 border border-black/10 rounded-xl p-6 relative">
                                {showMnemonic && mnemonic ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {mnemonic.split(' ').map((word, i) => (
                                            <div key={i} className="bg-white border border-black/10 rounded-lg p-2 text-center text-xs font-mono font-bold">
                                                <span className="text-black/30 mr-2">{i+1}</span>{word}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-black/40">
                                        <Key size={32} className="mb-2 opacity-50" />
                                        <p className="text-xs uppercase tracking-widest font-black">Hidden for Security</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200">
                                NEVER share this phrase. Anyone with this phrase can steal your funds.
                            </div>
                        </div>
                    )}
                </div>

                {/* HD Accounts Panel */}
                <div className="bg-white rounded-[32px] p-8 border border-black/10 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase tracking-widest">Accounts</h3>
                    </div>

                    {isLocked ? (
                        <div className="flex-1 flex items-center justify-center text-black/30 font-mono text-sm">
                            Unlock to view accounts
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto flex-1">
                            {accounts.map((acc, idx) => (
                                <div key={acc.address} className={`flex justify-between items-center p-4 border rounded-xl group transition-colors ${acc.address === address ? 'bg-black/5 border-black/30' : 'bg-white border-black/10 hover:border-black/30'}`}>
                                    <div className="flex-1 cursor-pointer" onClick={() => switchAccount(acc.address)}>
                                        <div className="text-xs font-black uppercase tracking-widest text-black/50 mb-1 flex items-center gap-2">
                                            {acc.label || `Account ${idx}`}
                                            {acc.address === address && <span className="bg-black text-white text-[8px] px-1.5 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <div className="font-mono text-sm">{acc.address.slice(0, 8)}...{acc.address.slice(-6)}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => copyToClipboard(acc.address)}
                                            className="p-2 text-black/40 hover:text-black bg-white rounded-lg shadow-sm border border-black/10"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
            <span className="text-white/60 font-mono text-xs uppercase">{label}</span>
            <span className="text-white font-black text-xs uppercase tracking-wider">{value}</span>
        </div>
    )
}
