"use client";

import React, { useState } from 'react';
import { 
    ArrowUpRight, ArrowDownLeft, Repeat, CreditCard, LayoutGrid, 
    Image as ImageIcon, TrendingUp, ExternalLink, Lock, Skull, 
    Brain, Shield, EyeOff, X, Zap, Gift, Activity, Search, Loader2
} from 'lucide-react';
import { useAccount, useChainId, useReadContracts, useBalance } from 'wagmi';
import { formatUnits, erc20Abi } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';

import NFTGallery from '@/components/wallet/NFTGallery';
import SendModal from '@/components/wallet/modals/SendModal';
import ReceiveModal from '@/components/wallet/modals/ReceiveModal';
import SwapModal from '@/components/wallet/modals/SwapModal';
import TimeLockVaultModal from '@/components/wallet/modals/TimeLockVaultModal';
import DeadMansSwitchModal from '@/components/wallet/modals/DeadMansSwitchModal';
import AIRebalancerModal from '@/components/wallet/modals/AIRebalancerModal';
import SocialRecoveryModal from '@/components/wallet/modals/SocialRecoveryModal';
import PrivacyMixerModal from '@/components/wallet/modals/PrivacyMixerModal';
import FiatOnRamp from '@/components/wallet/FiatOnRamp';
import TokenManager from '@/components/wallet/TokenManager';
import PredictionsTab from '@/components/wallet/PredictionsTab';
import PerpsTab from '@/components/wallet/PerpsTab';
import ClaimablesTab from '@/components/wallet/ClaimablesTab';

import { getSupportedTokens, TOKENS_BY_CHAIN } from '@/config/tokens';
import { Position, Transaction, PerpPosition, PredictionPosition, ClaimableAsset } from '@/types/wallet';

interface WalletActionsProps {
    positions?: Position[];
    history?: Transaction[];
    userAddress?: string;
    assets?: any[];
    perps?: PerpPosition[];
    predictions?: PredictionPosition[];
    claimables?: ClaimableAsset[];
    isLoading?: boolean;
}

export function WalletActions({ 
    positions = [], 
    history = [], 
    userAddress, 
    assets = [],
    perps = [],
    predictions = [],
    claimables = [],
    isLoading = false
}: WalletActionsProps) {
    const { address: wagmiAddress, isConnected } = useAccount();
    const effectiveAddress = userAddress || wagmiAddress || ''; 
    const chainId = useChainId();
    
    const [activeTab, setActiveTab] = useState('Tokens');
    const [activeSubTab, setActiveSubTab] = useState('All');

    // Modals
    const [showSend, setShowSend] = useState(false);
    const [showReceive, setShowReceive] = useState(false);
    const [showSwap, setShowSwap] = useState(false);
    const [showFiat, setShowFiat] = useState(false);
    const [showTokenManager, setShowTokenManager] = useState(false);
    const [showTimeLock, setShowTimeLock] = useState(false);
    const [showDeadMan, setShowDeadMan] = useState(false);
    const [showAIRebalancer, setShowAIRebalancer] = useState(false);
    const [showSocialRecovery, setShowSocialRecovery] = useState(false);
    const [showPrivacyMixer, setShowPrivacyMixer] = useState(false);

    // Tokens Data Logic (Wagmi Fallback)
    const supportedTokens = (typeof getSupportedTokens === 'function' ? getSupportedTokens(chainId) : TOKENS_BY_CHAIN?.[chainId]) || [];
    const { data: tokenBalances, isLoading: isLoadingTokens } = useReadContracts({
        contracts: supportedTokens.map((t) => ({
            address: t.address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [effectiveAddress as `0x${string}`],
            chainId
        })),
        query: { enabled: !!effectiveAddress && supportedTokens.length > 0 }
    });

    const [searchQuery, setSearchQuery] = useState("");

    const ACTIONS = [
        { label: 'Comprar', icon: <CreditCard size={24} />, action: () => setShowFiat(true) },
        { label: 'Cambiar', icon: <Repeat size={24} />, action: () => setShowSwap(true) },
        { label: 'Enviar', icon: <ArrowUpRight size={24} />, action: () => setShowSend(true) },
        { label: 'Recibir', icon: <ArrowDownLeft size={24} />, action: () => setShowReceive(true) },
    ];

    const MAIN_TABS = [
        { id: 'Tokens', label: 'Tokens', icon: <LayoutGrid size={18} /> },
        { id: 'DeFi', label: 'DeFi', icon: <TrendingUp size={18} /> },
        { id: 'NFT', label: 'NFTs', icon: <ImageIcon size={18} /> }
    ];

    const DEFI_SUBTABS = [
        { id: 'All', label: 'Todos', icon: <Activity size={14} /> },
        { id: 'Perps', label: 'Perps', icon: <Zap size={14} />, count: perps.length },
        { id: 'Predictions', label: 'Predictions', icon: <TrendingUp size={14} />, count: predictions.length },
        { id: 'Claimables', label: 'Claimables', icon: <Gift size={14} />, count: claimables.length }
    ];

    return (
        <div className="w-full">
            {/* Modals */}
            <SendModal isOpen={showSend} onClose={() => setShowSend(false)} userAddress={effectiveAddress} chainId={chainId} />
            <ReceiveModal isOpen={showReceive} onClose={() => setShowReceive(false)} userAddress={effectiveAddress} chainId={chainId} />
            <SwapModal isOpen={showSwap} onClose={() => setShowSwap(false)} />
            <TimeLockVaultModal isOpen={showTimeLock} onClose={() => setShowTimeLock(false)} />
            <DeadMansSwitchModal isOpen={showDeadMan} onClose={() => setShowDeadMan(false)} />
            <AIRebalancerModal isOpen={showAIRebalancer} onClose={() => setShowAIRebalancer(false)} />
            <SocialRecoveryModal isOpen={showSocialRecovery} onClose={() => setShowSocialRecovery(false)} />
            <PrivacyMixerModal isOpen={showPrivacyMixer} onClose={() => setShowPrivacyMixer(false)} />

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mb-8 px-4">
                {ACTIONS.map((action) => (
                    <motion.button
                        key={action.label}
                        onClick={action.action}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="w-14 h-14 bg-white/80 backdrop-blur-md border border-[#1F1F1F]/5 rounded-2xl flex items-center justify-center text-[#1F1F1F] shadow-sm hover:shadow-md transition-all">
                            {action.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#1F1F1F]/60">{action.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Rainbow-Style Navigation */}
            <div className="bg-white/40 backdrop-blur-xl border-t border-[#1F1F1F]/5 pt-6 pb-2 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                
                {/* Main Tabs */}
                <div className="flex gap-4 mb-6 px-8 overflow-x-auto scrollbar-hide no-scrollbar">
                    {MAIN_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== 'DeFi') setActiveSubTab('All');
                            }}
                            className={`
                                flex items-center gap-2 pb-2 transition-all relative whitespace-nowrap
                                ${activeTab === tab.id ? 'text-[#1F1F1F]' : 'text-[#1F1F1F]/40 hover:text-[#1F1F1F]/60'}
                            `}
                        >
                            <span className="font-black text-lg tracking-tight">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute -bottom-1 left-0 right-0 h-1 bg-[#1F1F1F] rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Bar - Rainbow Style */}
                <div className="px-6 mb-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F1F1F]/30 group-focus-within:text-[#1F1F1F] transition-colors" />
                        <input 
                            type="text" 
                            placeholder={`Buscar en ${activeTab}...`} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/60 border border-transparent focus:border-[#1F1F1F]/10 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-[#1F1F1F] outline-none transition-all placeholder:text-[#1F1F1F]/20"
                        />
                    </div>
                </div>

                {/* Sub-menu Navigation (DeFi Specific) */}
                {activeTab === 'DeFi' && (
                    <div className="flex gap-2 mb-6 px-6 overflow-x-auto scrollbar-hide no-scrollbar">
                        {DEFI_SUBTABS.map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setActiveSubTab(sub.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border
                                    ${activeSubTab === sub.id 
                                        ? 'bg-[#1F1F1F] text-[#EAEADF] border-[#1F1F1F] shadow-lg' 
                                        : 'bg-white/50 text-[#1F1F1F]/60 border-transparent hover:bg-white'
                                    }
                                `}
                            >
                                {sub.icon}
                                <span className="text-xs font-black uppercase tracking-tighter">{sub.label}</span>
                                {sub.count !== undefined && sub.count > 0 && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                        activeSubTab === sub.id ? 'bg-white/20' : 'bg-[#1F1F1F]/5'
                                    }`}>
                                        {sub.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="min-h-[500px] pb-20">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Tokens' && (
                            <motion.div 
                                key="tokens"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2 px-6"
                            >
                                {assets.length > 0 ? (
                                    assets.filter(a => a.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map((asset, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-[#1F1F1F]/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2">
                                                    {asset.logoURI ? <img src={asset.logoURI} alt={asset.symbol} className="w-full h-full object-contain" /> : <div className="font-black">{asset.symbol[0]}</div>}
                                                </div>
                                                <div>
                                                    <div className="font-black text-base text-[#1F1F1F]">{asset.symbol}</div>
                                                    <div className="text-xs font-bold text-[#1F1F1F]/40 uppercase tracking-tighter">{asset.name}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-base text-[#1F1F1F]">{asset.balanceFormatted}</div>
                                                <div className="text-xs font-black text-emerald-600">${asset.valueUSD.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1F1F1F]/10">
                                            <LayoutGrid size={40} />
                                        </div>
                                        <p className="font-black text-[#1F1F1F]/20 uppercase tracking-widest italic">No assets detected</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'DeFi' && (
                            <motion.div 
                                key="defi"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {activeSubTab === 'All' && (
                                    <div className="space-y-8">
                                        {perps.length > 0 && (
                                            <div>
                                                <h3 className="px-8 text-[10px] font-black uppercase text-[#1F1F1F]/30 tracking-[0.2em] mb-4">Active Perps</h3>
                                                <PerpsTab perps={perps} />
                                            </div>
                                        )}
                                        {predictions.length > 0 && (
                                            <div>
                                                <h3 className="px-8 text-[10px] font-black uppercase text-[#1F1F1F]/30 tracking-[0.2em] mb-4">Predictions</h3>
                                                <PredictionsTab predictions={predictions} />
                                            </div>
                                        )}
                                        {claimables.length > 0 && (
                                            <div>
                                                <h3 className="px-8 text-[10px] font-black uppercase text-[#1F1F1F]/30 tracking-[0.2em] mb-4">Claimable Rewards</h3>
                                                <ClaimablesTab claimables={claimables} />
                                            </div>
                                        )}
                                        {perps.length === 0 && predictions.length === 0 && claimables.length === 0 && (
                                            <div className="text-center py-20 px-10">
                                                <p className="font-black text-[#1F1F1F]/20 uppercase tracking-[0.2em]">No DeFi Positions Found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeSubTab === 'Perps' && <PerpsTab perps={perps} isLoading={isLoading} />}
                                {activeSubTab === 'Predictions' && <PredictionsTab predictions={predictions} isLoading={isLoading} />}
                                {activeSubTab === 'Claimables' && <ClaimablesTab claimables={claimables} isLoading={isLoading} />}
                            </motion.div>
                        )}

                        {activeTab === 'NFT' && (
                            <motion.div 
                                key="nfts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <NFTGallery walletAddress={effectiveAddress} chainId={chainId} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
