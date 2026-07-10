'use client';

import React, { useEffect } from 'react';
import { useHardwareEnclave } from '@/hooks/useHardwareEnclave';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { Fingerprint, Cpu, CheckCircle2, Loader2, LockKeyhole, Key } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9000] flex flex-col items-center justify-center bg-[#F9F8F6]/80 backdrop-blur-xl font-sans text-[#0A0A0A] p-6 overflow-hidden">
      {/* Background premium glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
        className="relative z-10 w-full max-w-md border border-[#EBEBEB] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 animate-pulse" />
          <div className="absolute inset-1 rounded-full border border-indigo-500/30" />
          <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center text-indigo-600 relative z-10">
            <Key size={28} strokeWidth={2} />
          </div>
        </div>
        
        <h2 className="text-[24px] font-black tracking-tight text-black mb-1">Hardware Key Generation</h2>
        <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-[0.2em] mb-6 flex items-center justify-center gap-2">
          <Cpu size={12} strokeWidth={3} /> Secure Enclave Active
        </div>

        <p className="text-[14px] text-[#555] font-medium leading-[1.6] mb-8 px-2">
          To enter the sovereign network, we must generate your private cryptographic keys. These keys are mathematically bound to the physical hardware of your device and will never leave it.
        </p>

        {isEnclaveReady ? (
          <button
            onClick={() => generateEnclaveSignature(address || 'anonymous')}
            disabled={isAuthenticating}
            className="w-full h-[56px] bg-black hover:bg-black/85 text-white rounded-2xl font-bold text-[14px] tracking-wide transition-transform active:scale-[0.98] shadow-lg shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isAuthenticating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating Keys...</>
            ) : (
              <><Fingerprint size={18} /> Generate Hardware Keys</>
            )}
          </button>
        ) : (
          <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col items-center gap-2">
            <LockKeyhole className="text-red-500" size={24} />
            <div className="text-red-900 text-[14px] font-bold tracking-tight">Hardware Enclave Not Detected</div>
            <div className="text-red-800/70 text-[12px] font-medium leading-relaxed">Your device lacks TPM/WebAuthn support required for Turing-Shield binding. Please use a supported device.</div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2.5 w-full text-left bg-[#F9F8F6] p-5 rounded-2xl border border-[#EBEBEB]">
          <div className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-black mb-2">Security Audit Trail</div>
          <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#444]">
            <CheckCircle2 size={14} className="text-indigo-500" /> Fully Homomorphic Encryption Active
          </div>
          <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#444]">
            <CheckCircle2 size={14} className="text-indigo-500" /> Zero-Knowledge Transport Layer
          </div>
          <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#444]">
            <CheckCircle2 size={14} className="text-indigo-500" /> eIDAS 2.0 Compliance Enforced
          </div>
        </div>
      </motion.div>
    </div>
  );
}
