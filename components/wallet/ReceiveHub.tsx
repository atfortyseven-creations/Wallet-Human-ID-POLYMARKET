"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { getExplorerAddressUrl } from '@/lib/wallet/chains';

interface ReceiveHubProps {
    addresses: {
        network: string;
        address: string;
        token: string;
        chainId?: number; // Optional chainId for explorer links
        icon?: React.ReactNode;
    }[];
}

export default function ReceiveHub({ addresses = [] }: ReceiveHubProps) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [copied, setCopied] = useState(false);

    const current = addresses[selectedIdx] || { 
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
            
            {/* LEFT: ADDRESS LIST (Multi-address view) */}
            <div className="md:col-span-4 space-y-4">
                <h3 className="text-sm font-bold text-[#1F1F1F]/60 uppercase tracking-widest mb-4">Your Addresses</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {addresses.map((addr, idx) => (
                        <button
                            key={`${addr.network}-${idx}`}
                            onClick={() => setSelectedIdx(idx)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${
                                selectedIdx === idx 
                                    ? 'bg-white border-purple-500/30 shadow-lg scale-[1.02]' 
                                    : 'bg-white/40 border-transparent hover:bg-white/60'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${getNetworkColor(addr.network)}`}>
                                    {addr.token[0]}
                                </div>
                                <div className="text-left">
                                    <div className="text-[#1F1F1F] font-bold text-sm">{addr.network}</div>
                                    <div className="text-[#1F1F1F]/50 text-xs font-mono">{addr.address.slice(0, 6)}...{addr.address.slice(-4)}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER: BIG QR & INFO */}
            <div className="md:col-span-8">
                <motion.div 
                    layoutId={`card-${selectedIdx}`}
                    className="bg-white rounded-[40px] p-8 shadow-xl border border-[#1F1F1F]/5 flex flex-col items-center text-center relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold text-white mb-8 ${getNetworkColor(current.network)}`}>
                            {current.network} Network
                        </div>

                        {/* QR Display */}
                        <div className="p-4 bg-white rounded-3xl shadow-lg mb-8 border border-[#1F1F1F]/5">
                            <QRCodeSVG 
                                value={current.address} 
                                size={220}
                                level="H"
                                includeMargin={true}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Instruction Text */}
                        <p className="text-[#1F1F1F]/60 text-sm max-w-sm mb-2">
                             Utiliza esta dirección para recibir tokens y coleccionables en
                        </p>
                        <h2 className="text-2xl font-black text-[#1F1F1F] mb-8">
                            "{current.token}"
                        </h2>

                        {/* Address Box */}
                        <div className="w-full max-w-md bg-[#F5F5F0] rounded-2xl p-4 flex items-center justify-between mb-6 group cursor-pointer hover:bg-[#EAEADF] transition-colors"
                             onClick={() => handleCopy(current.address)}>
                            <p className="font-mono text-[#1F1F1F] text-sm md:text-base break-all text-center flex-1">
                                {current.address}
                            </p>
                            <div className={`${copied ? 'text-green-500' : 'text-[#1F1F1F]/30'} ml-2`}>
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full max-w-md mb-8">
                            <button 
                                onClick={() => handleCopy(current.address)}
                                className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Copy size={18} />
                                Copiar Dirección
                            </button>
                            
                            <a 
                                href={current.chainId ? getExplorerAddressUrl(current.chainId, current.address) : `https://etherscan.io/address/${current.address}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-4 bg-white border border-[#1F1F1F]/10 text-[#1F1F1F] rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center"
                                title="View on Explorer"
                            >
                                <ExternalLink size={20} />
                            </a>
                            
                            <button className="px-4 py-4 bg-white border border-[#1F1F1F]/10 text-[#1F1F1F] rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {/* Educational Tip for 404 addresses */}
                        <div className="w-full max-w-md p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 text-left">
                           <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                               <ExternalLink size={12} className="text-blue-600" />
                           </div>
                           <p className="text-xs text-blue-800 leading-relaxed font-medium">
                               <span className="font-bold block mb-1">¿Error 404 en el explorador?</span>
                               Las direcciones nuevas no aparecen en los buscadores públicos hasta que reciben su primera transacción o saldo. Es una medida estándar de las redes de blockchain.
                           </p>
                        </div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

function getNetworkColor(network: string) {
    if (network.includes('Bitcoin')) return 'bg-orange-500';
    if (network.includes('Polygon')) return 'bg-purple-500';
    if (network.includes('Solana')) return 'bg-teal-500';
    if (network.includes('Base')) return 'bg-blue-500';
    return 'bg-blue-600'; // Default ETH
}
