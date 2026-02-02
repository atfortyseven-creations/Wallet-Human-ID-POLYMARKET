"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

interface LandingHeroProps {
    onStart?: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
    return (
        <div className="relative w-full h-full flex items-center justify-center px-6">
            <div className="max-w-6xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 dark:border-white/10 border-black/10 bg-white/5 dark:bg-white/5 bg-black/5 backdrop-blur-md mb-6">
                        <Shield className="w-4 h-4 text-[#00ff9d]" />
                        <span className="text-sm font-mono uppercase tracking-wider text-[#1F1F1F] dark:text-white">
                            Military-Grade Security
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                        <span className="text-[#1F1F1F] dark:text-white">The Future of</span>
                        <br />
                        <span className="text-purple-500">
                            Human Finance
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-[#1F1F1F]/70 dark:text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Sovereign wallet with biometric security, zero-knowledge proofs, and unmatched privacy. 
                        <span className="font-bold text-[#1F1F1F] dark:text-white"> Your keys. Your control.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link 
                            href="/wallet"
                            className="group px-8 py-4 bg-white dark:bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] flex items-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <Link 
                            href="/trust"
                            className="px-8 py-4 bg-white/10 dark:bg-white/10 text-[#1F1F1F] dark:text-white rounded-2xl font-bold text-lg hover:bg-white/20 dark:hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 dark:border-white/10 border-black/10"
                        >
                            Learn More
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-mono text-[#1F1F1F]/50 dark:text-white/50">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#00ff9d]" />
                            <span>10M+ Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#00ff9d]" />
                            <span>Zero Breaches</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
                            <span>100% Uptime</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
