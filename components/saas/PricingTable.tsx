"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Zap, Globe, Database, ArrowRight } from 'lucide-react';
import { SAAS_PLANS, PlanTier } from '@/lib/saas/plans';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';

export function PricingTable() {
    const { address, isConnected } = useAccount();
    const isSignedIn = isConnected;
    const [isAnnual, setIsAnnual] = useState(false);
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSubscription = async (tier: string) => {
        if (!isSignedIn) {
            alert("Please sign in to upgrade your tier.");
            return;
        }

        setLoadingTier(tier);
        try {
            // SIWE-native: userId is the connected wallet address
            const userId = address;

            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, userId, isAnnual }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to start checkout');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Financial Tunnel connection failed: ${error.message}`);
        } finally {
            setLoadingTier(null);
        }
    };

    // Get ordered plans skipping FREE
    const plansToShow = [
        SAAS_PLANS[PlanTier.STANDARD],
        SAAS_PLANS[PlanTier.STARTER],
        SAAS_PLANS[PlanTier.PRO],
        SAAS_PLANS[PlanTier.ELITE],
    ];

    return (
        <div className="w-full">
            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-4 mb-16">
                <span className={`text-sm font-bold uppercase tracking-widest ${!isAnnual ? 'text-white' : 'text-white/40'}`}>Monthly</span>
                <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="w-16 h-8 bg-white/10 rounded-full relative border border-white/20 transition-all hover:border-white/40"
                >
                    <motion.div 
                        initial={false}
                        animate={{ x: isAnnual ? 32 : 0 }}
                        className="w-8 h-8 absolute top-[-1px] left-[-1px] bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20"
                    />
                </button>
                <span className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-white/40'}`}>
                    Annual <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap">Save 20%</span>
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plansToShow.map((plan, idx) => {
                    const isPro = plan.tier === PlanTier.PRO;
                    const isInst = plan.tier === PlanTier.ELITE;
                    
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={plan.tier}
                            className={`relative rounded-xl p-8 flex flex-col transition-all duration-300 ${
                                isInst 
                                ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border-t-2 border-t-indigo-500 border border-white/5 shadow-[0_0_50px_rgba(99,102,241,0.05)]'
                                : 'bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-white/10'
                            }`}
                        >
                            {/* Badges */}
                            {isPro && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            {isInst && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400">
                                    Maximum Power
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-mono font-bold text-white tracking-tight">
                                        {isAnnual ? plan.priceMetrics.annual : plan.priceMetrics.monthly}
                                    </span>
                                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
                                        / {isAnnual ? 'YR' : 'MO'}
                                    </span>
                                </div>
                            </div>

                            {/* Limits List */}
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="pb-4 border-b border-white/5 space-y-0">
                                    <div className="flex justify-between items-center text-[13px] py-2 border-b border-white/[0.02]">
                                        <span className="text-white/50 tracking-wide">Daily Requests</span>
                                        <span className="text-white font-mono font-medium">
                                            {plan.limits.requestsPerDay === -1 ? '' : plan.limits.requestsPerDay.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] py-2 border-b border-white/[0.02]">
                                        <span className="text-white/50 tracking-wide">Max Tokens</span>
                                        <span className="text-white font-mono font-medium">
                                            {plan.limits.maxTokens === -1 ? 'ALL' : plan.limits.maxTokens}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] py-2 border-b border-white/[0.02]">
                                        <span className="text-white/50 tracking-wide">API Keys</span>
                                        <span className="text-white font-mono font-medium">{plan.limits.maxApiKeys}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] py-2 border-b border-white/[0.02]">
                                        <span className="text-white/50 tracking-wide">Data History</span>
                                        <span className="text-white font-mono font-medium">
                                            {plan.limits.dataWindowHours >= 720 ? `${plan.limits.dataWindowHours/24/30} MO` : `${plan.limits.dataWindowHours} HR`}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="pt-2 space-y-3">
                                    <FeatureRow label="REST API" active={true} />
                                    <FeatureRow label="WebSockets Streams" active={plan.features.webSockets} highlight={plan.features.webSockets && !isPro && !isInst} />
                                    <FeatureRow label="FIX Protocol" active={plan.features.fixProtocol} highlight={plan.features.fixProtocol} />
                                    <FeatureRow label="Dark Pool Detection" active={plan.features.darkPoolDetection} highlight={plan.features.darkPoolDetection && (isPro || isInst)} />
                                    <FeatureRow label="Heikin-Ashi Signals" active={plan.features.heikinAshiSignals} />
                                    <FeatureRow label="CSV/Parquet Export" active={plan.features.csvExport} highlight={plan.features.csvExport} />
                                    <FeatureRow label="IP Whitelist & HMAC" active={plan.features.ipWhitelist} />
                                </div>
                            </div>

                            <Button 
                                onClick={() => handleSubscription(plan.tier)}
                                disabled={loadingTier === plan.tier}
                                className={`w-full h-12 flex items-center justify-between px-6 transition-all ${
                                    isInst 
                                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white hover:scale-[1.02]' 
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                <span className="uppercase font-bold tracking-widest text-xs">
                                    {loadingTier === plan.tier ? 'Launching...' : (isInst ? 'Get Elite' : 'Select Plan')}
                                </span>
                                <ArrowRight size={16} />
                            </Button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function FeatureRow({ label, active, highlight = false }: { label: string, active: boolean, highlight?: boolean }) {
    return (
        <div className={`flex justify-between items-center text-[13px] py-1.5 ${active ? (highlight ? 'text-indigo-300' : 'text-white/70') : 'text-white/20'}`}>
            <span className={`tracking-wide ${highlight ? 'font-medium' : ''}`}>{label}</span>
            <div className="shrink-0">
                {active ? <Check size={14} className={highlight ? 'text-indigo-400' : 'text-green-500/80'} /> : <X size={14} className="text-white/10" />}
            </div>
        </div>
    );
}

