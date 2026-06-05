'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LockOpen, Blocks, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    delay?: number;
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col p-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] transition-colors hover:border-cyan-500/30"
        >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.1] text-zinc-300 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300">
                <Icon size={24} strokeWidth={1.5} />
            </div>

            <h3 className="mb-3 text-xl font-bold text-white tracking-tight group-hover:text-cyan-100 transition-colors">
                {title}
            </h3>

            <p className="text-zinc-400 leading-relaxed text-sm">
                {description}
            </p>
        </motion.div>
    );
}

export function FeaturesSection() {
    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-black/50 backdrop-blur-sm">
            <div className="max-w-[2560px] mx-auto text-left">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-4"
                    >
                        Trust Architecture
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-zinc-400 max-w-2xl mx-auto text-lg"
                    >
                        Redefining digital identity with the highest standards of privacy and systemty.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Biometric Privacy (ZK-Snarks)"
                        description="Verify your KYC without ever revealing your actual biometric data. Your face generates a zero-knowledge mathematical proof; your data never leaves your device."
                        delay={0}
                    />
                    <FeatureCard
                        icon={LockOpen}
                        title="Total Digital Systemty"
                        description="Your identity credentials live in your wallet, not on our servers. You are the sole owner of your KYC; you decide what you share, with whom, and when."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={Blocks}
                        title="Universal Web3 Passport"
                        description="A single login for the entire ecosystem. Access Whale Alert Network, Aave, DAOs, and metaverses without managing multiple accounts or passwords."
                        delay={0.2}
                    />
                </div>
            </div>
        </section>
    );
}

