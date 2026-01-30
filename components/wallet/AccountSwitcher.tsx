"use client";

import React, { useState } from 'react';
import { ChevronDown, Plus, MoreVertical, Copy, LogOut, ExternalLink, User, Wallet } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect, useEnsName } from 'wagmi';

export function AccountSwitcher() {
    const { address, isConnected } = useAppKitAccount();
    const { open } = useAppKit();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address: address as `0x${string}` });
    
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        if (!isConnected) {
            open();
        } else {
            setIsOpen(!isOpen);
        }
    };

    const formattedAddress = address 
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : '';
    
    const displayName = ensName || formattedAddress || "Connect Wallet";

    return (
        <div className="relative z-50">
            {/* Main Trigger Button */}
            <button 
                onClick={toggleMenu}
                className="
                    flex items-center gap-3 px-5 py-2.5 rounded-full 
                    bg-white border border-neutral-200 shadow-sm
                    text-neutral-900 hover:shadow-md hover:border-neutral-300 transition-all active:scale-95
                    min-w-[180px] justify-between
                "
                aria-haspopup="true"
                aria-expanded={isConnected ? isOpen : false}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${isConnected ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-neutral-200'}`}>
                         {isConnected ? <User size={14} className="text-white" /> : <Wallet size={14} className="text-neutral-500" />}
                    </div>
                    <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="font-bold text-sm tracking-tight">{displayName}</span>
                        {isConnected && <span className="text-[10px] text-neutral-400 font-medium">Main Vault</span>}
                    </div>
                </div>
                {isConnected && (
                    <ChevronDown size={16} className={`text-neutral-400 transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {/* Dropdown Menu */}
            {isConnected && isOpen && (
                <div className="
                    absolute top-full left-0 mt-3 w-80 
                    bg-white/95 backdrop-blur-xl border border-white/20 
                    rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden
                    animate-in fade-in zoom-in-95 duration-200 origin-top-left ring-1 ring-black/5
                ">
                    {/* Header: Active Account Info */}
                    <div className="p-4 border-b border-neutral-100 bg-white/50">
                        <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-2">Active Account</div>
                        <div className="flex items-center justify-between bg-neutral-100 p-3 rounded-xl">
                            <span className="font-mono text-sm text-neutral-700">{formattedAddress}</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(address || '');
                                    }}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors text-neutral-500 hover:text-blue-600"
                                >
                                    <Copy size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://etherscan.io/address/${address}`, '_blank');
                                    }}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors text-neutral-500 hover:text-blue-600"
                                >
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-2 bg-neutral-50/50">
                        <button 
                            onClick={() => { disconnect(); setIsOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors"
                        >
                            <LogOut size={16} /> Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
