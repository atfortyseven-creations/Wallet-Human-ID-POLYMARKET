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
                    flex items-center gap-3 px-5 py-2.5 rounded-full 
                    bg-white border border-neutral-200 shadow-sm
                    text-neutral-900 hover:shadow-md hover:border-neutral-300 transition-all active:scale-95
                "
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-sm" />
                <div className="flex flex-col items-start leading-none gap-0.5">
                    <span className="font-bold text-sm tracking-tight">{activeAccount}</span>
                    <span className="text-[10px] text-neutral-400 font-medium">Ethereum Mainnet</span>
                </div>
                <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="
                    absolute top-full left-0 mt-3 w-80 
                    bg-white/90 backdrop-blur-xl border border-white/20 
                    rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden
                    animate-in fade-in zoom-in-95 duration-200 origin-top-left ring-1 ring-black/5
                ">
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-100 bg-white/50">
                        <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3 px-1">Mis Cuentas</div>
                        {/* Search Mock */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input 
                                type="search" 
                                placeholder="Buscar cuenta..." 
                                className="w-full bg-neutral-100 border-transparent rounded-xl py-2.5 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Account List */}
                    <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {[
                            { name: "Main Vault", bal: "12.5 ETH", color: "bg-blue-600" },
                            { name: "Trading Alpha", bal: "1.2 BTC", color: "bg-orange-500" },
                            { name: "Yield Farm", bal: "5K USDC", color: "bg-green-500" }
                        ].map((acc, i) => (
                            <div 
                                key={i}
                                onClick={() => { setActiveAccount(acc.name); setIsOpen(false); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-2xl cursor-pointer
                                    hover:bg-neutral-50 transition-colors group relative border
                                    ${activeAccount === acc.name ? 'bg-blue-50 border-blue-100' : 'border-transparent'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${acc.color} flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white`}>
                                        {acc.name[0]}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-bold ${activeAccount === acc.name ? 'text-blue-900' : 'text-neutral-900'}`}>{acc.name}</div>
                                        <div className="text-neutral-500 text-xs font-mono mt-0.5">{acc.bal}</div>
                                    </div>
                                </div>

                                {/* Three Dots Menu Trigger */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); alert(`Detalles de ${acc.name}`); }}
                                    className="p-2 text-neutral-300 hover:text-neutral-600 rounded-full hover:bg-neutral-200/50 transition-colors"
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100 transition-colors group">
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 font-bold text-sm group-hover:scale-[1.02] transition-transform">
                            <Plus size={16} /> Agregar Billetera
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
