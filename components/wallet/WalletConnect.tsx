"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect, useEnsName, useBalance, useConnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Copy, Check, LogOut, ChevronDown, Wallet, Globe, ShieldCheck, MessageCircle } from "lucide-react";
import NextLink from "next/link";
import { toast } from "sonner";

export default function WalletConnect() {
    const { address, isConnected, chain } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address });
    const { data: ensName } = useEnsName({ address });
    const { open } = useAppKit();

    // Add effect to sync wallet with backend on connection
    const { isConnected: isWagmiConnected } = useAccount();
    
    useEffect(() => {
        if (isWagmiConnected && address) {
            fetch('/api/wallet/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address })
            }).catch(err => console.error("Sync failed", err));
        }
    }, [isWagmiConnected, address]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const displayName = ensName || (address ? formatAddress(address) : "");

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Address Copied");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative z-50">
            <AnimatePresence mode="wait">
                {!isConnected ? (
                    <div className="flex items-center gap-2">
                        {/* Primary Connect - AppKit (Unified) */}
                        <motion.button
                            key="connect-appkit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => open()}
                            className="px-6 py-2 rounded-full bg-[#1F1F1F] text-[#EAEADF] font-black text-xs tracking-widest border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 group"
                        >
                            <Wallet size={14} className="group-hover:rotate-12 transition-transform" />
                            CONNECT WALLET
                        </motion.button>

                        {/* Direct MM Hook - Following Step 262 Instruction */}
                        <motion.button
                            key="connect-mm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                                
                                // FORCE PC SIGNATURE FLOW
                                if (!isMobile && typeof window !== 'undefined' && (window as any).ethereum) {
                                    try {
                                        const provider = (window as any).ethereum;
                                        // FIX: Removed dummy personal_sign request here.
                                        // Previously it injected a Math.random() token and forced the user to sign
                                        // a fake message before triggering Wagmi connect, resulting in double-signing
                                        // because AppKit/SIWE handles the real EIP-4361 signature downstream.
                                        await provider.request({ method: 'eth_requestAccounts' });
                                        const connector = connectors.find(c => c.id === 'io.metamask' || c.id === 'metaMask' || c.id.includes('metamask'));
                                        if (connector) connect({ connector });
                                        return;
                                    } catch (err) {
                                        console.error('MetaMask direct connection failed:', err);
                                        // fallback to normal connect
                                    }
                                }

                                const mm = connectors.find(c => c.id === 'metaMaskSDK' || c.name.toLowerCase().includes('metamask'));
                                if (mm) {
                                    connect({ connector: mm });
                                } else {
                                    open();
                                }
                            }}
                            className="p-2 rounded-full bg-[#F6851B]/10 text-[#F6851B] border border-[#F6851B]/20 hover:bg-[#F6851B]/20 transition-all"
                            title="Direct MetaMask Connect"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" className="w-5 h-5" alt="MM" />
                        </motion.button>
                    </div>
                ) : (
                    <div 
                        className="relative"
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 px-4 py-2 bg-[#EAEADF] border-2 border-[#1F1F1F] rounded-full shadow-[4px_4px_0px_0px_#1F1F1F] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase opacity-50 mb-0.5">{chain?.name || 'Unknown'}</span>
                                <span className="text-sm font-black text-[#1F1F1F]">{displayName}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[#EAEADF]">
                                <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </motion.button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-72 bg-[#EAEADF] border-2 border-[#1F1F1F] rounded-3xl p-6 shadow-2xl overflow-hidden"
                                >
                                    <div className="space-y-4">
                                        <div className="pb-4 border-b border-[#1F1F1F]/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Active Identity</span>
                                                <ShieldCheck size={14} className="text-green-600" />
                                            </div>
                                            <div className="text-xl font-black text-[#1F1F1F] break-all">{displayName}</div>
                                            <button 
                                                onClick={handleCopy}
                                                className="flex items-center gap-1 mt-1 text-[10px] font-bold text-[#1F1F1F]/60 hover:text-[#1F1F1F] transition-colors"
                                            >
                                                {address} {copied ? <Check size={10} /> : <Copy size={10} />}
                                            </button>
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-1">Balance</span>
                                            <div className="text-2xl font-black text-[#1F1F1F]">
                                                {balance?.formatted.slice(0, 6)} {balance?.symbol}
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-2">
                                            <NextLink
                                                href="/dashboard?tab=chat"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#9945FF]/10 text-[#9945FF] hover:bg-[#9945FF]/20 transition-all text-xs font-black uppercase tracking-wider"
                                            >
                                                <MessageCircle size={14} />
                                                Enter Whale Chat
                                            </NextLink>
                                            <button 
                                                onClick={() => disconnect()}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-wider"
                                            >
                                                <LogOut size={14} />
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

