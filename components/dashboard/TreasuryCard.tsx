'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const TreasuryCard = () => {
    const [count, setCount] = useState(0);
    const TARGET_SUPPLY = 15000000; // 15M Circulating

    useEffect(() => {
        // Simple CountUp Logic
        const duration = 2000; // 2s
        const steps = 60;
        const stepTime = duration / steps;
        const increment = TARGET_SUPPLY / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= TARGET_SUPPLY) {
                setCount(TARGET_SUPPLY);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-amber-100/10 p-6 h-full min-h-[200px]"
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {/* Golden Glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-500" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                            <Landmark size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Protocol Treasury</h3>
                    </div>

                    <div className="space-y-1">
                        <div className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">
                            {Math.floor(count).toLocaleString()} <span className="text-lg text-gray-500">HMND</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-500/80 tracking-wide">DEFLATIONARY MECHANISM ACTIVE</span>
                        </div>
                    </div>
                </div>

                <Link href="/tokenomics" className="mt-6 group/btn">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10 group-hover/btn:bg-white/10 group-hover/btn:border-amber-500/30 transition-all">
                        <span className="text-xs font-bold text-gray-300 group-hover/btn:text-white">INSPECT LEDGER</span>
                        <ArrowRight size={14} className="text-gray-500 group-hover/btn:text-amber-500 transition-colors" />
                    </div>
                </Link>
            </div>
        </motion.div>
    );
};
