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
        <section className="relative w-full min-h-screen py-32 flex flex-col items-center justify-center overflow-hidden">
            
            {/* Solid Background - No Image */}
            <div className="absolute inset-0 z-0 bg-[#EAEADF] dark:bg-[#0a0a0a]" />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center text-white">
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-[#00ff9d] mb-6">
                        Roadmap to Sovereignty
                    </div>

                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-4">
                        WORLD RELEASE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-[#00ff9d]">
                            2027
                        </span>
                    </h2>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/70 leading-relaxed font-light mb-16">
                        Before entering to operate in the market candles, it is crucial to be well-informed with great detail. 
                        We encourage deep understanding over impulsivity. 
                        Prepare yourself for the next era of financial intelligence.
                    </p>
                </motion.div>

                {/* Glassmorphism Countdown */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
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
            className="flex flex-col items-center justify-center w-24 h-24 md:w-40 md:h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
        >
            <div className="text-3xl md:text-5xl font-black font-mono tracking-tighter text-white">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 mt-2">
                {label}
            </div>
        </motion.div>
    );
}
