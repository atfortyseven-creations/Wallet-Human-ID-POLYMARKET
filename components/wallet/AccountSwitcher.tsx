"use client";

import React, { useState } from 'react';
import { ChevronDown, Plus, MoreVertical, Copy, EyeOff, Key, Shield } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';

export function AccountSwitcher() {
    const { address, isConnected } = useAppKitAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [activeAccount, setActiveAccount] = useState("Main Vault");

    // Mock functionality for the requested "Account Details" menu
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="relative z-50">
            {/* Main Trigger Button */}
            <button 
                onClick={toggleMenu}
                className="
                    flex items-center gap-2 px-4 py-2 rounded-full 
                    bg-white/10 backdrop-blur-md border border-white/10 
                    text-white hover:bg-white/20 transition-all active:scale-95
                "
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20" />
                <span className="font-medium text-sm hidden md:block">{activeAccount}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="
                    absolute top-full left-0 mt-2 w-72 
                    bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 
                    rounded-2xl shadow-2xl overflow-hidden
                    animate-in fade-in zoom-in-95 duration-200 origin-top-left
                ">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">Mis Cuentas</div>
                        {/* Search Mock */}
                        <input 
                            type="search" 
                            placeholder="Buscar cuenta..." 
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Account List (Stacked Logic Mock) */}
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                        {[
                            { name: "Main Vault", bal: "12.5 ETH", color: "bg-blue-500" },
                            { name: "Trading Alpha", bal: "1.2 BTC", color: "bg-orange-500" },
                            { name: "Yield Farm", bal: "5K USDC", color: "bg-green-500" }
                        ].map((acc, i) => (
                            <div 
                                key={i}
                                onClick={() => { setActiveAccount(acc.name); setIsOpen(false); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-xl cursor-pointer
                                    hover:bg-white/10 transition-colors group relative
                                    ${activeAccount === acc.name ? 'bg-white/5 border border-blue-500/30' : 'border border-transparent'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${acc.color} flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}>
                                        {acc.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-medium">{acc.name}</div>
                                        <div className="text-white/50 text-xs">{acc.bal}</div>
                                    </div>
                                </div>

                                {/* Three Dots Menu Trigger */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); alert(`Detalles de ${acc.name}`); }}
                                    className="p-2 text-white/20 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="Account Options"
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-2 border-t border-white/5 bg-white/5">
                        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all text-sm">
                            <Plus size={16} /> Add Wallet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
