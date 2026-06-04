"use client";

import React from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';

const whaleVariants: Variants = {
    loop: {
        x: [-8, 8, -6, 6, -8], 
        y: [-12, 10, -8, 6, -12],
        rotateZ: [-1, 2, -1.5, 1, -1],
        filter: [
            'drop-shadow(0px 0px 10px rgba(6, 182, 212, 0.2))', 
            'drop-shadow(0px 0px 35px rgba(6, 182, 212, 0.8))', 
            'drop-shadow(0px 0px 15px rgba(6, 182, 212, 0.3))',
            'drop-shadow(0px 0px 40px rgba(6, 182, 212, 0.9))',
            'drop-shadow(0px 0px 10px rgba(6, 182, 212, 0.2))'
        ],
        transition: { 
            duration: 14, 
            repeat: Infinity, 
            ease: [0.25, 0.1, 0.25, 1] 
        }
    }
};

const auraVariants: Variants = {
    loop: {
        scale: [1, 1.15, 0.95, 1.1, 1],
        opacity: [0.1, 0.4, 0.15, 0.5, 0.1],
        transition: { 
            duration: 13, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }
    }
};

export function CinematicWhaleLogo({ src = "/official-whale-monochrome.png", className = "" }: { src?: string, className?: string }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            
            {!prefersReducedMotion && (
                <>
                    {/* Ambient Glow Aura */}
                    <motion.div 
                        className="absolute inset-0 rounded-full bg-cyan-400/10 blur-[30px] z-0 pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                        variants={auraVariants}
                        animate="loop"
                    />

                    {/* Ocean Parallax - subtle drifting lines instead of points */}
                    <motion.div 
                        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent z-0 pointer-events-none"
                        style={{ bottom: '10%', willChange: "transform, opacity" }}
                        animate={{ x: ['-20%', '20%', '-20%'], opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent z-0 pointer-events-none"
                        style={{ bottom: '25%', willChange: "transform, opacity" }}
                        animate={{ x: ['20%', '-20%', '20%'], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    />
                </>
            )}

            {/* The single persistent Whale Image */}
            <div className="w-full h-full absolute inset-0 z-20 pointer-events-auto flex items-center justify-center">
                {prefersReducedMotion ? (
                    <img 
                        src={src} 
                        alt="Whale"
                        className="relative object-contain mix-blend-screen opacity-90 scale-[2.8]"
                    />
                ) : (
                    <motion.img 
                        src={src} 
                        alt="Whale"
                        className="relative object-contain mix-blend-screen scale-[2.8] transform-gpu"
                        style={{ willChange: "transform, filter" }}
                        variants={whaleVariants}
                        animate="loop"
                    />
                )}
            </div>

        </div>
    );
}
