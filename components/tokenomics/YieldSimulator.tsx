'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { TOKEN_METRICS } from '@/src/config/tokenomics';

export const YieldSimulator = () => {
    const [protocolVolume, setProtocolVolume] = useState(5_000_000); // Default $5M
    const [stakedAmount, setStakedAmount] = useState(10_000); // Default 10k HMND

    // LOGIC: Real Yield Calculation
    // Assumption: Protocol takes 0.5% fee on volume. 
    // Stakers receive 50% of that fee.
    // User Share = UserStaked / TotalStaked (Assumed 40M staked)
    const monthlyIncome = useMemo(() => {
        const dailyFeeRevenue = protocolVolume * 0.005;
        const stakerPoolShare = dailyFeeRevenue * 0.50;
        const totalStakedEst = 40_000_000; // 40% of supply
        const userShare = stakedAmount / totalStakedEst;
        const dailyIncome = stakerPoolShare * userShare;
        return dailyIncome * 30;
    }, [protocolVolume, stakedAmount]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00f2ea]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full bg-[#00f2ea]/10 border border-[#00f2ea]/20 text-[#00f2ea]">
                    <Calculator size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Real Yield Simulator</h2>
                    <p className="text-xs text-gray-400 font-mono">ESTIMATE YOUR PASSIVE INCOME</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">

                {/* SLIDER 1: VOLUME */}
                <div>
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-400">Daily Volume</span>
                        <span className="text-white font-mono font-bold">{formatCurrency(protocolVolume)}</span>
                    </div>
                    <input
                        type="range"
                        min="10000"
                        max="100000000"
                        step="100000"
                        value={protocolVolume}
                        onChange={(e) => setProtocolVolume(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f2ea] hover:bg-white/20 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
                        <span>$10k</span>
                        <span>$100M</span>
                    </div>
                </div>

                {/* SLIDER 2: STAKED */}
                <div>
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-400">Your Staked {TOKEN_METRICS.ticker}</span>
                        <span className="text-white font-mono font-bold">{stakedAmount.toLocaleString()} HMND</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="100000"
                        step="100"
                        value={stakedAmount}
                        onChange={(e) => setStakedAmount(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7000ff] hover:bg-white/20 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
                        <span>100</span>
                        <span>100,000</span>
                    </div>
                </div>

                {/* OUTPUT CARD */}
                <div className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ea]/10 to-[#7000ff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly Income</div>
                            <motion.div
                                key={monthlyIncome}
                                initial={{ opacity: 0.5, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-black text-white tracking-tight"
                            >
                                {formatCurrency(monthlyIncome)}
                            </motion.div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">APY (Est.)</div>
                            <div className="text-xl font-mono text-[#00ff9d]">
                                {((monthlyIncome * 12) / (stakedAmount * 1.5) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
