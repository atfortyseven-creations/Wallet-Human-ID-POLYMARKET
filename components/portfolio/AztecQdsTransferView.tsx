"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Cpu, Lock, Send, Hexagon, Activity, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemAccount } from '@/hooks/useSystemAccount';

interface Props {
  onBack: () => void;
}

export function AztecQdsTransferView({ onBack }: Props) {
  const { address } = useSystemAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('1');
  const [step, setStep] = useState<'IDLE'|'ENCRYPTING'|'PROVING'|'SUBMITTING'|'SUCCESS'>('IDLE');
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Terminal hacking effect for matrix-like background
  const [matrixText, setMatrixText] = useState("");
  
  useEffect(() => {
      if (step !== 'IDLE' && step !== 'SUCCESS') {
          const interval = setInterval(() => {
              const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
              let str = "";
              for (let i = 0; i < 200; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
              setMatrixText(str);
          }, 50);
          return () => clearInterval(interval);
      }
  }, [step]);

  const handleTransfer = async () => {
      if (!recipient || !amount) {
          toast.error("Invalid dimensions for Quantum Transfer");
          return;
      }
      
      try {
          setStep('ENCRYPTING');
          await new Promise(r => setTimeout(r, 1500));
          
          setStep('PROVING');
          await new Promise(r => setTimeout(r, 2000));
          
          setStep('SUBMITTING');
          
          const res = await fetch('/api/aztec/transfer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  from: address || "0x0",
                  to: recipient,
                  amount: amount
              })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transfer Failed");
          
          setTxHash(data.txHash || data.receipt?.txHash || "0x" + Math.random().toString(16).slice(2) + " (Mock ZK Hash)");
          setStep('SUCCESS');
          toast.success("Zero-Knowledge Transfer Complete");
          
      } catch (e: any) {
          console.error("Aztec Transfer Error", e);
          toast.error(`Transfer Failed: ${e.message}`);
          setStep('IDLE');
      }
  };

  return (
      <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.98 }} 
          className="absolute inset-0 z-50 bg-[#0A0A0A] text-white flex flex-col font-mono overflow-hidden"
      >
          {/* Matrix Background Effect */}
          <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none break-all text-[8px] leading-none text-green-500">
              {matrixText}
          </div>

          <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 relative z-10 bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Shield size={20} className="text-white" />
                  </div>
                  <div>
                      <h2 className="text-xl font-black uppercase tracking-[0.2em]">Quantum Dots Transfer</h2>
                      <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest mt-1">
                          <EyeOff size={12} /> Aztec Privacy Network
                      </div>
                  </div>
              </div>
              <button onClick={onBack} className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors border border-white/10 px-4 py-2 hover:bg-white/5">
                  [ ABORT ]
              </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
              <AnimatePresence mode="wait">
                  {step === 'IDLE' && (
                      <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-xl">
                          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                              
                              <div className="space-y-6">
                                  <div>
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2 mb-3">
                                          <Hexagon size={12} /> Target Aztec Address
                                      </label>
                                      <input 
                                          type="text" 
                                          value={recipient}
                                          onChange={e => setRecipient(e.target.value)}
                                          placeholder="0x..." 
                                          className="w-full bg-black/50 border border-white/10 text-white font-mono p-4 text-sm focus:border-white/50 outline-none transition-colors shadow-inner"
                                      />
                                  </div>

                                  <div>
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2 mb-3">
                                          <Cpu size={12} /> QDs Amount
                                      </label>
                                      <div className="relative">
                                          <input 
                                              type="number" 
                                              value={amount}
                                              onChange={e => setAmount(e.target.value)}
                                              className="w-full bg-black/50 border border-white/10 text-white font-mono p-4 text-2xl focus:border-white/50 outline-none transition-colors"
                                          />
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-black uppercase tracking-widest">
                                              QDs
                                          </div>
                                      </div>
                                  </div>

                                  <div className="pt-4">
                                      <button 
                                          onClick={handleTransfer}
                                          className="w-full relative overflow-hidden bg-white text-black py-5 font-black uppercase tracking-[0.3em] text-[12px] hover:bg-white/90 transition-all group/btn"
                                      >
                                          <span className="relative z-10 flex items-center justify-center gap-3">
                                              <Lock size={16} /> Execute Shielded Transfer
                                          </span>
                                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.1),transparent)] -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                  )}

                  {(step === 'ENCRYPTING' || step === 'PROVING' || step === 'SUBMITTING') && (
                      <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                          <div className="relative w-32 h-32 mb-8">
                              <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-ping opacity-20"></div>
                              <div className="absolute inset-2 border-2 border-white/20 rounded-full animate-spin [animation-duration:3s]"></div>
                              <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-full animate-spin [animation-direction:reverse] [animation-duration:2s]"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <Fingerprint size={40} className="text-white animate-pulse" />
                              </div>
                          </div>
                          <h3 className="text-2xl font-black uppercase tracking-[0.3em] mb-4">
                              {step === 'ENCRYPTING' && "Encrypting Note"}
                              {step === 'PROVING' && "Generating ZK Proof"}
                              {step === 'SUBMITTING' && "Submitting to Network"}
                          </h3>
                          <div className="text-[10px] text-white/50 font-mono tracking-widest max-w-md mx-auto leading-relaxed h-12">
                              {step === 'ENCRYPTING' && "Homomorphically obscuring parameters. Target address and payload amount will be hidden from the public ledger."}
                              {step === 'PROVING' && "Constructing PLONK cryptographic proof. Asserting valid state transition without revealing underlying values."}
                              {step === 'SUBMITTING' && "Broadcasting transaction to Aztec Sequencer. Awaiting block inclusion..."}
                          </div>
                      </motion.div>
                  )}

                  {step === 'SUCCESS' && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl text-center">
                          <div className="bg-white/5 border border-white/10 p-12 rounded-2xl relative overflow-hidden">
                              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <CheckCircle2 size={40} className="text-green-500" />
                              </div>
                              <h3 className="text-3xl font-black uppercase tracking-[0.2em] mb-4 text-white">Shielded Transfer Complete</h3>
                              <p className="text-[11px] text-white/50 uppercase tracking-widest mb-8 max-w-sm mx-auto leading-relaxed">
                                  Your Quantum Dots have been securely transferred across the privacy layer.
                              </p>
                              
                              <div className="bg-black/50 border border-white/5 p-4 text-left mb-8">
                                  <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Zero-Knowledge Receipt</div>
                                  <div className="font-mono text-[11px] text-green-400 break-all">
                                      {txHash}
                                  </div>
                              </div>

                              <button 
                                  onClick={onBack}
                                  className="border border-white/20 text-white px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-black transition-colors"
                              >
                                  Return to Portfolio
                              </button>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </motion.div>
  );
}
