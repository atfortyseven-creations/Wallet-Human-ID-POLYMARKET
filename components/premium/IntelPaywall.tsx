"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, Shield, ArrowRight, Activity, AlertTriangle } from 'lucide-react';
import { useCWI } from '@/lib/bsv/CWIContext';
import { toast } from 'sonner';

/**
 * Enterprise INTEL PAYWALL (Pillar 2 - Phase 2)
 * -----------------------------------------
 * Institutional UI for unlocking premium blockchain analytics.
 * Requires a cryptographically verified micropayment in BSV.
 */
export const IntelPaywall = ({ intelId, onUnlock }: { intelId: string; onUnlock: (data: any) => void }) => {
    const { identity, createAction } = useCWI();
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async () => {
        if (!identity) {
            toast.error("KYC Required. Please initialize your wallet.");
            return;
        }

        setIsUnlocking(true);
        toast.info("Initializing Micropayment Substrate...");

        try {
            // 1. Create a Payment Action (5000 SATS for Premium Intel)
            // This triggers the Permission Nexus in the CWI Context
            const paymentResult = await createAction({
                type: 'INTEL_PAYMENT',
                ticker: 'BSV',
                amount: 5000,
                recipient: '1HumanIDRevenueService...xyz', // Protocol Revenue Address
                metadata: { intelId, protocol: 'System-Intel-V1.0' }
            });

            const txid = paymentResult.txid;

            // 2. Transmit Payment Proof to the Paywall API
            const res = await fetch(`/api/whale/intel/${intelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txid, address: identity.getAddress() })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Payment Verified. System Intel Unlocked.");
                onUnlock(data.intel);
            } else {
                throw new Error(data.error || "Payment Verification Failure.");
            }

        } catch (e: any) {
            console.error('Paywall Error:', e);
            toast.error(`Protocol Failure: ${e.message}`);
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group relative w-full aspect-video bg-[#0a0a0a] border border-[var(--aztec-chartreuse)]/10 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        >
            {/* Background Texture / Animated Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,43,0.02),transparent_70%)]" />
            
            {/* Lock Icon with Pulse */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[var(--aztec-chartreuse)]/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-20 h-20 bg-black border border-[var(--aztec-chartreuse)]/30 rounded-3xl flex items-center justify-center text-[var(--aztec-chartreuse)]">
                    <Lock size={32} />
                </div>
            </div>

            <div className="relative z-10 max-w-md space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)]">Premium Analytics Restricted</span>
                <h2 className="text-3xl font-bold font-aztec-serif uppercase tracking-tighter">Whale <span className="text-[var(--aztec-orchid)]">De-Masking</span> Required</h2>
                <p className="text-[11px] font-aztec-mono text-white/40 leading-relaxed mb-6">
                    This high-tier alert contains identifying metadata and historical PnL analysis. 
                    Unlocking requires an institutional micropayment.
                </p>

                <div className="flex flex-col gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUnlock}
                        disabled={isUnlocking}
                        className={`w-full py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-3 transition-all
                            ${isUnlocking ? 'bg-white/10 text-white/30 cursor-wait' : 'bg-white text-black hover:bg-[var(--aztec-chartreuse)]'}
                        `}
                    >
                        {isUnlocking ? (
                            <>Verifying Substrate Payment...</>
                        ) : (
                            <>Transmit 5,000 SATS <ArrowRight size={14} /></>
                        )}
                    </motion.button>
                    
                    <div className="flex justify-center gap-6 opacity-30">
                        <div className="flex items-center gap-2">
                            <Shield size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">AES-GCM Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap size={12} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Instant Resolution</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Warning Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-3 bg-[var(--aztec-orchid)]/5 border border-[var(--aztec-orchid)]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <AlertTriangle size={12} className="text-[var(--aztec-orchid)]" />
                <span className="text-[8px] font-black text-[var(--aztec-orchid)] uppercase tracking-widest italic">Non-Refundable Institutional Fee</span>
            </div>
        </motion.div>
    );
};
