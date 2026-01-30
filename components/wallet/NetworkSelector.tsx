"use client";

import React, { useState } from 'react';
import { ChevronDown, Layers, Search } from 'lucide-react';

const NETWORKS = {
    popular: [
        { name: "Ethereum", color: "bg-[#627EEA]" },
        { name: "Linea", color: "bg-black border border-white/20" },
        { name: "Base", color: "bg-[#0052FF]" },
        { name: "Arbitrum", color: "bg-[#2D374B]" },
        { name: "BNB Chain", color: "bg-[#F3BA2F]" },
        { name: "OP Mainnet", color: "bg-[#FF0420]" },
        { name: "Polygon", color: "bg-[#8247E5]" },
    ],
    additional: [
        { name: "Avalanche", color: "bg-[#E84142]" },
        { name: "HyperEVM", color: "bg-purple-600" },
        { name: "Monad", color: "bg-[#814CCD]" },
        { name: "Sei", color: "bg-[#A73336]" },
        { name: "zkSync Era", color: "bg-[#FFFFFF] text-black" },
    ]
};

export function NetworkSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(NETWORKS.popular[0]);

    return (
        <div className="w-full max-w-md mx-auto relative z-40 my-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    bg-white/5 backdrop-blur-md border border-white/10
                    hover:bg-white/10 transition-colors group
                "
            >
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${selected.color} flex items-center justify-center text-[8px] font-bold`}>
                        {/* Logo Placeholder */}
                    </div>
                    <span className="text-white font-medium">{selected.name}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                    <span className="text-xs">Select Network</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Mega Menu Dropdown */}
            {isOpen && (
                <div className="
                    absolute top-full left-0 mt-2 w-full
                    bg-[#121212]/95 backdrop-blur-xl border border-white/10 box-border
                    rounded-2xl shadow-2xl p-4 overflow-hidden
                    animate-in fade-in slide-in-from-top-2 duration-200
                ">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input 
                            type="text" 
                            placeholder="Find network..." 
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-8">
                        {/* Column 1: Popular */}
                        <div className="flex-1">
                            <div className="text-xs text-white/40 font-bold uppercase mb-2">Populares</div>
                            <div className="space-y-1">
                                {NETWORKS.popular.map((net) => (
                                    <button 
                                        key={net.name}
                                        onClick={() => { setSelected(net); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                                    >
                                        <div className={`w-5 h-5 rounded-full ${net.color}`} />
                                        <span className="text-sm text-white/90">{net.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Additional/Custom */}
                        <div className="flex-1 border-l border-white/5 pl-4">
                             <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-white/40 font-bold uppercase">Adicionales</div>
                                <button className="text-[10px] text-blue-400 font-bold hover:underline">+ Custom</button>
                             </div>
                             <div className="space-y-1">
                                {NETWORKS.additional.map((net) => (
                                    <button 
                                        key={net.name}
                                        onClick={() => { setSelected(net); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                                    >
                                        <div className={`w-5 h-5 rounded-full ${net.color}`} />
                                        <span className="text-sm text-white/90">{net.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
