"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Layers, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function NetworkTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Flow Analytics', href: '/network', icon: BarChart3 },
        { name: 'Mining Protocol', href: '/network/mining', icon: Zap },
    ];

    return (
        <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-6 border-b border-slate-200 mb-12">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "relative py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all whitespace-nowrap flex items-center gap-3",
                            isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <tab.icon size={14} className={isActive ? "text-indigo-600" : "text-slate-300"} strokeWidth={3} />
                        {tab.name}
                        {isActive && (
                            <motion.div
                                layoutId="network-tab-indicator"
                                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

