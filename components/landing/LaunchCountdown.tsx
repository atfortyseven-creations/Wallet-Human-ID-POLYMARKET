"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function LaunchCountdown() {
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
        <section className="relative w-full min-h-[120vh] flex flex-col items-center justify-center overflow-hidden">
            
            {/* 1. IMMERSIVE TOP DIVIDER (The Scoop) */}
            <div className="absolute top-0 left-0 w-full h-[300px] z-20 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <path 
                        fill="#0a0a0a" 
                        fillOpacity="1" 
                        d="M0,160L80,181.3C160,203,320,245,480,245.3C640,245,800,203,960,176C1120,149,1280,139,1360,133.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
                    ></path>
                </svg>
                {/* Soft Fade Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#EAEADF]/0 via-[#0a0a0a]/40 to-[#0a0a0a]" />
            </div>

            {/* 2. ANIMATED MESH BACKGROUND (The Portal) */}
            <div className="absolute inset-0 z-0 bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            x: [-20, 20, -20],
                            y: [-20, 20, -20]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -left-[20%] w-[80vw] h-[80vw] rounded-full blur-[120px] bg-purple-600/30" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            x: [20, -20, 20],
                            y: [20, -20, 20]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[20%] -right-[20%] w-[70vw] h-[70vw] rounded-full blur-[120px] bg-[#00ff9d]/20" 
                    />
                </div>
                {/* Noise static layer */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </div>

            {/* 3. CONTENT AREA */}
            <div className="relative z-30 w-full max-w-7xl mx-auto px-6 text-center text-white pt-40">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-[#00ff9d] mb-8">
                        The Sovereignty Protocol
                    </div>

                    <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] uppercase">
                        WORLD <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00ff9d]">
                            RELEASE
                        </span>
                    </h2>

                    <p className="max-w-3xl mx-auto text-lg md:text-2xl text-white/50 leading-relaxed font-medium mb-20 px-4">
                        We are building the future with total precision. <br className="hidden md:block"/>
                        Sovereign intelligence meets absolute financial freedom.
                    </p>
                </motion.div>

                {/* Glassmorphism Countdown */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-10">
                    <CountdownItem value={timeLeft.days} label="DAYS" />
                    <CountdownItem value={timeLeft.hours} label="HOURS" />
                    <CountdownItem value={timeLeft.minutes} label="MINUTES" />
                    <CountdownItem value={timeLeft.seconds} label="SECONDS" />
                </div>
            </div>

            {/* 4. IMMERSIVE BOTTOM DIVIDER (The Blend) */}
            <div className="absolute bottom-0 left-0 w-full h-[200px] z-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                <svg viewBox="0 0 1440 320" className="w-full h-full absolute bottom-0 translate-y-1" preserveAspectRatio="none">
                    <path 
                        fill="#0a0a0a" 
                        fillOpacity="1" 
                        d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,197.3C960,171,1056,117,1152,101.3C1248,85,1344,107,1392,117.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    ></path>
                </svg>
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
