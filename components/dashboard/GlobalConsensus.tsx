// components/dashboard/GlobalConsensus.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp, TrendingDown, Clock, Shield, Database, Globe } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  change: number;
  description: string;
}

export default function GlobalConsensus() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating deep macro-sentiment analysis from global on-chain signals
    setTimeout(() => {
      setMetrics([
        { label: 'Macro_Sentiment_Ratio', value: '62.4%', change: 2.1, description: 'Aggregated social & trade sentiment derived from institutional order flows.' },
        { label: 'Liquidity_Density', value: '$842.1B', change: -0.5, description: 'Available stablecoin liquidity across core DEX/CEX clusters.' },
        { label: 'Whale_Confidence_Score', value: '84/100', change: 5.4, description: 'Predictive score based on top-100 wallet accumulation velocity.' },
        { label: 'Supply_Shock_Probability', value: 'LOW', change: 0, description: 'Probability of massive sell-off events within a 48H window.' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="h-full w-full min-h-0 bg-black text-white font-mono flex flex-col p-8 gap-8">
      
      {/*  ACADEMIC INTRO  */}
      <div className="p-8 border border-white/5 bg-white/[0.01] flex flex-col gap-6">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Globe size={28} />
           </div>
           <div>
              <h1 className="text-xl font-black uppercase tracking-[0.4em]">Global_Consensus_Genesis</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Macrostructural Sentiment Analysis Engine // V3.1 Production</p>
           </div>
           <div className="ml-auto flex items-center gap-4 text-[8px] text-emerald-500/80 uppercase tracking-widest px-4 py-2 border border-emerald-500/20 bg-emerald-500/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Consensus_Locked:_STABLE</span>
           </div>
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed max-w-3xl">
           The Global Consensus module aggregates disparate on-chain data points to synthesize a deterministic view of market sentiment. 
           It factors in exchange inflows, derivative funding rates, social volume, and institutional treasury movements.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-white/5 bg-white/[0.02] h-32 animate-pulse" />
          ))
        ) : (
          metrics.map((m, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="border border-white/5 bg-white/[0.02] p-6 group hover:border-white/10 transition-all"
             >
                <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-4">{m.label}</div>
                <div className="flex items-baseline gap-3 mb-2">
                   <span className="text-2xl font-black text-white">{m.value}</span>
                   {m.change !== 0 && (
                      <span className={`text-[10px] font-bold ${m.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {m.change > 0 ? '+' : ''}{m.change}%
                      </span>
                   )}
                </div>
                <p className="text-[9px] text-white/40 uppercase leading-relaxed tracking-widest line-clamp-2">
                   {m.description}
                </p>
             </motion.div>
          ))
        )}
      </div>

      {/*  MACRO FEED PANEL  */}
      <div className="mt-auto border border-white/10 bg-white/[0.01] p-6 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Shield size={12} className="text-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-widest">Protocol_Integrity_Verified</span>
            </div>
            <div className="flex items-center gap-2">
               <Database size={12} className="text-white/20" />
               <span className="text-[9px] text-white/20 uppercase tracking-widest">Oracle_Sources:_Premium_Aggregator</span>
            </div>
         </div>
         <button className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors">
            ACCESS_MACRO_INSIGHT_LOGS 
         </button>
      </div>

      {/*  FOOTER  */}
      <div className="flex items-center justify-between text-[8px] text-white/20 uppercase tracking-[0.5em]">
         <span>Node_Status:_Primary_Active</span>
         <span>Global_Consensus_Model_ALFA-3.1</span>
      </div>

    </div>
  );
}
