'use client';

import React, { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, PenTool } from 'lucide-react';
import { toast } from 'sonner';

export const EarlyAccess = () => {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [status, setStatus] = useState<'IDLE' | 'SIGNING' | 'SUCCESS'>('IDLE');

    const handleJoin = async () => {
        if (!isConnected || !address) {
            toast.error("Connect Wallet Required");
            return;
        }

        try {
            setStatus('SIGNING');

            // 1. Prepare Message (EIP-191)
            const message = `REQUESTING_PRIORITY_ACCESS\n\nProtocol: Humanid.fi\nParams: Early_Adopter_Tier\nTimestamp: ${Date.now()}\n\nWallet: ${address}`;

            // 2. Request Signature (Off-chain, Zero Gas)
            const signature = await signMessageAsync({ message });

            // 3. Submit to "Backend" (Simulated)
            console.log("Submitting Signature:", signature);
            await new Promise(r => setTimeout(r, 1500)); // Sim network

            setStatus('SUCCESS');
            toast.success("Identity Verified. You are on the list.");

        } catch (error) {
            console.error("Signature Failed:", error);
            setStatus('IDLE');
            toast.error("Signature Rejected by User");
        }
    };

    if (status === 'SUCCESS') {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-6 rounded-xl bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-center"
            >
                <ShieldCheck className="mx-auto text-[#00ff9d] mb-3" size={32} />
                <h3 className="text-xl font-bold text-white mb-1">ACCESS GRANTED</h3>
                <p className="text-sm text-[#00ff9d] font-mono">YOUR SPOT IS SECURED ON CHAIN.</p>
            </motion.div>
        );
    }

    return (
        <div className="glass p-8 rounded-xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50" />

            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Beta Access</h3>
            <p className="text-[#888899] mb-6 text-sm relative z-10">
                Sign a cryptographic proof to join the priority queue. <br />
                <span className="text-[#00f2ea]">Zero Gas Fee.</span>
            </p>

            <button
                onClick={handleJoin}
                disabled={status === 'SIGNING'}
                className="w-full py-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00f2ea] text-white font-mono uppercase tracking-widest transition-all relative z-10 flex items-center justify-center gap-3"
            >
                {status === 'SIGNING' ? (
                    <>
                        <Loader2 className="animate-spin" /> VERIFYING SIGNATURE...
                    </>
                ) : (
                    <>
                        <PenTool size={16} /> REQUEST ACCESS
                    </>
                )}
            </button>
        </div>
    );
};
