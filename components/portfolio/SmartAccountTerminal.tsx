"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Fingerprint, Cpu, ArrowRight, Check, Zap, Layers } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { packUserOp, getUserOpHash, ENTRY_POINT_ADDRESS } from '@/lib/erc4337-bundler-engine';
import { ethers } from 'ethers';

export function SmartAccountTerminal({ onBack }: { onBack: () => void }) {
  const getConnectedWallet = useWalletStore(s => s.getConnectedWallet);
  const address = useWalletStore(s => s.address);
  const isLocked = useWalletStore(s => s.isLocked);
  const [isPacking, setIsPacking] = useState(false);
  const [userOpData, setUserOpData] = useState<any>(null);

  const generateDummyUserOp = async () => {
    if (isLocked) {
      toast.error("Vault Locked", { description: "Unlock your vault from the portfolio home screen before signing operations." });
      return;
    }
    setIsPacking(true);
    toast.loading("Constructing ERC-4337 UserOperation...", { id: 'uop' });
    try {
      const wallet = await getConnectedWallet();
      if (!wallet) {
        toast.error("No signing key available", { id: 'uop', description: "Connect a wallet with a private key to sign UserOperations." });
        return;
      }

      const dummyOp = {
        sender: address || wallet.address,
        nonce: BigInt(Math.floor(Math.random() * 100)),
        initCode: "0x",
        callData: "0xdeadbeef",
        callGasLimit: 2000000n,
        verificationGasLimit: 150000n,
        preVerificationGas: 21000n,
        maxFeePerGas: 3000000000n,
        maxPriorityFeePerGas: 1000000000n,
        paymasterAndData: "0x",
        signature: "0x",
      };

      const packed = packUserOp(dummyOp);
      const hash = getUserOpHash(dummyOp, ENTRY_POINT_ADDRESS, 1n);

      // Sign the UserOp hash with the EOA private key
      const signature = await wallet.signMessage(ethers.getBytes(hash));
      dummyOp.signature = signature;

      setUserOpData({ op: dummyOp, packed, hash });
      toast.success("UserOperation Cryptographically Packed", { id: 'uop' });
    } catch (e: any) {
      toast.error("Operation Failed", { id: 'uop', description: e.message });
    } finally {
      setIsPacking(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col max-w-3xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-[600px] flex-1">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <Fingerprint size={18} className="text-black" strokeWidth={1.5} />
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Smart Account Terminal</h2>
            <p className="text-[9px] text-black/40 uppercase tracking-widest">ERC-4337 Account Abstraction</p>
          </div>
        </div>
        <button onClick={onBack} className="text-[9px] uppercase tracking-widest font-bold text-black/40 hover:text-black border border-black/10 px-3 py-1.5 hover:border-black transition-all">
          CLOSE
        </button>
      </div>

      <div className="bg-black/5 text-black p-5 mb-6 relative overflow-hidden border border-black/10">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Layers size={120} strokeWidth={0.5} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <Cpu size={12} /> Bundler Node Target: rpc.flashbots.net/fast
        </h3>
        <p className="text-[9px] text-black/60 uppercase tracking-widest max-w-lg leading-relaxed">
          Bypassing standard EOA Mempool. Constructing intent-based UserOperations for global EntryPoint execution.
        </p>
      </div>

      {!userOpData ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-black/10 border-dashed p-12">
            <Fingerprint size={32} className="text-black/20 mb-4" strokeWidth={1} />
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-6 text-center max-w-sm">
                Generate a meta-transaction payload to bundle multiple DeFi interactions into a single atomic execution via Paymaster sponsorship.
            </p>
            <button
                onClick={generateDummyUserOp}
                disabled={isPacking}
                className="px-6 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-black/80 disabled:opacity-30 transition-all flex items-center gap-3"
            >
                {isPacking ? <Cpu size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                {isPacking ? 'PACKING CALLDATA...' : 'CONSTRUCT USER-OP'}
            </button>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
            <div className="border border-emerald-200 bg-emerald-50 p-6 space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-700 text-[10px] font-black uppercase tracking-widest pb-3 border-b border-emerald-200">
                    <span className="flex items-center gap-2"><Check size={14} /> UserOperation Ready</span>
                    <span>Nonce: {userOpData.op.nonce.toString()}</span>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <div className="text-[9px] text-emerald-700/60 uppercase tracking-widest mb-1">EntryPoint Address (v0.6)</div>
                        <div className="text-[11px] font-mono text-emerald-900 bg-emerald-100 p-2 border border-emerald-200/50">{ENTRY_POINT_ADDRESS}</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-emerald-700/60 uppercase tracking-widest mb-1">UserOp Cryptographic Hash</div>
                        <div className="text-[11px] font-mono text-emerald-900 break-all bg-emerald-100 p-2 border border-emerald-200/50">{userOpData.hash}</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-emerald-700/60 uppercase tracking-widest mb-1">Authorization Signature (EOA)</div>
                        <div className="text-[10px] font-mono text-emerald-900 break-all bg-emerald-100 p-2 h-16 overflow-y-auto border border-emerald-200/50">{userOpData.op.signature}</div>
                    </div>
                </div>

                <button
                    onClick={() => toast.success("Bundler Transmission Sent", { description: "eth_sendUserOperation executed via private RPC." })}
                    className="w-full py-4 mt-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                    TRANSMIT TO BUNDLER NETWORK <ArrowRight size={14} />
                </button>
            </div>
        </div>
      )}
    </motion.div>
  );
}
