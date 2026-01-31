"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Search, X, Loader2 } from 'lucide-react';
import { isAddress } from 'viem';

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
    
    try {
        if (!isAddress(input) && !input.endsWith('.eth')) {
            throw new Error('Invalid address or ENS');
        }
        await onAdd(input, input.slice(0, 8)); // Mock add
    } catch (e: any) {
        setError(e.message);
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
        className="w-full max-w-sm bg-[#EAEADF] rounded-3xl p-6 shadow-2xl relative"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 hover:bg-[#1F1F1F]/10 rounded-full">
            <X size={20} />
        </button>

        <h2 className="text-xl font-black text-[#1F1F1F] mb-4 flex items-center gap-2">
            <Eye className="text-[#1F1F1F]/50" />
            Watch Wallet
        </h2>

        <div className="space-y-4">
            <div>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="0x... or vitalik.eth"
                    className="w-full p-4 rounded-xl bg-white border-2 border-transparent focus:border-[#1F1F1F]/20 outline-none font-mono text-sm"
                />
                {error && <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>}
            </div>

            <button 
                onClick={handleSubmit}
                disabled={loading || !input}
                className="w-full py-4 bg-[#1F1F1F] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Track Address'}
            </button>
        </div>
      </motion.div>
    </div>
  );
}
