"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LaunchCountdown() {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        // Target: Jan 1, 2027
        const targetDate = new Date('2027-01-01T00:00:00');
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference < 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section 
            className="relative w-full min-h-[140vh] flex flex-col items-center justify-center overflow-visible"
            style={{ 
                maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
            }}
        >
            
            {/* 1. SEAMLESS TOP MELTING (Fuzzy Gradient) */}
            <div className="absolute top-0 left-0 w-full h-[300px] z-10 pointer-events-none">
                <div 
                    className="w-full h-full"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 0%, #EAEADF 0%, #EAEADF 40%, rgba(234, 234, 223, 0) 100%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            {/* 2. ANIMATED MESH BACKGROUND (The Portal) */}
            <div className="absolute inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
                {/* Immersive mesh glow foundation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
                
                <div className="absolute inset-0 opacity-50">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, 90, 0],
                            x: [-100, 100, -100],
                            y: [-50, 50, -50]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[30%] -left-[30%] w-[100vw] h-[100vw] rounded-full blur-[150px] bg-purple-600/30" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.3, 1, 1.3],
                            rotate: [0, -90, 0],
                            x: [100, -100, 100],
                            y: [50, -50, 50]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[30%] -right-[30%] w-[90vw] h-[90vw] rounded-full blur-[150px] bg-[#00ff9d]/20" 
                    />
                </div>
                {/* Noise static layer */}
                <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] mix-blend-overlay" />
            </div>

            {/* 3. CONTENT AREA */}
            <div className="relative z-20 w-full max-w-[2560px] mx-auto px-6 text-left text-white pt-60 pb-40">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                    whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-[12px] font-black uppercase tracking-[0.4em] text-[#00ff9d] mb-12">
                        {t.countdown.badge}
                    </div>

                    <h2 className="text-7xl md:text-[14rem] font-black tracking-tighter mb-12 leading-[0.8] uppercase select-none">
                        {t.countdown.title.split(' ')[0]} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00ff9d] drop-shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                            {t.countdown.title.split(' ')[1] || ''}
                        </span>
                    </h2>

                    <p className="max-w-4xl mx-auto text-xl md:text-3xl text-white/40 leading-relaxed font-bold mb-24 px-4 tracking-tight">
                        {t.countdown.description}
                    </p>
                </motion.div>

                {/* Glassmorphism Countdown */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-14">
                    <CountdownItem value={timeLeft.days} label={t.countdown.days} />
                    <CountdownItem value={timeLeft.hours} label={t.countdown.hours} />
                    <CountdownItem value={timeLeft.minutes} label={t.countdown.minutes} />
                    <CountdownItem value={timeLeft.seconds} label={t.countdown.seconds} />
                </div>
            </div>

            {/* 4. SEAMLESS BOTTOM MELTING (Fuzzy Gradient to Footer) */}
            <div className="absolute bottom-0 left-0 w-full h-[400px] z-10 pointer-events-none">
                <div 
                    className="w-full h-full"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 100%, black 0%, black 30%, rgba(0, 0, 0, 0) 100%)',
                        filter: 'blur(60px)',
                    }}
                />
            </div>

        </section>
    );
}

function CountdownItem({ value, label }: { value: number, label: string }) {
    return (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center w-28 h-28 md:w-48 md:h-48 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] group hover:bg-white/10 transition-colors shadow-2xl relative"
        >
            {/* Animated Glow behind timer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff9d]/5 to-purple-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="text-4xl md:text-7xl font-black tabular-nums tracking-tighter text-white z-10">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/30 z-10 mt-3 group-hover:text-[#00ff9d] transition-colors">
                {label}
            </div>
        </motion.div>
    );
}

