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
            className="relative z-10 bg-white border-t border-black/5 overflow-hidden text-black/80 pb-12 pt-28 font-sans"
        >

            {/* Atmosphere Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c084fc]/30 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-[2560px] mx-auto px-8 md:px-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Identity */}
                    <div className="md:col-span-5 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-6 bg-black/5 border border-black/10 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm">
                            <span className="text-[12px] font-aztec-mono font-black tracking-[0.25em] uppercase text-black">Whale Network</span>
                        </div>
                        <p className="text-[13px] font-sans text-black/60 leading-relaxed max-w-sm tracking-wide mb-8">
                            Decentralized digital identity and financial privacy infrastructure built natively on Aztec Network L2. 
                        </p>
                    </div>

                    {/* Elite Navigation */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-4 gap-10 md:pl-12">
                        
                        {/* PRODUCT */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[11px] font-sans font-black uppercase tracking-[0.1em] text-black">PRODUCT</h4>
                            <div className="flex flex-col gap-4">
                                <FooterLink href="/architecture">Architecture</FooterLink>
                                <FooterLink href="/registry">Registry</FooterLink>
                                <FooterLink href="/whitepaper">Whitepaper</FooterLink>
                            </div>
                        </div>

                        {/* DEVELOPERS */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[11px] font-sans font-black uppercase tracking-[0.1em] text-black">DEVELOPERS</h4>
                            <div className="flex flex-col gap-4">
                                <FooterLink href="/api-docs">API Docs</FooterLink>
                                <FooterLink href="/zk-sandbox">ZK Sandbox</FooterLink>
                                <FooterLink href="/architecture">Architecture</FooterLink>
                                <FooterLink href="https://github.com/Whale-Network" external>GitHub</FooterLink>
                            </div>
                        </div>

                        {/* COMPANY */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[11px] font-sans font-black uppercase tracking-[0.1em] text-black">COMPANY</h4>
                            <div className="flex flex-col gap-4">
                                <FooterLink href="/vision">Vision</FooterLink>
                            </div>
                        </div>

                        {/* REGULATORY */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[11px] font-sans font-black uppercase tracking-[0.1em] text-black">REGULATORY</h4>
                            <div className="flex flex-col gap-4">
                                <FooterLink href="/legal/compliance">Attestation Docs</FooterLink>
                                <FooterLink href="/legal/aztec-grant-transparency">Aztec Transparency</FooterLink>
                                <FooterLink href="/legal/terms">Terms & Conditions</FooterLink>
                                <FooterLink href="/legal/privacy">Privacy Policy</FooterLink>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Secure Baseline & Legal Disclaimer MiCA */}
                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    
                    {/* MiCA Warning */}
                    <div className="max-w-4xl mx-auto text-center border border-black/5 bg-black/5 p-4 rounded-lg">
                        <p className="text-[10px] text-black/60 font-sans leading-relaxed text-justify">
                            <strong className="text-black/80">⚠️ Regulatory Risk Warning (MiCA):</strong> The acquisition of the $QDs token entails risks. It is possible to lose the entire capital invested. The $QDs token is not covered by deposit guarantee schemes or investor compensation schemes. This crypto-asset has not been verified or approved by the CNMV or any other competent authority. Read the full Whitepaper before operating.
                        </p>
                    </div>

                    <div className="text-[9px] font-aztec-mono font-black uppercase tracking-[0.4em] text-black/40 flex items-center justify-center gap-4 hover:text-black/60 transition-colors mt-4">
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
}

const FooterLink = ({ href, children, external = false }: FooterLinkProps) => (
    <Link 
        href={href} 
        target={external ? "_blank" : "_self"}
        rel={external ? "noopener noreferrer" : ""}
        className="text-[12.5px] font-sans font-medium text-black/60 hover:text-black transition-colors"
    >
        {children}
    </Link>
);
