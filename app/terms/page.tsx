"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Database, Scale } from 'lucide-react';
import { SystemFooter } from '@/components/landing/SystemFooter';

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TermsPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#c4f344]/20 bg-[#020605] text-white" style={{ minHeight: "100vh" }}>
            
            {/* HERO & BENTO BOX */}
            <div className="w-full max-w-[1400px] mx-auto pt-32 pb-24 px-6 lg:px-12 flex flex-col items-center">
                
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full text-center flex flex-col items-center mb-24">
                    <motion.div variants={FADE_UP} className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full shadow-sm mb-8">
                        <ShieldCheck size={16} className="text-[#c4f344]" />
                    </motion.div>
                    
                    <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] font-normal tracking-tighter leading-[0.95] text-white uppercase mb-8 font-serif italic">
                        Terms of <span className="text-[#c4f344] not-italic font-sans">Service.</span>
                    </motion.h1>
                    
                    <motion.p variants={FADE_UP} className="text-[18px] text-white/60 leading-relaxed max-w-2xl mb-8 font-light">
                        The definitive legal agreement establishing the parameters of interaction between users and the Humanity Ledger infrastructure, powered by Aztec Network.
                    </motion.p>
                    
                    <motion.p variants={FADE_UP} className="font-mono text-[11px] uppercase tracking-widest font-bold text-white/30">
                        Effective Date: January 1, 2026
                    </motion.p>
                </motion.div>

                {/* Principles */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1200px] mx-auto mb-32">
                    
                    {/* Bento 1 */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-[#c4f344]/30 transition-all duration-500">
                        <div className="w-full h-[180px] bg-black/20 rounded-3xl border border-white/5 mb-8 flex flex-col items-center justify-center overflow-hidden gap-4 text-white/20">
                            <Scale size={48} strokeWidth={1} className="group-hover:text-[#c4f344] transition-colors duration-500" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Self-Custody</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-[22px] font-bold uppercase tracking-tight text-white">Absolute Ownership</h3>
                            </div>
                            <p className="text-[15px] leading-relaxed text-white/60 font-light">
                                Operational independence is guaranteed by cryptography. You maintain total custody and responsibility for your private keys and encrypted state notes.
                            </p>
                        </div>
                    </div>

                    {/* Bento 2 */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-[#c4f344]/30 transition-all duration-500">
                        <div className="w-full h-[180px] bg-black/20 rounded-3xl border border-white/5 mb-8 flex flex-col items-center justify-center overflow-hidden gap-4 text-white/20">
                            <Database size={48} strokeWidth={1} className="group-hover:text-[#c4f344] transition-colors duration-500" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Client-Side Execution</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-[22px] font-bold uppercase tracking-tight text-white">Zero-Knowledge Verification</h3>
                            </div>
                            <p className="text-[15px] leading-relaxed text-white/60 font-light">
                                All proofs are generated locally on your device. The network only receives cryptographically verified zero-knowledge payloads, ensuring absolute data privacy.
                            </p>
                        </div>
                    </div>

                </motion.div>

                {/* SECTIONS */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-bold tracking-tighter shrink-0 text-white/10 leading-none">01</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight mb-8 text-[#c4f344] uppercase">Protocol Interaction</h2>
                            <div className="space-y-6 text-white/70 text-[18px] leading-[1.8] font-light">
                                <p>
                                    This document constitutes the legal agreement governing your use of the Humanity Ledger interface. By generating zero-knowledge proofs, deploying Noir contracts, or engaging with our decentralized sequencing architecture, you agree to these terms.
                                </p>
                                <p>
                                    The platform is a non-custodial, decentralized privacy infrastructure. Access to the protocol is facilitated through open-source cryptography. We do not custody, wrap, escrow, or otherwise manage your cryptographic assets or private viewing keys.
                                </p>
                                <p>
                                    Consequently, we are mathematically incapable of reversing, pausing, or altering transactions once they have been signed by your wallet and finalized by the decentralized sequencer network on Ethereum Layer 1.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-bold tracking-tighter shrink-0 text-white/10 leading-none">02</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight mb-8 text-[#c4f344] uppercase">Limitation of Liability</h2>
                            <div className="space-y-6 text-white/70 text-[18px] leading-[1.8] font-light">
                                <p>
                                    The protocol provides privacy-preserving infrastructure using experimental zero-knowledge cryptography. While the code is heavily audited, the use of decentralized finance protocols inherently carries significant risk.
                                </p>
                                
                                <div className="p-8 my-10 bg-red-950/20 border border-red-500/30 rounded-3xl shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <AlertTriangle className="mb-6 text-red-400 relative z-10" size={32} />
                                    <p className="font-mono text-[12px] leading-[1.8] uppercase tracking-widest font-bold text-red-300 relative z-10">
                                        "Interaction with zero-knowledge smart contracts implies an acknowledgment of cryptographic risk. We expressly disclaim all liability for capital loss resulting from protocol exploits, network congestion, incorrect proof generation, or loss of private decryption keys."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-bold tracking-tighter shrink-0 text-white/10 leading-none">03</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight mb-8 text-[#c4f344] uppercase">Usage Restrictions</h2>
                            <div className="space-y-6 text-white/70 text-[18px] leading-[1.8] font-light">
                                <p>
                                    The protocol is designed to provide financial privacy for legitimate users. We strictly prohibit the use of our infrastructure for money laundering, terrorism financing, or any activity that violates applicable international sanctions.
                                </p>
                                <p>
                                    While we cannot access your private state, we reserve the right to block IP addresses or client-side identifiers that engage in denial of service attacks against our RPC infrastructure or attempt to exploit the platform's front-end interfaces.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            
            <SystemFooter />
        </div>
    );
}
