"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Activity, CheckCircle2, Lock } from 'lucide-react';

interface AztecProverHUDProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const AztecProverHUD: React.FC<AztecProverHUDProps> = ({ isVisible, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      return;
    }

    const sequence = async () => {
      // Step 1: Initialize PXE & Read ACIR
      await new Promise(r => setTimeout(r, 600));
      setStep(1);
      
      // Step 2: Generate Witness (Private Execution)
      await new Promise(r => setTimeout(r, 800));
      setStep(2);
      
      // Step 3: Construct ZK Proof (Barretenberg Backend)
      await new Promise(r => setTimeout(r, 1200));
      setStep(3);

      // Step 4: Encrypt Logs & Emit State
      await new Promise(r => setTimeout(r, 600));
      setStep(4);

      // Finish
      await new Promise(r => setTimeout(r, 500));
      onComplete();
    };

    sequence();
  }, [isVisible, onComplete]);

  const steps = [
    { name: "Initializing PXE Context", icon: <Cpu size={14} /> },
    { name: "Generating Witness (Private Execution)", icon: <Lock size={14} /> },
    { name: "Constructing UltraPlonk ZK Proof", icon: <Activity size={14} /> },
    { name: "Emitting Encrypted Logs & State Update", icon: <Shield size={14} /> },
    { name: "Proof Verified on Aztec Network", icon: <CheckCircle2 size={14} className="text-[var(--aztec-chartreuse)]" /> }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[340px] bg-black/90 border border-[var(--aztec-orchid)]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
        >
          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[1px] bg-[var(--aztec-orchid)]/50 pointer-events-none"
          />

          <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <Cpu className="text-[var(--aztec-orchid)] animate-pulse" size={16} />
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--aztec-orchid)]">
              Noir ZK Prover 
            </h4>
          </div>

          <div className="space-y-2">
            {steps.map((s, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-2 text-[10px] font-aztec-mono transition-opacity duration-300 ${
                  step >= idx ? 'opacity-100' : 'opacity-20'
                }`}
              >
                {step > idx ? (
                  <CheckCircle2 size={14} className="text-[var(--aztec-chartreuse)]" />
                ) : step === idx ? (
                  <div className="animate-spin text-[var(--aztec-orchid)]">{s.icon}</div>
                ) : (
                  <div className="text-white/20">{s.icon}</div>
                )}
                <span className={step >= idx ? 'text-white' : 'text-white/40'}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[8px] font-aztec-mono text-white/40">
            <span>Barretenberg Backend</span>
            <span>Circuit: WhaleChat</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
