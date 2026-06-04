"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Twitter, Github, Lock, Database, ArrowUpRight, Globe, Code } from 'lucide-react';
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
                            <span className="text-xl pb-1"></span>
                            <span className="text-[12px] font-aztec-mono font-black tracking-[0.25em] uppercase text-white">Whale Alert Network</span>
                        </div>
                        <p className="text-[13px] font-sans text-white/40 leading-relaxed max-w-sm tracking-wide">
                            Advanced market insights and privacy infrastructure. Built to be simple, fast, and accessible for everyone in the world.
                        </p>
                    </div>

                    {/* Elite Navigation */}
                    <div className="md:col-span-7 grid grid-cols-2 gap-12 md:pl-16">
                        {/* Platform */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-aztec-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> Access
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/dashboard" icon={<Globe size={15} />}>Platform</FooterLink>
                                <FooterLink href="/portfolio" icon={<Database size={15} />}>Portfolio</FooterLink>
                                <FooterLink href="/academy" icon={<Code size={15} />}>Academy</FooterLink>
                                <FooterLink href="/forum" icon={<Lock size={15} />}>Forum</FooterLink>
                                <FooterLink href="/news" icon={<Globe size={15} />}>News</FooterLink>
                            </div>
                        </div>

                        {/* Connect */}
                        <div className="flex flex-col gap-8">
                            <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> Connect
                            </h4>
                            <div className="flex flex-col gap-5">
                                <FooterLink href="/privacy" icon={<Lock size={15} />}>Privacy</FooterLink>
                                <FooterLink href="/terms" icon={<Lock size={15} />}>Terms</FooterLink>
                            </div>
                        </div>

                        {/* Executed Phases */}
                        <div className="flex flex-col gap-8 md:col-span-2 mt-8 md:mt-0">
                            <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-white/30" /> System Phases
                            </h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                {[...Array(15)].map((_, i) => (
                                    <FooterLink key={i} href={`/phase-${i+1}`} icon={<Database size={12} />}>
                                        Phase {i+1}
                                    </FooterLink>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Secure Baseline */}
                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="text-[9px] font-aztec-mono font-black uppercase tracking-[0.4em] text-white/20 flex items-center justify-center gap-4 hover:text-white/40 transition-colors">
                        <Globe size={11} className="opacity-50" />
                        <span>© 2026 Whale Alert Network CORP  ALL RIGHTS RESERVED</span>
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
