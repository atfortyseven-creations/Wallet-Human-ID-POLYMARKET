import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Fingerprint, Loader2 } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';

export function UnlockVaultScreen() {
    const { unlockVault, clearWallet } = useWalletStore();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        // Small delay to allow UI to show loading spinner before heavy synchronous decryption
        setTimeout(() => {
            unlockVault(password);
            setLoading(false);
        }, 100);
    };

    return (
        <div className="w-full h-screen bg-white text-black flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center text-center"
            >
                <div className="w-20 h-20 bg-black/5 rounded-full border border-black/10 flex items-center justify-center mb-6">
                    <Lock size={28} className="text-black/60" />
                </div>
                
                <h1 className="text-2xl font-light tracking-tight text-black mb-2">Vault Locked</h1>
                <p className="text-xs text-black/50 tracking-widest uppercase mb-8 leading-relaxed">
                    Session expired. Enter your master password to decrypt cryptographic keys into memory.
                </p>

                <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
                    <input 
                        type="password"
                        placeholder="Master Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                        className="w-full bg-black/5 border border-black/10 text-black px-4 py-4 text-center tracking-[0.2em] uppercase font-bold text-xs focus:outline-none focus:border-black/30 placeholder:text-black/30"
                    />
                    
                    <button 
                        type="submit"
                        disabled={!password || loading}
                        className="w-full bg-black text-white px-4 py-4 uppercase tracking-[0.2em] font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-black/80 transition-colors"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Fingerprint size={14} />}
                        Decrypt Vault
                    </button>
                </form>

                <div className="mt-12 pt-6 border-t border-black/10 w-full flex flex-col items-center gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-black/40">Lost your password?</p>
                    <button 
                        onClick={() => {
                            if (window.confirm("WARNING: This will permanently wipe all encrypted data from this device. You will need your Seed Phrase to recover funds. Proceed?")) {
                                clearWallet();
                            }
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                    >
                        Reset Wallet & Clear Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
