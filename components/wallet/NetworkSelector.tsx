"use client";

import React, { useState } from 'react';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NetworkSelector() {
    const chainId = useChainId();
    const { chains, switchChain, isPending } = useSwitchChain();
    const { isConnected } = useAccount();
    const [isOpen, setIsOpen] = useState(false);

    // Find current chain object
    const currentChain = chains.find(c => c.id === chainId);
    
    // Check if supported (if configured chains are the only ones allowed)
    // In wagmi config we defined the supported chains, so if chainId isn't in `chains`, it's wrong.
    const isWrongNetwork = !currentChain && isConnected;

    const handleSwitch = (id: number) => {
        switchChain({ chainId: id });
        setIsOpen(false);
    };

    if (!isConnected) return null;

    return (
        <div className="relative z-40">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                    ${isWrongNetwork 
                        ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'}
                `}
            >
                {isWrongNetwork ? (
                    <>
                        <AlertTriangle size={14} className="stroke-[2.5]" />
                        <span>Wrong Network</span>
                    </>
                ) : (
                    <>
                        {/* Dot Indicator */}
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span>{currentChain?.name || 'Unknown Network'}</span>
                    </>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1"
                    >
                        <div className="px-3 py-2 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                            Select Network
                        </div>
                        {chains.map((chain) => (
                            <button
                                key={chain.id}
                                disabled={isPending}
                                onClick={() => handleSwitch(chain.id)}
                                className={`
                                    w-full text-left px-3 py-2.5 text-sm flex items-center justify-between
                                    hover:bg-neutral-800 transition-colors
                                    ${chain.id === chainId ? 'text-white' : 'text-neutral-400'}
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    {/* Mock Icons based on name or generic */}
                                    <div className={`w-2 h-2 rounded-full ${chain.id === chainId ? 'bg-green-500' : 'bg-neutral-600'}`} />
                                    {chain.name}
                                </span>
                                {chain.id === chainId && <CheckCircle2 size={14} className="text-green-500" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
