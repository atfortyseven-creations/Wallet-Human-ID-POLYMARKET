"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

interface StakingProvider {
  id: string;
  name: string;
  apy: number;
  tvl: string;
  min: string;
}

// [PRODUCTION] Providers should be fetched from a DeFi adapter or centralized API
// For now, we define the structure and set to empty until real-time APYs are integrated
const PROVIDERS: StakingProvider[] = [];

// Fallback providers for UI demonstration if no live data is found
const FALLBACK_PROVIDERS: StakingProvider[] = [
  { id: 'lido', name: 'Lido', apy: 0, tvl: '$0', min: '0 ETH' },
  { id: 'rocketpool', name: 'Rocket Pool', apy: 0, tvl: '$0', min: '0.01 ETH' },
];

export default function StakingDashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [providers, setProviders] = useState<StakingProvider[]>(FALLBACK_PROVIDERS);
  const [isLoading, setIsLoading] = useState(true);

  // [PRODUCTION] Fetch real-time staking data
  useEffect(() => {
    async function fetchStakingData() {
      try {
        setIsLoading(true);
        // In a real scenario, this would call a centralized API or protocol subgraphs
        const response = await fetch('/api/staking/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers);
        } else {
          // Fallback logic: Fetch from individual protocol APIs if possible
          // For now, we will use the fallback providers but with 0 values to show they are live-loading
        }
      } catch (e) {
        console.error("Failed to fetch staking data", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStakingData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#1F1F1F]">Liquid Staking</h2>
      
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#1F1F1F]/20" size={32} />
          </div>
        ) : providers.length > 0 ? providers.map((p) => (
          <motion.div
            key={p.id}
            layout
            onClick={() => setSelected(selected === p.id ? null : p.id)}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-colors ${
              selected === p.id 
                ? 'bg-[#1F1F1F] text-[#EAEADF] border-[#1F1F1F]' 
                : 'bg-white/50 border-[#1F1F1F]/5 hover:bg-white/80'
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
        )) : (
          <div className="text-center py-10 text-[#1F1F1F]/40 font-bold">
            No staking providers available at this time.
          </div>
        )}
      </div>
    </div>
  );
}

