"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, TrendingUp, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getStakingProviders, stakeETH, getStakingPositions, calculateRewards, type StakingProvider, type StakingPosition } from '@/lib/wallet/staking';

interface StakingDashboardProps {
  walletAddress: string;
}

export default function StakingDashboard({ walletAddress }: StakingDashboardProps) {
  const [providers, setProviders] = useState<StakingProvider[]>([]);
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<StakingProvider | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [stakingStatus, setStakingStatus] = useState<'idle' | 'staking' | 'success'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providersData, positionsData] = await Promise.all([
        getStakingProviders(),
        getStakingPositions(walletAddress),
      ]);
      setProviders(providersData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error loading staking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!selectedProvider || !stakeAmount) return;
    
    setStakingStatus('staking');
    try {
      await stakeETH(selectedProvider.id, parseFloat(stakeAmount), walletAddress);
      setStakingStatus('success');
      setTimeout(() => {
        setStakingStatus('idle');
        setStakeAmount('');
        loadData(); // Refresh positions
      }, 3000);
    } catch (error) {
      console.error('Staking failed:', error);
      setStakingStatus('idle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#EAEADF] p-6 rounded-3xl border-2 border-[#1F1F1F]/10">
          <h3 className="text-sm font-bold text-[#1F1F1F]/70 mb-1">Total Staked</h3>
          <div className="text-3xl font-black text-[#1F1F1F]">
            {positions.reduce((sum, p) => sum + p.stakedAmount, 0).toFixed(4)} ETH
          </div>
          <div className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp size={14} />
            Earning ~3.6% APY
          </div>
        </div>

        <div className="bg-[#EAEADF] p-6 rounded-3xl border-2 border-[#1F1F1F]/10">
          <h3 className="text-sm font-bold text-[#1F1F1F]/70 mb-1">Rewards Earned</h3>
          <div className="text-3xl font-black text-[#1F1F1F]">
            {positions.reduce((sum, p) => sum + p.rewardsEarned, 0).toFixed(6)} ETH
          </div>
          <div className="text-sm text-[#1F1F1F]/50 mt-2">
            ≈ ${(positions.reduce((sum, p) => sum + p.rewardsEarned, 0) * 3000).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div>
        <h3 className="text-xl font-black text-[#1F1F1F] mb-4">Liquid Staking</h3>
        <div className="space-y-3">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              layout
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedProvider?.id === provider.id
                  ? 'bg-[#1F1F1F] text-[#EAEADF] border-[#1F1F1F]'
                  : 'bg-white/50 border-transparent hover:bg-white/80'
              }`}
              onClick={() => setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full p-1">
                    <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{provider.name}</h4>
                    <div className={`text-sm ${selectedProvider?.id === provider.id ? 'opacity-70' : 'opacity-50'}`}>
                      {provider.symbol}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-xl text-green-500">{provider.apy}% APY</div>
                  <div className={`text-xs ${selectedProvider?.id === provider.id ? 'opacity-70' : 'opacity-50'}`}>
                    ${provider.tvl}B TVL
                  </div>
                </div>
              </div>

              {/* Staking Form (Expandable) */}
              <AnimatePresence>
                {selectedProvider?.id === provider.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-4 border-t border-white/20">
                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold opacity-70 mb-1 block">Amount to Stake</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-white/10 rounded-xl px-4 py-3 text-lg font-bold outline-none border border-white/20 focus:border-white/50"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-50">ETH</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold opacity-70 mb-1 block">You Receive</label>
                          <div className="w-full bg-white/5 rounded-xl px-4 py-3 text-lg font-bold border border-white/10 opacity-70 flex items-center justify-between">
                            <span>{stakeAmount ? (parseFloat(stakeAmount) / provider.exchangeRate).toFixed(4) : '0.00'}</span>
                            <span className="text-sm">{provider.symbol}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm opacity-70 mb-4 bg-white/5 p-3 rounded-lg">
                        <span>Est. Yearly Rewards</span>
                        <span className="font-bold text-green-400">
                           + {stakeAmount ? calculateRewards(parseFloat(stakeAmount), provider.apy, 'year').toFixed(4) : '0.00'} ETH
                        </span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleStake(); }}
                        disabled={stakingStatus !== 'idle' || !stakeAmount}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          stakingStatus === 'success' ? 'bg-green-500 text-white' : 'bg-[#EAEADF] text-[#1F1F1F] hover:bg-white'
                        }`}
                      >
                        {stakingStatus === 'staking' ? (
                          <span className="w-5 h-5 border-2 border-[#1F1F1F]/30 border-t-[#1F1F1F] rounded-full animate-spin" />
                        ) : stakingStatus === 'success' ? (
                          <>
                            <CheckCircle2 size={20} />
                            Staked Successfully
                          </>
                        ) : (
                          <>
                            Stake ETH
                            <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
