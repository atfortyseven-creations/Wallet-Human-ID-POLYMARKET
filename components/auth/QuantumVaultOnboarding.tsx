"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/store/wallet-store";
import { encryptWithPassword, tryDecryptAny } from "@/lib/wallet-security";
import { useSystemConnect } from "@/hooks/useSystemConnect";
import { Lock, Hash, Wallet, EyeOff, Eye, UserPlus, Fingerprint } from "lucide-react";
import { WalletQRMatrix, useIlluminationOrder } from "@/components/ui/WalletQRMatrix";
import { OptimizedLocalLottie } from "@/components/landing/OptimizedLocalLottie";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

type OnboardingPhase = 
  | "INTRO" 
  | "UNLOCK"
  | "ENTROPY" 
  | "PROOFS" 
  | "MNEMONIC_BACKUP" 
  | "MNEMONIC_VERIFY" 
  | "VAULT_SEAL" 
  | "COMPLETE";

export function QuantumVaultOnboarding({ onComplete }: { onComplete: () => void }) {
  const { createWallet, setupPassword, importWallet, accounts, mnemonic, cloudSync } = useWalletStore();
  const { activateSystemVault } = useSystemConnect();
  
  const [phase, setPhase] = useState<OnboardingPhase>("INTRO");
  const [entropyProgress, setEntropyProgress] = useState(0);
  // Stable IDs — must NOT use Math.random() or inputs lose focus on every keystroke
  const unlockPwdId = "unlock-password-field";
  const newPwdId = "new-password-field";
  const newPwdConfirmId = "new-password-confirm-field";
  
  // Storage Check
  const [hasKeystore, setHasKeystore] = useState(false);
  const [systemAccounts, setSystemAccounts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('system_accounts');
      const parsed = stored ? JSON.parse(stored) : [];
      setSystemAccounts(parsed);
      const ks = localStorage.getItem('system_keystore');
      const vault = localStorage.getItem('system_vault_v1');
      if (parsed.length > 0 || ks || vault) {
        setHasKeystore(true);
      }
    } catch {}
  }, []);

  // Verification states
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [verificationAnswers, setVerificationAnswers] = useState<Record<number, string>>({});
  
  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // --------------------------------------------------------
  // PHASE: ENTROPY GATHERING (QUANTUM HARDWARE RESONANCE)
  // --------------------------------------------------------
  const [hardwareHex, setHardwareHex] = useState<string>("0x0000000000000000");

  // Pre-generate a stable shuffled illumination order for the QR pixel animation.
  // 1681 covers a 41×41 QR (Version 6, EC=M). Excess indices are ignored by the component.
  const illuminationOrder = useIlluminationOrder(1681);

  // Address to encode: use the store address once available.
  // BUG FIX: For first-time users, the address is not generated until the PROOFS phase,
  // causing the QR matrix to remain a skeleton. Provide a dummy address for the visual animation.
  const scanAddress = useWalletStore(s => s.address) || "0x0000000000000000000000000000000000000000";

  // SSR-safe screen size: initialise as 320 (desktop default), update after mount
  const [qrSize, setQrSize] = useState(320);
  useEffect(() => {
    const update = () => setQrSize(window.innerWidth < 640 ? 240 : 320);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    if (phase !== "ENTROPY") return;
    
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      setEntropyProgress(prev => {
        let next = prev;
        
        if (isPressing) {
          // Increase progress over 8 seconds (100% / 8000ms = 0.0125 per ms)
          next = prev + (delta * 0.0125);
          
          // Generate actual entropy while pressing
          const randomValues = new Uint8Array(8);
          window.crypto.getRandomValues(randomValues);
          const hexString = "0x" + Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
          setHardwareHex(hexString);
        } else {
          // Decay progress if released before 100% to force a continuous hold
          if (prev > 0 && prev < 100) {
            next = Math.max(0, prev - (delta * 0.03)); // Decay slightly slower to match 8s scale
          }
        }

        if (next >= 100 && prev < 100) {
          setTimeout(() => setPhase("PROOFS"), 1200); // 1.2s delay to admire the flawless full QR before Transaction Complete Lottie
          return 100;
        }
        
        return Math.min(100, next);
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, isPressing]);

  // --------------------------------------------------------
  // PHASE: CORE PROOFS (Complex operations)
  // --------------------------------------------------------
  useEffect(() => {
    if (phase === "PROOFS") {
      let isSubscribed = true;
      const runProofs = async () => {
        await new Promise(r => setTimeout(r, 1000));
        if (!isSubscribed) return;
        
        createWallet();
        // Transaction Complete.json takes exactly ~3-4 seconds to look perfect.
        await new Promise(r => setTimeout(r, 3800));
        if (!isSubscribed) return;
        
        setPhase("MNEMONIC_BACKUP");
      };
      runProofs();
      return () => { isSubscribed = false; };
    }
  }, [phase, createWallet]);

  // --------------------------------------------------------
  // MNEMONIC SETUP
  // --------------------------------------------------------
  useEffect(() => {
    if ((phase === "MNEMONIC_BACKUP" || phase === "MNEMONIC_VERIFY") && mnemonic) {
      const words = mnemonic.split(" ");
      setSeedWords(words);
      
      if (verificationIndices.length === 0) {
        const indices = new Set<number>();
        while(indices.size < 3) {
          indices.add(Math.floor(Math.random() * 12));
        }
        setVerificationIndices(Array.from(indices).sort((a,b) => a - b));
      }
    }
  }, [phase, mnemonic, verificationIndices.length]);

  const verifyMnemonic = () => {
    // Guard: if seedWords haven't loaded yet, skip
    if (seedWords.length === 0 || verificationIndices.length === 0) return;
    let isValid = true;
    for (const index of verificationIndices) {
      if ((verificationAnswers[index] ?? '').toLowerCase().trim() !== seedWords[index]) {
        isValid = false;
        break;
      }
    }
    
    if (isValid) {
      setPhase("VAULT_SEAL");
    } else {
      toast.error("Verification Failed", { description: "One or more words are incorrect." });
    }
  };

  // --------------------------------------------------------
  // VAULT SEALING
  // --------------------------------------------------------
  const sealVault = async () => {
    const cleanPassword = password.trim();
    if (cleanPassword.length < 8) {
      toast.error("Security Requirement", { description: "Password must be at least 8 characters." });
      return;
    }
    if (cleanPassword !== confirmPassword.trim()) {
      toast.error("Mismatch", { description: "Passwords do not match." });
      return;
    }

    // BUG FIX: Don't transition to COMPLETE until the async vault sealing succeeds.
    // Moved setPhase("COMPLETE") below after successful encryption.
    setupPassword(cleanPassword);

    try {
      const state = useWalletStore.getState();
      const walletMnemonic = state.mnemonic;
      const walletAddress  = state.address;
      const walletPk       = state.privateKey;

      if (walletMnemonic && walletAddress) {
        const encryptedBlob = await encryptWithPassword(walletMnemonic, cleanPassword);

        const newAccount = {
          id: Date.now().toString(),
          name: `Wallet ${systemAccounts.length + 1}`,
          address: walletAddress,
          encryptedBlob,
          createdAt: Date.now(),
        };

        const existing = JSON.parse(localStorage.getItem('system_accounts') || '[]');
        const updated  = [...existing.filter((a: any) => a.address !== walletAddress), newAccount];
        localStorage.setItem('system_accounts', JSON.stringify(updated));
        localStorage.setItem('system_keystore', encryptedBlob);

        if (walletPk) {
          try {
            await activateSystemVault(walletPk, walletAddress);
          } catch {}

          try {
            const resp = await fetch('/api/auth/system-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ address: walletAddress }),
            });
            if (resp.ok) {
              await cloudSync().catch(() => {});
            }
          } catch {}
        }
      }
    } catch (err: any) {
      // Vault sealing failed — stay on VAULT_SEAL so user can retry
      toast.error("Vault Error", { description: "Could not seal vault. Please try again." });
      return;
    }

    // Only transition to COMPLETE after all crypto work succeeded.

    // CRITICAL FIX 1: Clear any leftover disconnect guard from a previous logout.
    // Without this, useSystemAccount sees the guard and forces-disconnects the new session.
    try {
      localStorage.removeItem('__disconnected__');
      sessionStorage.removeItem('__disconnected__');
    } catch {}

    // CRITICAL FIX 2: Write the wallet address to sessionStorage so useSystemAccount
    // (Priority 1b) can restore the session on the very first render after redirect.
    // Previously only portfolio_unlocked was set — address was missing, breaking the restore.
    try {
      sessionStorage.setItem('portfolio_unlocked', 'true');
      sessionStorage.setItem('system_wallet_addr', walletAddress.toLowerCase());
    } catch {}

    // CRITICAL FIX 3: Write system_session_v2 to localStorage for cross-tab and
    // page-refresh recovery (7 days). Without this, a refresh after sign-up loses the session.
    try {
      const sessionV2 = {
        wallet: walletAddress.toLowerCase(),
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      localStorage.setItem('system_session_v2', JSON.stringify(sessionV2));
    } catch {}

    setPhase("COMPLETE");
    setTimeout(() => {
      onComplete();
    }, 4500); // Wait for the lottie
  };

  // --------------------------------------------------------
  // UNLOCK EXISTING VAULT
  // --------------------------------------------------------
  const handleUnlock = async () => {
    const cleanPassword = password.trim();
    if (!cleanPassword) return;

    let targetBlob = '';
    let targetAccount = systemAccounts[0];
    let isLegacyVault = false;

    if (targetAccount) {
      targetBlob = targetAccount.encryptedBlob;
      if (targetAccount.id === 'legacy-1' && !localStorage.getItem('system_keystore') && localStorage.getItem('system_vault_v1')) {
        isLegacyVault = true;
      }
    } else {
      const ks = localStorage.getItem('system_keystore');
      const vault = localStorage.getItem('system_vault_v1');
      if (ks) targetBlob = ks;
      else if (vault) { targetBlob = vault; isLegacyVault = true; }
    }

    if (!targetBlob) {
      toast.error('Wallet data missing');
      return;
    }

    setIsDecrypting(true);
    await new Promise(r => setTimeout(r, 60));

    try {
      let pk: string | null = null;
      let addr: string | null = null;

      if (!isLegacyVault) {
        const { plaintext, wasLegacy } = await tryDecryptAny(targetBlob, cleanPassword);
        let walletObj: any;
        if (wasLegacy) {
          walletObj = new ethers.Wallet(plaintext);
        } else {
          walletObj = ethers.Wallet.fromPhrase(plaintext);
        }
        pk = walletObj.privateKey;
        addr = walletObj.address;
      } else {
        const { readStoredVaultKey } = await import('@/hooks/useSystemConnect');
        const vaultPk = await readStoredVaultKey();
        if (!vaultPk) throw new Error('Vault corrupted');
        const walletObj: any = new ethers.Wallet(vaultPk);
        pk = walletObj.privateKey;
        addr = walletObj.address;
      }

      if (pk && addr) {
        importWallet(pk, 'System Main');
        try { setupPassword(cleanPassword); } catch {}

        // CRITICAL FIX: Clear disconnect guard from previous logout & persist full session
        try {
          localStorage.removeItem('__disconnected__');
          sessionStorage.removeItem('__disconnected__');
        } catch {}
        try {
          sessionStorage.setItem('portfolio_unlocked', 'true');
          sessionStorage.setItem('system_wallet_addr', addr.toLowerCase());
        } catch {}
        try {
          const sessionV2 = { wallet: addr.toLowerCase(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
          localStorage.setItem('system_session_v2', JSON.stringify(sessionV2));
        } catch {}

        try { await activateSystemVault(pk, addr); } catch {}
        try {
          const verifyResp = await fetch('/api/auth/system-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: addr })
          });
          if (verifyResp.ok) await cloudSync().catch(() => {});
        } catch {}
        
        setIsDecrypting(false);
        setPassword("");        // BUG FIX: clear password from state after unlock
        setConfirmPassword("");
        setPhase("COMPLETE");
        setTimeout(() => {
          onComplete();
        }, 4500); // Wait for the lottie
      }
    } catch (e: any) {
      setIsDecrypting(false);
      toast.error('Contraseña incorrecta');
    }
  };

  // BUG FIX: Reset all creation state when user starts a fresh wallet from INTRO
  const startNewWallet = () => {
    setEntropyProgress(0);
    setSeedWords([]);
    setVerificationIndices([]);
    setVerificationAnswers({});
    setPassword("");
    setConfirmPassword("");
    setPhase("ENTROPY");
  };

  // --------------------------------------------------------
  // RENDERERS
  // --------------------------------------------------------
  return (
    <div 
      className="w-full min-h-[100dvh] bg-transparent flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="w-full max-w-5xl px-6 md:px-12 flex flex-col items-center justify-center relative z-10 py-12">
        <AnimatePresence mode="wait">
          
          {phase === "INTRO" && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center w-full">
              <div className="w-24 h-24 border-2 border-black flex items-center justify-center mb-8 bg-white/50 backdrop-blur-md">
                <Wallet size={36} className="text-black" />
              </div>
              <h1 className="text-[34px] md:text-[56px] font-black uppercase tracking-[0.15em] text-black mb-6 drop-shadow-sm">Humanity Ledger</h1>
              <p className="text-[16px] md:text-[18px] font-medium text-black/60 max-w-lg mb-16 leading-relaxed">
                Connect your identity to the most secure on-chain wallet system.
              </p>
              
              <div className="flex flex-col gap-6 w-full max-w-md">
                {hasKeystore ? (
                  <>
                    <button 
                      onClick={() => setPhase("UNLOCK")}
                      className="group relative px-10 py-5 bg-black !text-white font-black text-[14px] uppercase tracking-[0.3em] overflow-hidden transition-transform active:scale-95 w-full flex items-center justify-center gap-3 !shadow-2xl hover:bg-black/90"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <span className="relative z-10 flex items-center gap-3 !text-white"><Lock size={18} /> Login / Unlock Wallet</span>
                    </button>
                    <button 
                      onClick={startNewWallet}
                      className="px-10 py-5 border-2 border-black text-black bg-white/50 backdrop-blur-sm font-black text-[14px] uppercase tracking-[0.3em] hover:bg-black/5 transition-colors w-full shadow-lg"
                    >
                      Create New Wallet
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={startNewWallet}
                    className="group relative px-10 py-5 bg-black !text-white font-black text-[14px] uppercase tracking-[0.3em] overflow-hidden transition-transform active:scale-95 w-full flex items-center justify-center gap-3 !shadow-2xl hover:bg-black/90"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10 flex items-center gap-3 !text-white"><UserPlus size={18} /> Create New Wallet</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {phase === "UNLOCK" && (
            <motion.div key="unlock" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full max-w-md">
              <div className="w-24 h-24 border-2 border-black bg-white/50 backdrop-blur-sm flex items-center justify-center mb-8 shadow-lg">
                <Lock size={36} className="text-black" />
              </div>
              <h2 className="text-[28px] md:text-[36px] font-black uppercase tracking-widest text-black mb-12 text-center drop-shadow-sm">Unlock Wallet</h2>
              
              <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="w-full space-y-8 mb-12">
                <input type="text" name="fakeusernameremembered" style={{ display: "none" }} />
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id={unlockPwdId}
                    name={unlockPwdId}
                    autoComplete="current-password"
                    spellCheck="false"
                    className="w-full border-b-2 border-black/20 pb-4 text-[20px] md:text-[28px] text-center font-mono font-bold text-black focus:border-black outline-none transition-colors bg-transparent tracking-widest drop-shadow-sm"
                    placeholder="ENTER PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-4 text-black/40 hover:text-black">
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </form>

              <button 
                onClick={handleUnlock}
                disabled={isDecrypting}
                className="w-full px-10 py-5 bg-black !text-white font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 !shadow-2xl"
              >
                {isDecrypting ? <span className="animate-pulse !text-white">Decrypting...</span> : <span className="!text-white">Unlock</span>}
              </button>
              
              <button 
                onClick={() => setPhase("INTRO")}
                className="mt-8 text-[12px] font-bold text-black/50 uppercase tracking-widest hover:text-black"
              >
                Back
              </button>
            </motion.div>
          )}

          {phase === "ENTROPY" && (
            <motion.div 
              key="entropy" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex flex-col items-center w-full px-2 text-center select-none"
              style={{ touchAction: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              <div 
                className={`w-32 h-32 md:w-40 md:h-40 border-4 rounded-full flex items-center justify-center mb-8 shadow-2xl cursor-pointer transition-all duration-300 ${isPressing ? 'border-black bg-black/10 scale-95' : 'border-black/20 bg-transparent scale-100 hover:border-black/50'}`}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setIsPressing(true); }}
                onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setIsPressing(false); }}
                onPointerCancel={() => setIsPressing(false)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <Fingerprint size={64} className={`transition-all duration-300 ${isPressing ? 'text-black scale-110' : 'text-black/30'}`} strokeWidth={isPressing ? 2 : 1.5} />
              </div>
              <h2 className="text-[13px] md:text-[20px] font-black uppercase tracking-widest text-black mb-2 drop-shadow-sm">Generating Secure Identity</h2>
              <p className={`text-[10px] md:text-[12px] font-mono uppercase tracking-widest mb-8 md:mb-11 transition-colors ${isPressing ? 'text-black font-bold animate-pulse' : 'text-black/50'}`}>
                {isPressing ? "Extracting quantum entropy..." : "Hold fingerprint to verify identity"}
              </p>
              
              <div className="w-full max-w-xl bg-black/5 h-1.5 mb-5 overflow-hidden rounded-full backdrop-blur-sm">
                <div className="h-full bg-black transition-all duration-75 ease-linear rounded-full" style={{ width: `${Math.min(100, entropyProgress)}%` }} />
              </div>
              
              <div className="font-mono text-[56px] md:text-[98px] font-black tracking-tighter text-black/10 tabular-nums leading-none transition-all" style={{ opacity: isPressing ? 1 : 0.5 }}>
                {Math.min(100, entropyProgress).toFixed(1)}%
              </div>
              
              <div className="mt-4 font-mono text-[10px] md:text-[14px] text-black/40 tracking-widest uppercase">
                Entropy Hash: {hardwareHex}
              </div>
              
              <WalletQRMatrix
                address={scanAddress ?? ""}
                mode="animate"
                progress={entropyProgress}
                isPressing={isPressing}
                illuminationOrder={illuminationOrder}
                size={qrSize}
                className="mt-8 mx-auto"
              />
            </motion.div>
          )}

          {phase === "PROOFS" && (
            <motion.div key="proofs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full h-full">
              <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mb-12">
                <RemoteLottie
                  path="/system-shots/Transaction Complete.json"
                  loop={false}
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-[28px] md:text-[40px] font-black uppercase tracking-widest text-black mb-4 drop-shadow-sm">Generating Identity</h2>
              <p className="text-[16px] font-mono text-black/50 uppercase tracking-widest">Compiling ZK-Proofs...</p>
            </motion.div>
          )}

          {phase === "MNEMONIC_BACKUP" && (
            <motion.div key="backup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-4xl bg-white/40 backdrop-blur-xl p-8 md:p-16 rounded-[40px] shadow-2xl border border-white/50">
              <div className="mb-16 text-center">
                <h2 className="text-[28px] md:text-[40px] font-black uppercase tracking-[0.1em] text-black mb-4 drop-shadow-sm">Secret Recovery Phrase</h2>
                <p className="text-[14px] md:text-[18px] font-bold text-red-600 uppercase tracking-widest drop-shadow-sm">CRITICAL: Write these down. Never share them. If lost, funds are permanently unrecoverable.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 mb-16">
                {seedWords.map((word, index) => (
                  <div key={index} className="flex items-center border-b-2 border-black/20 pb-4">
                    <span className="text-[14px] md:text-[16px] font-bold text-black/40 w-10 md:w-12 shrink-0">{index + 1}.</span>
                    <span className="text-[18px] md:text-[24px] font-mono font-black text-black tracking-widest drop-shadow-sm">{word}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setPhase("MNEMONIC_VERIFY")}
                  className="px-12 py-6 bg-black !text-white font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black/90 transition-colors w-full md:w-auto !shadow-2xl"
                >
                  <span className="!text-white block w-full text-center">I have securely saved these words</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === "MNEMONIC_VERIFY" && (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-3xl bg-white/40 backdrop-blur-xl p-8 md:p-16 rounded-[40px] shadow-2xl border border-white/50">
               <div className="mb-16 text-center">
                <h2 className="text-[28px] md:text-[40px] font-black uppercase tracking-[0.1em] text-black mb-4 drop-shadow-sm">Verify Backup</h2>
                <p className="text-[14px] md:text-[18px] font-bold text-black/60 uppercase tracking-widest">Confirm specific words from your phrase to proceed.</p>
              </div>

              <div className="space-y-12 mb-16">
                {verificationIndices.map((index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <label className="text-[16px] font-black uppercase tracking-widest text-black text-center md:text-left drop-shadow-sm">
                      Word #{index + 1}
                    </label>
                    <input 
                      type="text"
                      className="w-full border-b-4 border-black/20 pb-4 text-[24px] md:text-[32px] font-mono font-black text-black text-center md:text-left focus:border-black outline-none transition-colors bg-transparent placeholder:text-black/10"
                      placeholder={`Enter word #${index + 1}`}
                      value={verificationAnswers[index] || ""}
                      onChange={(e) => setVerificationAnswers(prev => ({...prev, [index]: e.target.value}))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                <button 
                  onClick={() => setPhase("MNEMONIC_BACKUP")}
                  className="text-[12px] md:text-[14px] font-bold text-black/50 uppercase tracking-widest hover:text-black"
                >
                  View Phrase Again
                </button>
                <button 
                  onClick={verifyMnemonic}
                  className="px-10 py-5 bg-black !text-white font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black/90 transition-colors w-full md:w-auto text-center !shadow-2xl"
                >
                  <span className="!text-white block w-full text-center">Verify & Proceed</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === "VAULT_SEAL" && (
            <motion.div key="seal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl bg-white/40 backdrop-blur-xl p-8 md:p-16 rounded-[40px] shadow-2xl border border-white/50">
              <div className="mb-16 text-center">
                <div className="w-24 h-24 mx-auto border-2 border-black flex items-center justify-center mb-8 bg-black shadow-lg">
                  <Lock size={36} className="text-white" />
                </div>
                <h2 className="text-[28px] md:text-[40px] font-black uppercase tracking-[0.1em] text-black mb-4 drop-shadow-sm">Set Password</h2>
                <p className="text-[14px] md:text-[18px] font-bold text-black/60 uppercase tracking-widest">Create a local password to encrypt your account on this device.</p>
              </div>

              <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="space-y-12 mb-16">
                <input type="text" name="fakeusernameremembered" style={{ display: "none" }} />
                <input type="password" name="fakepasswordremembered" style={{ display: "none" }} />
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id={newPwdId}
                    name={newPwdId}
                    autoComplete="new-password"
                    spellCheck="false"
                    className="w-full border-b-4 border-black/20 pb-4 text-[24px] md:text-[32px] font-mono font-black text-black text-center focus:border-black outline-none transition-colors bg-transparent tracking-widest drop-shadow-sm"
                    placeholder="ENTER PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-4 text-black/40 hover:text-black">
                    {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id={newPwdConfirmId}
                    name={newPwdConfirmId}
                    autoComplete="new-password"
                    spellCheck="false"
                    className="w-full border-b-4 border-black/20 pb-4 text-[24px] md:text-[32px] font-mono font-black text-black text-center focus:border-black outline-none transition-colors bg-transparent tracking-widest drop-shadow-sm"
                    placeholder="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex justify-center">
                <button 
                  onClick={sealVault}
                  className="px-12 py-6 bg-black !text-white font-black text-[14px] uppercase tracking-[0.2em] hover:bg-black/90 transition-all flex items-center justify-center gap-3 w-full md:w-auto !shadow-2xl"
                >
                  <Lock size={18} className="!text-white" /> <span className="!text-white">Complete Setup</span>
                </button>
              </div>
            </motion.div>
          )}

          {phase === "COMPLETE" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center w-full h-full">
              <div className="w-64 h-64 md:w-96 md:h-96 mx-auto pointer-events-none mb-8">
                <RemoteLottie
                  path="/system-shots/Transaction Complete.json"
                  loop={false}
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-[0.2em] text-black mb-6 drop-shadow-sm">Setup Complete</h2>
              <p className="text-[16px] md:text-[20px] font-mono text-black/50 uppercase tracking-widest">Redirecting to portfolio...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
