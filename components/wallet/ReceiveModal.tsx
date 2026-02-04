"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode as QrIcon, Check, AlertCircle, ChevronDown, Search, ExternalLink } from "lucide-react";
import { useAccount, useChains, useSwitchChain } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { TOKENS_BY_CHAIN } from "@/config/tokens";
import Image from "next/image";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    address?: string;
}

export default function ReceiveModal({ isOpen, onClose, address: propAddress }: ReceiveModalProps) {
    const { address: wagmiAddress, chainId } = useAccount();
    const address = propAddress || wagmiAddress;
    const chains = useChains();
    const { switchChain, isPending: isSwitching, isSuccess: isSwitchSuccess, error: switchError } = useSwitchChain();
    const [copied, setCopied] = useState(false);

    // State
    const [selectedChainId, setSelectedChainId] = useState<number>(chainId || chains[0]?.id);
    const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
    
    // Status Modal State
    const [statusData, setStatusData] = useState<{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', message: string }>({ status: 'IDLE', message: '' });

    // Token Management
    const [selectedToken, setSelectedToken] = useState<any>(null); // Null means Showing list or Native default? 
    // Let's default to Native Token for the chain
    
    const activeChain = chains.find(c => c.id === selectedChainId);
    
    // Tokens for selected chain
    const tokens = useMemo(() => {
        const chainTokens = TOKENS_BY_CHAIN[selectedChainId] || [];
        // Add Native Token manually if not in list
        const nativeToken = {
            symbol: activeChain?.nativeCurrency.symbol || 'ETH',
            name: activeChain?.name || 'Native Token',
            address: '0x0000000000000000000000000000000000000000', // Null address for native
            decimals: activeChain?.nativeCurrency.decimals || 18,
            logo: activeChain?.nativeCurrency.symbol === 'MATIC' ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
                  activeChain?.nativeCurrency.symbol === 'ETH' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : undefined
        };
        return [nativeToken, ...chainTokens];
    }, [selectedChainId, activeChain]);

    const [currentAsset, setCurrentAsset] = useState<any>(tokens[0]);

    // Update current asset when chain changes
    useEffect(() => {
         const nativeToken = {
            symbol: activeChain?.nativeCurrency.symbol || 'ETH',
            name: activeChain?.name || 'Native Token',
            address: '0x0000000000000000000000000000000000000000',
             decimals: activeChain?.nativeCurrency.decimals || 18,
             logo: activeChain?.nativeCurrency.symbol === 'MATIC' ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
                   activeChain?.nativeCurrency.symbol === 'ETH' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : undefined
        };
        setCurrentAsset(nativeToken);
    }, [selectedChainId, activeChain]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Address copied");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNetworkChange = (chainId: number) => {
        setStatusData({ status: 'LOADING', message: 'Cambiando de red en Human DeFi...' });
        switchChain({ chainId }, {
            onSuccess: () => {
                setSelectedChainId(chainId);
                setStatusData({ status: 'SUCCESS', message: 'Red cambiada exitosamente' });
                setShowNetworkDropdown(false);
                setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
            },
            onError: (err) => {
                setStatusData({ status: 'ERROR', message: 'Error al cambiar de red' });
                toast.error(err.message.split('\n')[0]);
                setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                     {/* Status Modal for Network Switch */}
                     <TransactionStatusModal 
                        isOpen={statusData.status !== 'IDLE'}
                        status={statusData.status}
                        message={statusData.message}
                        onClose={() => setStatusData({ status: 'IDLE', message: '' })}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#1a1b23]">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <QrIcon className="w-5 h-5 text-blue-500" />
                                    Receive Assets
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Main Scrollable Content */}
                            <div className="overflow-y-auto p-6 space-y-6">

                                {/* Network Selector */}
                                <div className="space-y-2 relative z-20">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Network</label>
                                    <button 
                                        onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                                        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white transition-all"
                                    >
                                        <span className="font-bold flex items-center gap-2">
                                            {activeChain?.name || "Select Network"}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {showNetworkDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1f2a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {chains.map((chain) => (
                                                <button
                                                    key={chain.id}
                                                    onClick={() => handleNetworkChange(chain.id)}
                                                    className={`w-full text-left px-4 py-3 font-medium text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${selectedChainId === chain.id ? 'text-blue-400 bg-blue-500/10' : 'text-white/80'}`}
                                                >
                                                    {chain.name}
                                                    {selectedChainId === chain.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* QR Code Area */}
                                <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                                     {/* Background decoration */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="p-4 bg-white rounded-2xl shadow-xl z-10">
                                        {address ? (
                                            <QRCodeSVG
                                                value={address}
                                                size={180}
                                                level="M"
                                                bgColor="#FFFFFF"
                                                fgColor="#000000"
                                            />
                                        ) : (
                                            <div className="w-[180px] h-[180px] bg-neutral-200 animate-pulse rounded-xl" />
                                        )}
                                    </div>

                                    <div className="mt-4 text-center z-10">
                                         <div className="text-white/60 text-xs mb-1">Scan to send to</div>
                                         <div className="font-mono text-white font-bold text-sm bg-black/40 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors" onClick={handleCopy}>
                                            {address?.slice(0, 6)}...{address?.slice(-4)}
                                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                         </div>
                                    </div>
                                </div>

                                {/* Token List Selector (Like MetaMask) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Select Asset to Receive</label>
                                    
                                    <div className="space-y-2">
                                        {tokens.map((token, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setCurrentAsset(token)}
                                                className={`
                                                    p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                                                    ${currentAsset?.symbol === token.symbol 
                                                        ? 'bg-blue-500/10 border-blue-500/50' 
                                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Token Icon */}
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                        {token.logo ? (
                                                            <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-white">{token.symbol[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{token.name}</div>
                                                        <div className="text-xs text-white/50">{token.symbol}</div>
                                                    </div>
                                                </div>
                                                {currentAsset?.symbol === token.symbol && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Asset Details */}
                                {currentAsset && (
                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/10 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-white/40">Network</span>
                                            <span className="text-white font-medium">{activeChain?.name}</span>
                                        </div>
                                        {currentAsset.address !== '0x0000000000000000000000000000000000000000' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Token Contract</span>
                                                <a 
                                                    href={`${activeChain?.blockExplorers?.default.url}/address/${currentAsset.address}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 max-w-[150px] truncate"
                                                >
                                                    {currentAsset.address.slice(0, 6)}...{currentAsset.address.slice(-4)}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-2">
                                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-200/80">
                                                Only send <strong>{currentAsset.symbol}</strong> ({activeChain?.name}) to this address. Sending other assets may result in permanent loss.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
