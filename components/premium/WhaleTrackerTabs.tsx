"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const vipTabs = [
    { name: 'Overview', href: '/vip' },
    { name: 'Rastreador de whales', href: '/vip/tracker' },
    { name: 'Inst Capt TXs', href: '/vip/dark-pool' },
    { name: 'Volume', href: '/vip/volume' },
    { name: 'AI Risk Signals', href: '/vip/ai-risk' },
    { name: 'System Alerts', href: '/vip/alerts' },
    { name: 'Pulso IA', href: '/vip/pulse' },
    { name: 'Settlement Layer Health', href: '/vip/settlement' },
    { name: 'Systemic Risk Anomalies', href: '/vip/anomalies' },
    { name: 'Exchange Cockpit', href: '/vip/cockpit' },
    { name: 'Liquidity Contraction', href: '/vip/liquidity' },
    { name: 'Satoshi Detector', href: '/vip/satoshi' },
    { name: 'Inst Capital Clusters', href: '/vip/clusters' },
    { name: 'Entity Nexus', href: '/vip/nexus' },
];

export function WhaleTrackerTabs() {
    const pathname = usePathname();

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border-b border-white/10 pt-28 px-6 lg:px-12 fixed top-0 left-0 z-40">
            <div className="flex overflow-x-auto pb-0 scrollbar-hide gap-1 max-w-[1240px] mx-auto">
                {vipTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "relative px-4 py-4 text-xs tracking-wider uppercase font-medium transition-colors whitespace-nowrap",
                                isActive ? "text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            {tab.name}
                            {isActive && (
                                <motion.div
                                    layoutId="vip-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

