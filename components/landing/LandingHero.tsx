"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
    onStart: () => void;
}

export function LandingHero({ onStart }: Props) {
    return (
        <section 
            className="w-full h-[100dvh] flex flex-col items-center justify-center text-center px-4 relative"
            aria-label="Welcome to Human Defi"
        >
            <h1 
                className="
                    text-6xl md:text-8xl lg:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900
                    mb-8 tracking-tighter drop-shadow-2xl uppercase leading-[0.9]
                "
                style={{ fontFamily: 'var(--font-inter)' }} 
            >
                BIENVENIDO A<br/>
                HUMAN DeFi<br/>
                <span className="text-4xl md:text-6xl text-indigo-900/40 block mt-4">TU HOGAR EN WEB3</span>
            </h1>

            <button 
                onClick={onStart}
                className="
                    group relative px-12 py-6 bg-indigo-900 rounded-full text-white font-black text-2xl
                    overflow-hidden transition-all hover:scale-105 hover:bg-indigo-800 hover:shadow-[0_0_50px_rgba(79,70,229,0.5)]
                "
                aria-label="Start Registration"
            >
                <span className="relative z-10 flex items-center gap-2">
                    COMENZAR
                    <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                </span>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>
        </section>
    );
}
