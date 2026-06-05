"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Shield, HelpCircle } from 'lucide-react';

export function InvestmentInstruction() {
    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 flex flex-col h-full group hover:border-cyan-500/30 transition-all duration-500 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/5 flex items-center justify-center border border-cyan-600/10">
                    <HelpCircle size={20} className="text-cyan-600" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">How to Observe & Act</h3>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Zap size={14} className="text-cyan-600" />
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Growth Entry (Long)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Enter when <span className="text-cyan-600 font-bold">Whale Activity</span> shows high long-side persistence (&gt;70%) and the <span className="text-slate-900 font-bold">Sentiment Pulse</span> turns vivid cyan. Follow the smart money in phase 1 of accumulation.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={14} className="text-rose-600" />
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Distribution Exit (Short)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Exit or take profit when the <span className="text-rose-600 font-bold">Market Sentiment</span> shows heavy distribution (&lt;30%). Large volume transfers to exchanges are primary exit indicators.
                    </p>
                </div>

                <div className="p-5 bg-black/5 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                        <Shield size={12} className="text-cyan-600" />
                        <span className="text-[9px] font-black uppercase text-slate-900 tracking-[0.2em]">Risk Management</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                        Always verify signal persistence across multiple blocks. One whale transfer can be a trap; a coordinated flow is a trend.
                    </p>
                </div>
            </div>

        </div>
    );
}
