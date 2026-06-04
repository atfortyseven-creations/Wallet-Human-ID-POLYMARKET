"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { toast } from 'sonner';

export function NukeProfile() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [isNuking, setIsNuking] = useState(false);
    
    // Safety lock typed confirmation
    const [confirmText, setConfirmText] = useState('');

    const handleNuke = async () => {
        if (!address) {
            toast.error("Wallet not connected");
            return;
        }
        
        if (confirmText !== 'NUKE') {
            toast.error("You must type NUKE to confirm.");
            return;
        }

        setIsNuking(true);
        const toastId = toast.loading("Initiating Cryptographic Termination...");

        try {
            const timestamp = Date.now();
            const message = `I want to permanently delete all my data from System Handshake. Wallet: ${address}. Timestamp: ${timestamp}`;
            
            toast.loading("Generating EIP-191 Proof of Ownership...", { id: toastId });
            
            let signature;
            try {
                signature = await signMessageAsync({ message });
            } catch (err) {
                toast.error("Signature rejected. Nuke aborted.", { id: toastId });
                setIsNuking(false);
                setStep(0);
                return;
            }

            toast.loading("Broadcasting Nuke Directive...", { id: toastId });

            const res = await fetch('/api/user/nuke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    signature,
                    timestamp
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to purge profile");
            }

            toast.success("Profile Terminated.", { id: toastId });
            
            // Render digital corpse page
            document.body.innerHTML = `
                <div style="min-height: 100vh; background: black; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; text-align: center; padding: 2rem;">
                    <div style="color: #ef4444; margin-bottom: 2rem;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; text-transform: uppercase;">Your digital corpse has been cremated.</h1>
                    <p style="color: #888888; font-size: 0.875rem; letter-spacing: 0.2em; text-transform: uppercase;">We are now entirely blind to you.</p>
                    <p style="color: #444444; font-size: 0.75rem; margin-top: 4rem;">Session Terminated. Please close this window.</p>
                </div>
            `;
            
        } catch (e: any) {
            toast.error(e.message || "Termination failed.", { id: toastId });
            setIsNuking(false);
            setStep(0);
        }
    };

    return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-[2.5rem] mt-12 mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-multiply pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                        <AlertOctagon size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-red-950 uppercase tracking-tight">Danger Zone</h3>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-1">GDPR Right to be Forgotten</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-sm text-red-900/80 font-medium mb-6 leading-relaxed max-w-2xl">
                                This action is permanent and irreversible. It will obliterate your session, erase your KYC records, and delete all telemetry associated with your wallet from our servers. 
                            </p>
                            <button 
                                onClick={() => setStep(1)}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] flex items-center gap-3"
                            >
                                <ShieldAlert size={16} /> INITIALIZE TERMINATION
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-red-200 mb-6">
                                <div className="flex gap-3 mb-4 text-red-600">
                                    <AlertTriangle size={20} className="shrink-0" />
                                    <p className="text-xs font-bold font-mono tracking-widest uppercase leading-loose">
                                        WARNING: Once executed, your KYC is purged. You will lose access to all vaults. To proceed, type "NUKE".
                                    </p>
                                </div>
                                <input 
                                    type="text" 
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    placeholder="TYPE NUKE"
                                    className="w-full bg-white border-2 border-red-200 rounded-xl px-4 py-3 text-red-900 font-mono font-black text-2xl tracking-[0.3em] outline-none focus:border-red-500 text-center"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setStep(0)}
                                    className="flex-1 px-6 py-4 bg-white border border-red-200 hover:bg-red-50 text-red-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                                >
                                    ABORT
                                </button>
                                <button 
                                    onClick={handleNuke}
                                    disabled={confirmText !== 'NUKE' || isNuking}
                                    className="flex-1 px-6 py-4 bg-red-950 hover:bg-black disabled:opacity-50 text-red-500 hover:text-red-400 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3"
                                >
                                    {isNuking ? <Loader2 size={16} className="animate-spin" /> : 'NUKE MY PROFILE - BORRAR TODOS MIS DATOS'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
