"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';

interface StakingProvider {
  id: string;
  name: string;
  apy: number;
  tvl: string;
  min: string;
}

const PROVIDERS: StakingProvider[] = [
  { id: 'lido', name: 'Lido', apy: 3.8, tvl: '$24B', min: '0 ETH' },
  { id: 'rocketpool', name: 'Rocket Pool', apy: 3.45, tvl: '$3B', min: '0.01 ETH' },
];

export default function StakingDashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#1F1F1F]">Liquid Staking</h2>
      
      <div className="grid gap-4">
        {PROVIDERS.map((p) => (
          <motion.div
            key={p.id}
            layout
            onClick={() => setSelected(selected === p.id ? null : p.id)}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-colors ${
              selected === p.id 
                ? 'bg-[#1F1F1F] text-[#EAEADF] border-[#1F1F1F]' 
                : 'bg-[#EAEADF] border-transparent hover:bg-white/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm opacity-60">TVL: {p.tvl}</p>
              </div>
              <div className="text-right">
                <div className="font-black text-xl text-green-500">{p.apy}% APY</div>
                <div className="text-xs opacity-50">Min: {p.min}</div>
              </div>
            </div>

            <AnimatePresence>
              {selected === p.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 mt-4 border-t border-white/20">
                    <div className="mb-4">
                        <label className="text-xs font-bold opacity-60 block mb-2">Stake Amount</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/10 rounded-xl px-4 py-3 font-mono font-bold outline-none focus:bg-white/20 transition-all"
                            />
                            <button className="px-4 font-bold bg-white/20 rounded-xl hover:bg-white/30">MAX</button>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-[#EAEADF] text-[#1F1F1F] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all">
                        Stake with {p.name}
                        <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
