'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <div className="max-w-4xl mx-auto px-6 py-20">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-12 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Life</span>
                </Link>

                <header className="mb-16">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 text-black mb-6">
                        <Shield size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Privacy Protocol</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                        WE PROTECT <br />
                        <span className="text-gray-400">YOUR SOVEREIGNTY.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        Your data is yours. We don't track, we don't sell, we don't compromise. 
                        Human DeFi is built on the principle of absolute digital privacy.
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">1. Data Collection</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We do not collect personal identification information. We do not store your private keys, seed phrases, or any credentials that could compromise your assets. All transactional data is processed on-chain and remains under your exclusive control.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">2. Zero-Knowledge Proofs</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our architecture utilizes ZK-STARKs and stealth address protocols to ensure that while your interactions are cryptographically verifiable, your identity remains completely anonymous to us and third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. Third Party Services</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may interact with public RPC nodes and blockchain explorers. These services only see your public wallet address and encrypted transaction data as per standard blockchain operation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">4. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Since we do not hold your data, you are the sole steward of your information. You have the right to disappear from the network at any time by simply ceasing to use the interface.
                        </p>
                    </section>
                </div>

                <footer className="mt-24 pt-12 border-t border-gray-100 italic text-gray-400 text-sm">
                    Last updated: February 2, 2026. Human DeFi DAO.
                </footer>
            </div>
        </div>
    );
}
