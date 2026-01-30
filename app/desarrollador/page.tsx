
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code2, Database, Cpu, Wifi, Globe, User } from 'lucide-react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { HumanDefiFooter } from '@/components/landing/HumanDefiFooter';

export default function JavascriptDeveloperPage() {
    // Tech Stack Data
    const stack = [
        { icon: <Code2 />, name: "Next.js 14", desc: "App Router & Server Actions" },
        { icon: <Database />, name: "Prisma ORM", desc: "PostgreSQL Type-safe DB" },
        { icon: <Cpu />, name: "AI Integration", desc: "Gemini / OpenAI Agents" },
        { icon: <Wifi />, name: "Wagmi / Viem", desc: "Ethereum & L2 Hooks" },
    ];

    return (
        <div className="min-h-screen bg-[#111111] text-[#EAEADF] font-sans selection:bg-[#EAEADF] selection:text-[#111111] flex flex-col">
            <SiteHeader />
            
            <main className="flex-grow">
                {/* Hero / Letter Section */}
                <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl relative z-10"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <Terminal size={32} className="text-blue-400" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Humanity.</span>
                        </h1>
                        <div className="space-y-6 text-lg md:text-xl text-neutral-400 leading-relaxed font-light font-mono text-left max-w-2xl mx-auto border-l-2 border-white/10 pl-6">
                            <p>
                                <strong className="text-white">Developer Note:</strong>
                            </p>
                            <p>
                                I built this system not just as a wallet, but as a sovereign identity layer. 
                                Every line of code in <span className="text-yellow-200">src/</span> is designed 
                                to protect your data while giving you seamless access to the decentralized web.
                            </p>
                            <p>
                                No hidden trackers. No selling data. Just pure, open-source logic connecting 
                                you to the global financial system.
                            </p>
                            <p className="pt-4 text-sm opacity-60">
                                - The Architect
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Tech Stack Grid */}
                <section className="px-6 py-20 bg-[#161616] border-y border-white/5">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stack.map((tech, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {tech.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
                                    <p className="text-sm text-neutral-500">{tech.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Connection Section */}
                <section className="px-6 py-32 text-center">
                    <h2 className="text-3xl font-bold mb-12">The Bridge</h2>
                    <div className="flex items-center justify-center gap-8 md:gap-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <Code2 size={40} />
                            </div>
                            <span className="font-mono text-sm">DEVELOPER</span>
                        </div>
                        
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-24 md:w-64 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-ping" />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <User size={40} />
                            </div>
                            <span className="font-mono text-sm">USER</span>
                        </div>
                    </div>
                </section>

            </main>
            
            <div className="p-6">
                 <HumanDefiFooter />
            </div>
        </div>
    );
}
