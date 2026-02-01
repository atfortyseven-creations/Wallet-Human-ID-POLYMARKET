"use client";

import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FloatingImmersiveBackground } from './FloatingImmersiveBackground';
import { useLanguage } from '@/src/context/LanguageContext';

interface Props {
    onStart: () => void;
}

export function LandingHero({ onStart }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    const { t } = useLanguage();

    // Parallax effects for the cats
    const yLeft = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const yRight = useTransform(scrollYProgress, [0, 1], [0, 150]); // Slightly different speed for depth
    const scaleCats = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    // Text parallax
    const yText = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section 
            ref={containerRef}
            className="w-full h-[100dvh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-[#FAFAEE]"
            aria-label="Welcome to Human Defi"
        >
            {/* FLOATING IMMERSIVE ELEMENTS LAYER (Behind everything) */}
            <FloatingImmersiveBackground />

            {/* CONTENT LAYER */}
            <motion.div 
                style={{ y: yText, opacity: opacityText }}
                className="relative z-20 flex flex-col items-center mb-20 md:mb-0"
            >
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="
                        text-5xl md:text-7xl lg:text-[7rem] font-black text-[#4F2683]
                        mb-2 tracking-tighter uppercase leading-[0.9]
                        drop-shadow-sm
                    "
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    BIENVENIDO A<br/>
                    HUMAN DEFI
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-2xl md:text-4xl font-black text-[#4F2683] tracking-tight mb-8"
                >
                    TUHOGARENWEB3
                </motion.h2>

                <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    onClick={onStart}
                    className="
                        group relative px-10 py-4 bg-[#2E1A57] rounded-full text-white font-bold text-lg md:text-xl
                        overflow-hidden transition-all hover:scale-105 hover:bg-[#3d2270] hover:shadow-xl
                        uppercase tracking-widest flex items-center gap-2
                    "
                >
                    COMENZAR 
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>

            {/* IMMERSIVE CATS LAYER */}
            <div className="absolute inset-0 pointer-events-none z-10 flex justify-between items-end pb-0 md:pb-10 px-4 md:px-20 w-full max-w-[1800px] mx-auto">
                {/* Left Cat */}
                <motion.div 
                    style={{ y: yLeft, scale: scaleCats }}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-[40%] md:w-[25%] max-w-[400px]"
                >
                    <img 
                        src="/models/cat12.png" 
                        alt="Human DeFi Cat Left" 
                        className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                </motion.div>

                {/* Right Cat */}
                <motion.div 
                    style={{ y: yRight, scale: scaleCats }}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-[40%] md:w-[25%] max-w-[400px]"
                >
                    <img 
                        src="/models/cat12.png" 
                        alt="Human DeFi Cat Right" 
                        className="w-full h-auto object-contain drop-shadow-2xl transform scale-x-[-1]" // Flip horizontally for symmetry
                    />
                </motion.div>
            </div>
            
            {/* Bottom Gradient for smooth blend if needed, or colored bar as in mockup */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#F0A6E3]/30 z-0" />
        </section>
    );
}
