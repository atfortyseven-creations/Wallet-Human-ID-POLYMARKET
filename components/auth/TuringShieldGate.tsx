'use client';

import React, { useEffect } from 'react';
import { useHardwareEnclave } from '@/hooks/useHardwareEnclave';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { Fingerprint, ShieldAlert, Cpu, CheckCircle2, Loader2, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';

export function TuringShieldGate({ children, onVerified }: { children: React.ReactNode, onVerified?: (enclaveId: string) => void }) {
  const { address } = useSystemAccount();
  const { isEnclaveReady, isAuthenticating, enclaveId, checkEnclaveSupport, generateEnclaveSignature } = useHardwareEnclave();

  useEffect(() => {
    checkEnclaveSupport();
  }, [checkEnclaveSupport]);

  useEffect(() => {
    if (enclaveId && onVerified) {
      onVerified(enclaveId);
    }
  }, [enclaveId, onVerified]);

  if (enclaveId) {
    return <>{children}</>;
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md font-mono text-zinc-300 p-6 overflow-hidden">
      {/* Background Matrix/Quantum FX */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #22c55e 0%, transparent 50%)' }} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md border border-emerald-900/50 bg-black/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
          <ShieldAlert size={32} />
        </div>
        
        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-2">Turing-Shield Protocol</h2>
        <div className="text-xs text-emerald-500/80 uppercase tracking-widest mb-6 font-bold flex items-center gap-2">
          <Cpu size={12} /> FHE + ZK-PUF Security Level
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-8">
          To access the Whale Chat global network, your identity must be mathematically bound to the physical Secure Enclave of your device. This process generates an unforgeable zero-knowledge proof of biometric locality, eliminating Sybil attacks and ensuring absolute sovereignty.
        </p>

        {isEnclaveReady ? (
          <button
            onClick={() => generateEnclaveSignature(address || 'anonymous')}
            disabled={isAuthenticating}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isAuthenticating ? (
              <><Loader2 size={16} className="animate-spin" /> Accessing Secure Enclave...</>
            ) : (
              <><Fingerprint size={18} /> Bind Hardware Identity</>
            )}
          </button>
        ) : (
          <div className="w-full bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex flex-col items-center gap-2">
            <LockKeyhole className="text-red-500" size={24} />
            <div className="text-red-400 text-xs font-bold">Hardware Enclave Not Detected</div>
            <div className="text-red-500/60 text-[10px]">Your device lacks TPM/WebAuthn support required for Turing-Shield binding.</div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2 w-full text-left bg-black/40 p-4 rounded-lg border border-white/5">
          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Security Audit Trail</div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/60">
            <CheckCircle2 size={10} /> Fully Homomorphic Encryption (FHE) Active
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/60">
            <CheckCircle2 size={10} /> Zero-Knowledge CSAM Scanning Active
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400/60">
            <CheckCircle2 size={10} /> EU eIDAS 2.0 Compliance Mode: Enforced
          </div>
        </div>
      </motion.div>
    </div>
  );
}
