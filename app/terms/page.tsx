'use client';

import React from 'react';
import Link from 'next/link';
import { Gavel, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <div className="max-w-4xl mx-auto px-6 py-20">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-12 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Life</span>
                </Link>

                <header className="mb-16">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 text-black mb-6">
                        <Gavel size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Usage Governance</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
                        TERMS OF <br />
                        <span className="text-gray-400">ENGAGEMENT.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                        By accessing Human DeFi, you enter a decentralized environment of absolute responsibility. 
                        Read these terms carefully to understand your sovereignty.
                    </p>
                </header>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">1. Absolute Responsibility</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You are the sole owner of your private keys. Loss of keys equals loss of assets. Human DeFi is a non-custodial interface; we cannot recover, reset, or access your funds under any circumstances.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">2. "As-Is" Service</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The software is provided "as is" without warranty of any kind. While we strive for perfection in our smart contracts and security layers, you acknowledge the inherent risks of DeFi and blockchain technology.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">3. Prohibited Activities</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You agree not to use this interface for money laundering, terrorist financing, or any activity that violates the fundamental principles of human rights and decentralized ethics.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">4. DAO Governance</h2>
                        <p className="text-gray-600 leading-relaxed">
                            These terms are subject to change via community governance. Your continued use of the platform constitutes acceptance of any DAO-approved modifications.
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
