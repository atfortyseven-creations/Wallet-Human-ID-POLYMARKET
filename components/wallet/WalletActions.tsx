"use client";

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Repeat, CreditCard, LayoutGrid, Image as ImageIcon, History, Loader2, TrendingUp, ExternalLink, Lock, Skull, Brain, Shield, EyeOff } from 'lucide-react';
import { useAccount, useChainId, useReadContracts, useBalance } from 'wagmi';
import { formatUnits, erc20Abi } from 'viem';
import { FeatureCardsSection } from '@/components/landing/FeatureCardsSection';
import NFTGallery from '@/components/wallet/NFTGallery';
import { SecurityGrowthSection } from '@/components/landing/SecurityGrowthSection';
import SendModal from '@/components/wallet/modals/SendModal';
import ReceiveModal from '@/components/wallet/modals/ReceiveModal';
import SwapModal from '@/components/wallet/modals/SwapModal';
import TimeLockVaultModal from '@/components/wallet/modals/TimeLockVaultModal';
import DeadMansSwitchModal from '@/components/wallet/modals/DeadMansSwitchModal';
import AIRebalancerModal from '@/components/wallet/modals/AIRebalancerModal';
import SocialRecoveryModal from '@/components/wallet/modals/SocialRecoveryModal';
import PrivacyMixerModal from '@/components/wallet/modals/PrivacyMixerModal';
import { getSupportedTokens, TOKENS_BY_CHAIN } from '@/config/tokens';
import { toast } from 'sonner';
import { Position, Transaction } from '@/types/wallet';
import FiatOnRamp from '@/components/wallet/FiatOnRamp';
import TokenManager from '@/components/wallet/TokenManager';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WalletActionsProps {
    positions?: Position[];
    history?: Transaction[];
    userAddress?: string; // Add optional prop
}

export function WalletActions({ positions = [], history = [], userAddress }: WalletActionsProps) {
    const { address: wagmiAddress, isConnected } = useAccount();
    // Use prop or fallback to wagmi
    const effectiveAddress = userAddress || wagmiAddress || ''; 
    
    const chainId = useChainId();
    const [activeTab, setActiveTab] = useState('Tokens');

    // Modals
    const [showSend, setShowSend] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [showSwap, setShowSwap] = useState(false);
    const [showFiat, setShowFiat] = useState(false);
    const [showTokenManager, setShowTokenManager] = useState(false);
    // New unique features
    const [showTimeLock, setShowTimeLock] = useState(false);
    const [showDeadMan, setShowDeadMan] = useState(false);
    const [showAIRebalancer, setShowAIRebalancer] = useState(false);
    const [showSocialRecovery, setShowSocialRecovery] = useState(false);
    const [showPrivacyMixer, setShowPrivacyMixer] = useState(false);

    // Tokens Data
    // Defensive coding: Handle case where getSupportedTokens import might be undefined at runtime due to circular deps or build issues
    const supportedTokens: { symbol: string; name: string; address: string; decimals: number; icon?: string }[] = 
        (typeof getSupportedTokens === 'function' ? getSupportedTokens(chainId) : TOKENS_BY_CHAIN?.[chainId]) || [];
    
    // Construct contract calls for all supported tokens
    const { data: tokenBalances, isLoading: isLoadingTokens } = useReadContracts({
        contracts: supportedTokens.map((t) => ({
            address: t.address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [effectiveAddress as `0x${string}`], // Use effectiveAddress
            chainId
        })),
        query: {
            enabled: !!effectiveAddress && supportedTokens.length > 0
        }
    });

    // Native Balance
    const { data: nativeBalance } = useBalance({ address: effectiveAddress as `0x${string}` });

    // Process balances
    const tokens = supportedTokens.map((t, i) => {
        const result = tokenBalances?.[i]?.result as unknown; // Fix implicit any
        const bal = typeof result === 'bigint' ? result : BigInt(0);
        return {
            ...t,
            rawBalance: bal,
            formatted: bal ? formatUnits(bal, t.decimals) : "0",
            value: 0 // Mock value (needs price feed)
        };
    }).filter((t) => parseFloat(t.formatted) > 0);
    // Add Native to list if needed, or just show ERC20s in the list as "Tokens" usually implies. 
    // Usually Native is header, specific list is tokens. Stick to ERC20s for the list or include native if desired.

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // Filter Logic
    const filteredTokens = tokens.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPositions = positions.filter((p) => 
        p.marketTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.outcome?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter history logic (assuming history items have type/asset)
    const filteredHistory = history.filter((h) => 
        h.asset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ACTIONS = [
        { 
            label: 'Comprar', 
            icon: <CreditCard size={24} />, 
            color: 'bg-blue-600 hover:bg-blue-500',
            action: () => setShowFiat(true)
        },
        { 
            label: 'Intercambio', 
            icon: <Repeat size={24} />, 
            color: 'bg-zinc-700 hover:bg-zinc-600',
            action: () => setShowSwap(true)
        },
        { 
            label: 'Enviar', 
            icon: <ArrowUpRight size={24} />, 
            color: 'bg-zinc-700 hover:bg-zinc-600',
            action: () => setShowSend(true)
        },
        { 
            label: 'Recibir', 
            icon: <ArrowDownLeft size={24} />, 
            color: 'bg-zinc-700 hover:bg-zinc-600',
            action: () => setShowReceive(true)
        },
    ];

    const TABS = [
        { id: 'Tokens', label: 'Tokens' },
        { id: 'DeFi', label: 'DeFi' },
        { id: 'NFT', label: 'NFT' }
    ];

    return (
        <div className="w-full">
            {/* Core Modals */}
            <SendModal isOpen={showSend} onClose={() => setShowSend(false)} userAddress={effectiveAddress} chainId={chainId} />
            <ReceiveModal isOpen={showReceive} onClose={() => setShowReceive(false)} userAddress={effectiveAddress} chainId={chainId} />
            <SwapModal isOpen={showSwap} onClose={() => setShowSwap(false)} />
            
            {/* Unique Feature Modals */}
            <TimeLockVaultModal isOpen={showTimeLock} onClose={() => setShowTimeLock(false)} />
            <DeadMansSwitchModal isOpen={showDeadMan} onClose={() => setShowDeadMan(false)} />
            <AIRebalancerModal isOpen={showAIRebalancer} onClose={() => setShowAIRebalancer(false)} />
            <SocialRecoveryModal isOpen={showSocialRecovery} onClose={() => setShowSocialRecovery(false)} />
            <PrivacyMixerModal isOpen={showPrivacyMixer} onClose={() => setShowPrivacyMixer(false)} />

            {/* Fiat On-Ramp Modal */}
            <AnimatePresence>
                {showFiat && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className="relative w-full max-w-md"
                        >
                            <button 
                                onClick={() => setShowFiat(false)}
                                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <FiatOnRamp />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

             {/* Token Manager Modal */}
             <AnimatePresence>
                {showTokenManager && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                             initial={{ opacity: 0, y: 100 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 100 }}
                             className="w-full max-w-lg bg-[#EAEADF] rounded-3xl p-6 relative max-h-[85vh] overflow-y-auto"
                        >
                             <button 
                                onClick={() => setShowTokenManager(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-[#1F1F1F]/10 rounded-full"
                            >
                                <X size={20} className="text-[#1F1F1F]" />
                            </button>
                            <TokenManager 
                                walletAddress={effectiveAddress || ''} 
                                chainId={chainId} 
                            />
                        </motion.div>
                   </div>
                )}
             </AnimatePresence>


            {/* Main Actions - Elegant Stacked Cards */}
            <div className="mb-8 px-4">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 px-2">Acciones Principales</h2>
                <div className="grid grid-cols-2 gap-3">
                    {ACTIONS.map((action, index) => (
                        <motion.button
                            key={action.label}
                            onClick={action.action}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group bg-neutral-900 border border-neutral-800 rounded-2xl p-5 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {/* Gradient Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center gap-3">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center
                                    ${action.label === 'Comprar' ? 'bg-blue-600/20 text-blue-400' : 'bg-white/10 text-white'}
                                    group-hover:scale-110 transition-transform
                                `}>
                                    {action.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">{action.label}</p>
                                    <p className="text-xs text-neutral-400">
                                        {action.label === 'Comprar' && 'Añadir fondos'}
                                        {action.label === 'Intercambio' && 'Cambiar tokens'}
                                        {action.label === 'Enviar' && 'Transferir activos'}
                                        {action.label === 'Recibir' && 'Obtener dirección'}
                                    </p>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Advanced Features - Stackable Pills */}
            <div className="mb-10 px-4">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 px-2">Funciones Avanzadas</h2>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Time Vault', icon: <Lock size={16} />, gradient: 'from-amber-500/20 to-yellow-500/20', textColor: 'text-amber-400', ringColor: 'ring-amber-500/30', action: () => setShowTimeLock(true) },
                        { label: 'Dead Man Switch', icon: <Skull size={16} />, gradient: 'from-rose-500/20 to-red-500/20', textColor: 'text-rose-400', ringColor: 'ring-rose-500/30', action: () => setShowDeadMan(true) },
                        { label: 'AI Rebalancer', icon: <Brain size={16} />, gradient: 'from-cyan-500/20 to-blue-500/20', textColor: 'text-cyan-400', ringColor: 'ring-cyan-500/30', action: () => setShowAIRebalancer(true) },
                        { label: 'Social Recovery', icon: <Shield size={16} />, gradient: 'from-emerald-500/20 to-green-500/20', textColor: 'text-emerald-400', ringColor: 'ring-emerald-500/30', action: () => setShowSocialRecovery(true) },
                        { label: 'Privacy Mixer', icon: <EyeOff size={16} />, gradient: 'from-indigo-500/20 to-purple-500/20', textColor: 'text-indigo-400', ringColor: 'ring-indigo-500/30', action: () => setShowPrivacyMixer(true) }
                    ].map((feature, index) => (
                        <motion.button
                            key={feature.label}
                            onClick={feature.action}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                group relative px-4 py-3 rounded-full
                                bg-gradient-to-r ${feature.gradient}
                                backdrop-blur-xl border border-white/10
                                ring-1 ${feature.ringColor}
                                hover:shadow-lg hover:shadow-${feature.ringColor}/20
                                transition-all duration-300
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`${feature.textColor} group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <span className={`text-xs font-bold ${feature.textColor}`}>
                                    {feature.label}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>


            {/* Tabs Navigation - Elegant Pills */}
            <div className="flex gap-2 mb-8 mx-4 p-1 bg-neutral-100 rounded-2xl">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 py-3 px-4 text-sm font-bold text-center rounded-xl
                            transition-all duration-300
                            ${activeTab === tab.id 
                                ? 'bg-white text-neutral-900 shadow-md' 
                                : 'text-neutral-500 hover:text-neutral-700'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Bar - Elegant */}
            {(activeTab === 'Tokens' || activeTab === 'DeFi') && (
                <div className="px-4 mb-6">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Buscar activos..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-4 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-100 transition-all placeholder:text-neutral-400"
                        />
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="min-h-[400px] animate-fade-in relative z-10">
                {activeTab === 'Tokens' && (
                    <div className="px-4">
                        {!isConnected ? (
                             <div className="text-center py-16 text-neutral-400 text-sm">
                                <p>Wallet connection required for token details.</p>
                            </div>
                        ) : isLoadingTokens ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-neutral-400" />
                            </div>
                        ) : filteredTokens.length === 0 && (!nativeBalance || parseFloat(nativeBalance.formatted) === 0) ? (
                            <div className="text-center py-16 text-neutral-400 text-sm">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                                    <LayoutGrid size={24} />
                                </div>
                                <p className="font-medium">No tokens found.</p>
                                <button className="mt-4 text-blue-600 hover:text-blue-700 font-bold hover:underline">Import tokens</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Always show Native Token First if matches search */}
                                {nativeBalance && parseFloat(nativeBalance.formatted) > 0 && (nativeBalance.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || "native".includes(searchQuery.toLowerCase())) && (
                                    <div className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
                                                {nativeBalance.symbol[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{nativeBalance.symbol}</div>
                                                <div className="text-xs text-neutral-500">Native Token</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-neutral-900">{parseFloat(nativeBalance.formatted).toFixed(4)}</div>
                                            <div className="text-xs text-neutral-500">$0.00</div>
                                        </div>
                                    </div>
                                )}
                                {/* ERC20s */}
                                {filteredTokens.map((token, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {token.symbol[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{token.name}</div>
                                                <div className="text-xs text-neutral-500">{token.symbol}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-neutral-900">{parseFloat(token.formatted).toFixed(4)}</div>
                                            {/* Price placeholder */}
                                            <div className="text-xs text-neutral-500">$0.00</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                 {activeTab === 'DeFi' && (
                    <div className="px-4">
                        {positions && filteredPositions.length > 0 ? (
                            <div className="grid gap-3">
                                {filteredPositions.map((pos: any, idx) => (
                                    <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-4 hover:shadow-lg transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${pos.outcome === 'YES' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {pos.outcome}
                                                </span>
                                                <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{pos.marketTitle}</h4>
                                            </div>
                                            <ExternalLink size={14} className="text-neutral-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-xs text-neutral-500 mb-0.5">Value</div>
                                                <div className="font-mono font-bold text-neutral-900">${pos.value?.toFixed(2)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-bold ${pos.pnl >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                     {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toFixed(2)} ({pos.pnlPercent?.toFixed(1)}%)
                                                </div>
                                                <div className="text-[10px] text-neutral-400">{pos.shares?.toFixed(1)} Shares</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-neutral-400 text-sm">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                                    <TrendingUp size={24} />
                                </div>
                                <p className="font-medium">No results found.</p>
                            </div>
                        )}
                    </div>
                )}
                 {activeTab === 'NFT' && (
                    <div className="px-4">
                        {isConnected && effectiveAddress ? (
                            <NFTGallery walletAddress={effectiveAddress} chainId={chainId} />
                        ) : (
                             <div className="text-center py-16 text-neutral-400 text-sm">
                                 <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                                     <ImageIcon size={24} />
                                </div>
                                <p className="font-medium">Connect wallet to view NFTs</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
