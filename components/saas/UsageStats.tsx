"use client";

import { motion } from 'framer-motion';
import { Activity, Zap } from 'lucide-react';
import { SAAS_PLANS } from '@/lib/saas/plans';

type Stats = {
    dailyRequests: number;
    billingPeriodStart: string;
};

export function UsageStats({ tier, stats }: { tier: string; stats: Stats }) {
    const config = SAAS_PLANS[tier as keyof typeof SAAS_PLANS];
    const limit = config.limits.requestsPerDay;
    const isUnlimited = limit === -1;
    
    // Safety check for math
    const percentage = isUnlimited ? 0 : Math.min(100, Math.round((stats.dailyRequests / limit) * 100));
    
    // Determine bar color based on usage
    let progressColor = "bg-green-400";
    if (!isUnlimited) {
        if (percentage > 90) progressColor = "bg-red-500";
        else if (percentage > 75) progressColor = "bg-orange-400";
        else if (percentage > 50) progressColor = "bg-yellow-400";
    }

    return (
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap size={120} />
            </div>

            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
                    <Activity className="text-green-400" />
                    Daily Usage
                </h2>

                <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-4xl font-black text-white tracking-tighter">
                            {stats.dailyRequests.toLocaleString()}
                        </div>
                        <div className="text-right">
                            <div className="text-white/40 text-sm font-medium">
                                / {isUnlimited ? '' : limit.toLocaleString()} reqs
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                        {isUnlimited ? (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-indigo-400 to-indigo-500/20 animate-pulse" />
                        ) : (
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${progressColor} rounded-full relative`}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                    
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                            Reset at 00:00 UTC
                        </span>
                        {!isUnlimited && (
                            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                                {percentage}% Consumed
                            </span>
                        )}
                        {isUnlimited && (
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                Unlimited Tier
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/40 uppercase tracking-wider font-bold">Current Plan</span>
                    <span className="text-xs text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded">
                        {config.name.toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Data Retention</span>
                    <span className="text-white font-mono">{config.limits.dataWindowHours / 24} Days History</span>
                </div>
            </div>
        </div>
    );
}

