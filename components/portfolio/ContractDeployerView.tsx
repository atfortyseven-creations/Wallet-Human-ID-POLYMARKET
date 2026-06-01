"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FileCode, Play, AlertTriangle, Check, ExternalLink, Activity, Server } from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet-store';
import { deploySmartContract, isValidBytecode } from '@/lib/contract-deployer';

export function ContractDeployerView({ onBack }: { onBack: () => void }) {
  const getConnectedWallet = useWalletStore(s => s.getConnectedWallet);
  const activeNetwork = useWalletStore(s => s.activeNetwork);
  const [bytecode, setBytecode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState<{ address: string | null; hash: string; gas: bigint } | null>(null);

  const handleDeploy = async () => {
    if (!bytecode.trim()) return toast.error("Bytecode cannot be empty");
    if (!isValidBytecode(bytecode.trim())) return toast.error("Invalid EVM bytecode format");

    setIsDeploying(true);
    setResult(null);
    toast.loading("Compiling deployment transaction...", { id: 'deploy' });

    try {
      const wallet = await getConnectedWallet();
      if (!wallet) throw new Error("Wallet not connected or locked");

      toast.loading("Estimating EVM gas execution...", { id: 'deploy' });
      
      const deployment = await deploySmartContract(wallet, bytecode.trim(), [], [], 'medium');

      setResult({
        address: deployment.contractAddress,
        hash: deployment.transactionHash,
        gas: deployment.gasUsed,
      });

      toast.success("Smart Contract Deployed Successfully", { id: 'deploy' });
    } catch (e: any) {
      toast.error("Deployment Reverted", { id: 'deploy', description: e.message?.substring(0, 100) });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col max-w-3xl mx-auto w-full pt-8 px-6 pb-20 font-mono min-h-[600px] flex-1">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <FileCode size={18} className="text-black" strokeWidth={1.5} />
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Contract Deployer</h2>
            <p className="text-[9px] text-black/40 uppercase tracking-widest">Raw EVM Bytecode Injection</p>
          </div>
        </div>
        <button onClick={onBack} className="text-[9px] uppercase tracking-widest font-bold text-black/40 hover:text-black border border-black/10 px-3 py-1.5 hover:border-black transition-all">
          CLOSE
        </button>
      </div>

      <div className="bg-black/5 text-black p-5 mb-6 relative overflow-hidden border border-black/10">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Server size={120} strokeWidth={0.5} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
          <Activity size={12} /> Execution Environment: {activeNetwork.toUpperCase()}
        </h3>
        <p className="text-[9px] text-black/60 uppercase tracking-widest max-w-lg leading-relaxed">
          WARNING: Direct bytecode deployment bypasses compiler safety checks. Ensure your bytecode is properly compiled for the EVM target. Transaction `to` field will be null.
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2 block">
            Compiled Bytecode (Hex)
          </label>
          <textarea
            value={bytecode}
            onChange={(e) => setBytecode(e.target.value)}
            placeholder="0x608060405234801561001057600080fd5b506040516101163803806101168339810160405281019061003291906100..."
            className="w-full h-48 bg-black/[0.02] border border-black/10 p-4 text-[10px] font-mono outline-none focus:border-black transition-colors resize-none break-all text-black/80 placeholder:text-black/20"
            spellCheck={false}
          />
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-emerald-200 bg-emerald-50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase tracking-widest pb-3 border-b border-emerald-200">
              <Check size={14} /> Deployment Confirmed
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[9px] text-emerald-700/60 uppercase tracking-widest mb-1">Contract Address</div>
                <div className="text-[11px] font-mono text-emerald-900 break-all bg-emerald-100 p-2">{result.address}</div>
              </div>
              <div>
                <div className="text-[9px] text-emerald-700/60 uppercase tracking-widest mb-1">Transaction Hash</div>
                <div className="text-[11px] font-mono text-emerald-900 break-all bg-emerald-100 p-2">{result.hash}</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] text-emerald-700/60 uppercase tracking-widest pt-2">
              <span>Gas Consumed: {result.gas.toString()}</span>
              <a href={`https://etherscan.io/tx/${result.hash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-900">
                View Explorer <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleDeploy}
          disabled={isDeploying || !bytecode.trim()}
          className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-black/80 disabled:opacity-30 transition-all flex items-center justify-center gap-3 mt-4"
        >
          {isDeploying ? <Activity size={14} className="animate-pulse" /> : <Play size={14} fill="currentColor" />}
          {isDeploying ? 'BROADCASTING BYTECODE...' : 'DEPLOY TO BLOCKCHAIN'}
        </button>
      </div>
    </motion.div>
  );
}
