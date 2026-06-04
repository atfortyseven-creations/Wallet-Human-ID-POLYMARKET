"use client";

import React from 'react';
import { motion } from 'framer-motion';

const TICKER_TOKENS = [
    { symbol: 'BTC', price: '64,231.50', change: '+2.4%' },
    { symbol: 'ETH', price: '3,452.12', change: '+1.8%' },
    { symbol: 'SOL', price: '145.62', change: '+5.4%' },
    { symbol: 'BNB', price: '584.20', change: '+0.4%' },
    { symbol: 'XRP', price: '0.62', change: '-1.2%' },
    { symbol: 'ADA', price: '0.45', change: '+0.2%' },
    { symbol: 'DOGE', price: '0.16', change: '+8.4%' },
    { symbol: 'LINK', price: '18.42', change: '+3.1%' },
    { symbol: 'MATIC', price: '0.92', change: '-2.4%' },
    { symbol: 'AVAX', price: '45.12', change: '+4.2%' },
    { symbol: 'DOT', price: '7.42', change: '+1.1%' },
    { symbol: 'UNI', price: '12.45', change: '+2.8%' },
    { symbol: 'LDO', price: '2.45', change: '+5.2%' },
    { symbol: 'ARB', price: '1.12', change: '+0.8%' },
    { symbol: 'OP', price: '3.42', change: '+1.4%' },
];

export function GlobalTokenTicker() {
    const doubledTokens = [...TICKER_TOKENS, ...TICKER_TOKENS];

    return (
        <div className="fixed top-0 left-0 w-full h-8 bg-black/5/50 backdrop-blur-md border-b border-slate-100 z-40 overflow-hidden flex items-center pointer-events-none select-none">
            <motion.div 
                className="flex items-center gap-16 whitespace-nowrap"
                animate={{ x: [0, -1500] }}
                transition={{ 
                    duration: 40, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
            >
                {doubledTokens.map((token, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{token.symbol}</span>
                        <span className="text-[10px] font-mono font-black text-slate-900">${token.price}</span>
                        <span className={`text-[8px] font-black ${token.change.startsWith('+') ? 'text-[var(--aave-teal)]' : 'text-rose-500'}`}>
                            {token.change}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
