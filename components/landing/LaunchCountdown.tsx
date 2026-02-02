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
        <section className="relative w-full min-h-screen py-32 flex flex-col items-center justify-center">
            
            {/* CLEAN WHITE BACKGROUND - NO CLUTTER */}
            <div className="absolute inset-0 bg-white dark:bg-[#0a0a0a]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {/* WORLD RELEASE - Clean and Elegant */}
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-[#1F1F1F] dark:text-white uppercase leading-none">
                        WORLD RELEASE
                    </h2>

                    {/* 2027 - Elegant Typography */}
                    <div className="text-7xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-12">
                        2027
                    </div>

                    {/* Clean Description */}
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#1F1F1F]/70 dark:text-white/70 leading-relaxed font-light mb-20">
                        Before entering to operate in the market candles, it is crucial to be well-informed with great detail. 
                        We encourage deep understanding over impulsivity. 
                        Prepare yourself for the next era of financial intelligence.
                    </p>
                </motion.div>

                {/* Clean Countdown Boxes */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                    <CountdownItem value={timeLeft.days} label="DAYS" />
                    <CountdownItem value={timeLeft.hours} label="HOURS" />
                    <CountdownItem value={timeLeft.minutes} label="MINUTES" />
                    <CountdownItem value={timeLeft.seconds} label="SECONDS" />
                </div>

            </div>
        </section>
    );
}

function CountdownItem({ value, label }: { value: number, label: string }) {
    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center w-28 h-28 md:w-44 md:h-44 bg-white dark:bg-[#1F1F1F] rounded-2xl border-2 border-[#1F1F1F]/10 dark:border-white/10 shadow-lg hover:scale-105 transition-transform"
        >
            <div className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#1F1F1F] dark:text-white">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#1F1F1F]/50 dark:text-white/50 mt-2">
                {label}
            </div>
        </motion.div>
    );
}
