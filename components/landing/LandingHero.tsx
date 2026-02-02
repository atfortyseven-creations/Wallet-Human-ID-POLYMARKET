"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { DropdownNav } from './DropdownNav';

interface LandingHeroProps {
    onStart?: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
    const { scrollY } = useScroll();
    
    // Parallax transforms for cats (opposite directions for depth)
    const leftCatY = useTransform(scrollY, [0, 500], [0, -100]);
    const rightCatY = useTransform(scrollY, [0, 500], [0, -150]);
    const leftCatRotate = useTransform(scrollY, [0, 500], [0, -10]);
    const rightCatRotate = useTransform(scrollY, [0, 500], [0, 10]);

    return (
        <div className="relative w-full h-full flex items-center justify-center px-6">
            <div className="max-w-6xl mx-auto text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Dropdown Navigation */}
                    <div className="mb-6">
                        <DropdownNav />
                    </div>

                    {/* Main Heading with 3D Cats */}
                    <div className="relative">
                        {/* Left Cat - 3D Depth Effect */}
                        <motion.div
                            style={{ y: leftCatY, rotate: leftCatRotate }}
                            className="absolute -left-32 md:-left-48 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
                        >
                            <motion.img
                                src="/models/cat12.png"
                                alt="Kitten"
                                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                style={{
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                                    transform: 'perspective(1000px) rotateY(15deg)',
                                }}
                            />
                        </motion.div>

                        {/* Right Cat - 3D Depth Effect */}
                        <motion.div
                            style={{ y: rightCatY, rotate: rightCatRotate }}
                            className="absolute -right-32 md:-right-48 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
                        >
                            <motion.img
                                src="/models/cat12.png"
                                alt="Kitten"
                                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                style={{
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                                    transform: 'perspective(1000px) rotateY(-15deg)',
                                }}
                            />
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                            <span className="text-[#1F1F1F] dark:text-white">The Future of</span>
                            <br />
                            <span className="text-purple-500">
                                Human Finance
                            </span>
                        </h1>
                    </div>

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
