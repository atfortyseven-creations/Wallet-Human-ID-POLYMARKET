"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Zap, CheckCircle2, Copy, MoveRight, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { encryptWithPassword } from '@/lib/wallet-security';
import { useWalletStore } from '@/lib/store/wallet-store';

interface GenerateWalletWizardProps {
  onComplete: (privateKey: string, address: string) => void;
  onCancel: () => void;
}

export function GenerateWalletWizard({ onComplete, onCancel }: GenerateWalletWizardProps) {
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState<{ address: string, privateKey: string, mnemonic: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTransactionComplete, setShowTransactionComplete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pkRevealed, setPkRevealed] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { importWallet } = useWalletStore();

  const generateIdentity = async () => {
    setIsGenerating(true);
    setLoadingProgress(0);

    const duration = 7000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setLoadingProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        const newWallet = ethers.Wallet.createRandom();
        setWallet({
          address: newWallet.address,
          privateKey: newWallet.privateKey,
          mnemonic: newWallet.mnemonic?.phrase || ""
        });

        setIsGenerating(false);
        setShowTransactionComplete(true);

        setTimeout(() => {
          setShowTransactionComplete(false);
          setStep(2);
        }, 3500);
      }
    }, interval);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} Copied`, { description: 'Keep this absolutely secure. Never share it.' });
  };

  const handleSecureAndProceed = async () => {
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!wallet) return;

    setIsEncrypting(true);
    await new Promise(r => setTimeout(r, 50));

    try {
      const encryptedBlob = await encryptWithPassword(wallet.mnemonic, password);

      let accounts: any[] = [];
      try {
        const stored = localStorage.getItem('system_accounts');
        if (stored) accounts = JSON.parse(stored);
      } catch {}

      const newAccount = {
        id: Date.now().toString(),
        name: `Wallet ${accounts.length + 1}`,
        address: wallet.address,
        encryptedBlob,
        createdAt: Date.now()
      };

      localStorage.setItem('system_accounts', JSON.stringify([...accounts, newAccount]));
      localStorage.setItem('system_keystore', encryptedBlob);
      importWallet(wallet.privateKey, 'System Main');

      try {
        sessionStorage.setItem('portfolio_unlocked', 'true');
        sessionStorage.setItem('system_wallet_addr', wallet.address.toLowerCase());
      } catch {}

      setIsEncrypting(false);
      setStep(4);
    } catch (e: any) {
      toast.error('Encryption failed', { description: e.message });
      setIsEncrypting(false);
    }
  };

  // Step progress label
  const stepLabels = ['', 'Create', 'Backup', 'Secure', 'Done'];

  return (
    /* Full-screen overlay — safe area aware */
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        /* Sheet on mobile (slides up from bottom), centered card on sm+ */
        className="w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] flex flex-col relative overflow-hidden"
        style={{ maxHeight: '95dvh' }}
      >
        {/* ── Progress bar ── */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-black/5 z-10">
          <motion.div
            className="h-full bg-black"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            {[1,2,3,4].map(n => (
              <div key={n} className={`w-2 h-2 rounded-full transition-colors ${n <= step ? 'bg-black' : 'bg-black/10'}`} />
            ))}
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">
              Step {step} / 4 — {stepLabels[step]}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Create */}
            {step === 1 && !isGenerating && !showTransactionComplete && (
              <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col items-center text-center">
                <div className="w-44 h-44 mx-auto pointer-events-none">
                  <RemoteLottie path="/system-shots/Lock Loading.json" className="w-full h-full" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2 mt-2">Create Wallet</h2>
                <p className="text-sm text-black/50 mb-8 max-w-[260px] leading-relaxed mx-auto">
                  Generate a fresh, secure non-custodial wallet instantly. Created locally, never leaves your browser.
                </p>
                <button
                  onClick={generateIdentity}
                  className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Zap size={16} /> Create Wallet
                </button>
              </motion.div>
            )}

            {/* GENERATING */}
            {isGenerating && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-6">
                <div className="w-48 h-48 mb-4">
                  <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/50 mb-6">
                  Creating your secure wallet...
                </p>
                <div className="w-full max-w-[220px] h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-[9px] text-black/30 font-mono mt-3">{Math.round(loadingProgress)}%</p>
              </motion.div>
            )}

            {/* TRANSACTION COMPLETE LOTTIE */}
            {showTransactionComplete && (
              <motion.div key="txcomplete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center text-center py-8">
                <div className="w-40 h-40 mb-4">
                  <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} speed={1.15} className="w-full h-full" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-black">Identity Created</h3>
                <p className="text-[10px] text-black/40 uppercase tracking-widest mt-2 font-bold">Cryptographic Keys Generated</p>
              </motion.div>
            )}

            {/* STEP 2 — Backup */}
            {step === 2 && wallet && (
              <motion.div key="step2" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-5 border-b border-black/5 pb-4">
                  <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <Key size={15} />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight leading-tight">Backup Required</h2>
                    <p className="text-[9px] uppercase tracking-widest text-black/40 font-bold">Absolute Ownership</p>
                  </div>
                </div>

                {/* Recovery Phrase — 2 cols on mobile, 3 on sm+ */}
                <div className="bg-black/[0.03] rounded-2xl border border-black/5 p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Recovery Phrase</span>
                    <button
                      onClick={() => copyToClipboard(wallet.mnemonic, 'Seed Phrase')}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-black transition-colors border border-black/10 px-2 py-1 rounded-lg"
                    >
                      <Copy size={11}/> Copy
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {wallet.mnemonic.split(' ').map((word, i) => (
                      <div key={i} className="bg-white rounded-xl py-2 px-3 flex gap-2 items-center border border-black/5 shadow-sm">
                        <span className="text-[9px] text-black/30 font-mono w-4 shrink-0">{i+1}</span>
                        <span className="text-xs font-bold text-black/80 truncate">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private Key */}
                <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                      <Lock size={11}/> Private Key
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPkRevealed(v => !v)}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors border border-rose-200 px-2 py-1 rounded-lg"
                      >
                        <EyeOff size={11}/> {pkRevealed ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors border border-rose-200 px-2 py-1 rounded-lg"
                      >
                        <Copy size={11}/> Copy
                      </button>
                    </div>
                  </div>
                  <div
                    className="bg-white rounded-xl py-3 px-3 border border-rose-100 shadow-sm font-mono text-[10px] text-black/70 cursor-pointer"
                    onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                  >
                    {pkRevealed
                      ? <span className="break-all">{wallet.privateKey}</span>
                      : <span className="blur-sm select-none tracking-widest">{'•'.repeat(66)}</span>
                    }
                  </div>
                </div>

                {/* Confirmation checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-black/[0.03] rounded-2xl border border-black/5">
                  <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${saved ? 'bg-black border-black' : 'border-black/20 bg-white'}`}>
                    {saved && <CheckCircle2 size={13} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={saved} onChange={e => setSaved(e.target.checked)} />
                  <span className="text-xs font-bold text-black/70 leading-snug">I have securely backed up my Recovery Phrase and Private Key offline.</span>
                </label>

                <button
                  onClick={() => setStep(3)}
                  disabled={!saved}
                  className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue to Security <MoveRight size={16} />
                </button>
              </motion.div>
            )}

            {/* STEP 3 — Encrypt */}
            {step === 3 && wallet && (
              <motion.div key="step3" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col">
                <div className="flex items-center gap-3 mb-5 border-b border-black/5 pb-4">
                  <div className="w-9 h-9 bg-black/5 text-black rounded-full flex items-center justify-center shrink-0">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight leading-tight">Secure Wallet</h2>
                    <p className="text-[9px] uppercase tracking-widest text-black/40 font-bold">AES-GCM Encryption</p>
                  </div>
                </div>

                <p className="text-sm text-black/60 mb-5 font-medium leading-relaxed">
                  Set a master password to encrypt your recovery phrase on this device. This cannot be recovered if lost.
                </p>

                <div className="space-y-3 mb-5">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New Password (8+ characters)"
                    className="w-full bg-black/[0.04] border border-black/10 rounded-2xl px-5 py-4 text-black text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-black/30"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-black/[0.04] border border-black/10 rounded-2xl px-5 py-4 text-black text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-black/30"
                  />
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1 mb-5">
                    {[1,2,3,4].map(n => (
                      <div
                        key={n}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          password.length >= n * 3
                            ? n <= 2 ? 'bg-rose-400' : n === 3 ? 'bg-amber-400' : 'bg-black'
                            : 'bg-black/10'
                        }`}
                      />
                    ))}
                    <span className="text-[9px] text-black/40 font-bold uppercase tracking-widest ml-2 self-end">
                      {password.length < 6 ? 'Weak' : password.length < 10 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-snug font-medium">
                    Without this password, you will need your 12-word phrase to restore access. There is no recovery.
                  </p>
                </div>

                <button
                  onClick={handleSecureAndProceed}
                  disabled={password.length < 8 || password !== confirmPassword || isEncrypting}
                  className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isEncrypting
                    ? <><Lock size={15} className="animate-pulse" /> Encrypting...</>
                    : <>Encrypt & Save <MoveRight size={16} /></>
                  }
                </button>
              </motion.div>
            )}

            {/* STEP 4 — Done */}
            {step === 4 && wallet && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                <div className="w-full h-48 pointer-events-none">
                  <RemoteLottie path="/system-shots/Whale Mission.json" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Wallet Secured</h2>
                <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mb-5">Your identity is now on-chain</p>

                <div className="w-full bg-black/[0.04] border border-black/5 rounded-2xl px-4 py-3 mb-8">
                  <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mb-1">Address</p>
                  <p className="text-[11px] font-mono font-bold text-black break-all leading-relaxed">{wallet.address}</p>
                </div>

                <button
                  onClick={() => onComplete(wallet.privateKey, wallet.address)}
                  className="w-full h-14 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                >
                  Enter Dashboard
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
