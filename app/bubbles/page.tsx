"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, TrendingUp, Globe } from 'lucide-react';
import BubblesView from '@/components/premium/BubblesView';
import MarketTable from '@/components/premium/MarketTable';
import { FloatingImmersiveBackground } from '@/components/landing/FloatingImmersiveBackground';

export default function BubblesPage() {
  return (
    <div className="min-h-screen bg-[#EAEADF] text-[#1F1F1F] relative overflow-hidden">
      {/* Background Layer */}
      <FloatingImmersiveBackground density="low" kittenCount={1} />
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-32 relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md border border-black/5 rounded-full mb-6"
          >
            <Sparkles size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-Time Market Pulse</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic"
          >
            CRYPTO <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">BUBBLES</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-black/50 max-w-2xl mx-auto font-medium"
          >
            Visualiza el sentimiento del mercado en tiempo real. Burbujas dinámicas interactivas y ranking de activos soberanos.
          </motion.p>
        </div>

        {/* Stats Grid - Secondary Info */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
            <MiniStat icon={<TrendingUp size={16} />} label="Dominancia" value="BTC 52.4%" />
            <MiniStat icon={<Globe size={16} />} label="Global Cap" value="$2.41T" />
            <MiniStat icon={<BarChart3 size={16} />} label="Volumen 24h" value="$84.2B" />
            <MiniStat icon={<Sparkles size={16} />} label="Miedo/Codicia" value="74 (Codicia)" />
        </motion.div>

        {/* Main Visualization Container */}
        <div className="space-y-24">
            {/* Bubbles Chart */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full h-[700px]"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <TrendingUp size={20} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Visual Sentimental Engine</h2>
                </div>
                <BubblesView />
            </motion.div>

            {/* Market Ranking Table */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg">
                        <BarChart3 size={20} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Real-Time Market Ranking</h2>
                </div>
                <MarketTable />
            </motion.div>
        </div>
      </div>

      {/* Footer Tag */}
      <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-black text-white px-6 py-3 rounded-full font-black text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE DATA STREAM ACTIVE
          </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-black/30 font-black text-[10px] uppercase tracking-widest">
                {icon}
                {label}
            </div>
            <div className="text-xl font-black text-black">
                {value}
            </div>
        </div>
    );
}
