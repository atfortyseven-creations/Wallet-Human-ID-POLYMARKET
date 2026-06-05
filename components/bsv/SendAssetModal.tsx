"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Shield, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCWI } from '@/lib/bsv/CWIContext';
import { toast } from 'sonner';

interface SendAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
}

import { Transaction, P2PKH, PrivateKey } from '@bsv/sdk';
import { UtxoManager } from '@/lib/bsv/UtxoManager';

/**
 * INSTITUTIONAL SEND MODAL (Phase 34)
 * Real-world transaction building interface with 10000% SirDeggen fidelity.
 */
export const SendAssetModal = ({ isOpen, onClose, initialAddress = '' }: SendAssetModalProps) => {
  const { identity } = useCWI();
  const [address, setAddress] = useState(initialAddress);
  const [amount, setAmount] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const utxoManager = React.useMemo(() => new UtxoManager(), []);

  const handleSend = async () => {
    if (!address || !amount || !identity) {
      toast.error("Protocol Error: Missing destination, magnitude, or identity.");
      return;
    }

    setIsSigning(true);
    toast.info("Initializing Substrate Signature Chain...");

    try {
      const satoshisToSend = Math.floor(parseFloat(amount) * 100000000);
      const senderAddress = identity.getAddress();
      
      // 1. Fetch Real UTXOs
      const utxos = await utxoManager.getUtxos(senderAddress);
      
      // 2. Select Optimal UTXOs
      const selectedUtxos = utxoManager.selectUtxos(utxos, satoshisToSend);
      
      // 3. Build Transaction
      const tx = new Transaction();
      const privKey = PrivateKey.fromWif(identity.getWIF());
      const p2pkh = new P2PKH();

      // 4. Add Inputs with Unlocking Templates
      for (const u of selectedUtxos) {
        toast.info(`Fetching UTXO data for ${u.txid.slice(0, 8)}...`);
        const rawTxHex = await utxoManager.getRawTx(u.txid);
        const sourceTx = Transaction.fromHex(rawTxHex);
        
        tx.addInput({
          sourceTransaction: sourceTx,
          sourceOutputIndex: u.vout,
          unlockingScriptTemplate: p2pkh.unlock(privKey)
        } as any);
      }

      // 5. Add Recipient Output
      tx.addOutput({
        satoshis: satoshisToSend,
        lockingScript: p2pkh.lock(address)
      } as any);

      // 6. Add Change Output
      const changeAddress = identity.getChangeAddress();
      tx.addP2PKHOutput(changeAddress);

      // 7. Calculate Fees
      await tx.fee();

      // 8. Final Native Signing
      toast.info("Executing Elliptic Curve Sequence...");
      await identity.signTransaction(tx);
      
      const rawTx = tx.toHex();
      console.log('TX BUILD SUCCESS:', rawTx);
      
      // 9. Execute Broadcast
      toast.info("Broadcasting to Mainnet Nodes...");
      const txid = await utxoManager.broadcastTransaction(rawTx);
      
      toast.success(`Transaction Broadcasted Successfully! TXID: ${txid}`);
      onClose();
    } catch (e: any) {
      console.error('TX ERROR:', e);
      toast.error(`Protocol Failure: ${e.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex gap-4 items-center">
                 <div className="p-4 bg-[var(--aztec-chartreuse)] text-black rounded-3xl">
                    <Send size={24} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)]">Outbound Protocol</span>
                    <h2 className="text-3xl font-aztec-serif font-black uppercase tracking-tighter">Asset <span className="text-[var(--aztec-orchid)]">Transmission</span></h2>
                 </div>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Form Section */}
            <div className="p-12 space-y-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Destination BSV Address</label>
                <div className="relative group">
                   <input 
                     type="text" 
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="1abc...xyz"
                     className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-aztec-mono text-sm focus:border-[var(--aztec-chartreuse)]/50 focus:bg-white/[0.08] transition-all outline-none"
                   />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Transmission Magnitude (BSV)</label>
                <div className="relative flex items-center">
                   <input 
                     type="number" 
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     placeholder="0.00"
                     className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-aztec-mono text-4xl font-black focus:border-[var(--aztec-chartreuse)]/50 transition-all outline-none pr-24"
                   />
                   <span className="absolute right-8 text-xl font-black text-[var(--aztec-chartreuse)]">BSV</span>
                </div>
              </div>

              <div className="p-6 bg-[var(--aztec-orchid)]/5 border border-[var(--aztec-orchid)]/10 rounded-3xl flex gap-4">
                 <Shield size={24} className="text-[var(--aztec-orchid)] shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Institutional Auth Required</p>
                    <p className="text-[10px] text-white/40 font-aztec-mono">This transaction will be signed with BIP32 Key (m/0/0) using the ECIES substrate.</p>
                 </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="p-10 bg-white/[0.02] border-t border-white/10 flex flex-col items-center">
               <button 
                onClick={handleSend}
                disabled={isSigning}
                className={`w-full py-8 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4
                  ${isSigning ? 'bg-white/10 cursor-wait' : 'bg-white text-black hover:bg-[var(--aztec-chartreuse)] hover:scale-[1.02] active:scale-100'}
                `}
               >
                 {isSigning ? (
                   <>Executing Signature Chain...</>
                 ) : (
                   <>Initiate Transmission <ArrowRight size={18} /></>
                 )}
               </button>
               
               <div className="mt-6 flex items-center gap-2 opacity-30">
                  <Zap size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Instant Network Propagation Enabled</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
