"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Twitter, Github, Lock, Database, ArrowUpRight, Globe, Code, Shield, Scale, FileCheck } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <footer 
            className="relative z-10 bg-[#050505] border-t border-white/5 overflow-hidden text-white/80 pb-12 pt-28 font-sans"
        >

            {/* Atmosphere Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--aztec-orchid)]/30 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-[2560px] mx-auto px-8 md:px-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Identity */}
                    <div className="md:col-span-5 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-6 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-2xl">
                            <span className="text-[12px] font-aztec-mono font-black tracking-[0.25em] uppercase text-white">Whale Network</span>
                        </div>
                        <p className="text-[13px] font-sans text-white/40 leading-relaxed max-w-sm tracking-wide mb-8">
                            Decentralized digital identity and financial privacy infrastructure built natively on Aztec Network L2. 
                        </p>
                        
                        {/* Legal Links */}
                        <div className="flex flex-wrap gap-4 text-[11px] font-sans text-white/30 font-semibold tracking-wider">
                            <Link href="/legal/legal-notice" className="hover:text-white transition-colors">Legal Notice</Link>
                            <span className="opacity-30">•</span>
                            <Link href="/legal/aztec-grant-transparency" className="hover:text-white transition-colors">Aztec Grant Transparency</Link>
                            <span className="opacity-30">•</span>
                            <Link href="/legal/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
                            <span className="opacity-30">•</span>
                            <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <span className="opacity-30">•</span>
                            <Link href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
                            <span className="opacity-30">•</span>
                            <Link href="/legal/compliance" className="hover:text-[#c084fc] transition-colors flex items-center gap-1">
                                <Shield size={10} /> Compliance Docs
                            </Link>
                        </div>
                    </div>

                    {/* Elite Navigation */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-4 gap-10 md:pl-12">
                        
                        {/* PRODUCT */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> Product
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/architecture" icon={<Database size={15} />}>Architecture</FooterLink>
                                <FooterLink href="/registry" icon={<Lock size={15} />}>Registry</FooterLink>
                                <FooterLink href="/whitepaper" icon={<Globe size={15} />}>Whitepaper</FooterLink>
                            </div>
                        </div>

                        {/* REGULATORY */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-[#c084fc]/60 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-[#c084fc]/40" /> Regulatory
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/legal/compliance" icon={<Shield size={15} />}>Compliance Docs</FooterLink>
                                <FooterLink href="/legal/aztec-grant-transparency" icon={<Scale size={15} />}>Aztec Grant Transparency</FooterLink>
                                <FooterLink href="/legal/compliance" icon={<FileCheck size={15} />}>AML/KYC Policy</FooterLink>
                            </div>
                        </div>

                        {/* DEVELOPERS */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> Developers
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/api-docs" icon={<Code size={15} />}>API Docs</FooterLink>
                                <FooterLink href="https://github.com/Whale-Network" external icon={<Github size={15} />}>GitHub</FooterLink>
                            </div>
                        </div>

                        {/* COMPANY */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> Company
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/vision" icon={<Globe size={15} />}>Vision</FooterLink>
                                <FooterLink href="https://twitter.com/whalenetwork" external icon={<Twitter size={15} />}>Twitter</FooterLink>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Secure Baseline & Legal Disclaimer MiCA */}
                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    
                    {/* MiCA Warning */}
                    <div className="max-w-4xl mx-auto text-center border border-white/5 bg-black/20 p-4 rounded-lg">
                        <p className="text-[10px] text-white/30 font-sans leading-relaxed text-justify">
                            <strong className="text-white/50">⚠️ Regulatory Risk Warning (MiCA):</strong> The acquisition of the $QDs token entails risks. It is possible to lose the entire capital invested. The $QDs token is not covered by deposit guarantee schemes or investor compensation schemes. This crypto-asset has not been verified or approved by the CNMV or any other competent authority. Read the full Whitepaper before operating.
                        </p>
                    </div>

                    <div className="text-[9px] font-aztec-mono font-black uppercase tracking-[0.4em] text-white/20 flex items-center justify-center gap-4 hover:text-white/40 transition-colors mt-4">
                        <Globe size={11} className="opacity-50" />
                        <span>© 2026 HUMANITY LEDGER S.L. (In process of incorporation) • ALL RIGHTS RESERVED</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

interface FooterLinkProps {
    href: string;
    children: React.ReactNode;
    external?: boolean;
    icon?: React.ReactNode;
}

const FooterLink = ({ href, children, external = false, icon }: FooterLinkProps) => (
    <Link 
        href={href} 
        target={external ? "_blank" : "_self"}
        rel={external ? "noopener noreferrer" : ""}
        className="group flex items-center gap-4 text-[13px] font-sans font-semibold text-white/40 hover:text-white transition-all w-fit relative"
    >
        {/* Animated indicator line */}
        <div className="absolute -left-4 w-1 h-[1px] bg-white opacity-0 group-hover:opacity-100 group-hover:-left-6 transition-all duration-300" />
        
        {icon && <span className="text-white/20 group-hover:text-[var(--aztec-orchid)] transition-colors duration-300">{icon}</span>}
        <span className="tracking-wide group-hover:translate-x-1 transition-transform duration-300">{children}</span>
        
        <ArrowUpRight 
            size={12} 
            className="opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-white/60" 
        />
    </Link>
);
