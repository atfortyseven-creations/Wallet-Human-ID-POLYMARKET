"use client";

import React from 'react';
import { useSettings } from '@/src/context/SettingsContext';
import { Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProFeatureGateProps {
    children: React.ReactNode;
    featureName?: string;
}

export function ProFeatureGate({ children, featureName = "Premium Feature" }: ProFeatureGateProps) {
    const { tier } = useSettings();

    if (tier === 'pro') {
        return <>{children}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-[2rem] border border-slate-200 bg-black/5/50 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-500">
                <Lock size={20} />
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{featureName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Whale Alert Network Pro Membership Required</p>
            </div>

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center gap-2 hover:bg-indigo-600 transition-colors"
            >
                <Zap size={12} className="fill-current" /> Upgrade to Pro $299/mo
            </motion.button>
        </div>
    );
}
