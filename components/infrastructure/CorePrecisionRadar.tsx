"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ️ QUANTUM PRECISION RADAR ️
 * Millimetre-precision visualizer for node validation.
 */
export default function CorePrecisionRadar() {
    return (
        <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Outer Ring 1 */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/5 rounded-full"
            />
            
            {/* Outer Ring 2 (Dashed) */}
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-dashed border-indigo-500/20 rounded-full"
            />

            {/* Scanning Beam */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-transparent to-indigo-500/20 blur-sm pointer-events-none"
            />

            {/* Core Pulses */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"
            />

            {/* Internal Precision Markers */}
            <div className="absolute inset-10 flex items-center justify-center">
                {[...Array(24)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-full h-px bg-white/10"
                        style={{ transform: `rotate(${i * 15}deg)` }}
                    >
                        <div className="absolute right-0 w-1 h-1 bg-white/20 rounded-full mt-[-2px]" />
                    </div>
                ))}
            </div>

            {/* The Zero-Error Core */}
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] group cursor-pointer"
            >
                <div className="absolute inset-2 border border-black/10 rounded-full" />
                <div className="absolute inset-4 border-2 border-dashed border-black/5 rounded-full animate-spin-slow" />
                
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-tighter text-black/40 leading-none mb-1">Status</span>
                    <span className="text-sm font-black uppercase text-black">Active</span>
                </div>
                
                {/* Floating Micro-data */}
                <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-12 px-3 py-1 bg-black text-white text-[8px] font-black rounded-lg border border-white/10 whitespace-nowrap"
                >
                    LATENCY: 0.004ms
                </motion.div>
                
                <motion.div 
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-12 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-lg shadow-xl whitespace-nowrap"
                >
                    PRECISION: 99.999%
                </motion.div>
            </motion.div>
        </div>
    );
}
