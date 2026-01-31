"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Loader2, Search, X } from 'lucide-react';
import { isAddress } from 'viem';
import { resolveENSName } from '@/lib/wallet/ens';

interface WatchOnlyInputProps {
  onAdd: (address: string, name?: string) => Promise<void>;
  onCancel: () => void;
}

export default function WatchOnlyInput({ onAdd, onCancel }: WatchOnlyInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    let address = input;
    let name = undefined;

    try {
      if (input.endsWith('.eth')) {
        const resolved = await resolveENSName(input);
        if (!resolved) throw new Error('Could not resolve ENS name');
        address = resolved;
        name = input;
      } else if (!isAddress(input)) {
        throw new Error('Invalid Ethereum address');
      }

      await onAdd(address, name);
    } catch (err: any) {
      setError(err.message || 'Failed to add wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#EAEADF] rounded-3xl p-6 shadow-2xl relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#1F1F1F]/10 transition-colors"
        >
          <X size={24} className="text-[#1F1F1F]" />
        </button>

        <div className="w-16 h-16 bg-[#1F1F1F] rounded-full flex items-center justify-center mb-6 mx-auto">
          <Eye size={32} className="text-[#EAEADF]" />
        </div>

        <h2 className="text-2xl font-black text-[#1F1F1F] text-center mb-2">Watch Wallet</h2>
        <p className="text-[#1F1F1F]/70 text-center mb-6">
          Track any wallet or ENS domain without importing keys.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1F1F1F] mb-2">Address or ENS</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/50" size={20} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="0x... or vitalik.eth"
                className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-2xl outline-none focus:bg-white/80 transition-all font-mono"
              />
            </div>
            {error && (
              <p className="text-red-600 text-xs font-bold mt-2 ml-1">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !input}
            className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Track Wallet'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
