"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, Shield, Key } from "lucide-react";
import { useSignMessage, useAccount } from "wagmi";

export function ZkKYBVault() {
  const [stage, setStage] = useState<"IDLE" | "UPLOADING" | "VERIFYING" | "MINTING" | "COMPLETED">("IDLE");

  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !address || stage !== "IDLE") return;

    try {
      setStage("UPLOADING");
      const formData = new FormData();
      formData.append('document', file);
      formData.append('address', address);

      const uploadRes = await fetch('/api/oracle/kyb-upload', {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      
      setStage("VERIFYING");
      const verifyData = await uploadRes.json();
      
      setStage("MINTING");
      
      const mintMessage = `[ZK business verify]\nMint corporate SBT for ${address}\nDocument hash: ${verifyData.hash ?? '0x0'}`;
      let signature = "";
      
      const { useSystemAccount } = await import('@/hooks/useSystemAccount');
      const { useWalletStore } = await import('@/lib/store/wallet-store');
      const isLocalSystemWallet = useSystemAccount.getState?.().isLocalSystemWallet || (typeof window !== 'undefined' && !!localStorage.getItem('system_vault'));
      
      if (isLocalSystemWallet) {
          const wallet = await useWalletStore.getState().getConnectedWallet();
          if (wallet) {
              signature = await wallet.signMessage(mintMessage);
          } else {
              throw new Error("No local wallet found");
          }
      } else {
          signature = await signMessageAsync({ message: mintMessage });
      }

      // Save seed to prevent double-signing in Whale Chat
      const existingSeed = localStorage.getItem(`whale_chat_seed_${address.toLowerCase()}`);
      if (!existingSeed) {
        const { keccak256 } = await import('viem');
        localStorage.setItem(`whale_chat_seed_${address.toLowerCase()}`, keccak256(signature as `0x${string}`));
      }

      const mintRes = await fetch('/api/oracle/kyb-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });
      if (!mintRes.ok) throw new Error("Mint failed");

      setStage("COMPLETED");
    } catch (err) {
      setStage("IDLE");
    }
  };

  return (
    <div className="bg-white border border-black/5 rounded-[24px] p-8 text-[#050505] font-sans relative overflow-hidden shadow-sm flex flex-col h-full">
      {/* Abstract light mode background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[14px] font-black uppercase tracking-widest text-[#050505]">Institutional KYB Vault</h2>
            <p className="text-[10px] text-black/40 uppercase tracking-[0.2em] mt-1">Zk-Proof Corporate Identity Protocol</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
            <Key size={16} className="text-emerald-600" />
          </div>
        </div>

        <div className="mb-6 bg-[#FFFFFF] rounded-xl p-4 border border-black/5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/60 mb-2">Operation Manual</h4>
            <p className="text-[11px] text-black/50 leading-relaxed">
              1. Drag and drop your official Articles of Incorporation or Proof of Address into the vault.<br/>
              2. The cryptographic oracle encrypts and verifies the payload on-chain.<br/>
              3. Approve the Web3 signature to mint your non-transferable Corporate SBT.<br/>
              4. All source files are destroyed immediately post-verification.
            </p>
        </div>

        <div className="w-full flex-1 min-h-[250px] rounded-2xl border-2 border-dashed border-black/10 bg-[#FFFFFF] flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          
          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.label key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center cursor-pointer">
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg" />
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-50 transition-all border border-black/5">
                   <UploadCloud size={20} className="text-black/60 group-hover:text-emerald-600 transition-colors" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#050505]">Upload Corporate Docs</span>
                <span className="text-[9px] text-black/40 tracking-wider mt-2 max-w-[200px] text-center">Click or drop files here</span>
              </motion.label>
            )}

            {stage === "UPLOADING" && (
              <motion.div key="uploading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center">
                <FileText size={24} className="text-black/40 animate-bounce mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#050505]">Encrypting Payload...</span>
              </motion.div>
            )}

            {stage === "VERIFYING" && (
              <motion.div key="verifying" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
                <div className="w-full max-w-[200px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Cryptographic Oracle</span>
                    <span className="text-[9px] text-emerald-600">Verifying</span>
                  </div>
                  <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "linear" }} />
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "MINTING" && (
              <motion.div key="minting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center">
                <Key size={24} className="text-emerald-500 mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Minting Zk-SBT...</span>
              </motion.div>
            )}

            {stage === "COMPLETED" && (
              <motion.div key="completed" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">KYB Attestation Issued</span>
                <span className="text-[9px] text-black/40 tracking-wider mt-2 max-w-[250px]">Zero-knowledge proof saved to wallet. Source files permanently destroyed.</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
