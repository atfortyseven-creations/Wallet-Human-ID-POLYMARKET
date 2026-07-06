'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Box, Database, Lock, Loader2, Server } from 'lucide-react';

interface ExplorerProps {
  passportId?: string;
  txHash?: string;
  status: 'PENDING' | 'PROVING' | 'SUBMITTING' | 'CONFIRMED' | 'FAILED';
  slug?: string;
}

export default function TestnetExplorer({ passportId, txHash, status, slug }: ExplorerProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status === 'PENDING') setActiveStep(0);
    else if (status === 'PROVING') setActiveStep(1);
    else if (status === 'SUBMITTING') setActiveStep(2);
    else if (status === 'CONFIRMED') setActiveStep(3);
    else if (status === 'FAILED') setActiveStep(4);
  }, [status]);

  const steps = [
    { id: 0, label: 'Data Registry', icon: Database, desc: 'Encrypting payload...' },
    { id: 1, label: 'ZK Proving', icon: Lock, desc: 'Generating Noir Proof on Aztec...' },
    { id: 2, label: 'Mempool Broadcast', icon: Server, desc: 'Submitting to Testnet Sequencer...' },
    { id: 3, label: 'L2 Finality', icon: ShieldCheck, desc: 'Anchored securely.' },
  ];

  return (
    <div className="w-full bg-[#0a0a0c] border border-[#2a2a30] rounded-xl overflow-hidden font-mono text-sm relative">
      {/* Background Matrix-like glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ffcc]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="p-4 border-b border-[#2a2a30] flex items-center justify-between bg-[#121216]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#00ffcc] animate-pulse" />
          <h3 className="text-white font-bold tracking-wider">AZTEC L2 TESTNET EXPLORER</h3>
        </div>
        <div className="flex gap-2 items-center text-xs">
          <span className="text-gray-500">NETWORK:</span>
          <span className="text-[#00ffcc] bg-[#00ffcc]/10 px-2 py-0.5 rounded border border-[#00ffcc]/20">v2151908</span>
        </div>
      </div>

      <div className="p-6 relative z-10">
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">PASSPORT SLUG:</span>
            <span className="text-white font-bold">{slug || 'Awaiting Input...'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">TX HASH:</span>
            <span className="text-[#00ffcc] break-all">{txHash || (status === 'FAILED' ? 'N/A' : 'Pending...')}</span>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = activeStep > index || (activeStep === 3 && index === 3);
            const isCurrent = activeStep === index;
            const isFailed = status === 'FAILED' && index === activeStep;

            return (
              <div key={step.id} className="flex gap-4 relative">
                {/* Connecting Line */}
                {index !== steps.length - 1 && (
                  <div className={`absolute left-[19px] top-10 bottom-[-24px] w-0.5 transition-colors duration-500 ${
                    isCompleted ? 'bg-[#00ffcc]' : 'bg-[#2a2a30]'
                  }`} />
                )}

                {/* Icon Bubble */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  isFailed ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  isCurrent ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.3)]' :
                  isCompleted ? 'bg-[#00ffcc] border-[#00ffcc] text-black shadow-[0_0_10px_rgba(0,255,204,0.5)]' :
                  'bg-[#121216] border-[#2a2a30] text-gray-500'
                }`}>
                  {isCurrent && !isFailed ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h4 className={`font-bold transition-colors duration-500 ${
                    isFailed ? 'text-red-500' :
                    isCurrent || isCompleted ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs mt-1 transition-colors duration-500 ${
                    isFailed ? 'text-red-400' :
                    isCurrent ? 'text-[#00ffcc]' : 'text-gray-500'
                  }`}>
                    {isFailed ? 'Transaction Failed' : step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global failure notice */}
        <AnimatePresence>
          {status === 'FAILED' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center"
            >
              System Error: Network unreachable or proof generation failed.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
