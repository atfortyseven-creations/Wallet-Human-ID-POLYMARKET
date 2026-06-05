"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExplorerAddressUrl } from '@/lib/wallet/chains';
import { UNIVERSAL_TOKENS } from '@/config/universal-tokens';
import { TokenLogo } from '@/components/ui/TokenLogo';
import { useSystemAccount } from '@/hooks/useSystemAccount';

interface ReceiveHubProps {
    addresses: {
        network: string;
        address: string;
        token: string;
        chainId?: number;
        iconPath?: string;
    }[];
}

export default function ReceiveHub({ addresses = [] }: ReceiveHubProps) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [copied, setCopied] = useState(false);
    const { address: systemAddress } = useSystemAccount();

    const baseAddress = systemAddress || addresses[0]?.address || '0x...';

    // Merge explicitly provided addresses with universal tokens
    const allAddresses = [
        ...addresses,
        ...UNIVERSAL_TOKENS.map(t => ({
            network: 'Ethereum', // Defaulting to Ethereum for tokens
            address: baseAddress,
            token: t.symbol,
            iconPath: t.logoPath
        }))
    ];

    const current = allAddresses[selectedIdx] || {
        network: 'Ethereum',
        address: '0x...',
        token: 'ETH'
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* LEFT: ADDRESS LIST */}
            <div className="md:col-span-4 space-y-4">
                <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.3em] mb-4">Your Addresses</h3>
                <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                    {allAddresses.map((addr, idx) => (
                        <button
                            key={`${addr.network}-${idx}`}
                            onClick={() => setSelectedIdx(idx)}
                            className={`w-full p-4 flex items-center justify-between transition-all border-b ${
                                selectedIdx === idx
                                    ? 'border-black bg-black !!text-white'
                                    : 'border-black/10 bg-transparent text-black hover:bg-black/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <TokenLogo 
                                    symbol={addr.token} 
                                    logoURI={addr.iconPath} 
                                    className="w-7 h-7 rounded-full" 
                                    fallbackClassName={`w-7 h-7 border flex items-center justify-center font-black text-[9px] uppercase ${selectedIdx === idx ? 'border-white !text-white' : 'border-black/20 text-black/40'}`} 
                                />
                                <div className="text-left">
                                    <div className={`font-black text-[10px] uppercase tracking-widest ${selectedIdx === idx ? '!text-white' : 'text-black'}`}>{addr.network}</div>
                                    <div className={`text-[9px] font-mono ${selectedIdx === idx ? '!text-white/60' : 'text-black/40'}`}>{addr.address.slice(0, 6)}...{addr.address.slice(-4)}</div>
                                </div>
                            </div>
                            {selectedIdx === idx && (
                                <span className="text-[9px] font-black !text-white/60 uppercase tracking-widest">[*]</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: QR + ADDRESS */}
            <div className="md:col-span-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="border border-black/10 bg-white p-8 flex flex-col items-center text-center"
                    >
                        {/* Network Label */}
                        <div className="border border-black px-4 py-1.5 mb-8">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black">{current.network} / {current.token}</span>
                        </div>

                        {/* QR Display */}
                        <div className="p-3 border border-black/10 mb-8">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${current.address}&color=000000&bgcolor=ffffff`}
                                alt="Wallet Address QR"
                                className="w-[200px] h-[200px] object-contain"
                            />
                        </div>

                        {/* Instruction */}
                        <p className="text-[9px] text-black/40 uppercase tracking-widest font-black mb-1">
                            Send {current.token} to this address on
                        </p>
                        <p className="text-[13px] font-black uppercase tracking-tight text-black mb-8">
                            {current.network} Network
                        </p>

                        {/* Address Box */}
                        <button
                            onClick={() => handleCopy(current.address)}
                            className="w-full max-w-md bg-black/5 border border-black/10 p-4 flex items-center justify-between mb-4 hover:bg-black/10 transition-colors group"
                        >
                            <p className="font-mono text-black text-xs break-all text-left flex-1">
                                {current.address}
                            </p>
                            <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors shrink-0">
                                {copied ? '[COPIED]' : '[COPY]'}
                            </span>
                        </button>

                        {/* Actions */}
                        <div className="flex gap-2 w-full max-w-md mb-6">
                            <button
                                onClick={() => handleCopy(current.address)}
                                className="flex-1 py-3 bg-black !!text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy Address'}
                            </button>
                            <a
                                href={(current as any).chainId ? getExplorerAddressUrl((current as any).chainId, current.address) : `https://etherscan.io/address/${current.address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-3 border border-black/20 text-black font-black text-[9px] uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center justify-center"
                                title="View on Explorer"
                            >
                                [EXP]
                            </a>
                        </div>

                        {/* Note */}
                        <div className="w-full max-w-md p-3 border border-black/10 bg-black/3 flex gap-3 text-left">
                            <span className="text-[9px] font-black text-black/30 shrink-0">[i]</span>
                            <p className="text-[9px] text-black/40 font-bold leading-relaxed uppercase tracking-wide">
                                New addresses appear in explorers only after the first transaction. Standard network behavior.
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
