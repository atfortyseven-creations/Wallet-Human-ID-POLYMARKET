"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, TrendingUp, Loader2, Sparkles, Zap } from 'lucide-react';

interface AIRebalancerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIRebalancerModal({ isOpen, onClose }: AIRebalancerModalProps) {
    const [strategy, setStrategy] = useState('conservative');
    const [loading, setLoading] = useState(false);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [rebalancePlan, setRebalancePlan] = useState<any>(null);

    useEffect(() => {
        if (isOpen) fetchPortfolio();
    }, [isOpen]);

    const fetchPortfolio = async () => {
        const res = await fetch('/api/wallet/portfolio');
        const data = await res.json();
        setPortfolio(data);
    };

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet/rebalance/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy }),
            });
            const data = await res.json();
            setRebalancePlan(data.plan);
        } catch (e) {
            alert('Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    const executeRebalance = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet/rebalance/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: rebalancePlan }),
            });
            const data = await res.json();
            alert(` Portfolio rebalanced! ${data.swapsExecuted} swaps completed.`);
            onClose();
        } catch (e: any) {
            alert(e.message || 'Rebalance failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
                            <X size={20} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-cyan-500/20 rounded-full">
                                <Brain className="text-cyan-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">AI Portfolio Rebalancer</h2>
                                <p className="text-sm text-white/60">Optimize your holdings with ML</p>
                            </div>
                        </div>

                        {/* Current Portfolio */}
                        {portfolio && (
                            <div className="bg-white/5 rounded-2xl p-6 mb-6">
                                <h3 className="text-white font-bold mb-4">Current Portfolio</h3>
                                <div className="space-y-2">
                                    {portfolio.tokens?.map((token: any) => (
                                        <div key={token.symbol} className="flex justify-between items-center">
                                            <span className="text-white/80">{token.symbol}</span>
                                            <span className="text-white font-bold">{token.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Strategy Selection */}
                        <div className="mb-6">
                            <label className="text-white/80 text-sm mb-3 block">Rebalance Strategy</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['conservative', 'balanced', 'aggressive'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStrategy(s)}
                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                                            strategy === s
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Plan Button */}
                        {!rebalancePlan && (
                            <button
                                onClick={generatePlan}
                                disabled={loading}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 mb-6"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                {loading ? 'Analyzing...' : 'Generate AI Plan'}
                            </button>
                        )}

                        {/* Rebalance Plan */}
                        {rebalancePlan && (
                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Zap className="text-cyan-400" size={20} />
                                    Recommended Rebalance
                                </h3>
                                <div className="space-y-3">
                                    {rebalancePlan.swaps?.map((swap: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                            <span className="text-white/80">
                                                Swap {swap.from}  {swap.to}
                                            </span>
                                            <span className="text-white font-bold">{swap.amount}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                                    <p className="text-green-400 text-sm">
                                        <strong>Expected Return:</strong> +{rebalancePlan.expectedReturn}% over 30 days
                                    </p>
                                </div>

                                <button
                                    onClick={executeRebalance}
                                    disabled={loading}
                                    className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                                    {loading ? 'Executing...' : 'Execute Rebalance'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

