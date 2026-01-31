"use client";

import React from 'react';
import { motion } from 'framer-motion';

const PerspectiveCard = ({ title, subtitle, color, rotate, zIndex, translate }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: zIndex * 0.1 }}
        style={{ 
            rotate: rotate, 
            zIndex: zIndex,
            x: translate.x,
            y: translate.y 
        }}
        className={`absolute w-64 h-80 md:w-80 md:h-96 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col justify-end p-6 backdrop-blur-sm transition-transform hover:scale-105 hover:z-50 duration-300 group cursor-pointer`}
    >
        <div className={`absolute inset-0 opacity-40 ${color}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="relative z-10">
             <h3 className="text-2xl font-black text-white uppercase leading-none mb-2 drop-shadow-lg">{title}</h3>
             <p className="text-white/80 font-medium text-sm leading-tight">{subtitle}</p>
        </div>
    </motion.div>
);

export function FeatureCardsSection() {
    return (
        <div className="w-full relative py-32 flex flex-col items-center justify-center overflow-hidden min-h-[600px]">
            
            <div className="text-center mb-16 relative z-20">
                <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Bienvenido a<br/>Human DeFi
                </h3>
            </div>

            {/* Centralized Depth Group */}
            <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center perspective-[1000px]">
                
                {/* Card 1: Left Back */}
                <PerspectiveCard 
                    title="COMPRA Y CANJEA"
                    subtitle="Soporte nativo para USD y ETH"
                    color="bg-emerald-600"
                    rotate={-15}
                    zIndex={10}
                    translate={{ x: -120, y: 20 }}
                />

                {/* Card 2: Right Back */}
                 <PerspectiveCard 
                    title="INTERCAMBIO"
                    subtitle="Swaps instantáneos entre cadenas"
                    color="bg-blue-600"
                    rotate={15}
                    zIndex={10}
                    translate={{ x: 120, y: 20 }}
                />

                {/* Card 3: Center Back (Slightly higher) */}
                 <PerspectiveCard 
                    title="RECOMPENSAS"
                    subtitle="Gana royalties automáticamente"
                    color="bg-purple-600"
                    rotate={-5}
                    zIndex={20}
                    translate={{ x: -40, y: -40 }}
                />

                {/* Card 4: Front Center (Main Focus) */}
                 <PerspectiveCard 
                    title="ULTRA RÁPIDO"
                    subtitle="Ejecución instantánea en L2"
                    color="bg-orange-600"
                    rotate={0}
                    zIndex={30}
                    translate={{ x: 40, y: 40 }}
                />

            </div>
        </div>
    );
}
