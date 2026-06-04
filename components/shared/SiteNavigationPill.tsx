"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, LayoutDashboard, Globe, HelpCircle, Atom } from 'lucide-react';

export function SiteNavigationPill() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/ledger',    label: 'Ledger',    icon: Globe,         active: pathname.startsWith('/ledger') },
        { href: '/portfolio', label: 'Portfolio', icon: LayoutDashboard, active: pathname.startsWith('/portfolio') },
        { href: '/qds',       label: 'QDs',       icon: Atom,          active: pathname.startsWith('/qds') },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] hidden lg:flex items-center gap-8 bg-white/40 backdrop-blur-3xl px-10 py-4 rounded-[2.5rem] border border-black/5 shadow-2xl hover:bg-white/60 transition-all group">
            {navLinks.map((link) => (
                <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                        link.active ? 'text-[#050505]' : 'text-[#050505]/40 hover:text-[#050505]'
                    }`}
                >
                    <link.icon size={12} className={link.active ? 'text-[#8B5CF6]' : 'text-[#050505]/20'} />
                    {link.label}
                </Link>
            ))}
            <div className="w-px h-4 bg-black/5" />
            <Link 
                href="/status"
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                    pathname.startsWith('/status') ? 'text-[var(--aztec-orchid)]' : 'text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-orchid)]'
                }`}
            >
                <div className={`w-1.5 h-1.5 rounded-full ${pathname.startsWith('/status') ? 'bg-[var(--aztec-orchid)] animate-pulse' : 'bg-[var(--aztec-ink)]/40'}`} />
                Status
            </Link>
            <div className="w-px h-4 bg-black/5 " />
            <Link 
                href="/dashboard" 
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                    pathname.startsWith('/dashboard') ? 'text-[var(--aztec-orchid)]' : 'text-[var(--aztec-ink)]/40 hover:text-[var(--aztec-orchid)]'
                }`}
            >
                <Crown size={12} /> Dashboard
            </Link>
        </div>
    );
}
