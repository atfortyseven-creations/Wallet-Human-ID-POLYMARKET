"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { X, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: any[];
}

export function TransferModal({ isOpen, onClose, balances }: TransferModalProps) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("ETH");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
      if (!address || !amount) return;
      
      setLoading(true);
      try {
          const res = await fetch('/api/wallet/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  to: address,
                  amount: parseFloat(amount),
                  asset,
                  network: 'ETH'
              })
          });
          
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error);

          toast.success("TRANSACTION SENT ", {
              description: "It is now visible on Etherscan.",
              action: {
                  label: "View",
                  onClick: () => window.open(data.explorerUrl, '_blank')
              }
          });
          onClose();
          
      } catch (e: any) {
          toast.error("Transaction Failed", { description: e.message });
      } finally {
          setLoading(false);
      }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-8 border-white/20">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-black mb-1">Send Crypto</h2>
                <p className="text-white/50 text-sm">Transfer assets to another wallet</p>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-white/50 uppercase ml-1">Asset</label>
                      <select 
                        value={asset}
                        onChange={(e) => setAsset(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-purple-500 transition-colors appearance-none"
                      >
                          <option value="ETH">Ethereum (ETH)</option>
                          {/* <option value="USDT">Tether (USDT)</option> */}
                      </select>
                  </div>

                  <div>
                      <label className="text-xs font-bold text-white/50 uppercase ml-1">Recipient Address</label>
                      <input 
                        type="text" 
                        placeholder="0x..." 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm outline-none focus:border-purple-500 transition-colors"
                      />
                  </div>
                  
                  <div>
                      <label className="text-xs font-bold text-white/50 uppercase ml-1">Amount</label>
                      <div className="relative">
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-xl outline-none focus:border-purple-500 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">{asset}</span>
                      </div>
                  </div>
              </div>

              <button 
                onClick={handleSend}
                disabled={loading}
                className="w-full mt-8 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Broadcasting...' : (
                    <>
                        Send Transaction <ArrowRight size={18} />
                    </>
                )}
              </button>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

