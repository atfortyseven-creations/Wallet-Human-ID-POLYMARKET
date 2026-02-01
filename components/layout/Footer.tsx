import React from 'react';
import { SecurityShield } from '@/components/security/SecurityShield';
import { Twitter, Github, Globe, MessageCircle, Shield, ArrowUpRight, Download, Smartphone, Monitor } from 'lucide-react';
import { useApp } from '@/components/AppContext';

export const Footer = () => {
    const { t } = useApp();
    
    return (
        <footer className="relative z-10 mt-0 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
            {/* Immersive Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ff9d]/20 to-transparent" />

            <div className="max-w-[1440px] mx-auto px-6 py-24">
                <div className="flex flex-col items-center text-center">
                    
                    {/* CTA Section (Rainbow Style - Minimal & Bold) */}
                    <div className="max-w-4xl mx-auto mb-20">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            {t('footer.get_wallet')} <br />
                            <span className="text-white">Human DeFi</span>
                        </h2>
                        <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
                            The most secure and easy-to-use Web3 wallet. Available on all platforms.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <DownloadButton 
                                icon={<Smartphone size={24} />} 
                                label="Mobile App" 
                                sub="iOS & Android" 
                                active
                            />
                            <DownloadButton 
                                icon={<Monitor size={24} />} 
                                label="Extension" 
                                sub="Chrome & Brave" 
                            />
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-white/30">
                            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
                            Latest Version: v4.2.0 (Stable)
                        </div>
                    </div>

                    {/* Bottom Bar - Centered & Clean */}
                    <div className="w-full pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        
                        {/* Brand & Copyright */}
                        <div className="flex items-center gap-4">
                            <SecurityShield />
                            <div className="text-[10px] text-white/50 font-mono uppercase text-left">
                                © {new Date().getFullYear()} Humanidfi.com Org. <br />
                                Sovereign Intelligence.
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="flex items-center gap-4">
                            <SocialIcon icon={<Twitter size={18} />} href="https://twitter.com" />
                            <SocialIcon icon={<Github size={18} />} href="https://github.com" />
                            <SocialIcon icon={<MessageCircle size={18} />} href="https://discord.com" />
                            <SocialIcon icon={<Globe size={18} />} href="https://humanid.fi" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Helper Components

const DownloadButton = ({ icon, label, sub, active = false }: { icon: React.ReactNode, label: string, sub: string, active?: boolean }) => (
    <button className={`
        group relative overflow-hidden flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300
        ${active 
            ? 'bg-white text-black hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
        }
    `}>
        <div className={`
            p-2 rounded-lg transition-colors
            ${active ? 'bg-black/5' : 'bg-white/5 group-hover:bg-white/10'}
        `}>
            {icon}
        </div>
        <div className="text-left">
            <div className="text-sm font-bold leading-none mb-1">{label}</div>
            <div className={`text-[10px] font-mono ${active ? 'text-black/60' : 'text-white/40'}`}>{sub}</div>
        </div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </button>
);

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} className="block text-sm text-white/50 hover:text-[#00ff9d] transition-colors flex items-center gap-1 group">
        {children}
        <ArrowUpRight size={10} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
    </a>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all border border-transparent hover:border-white/10">
        {icon}
    </a>
);
