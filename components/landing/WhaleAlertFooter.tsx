"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Youtube, Instagram, Rss, Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Custom icons for brands not in Lucide (Discord, TikTok, Reddit)
const DiscordIcon = ({ size = 20 }: { size?: number }) => {
    const s = Math.max(1, size || 20);
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1892.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.1023.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1569 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
        </svg>
    );
};

const TikTokIcon = ({ size = 20 }: { size?: number }) => {
    const s = Math.max(1, size || 20);
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
        </svg>
    );
};

const RedditIcon = ({ size = 20 }: { size?: number }) => {
    const s = Math.max(1, size || 20);
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
    );
};


export function WhaleAlertFooter() {
    const { t } = useLanguage();

    const sections = [
        {
            title: "Whale Alert Network",
            links: [
                { name: t('footer.get_wallet'), href: "/wallet" },
                { name: t('footer.buy'), href: "#" },
                { name: t('footer.earn'), href: "#" },
                { name: t('footer.redeem'), href: "#" },
                { name: t('footer.rewards'), href: "#" }
            ]
        },
        {
            title: t('footer.new').toUpperCase(),
            links: [
                { name: t('footer.predict'), href: "#" },
                { name: t('footer.perps'), href: "#" },
                { name: t('footer.shield'), href: "#" },
                { name: t('footer.snaps'), href: "#" }
            ]
        },
        {
            title: t('footer.products'),
            links: [
                { name: "Whale Card", href: "/wallet" },
                { name: t('footer.smart_kit'), href: "#" },
                { name: t('footer.embedded'), href: "#" }
            ]
        },
        {
            title: t('footer.learn'),
            links: [
                { name: t('footer.developers'), href: "/developer" },

                { name: t('footer.dashboard'), href: "/dashboard" },
                { name: t('footer.sdk'), href: "#" },
                { name: t('footer.web3_services'), href: "#" }
            ]
        },
        {
            title: t('footer.about'),
            links: [
                { name: t('footer.security'), href: "#" },
                { name: t('footer.support' as any), href: "/support" },
                { name: t('footer.blog'), href: "#" },

                { name: t('footer.contact'), href: "#" }
            ]
        }
    ];

    const socialLinks = [
        { icon: <Twitter size={24} />, href: "https://x.com/antonioestt?t=R2chzvH1IOt18jYNM8epVw&s=09" },
        { icon: <Github size={24} />, href: "https://github.com/humanityledger" },
        { icon: <Youtube size={24} />, href: "#" },
        { icon: <Instagram size={24} />, href: "https://www.instagram.com/antonioestt?igsh=YndraW8zcXQ4amls" },
        { icon: <DiscordIcon size={24} />, href: "#" },
        { icon: <RedditIcon size={24} />, href: "#" },
        { icon: <TikTokIcon size={24} />, href: "#" },
        { icon: <Rss size={24} />, href: "#" },
    ];

    return (
        <footer className="w-full bg-white py-16 border-t border-black/5">
            <div className="max-w-[2560px] mx-auto px-4 text-left">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Navigation</h3>
                        <ul className="space-y-2">
                            <li><Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link></li>
                            <li><Link href="/portfolio" className="text-sm text-slate-600 hover:text-slate-900">Portfolio</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Community</h3>
                        <ul className="space-y-2">
                            <li><Link href="/forum" className="text-sm text-slate-600 hover:text-slate-900">Forum</Link></li>
                            <li><Link href="/chat" className="text-sm text-slate-600 hover:text-slate-900">Chat</Link></li>
                            <li><Link href="/news" className="text-sm text-slate-600 hover:text-slate-900">News</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Resources</h3>
                        <ul className="space-y-2">

                            <li><Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">Privacy</Link></li>
                            <li><Link href="/status" className="text-sm text-slate-600 hover:text-slate-900">Status</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Company</h3>
                        <ul className="space-y-2">

                            <li><Link href="/academy" className="text-sm text-slate-600 hover:text-slate-900">Academy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-black/5">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Humanity Ledger
                    </p>
                </div>
            </div>
        </footer>
    );
}
