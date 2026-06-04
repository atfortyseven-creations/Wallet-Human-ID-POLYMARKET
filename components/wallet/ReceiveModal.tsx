"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode as QrIcon, Check, AlertCircle, ChevronDown, ExternalLink } from "lucide-react";
import { useChains, useSwitchChain } from "wagmi";
import { useSystemAccount } from "@/hooks/useSystemAccount";
import { toast } from "sonner";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";
import { TokenLogo } from '@/components/ui/TokenLogo';

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    address?: string;
    userAssets?: any[];
}

export default function ReceiveModal({ isOpen, onClose, address: propAddress, userAssets = [] }: ReceiveModalProps) {
    const { address: wagmiAddress, chainId } = useSystemAccount();
    const address = propAddress || wagmiAddress;
    const chains = useChains();
    const { switchChain } = useSwitchChain();
    const [copied, setCopied] = useState(false);

    // Dynamic Network State
    const [selectedChainId, setSelectedChainId] = useState<number>(chainId || chains[0]?.id || 1);
    const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
    
    const [statusData, setStatusData] = useState<{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', message: string }>({ status: 'IDLE', message: '' });

    const activeChain = chains.find(c => c.id === selectedChainId);
    
    // Completely Dynamic Token Resolution (Purged of Mock Data)
    const tokens = useMemo(() => {
        // 1. Resolve Native Currency Dynamically from Wagmi Chain Config
        const nativeToken = {
            symbol: activeChain?.nativeCurrency.symbol || 'ETH',
            name: activeChain?.name || 'Native Token',
            address: 'native',
            decimals: activeChain?.nativeCurrency.decimals || 18,
            logoURI: activeChain?.nativeCurrency.symbol === 'MATIC' || activeChain?.nativeCurrency.symbol === 'POL' ? 'https://cryptologos.cc/logos/polygon-matic-logo.png' : 
                     activeChain?.nativeCurrency.symbol === 'ETH' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' : undefined,
            chainId: selectedChainId
        };

        // 2. Resolve User's Actual On-Chain Assets for this network
        const networkAssets = userAssets
            .filter(a => a.chainId === selectedChainId && a.symbol !== 'QDs' && a.address !== 'native')
            .map(a => ({
                symbol: a.symbol,
                name: a.name,
                address: a.address,
                decimals: a.decimals,
                logoURI: a.logoURI,
                chainId: a.chainId
            }));

        // 3. Deduplicate
        const merged = [nativeToken, ...networkAssets];
        const uniqueTokens = Array.from(new Map(merged.map(item => [item.symbol, item])).values());
        
        return uniqueTokens;
    }, [selectedChainId, activeChain, userAssets]);

    const [currentAsset, setCurrentAsset] = useState<any>(tokens[0]);

    // Auto-select native token when network changes
    useEffect(() => {
        if (tokens.length > 0) {
            setCurrentAsset(tokens[0]);
        }
    }, [selectedChainId, activeChain, tokens]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Address securely copied");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNetworkChange = (targetChainId: number) => {
        if (typeof switchChain !== 'function') {
            setSelectedChainId(targetChainId);
            setShowNetworkDropdown(false);
            return;
        }
        
        setStatusData({ status: 'LOADING', message: 'Syncing with requested network RPC...' });
        try {
            switchChain({ chainId: targetChainId }, {
                onSuccess: () => {
                    setSelectedChainId(targetChainId);
                    setStatusData({ status: 'SUCCESS', message: 'Network synchronized' });
                    setShowNetworkDropdown(false);
                    setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 1500);
                },
                onError: (err) => {
                    setStatusData({ status: 'ERROR', message: 'Network sync rejected' });
                    toast.error(err.message.split('\n')[0]);
                    setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
                }
            });
        } catch (e: any) {
            setStatusData({ status: 'ERROR', message: 'Failed to switch network' });
            setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <TransactionStatusModal 
                        isOpen={statusData.status !== 'IDLE'}
                        status={statusData.status}
                        message={statusData.message}
                        onClose={() => setStatusData({ status: 'IDLE', message: '' })}
                    />

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />

                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
                        <div className="w-full max-w-md bg-[#FFFFFF] border border-black/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">

                            <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5">
                                <h2 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-2">
                                    <div className="p-2 border border-black/10 rounded-2xl bg-white shadow-sm">
                                        <QrIcon className="w-5 h-5 text-black" />
                                    </div>
                                    RECEIVE
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                
                                <div className="space-y-2 relative z-20">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Network Synchronization</label>
                                    <button onClick={() => setShowNetworkDropdown(!showNetworkDropdown)} className="w-full flex items-center justify-between bg-white border border-black/10 shadow-sm hover:shadow-md rounded-[16px] px-4 py-4 text-black transition-all">
                                        <span className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                                            {activeChain?.name || "Select Network"}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-black/40 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showNetworkDropdown && (
                                        <div className="absolute top-[110%] left-0 right-0 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                            {chains.map((chain) => (
                                                <button key={chain.id} onClick={() => handleNetworkChange(chain.id)} className={`w-full text-left px-4 py-4 font-black text-[11px] uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center justify-between ${selectedChainId === chain.id ? 'text-black bg-black/5' : 'text-black/50'}`}>
                                                    {chain.name}
                                                    {selectedChainId === chain.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-[32px] border border-black/10 shadow-sm relative overflow-hidden group">
                                    <div className="p-5 bg-white rounded-3xl shadow-xl z-10 border border-black/5">
                                        {address ? (
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${address}&color=000000&bgcolor=FFFFFF`} alt="QR" className="w-[180px] h-[180px] object-contain rounded-2xl" />
                                        ) : (
                                            <div className="w-[180px] h-[180px] bg-black/5 animate-pulse rounded-2xl" />
                                        )}
                                    </div>
                                    <div className="mt-6 text-center z-10">
                                         <div className="text-black/40 text-[10px] font-black uppercase tracking-widest mb-3">Scan to resolve on-chain address</div>
                                         <div className="font-mono text-black font-black text-xs bg-[#FFFFFF] px-5 py-3 rounded-2xl border border-black/10 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-black hover:text-white transition-all group/btn" onClick={handleCopy}>
                                            {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "..."}
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-black/30 group-hover/btn:text-white/60 transition-colors" />}
                                         </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Dynamic Supported Assets</label>
                                    <div className="space-y-2">
                                        {tokens.map((token, idx) => (
                                            <div key={idx} onClick={() => setCurrentAsset(token)} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${currentAsset?.symbol === token.symbol ? 'bg-black text-white border-black shadow-md' : 'bg-white border-black/5 hover:border-black/20'}`}>
                                                <div className="flex items-center gap-4">
                                                    <TokenLogo symbol={token.symbol} address={token.address} logoURI={token.logoURI} className="w-10 h-10 rounded-full" fallbackClassName="w-10 h-10 rounded-full text-xs" />
                                                    <div>
                                                        <div className={`text-sm font-black uppercase tracking-tight ${currentAsset?.symbol === token.symbol ? 'text-white' : 'text-black'}`}>{token.name}</div>
                                                        <div className={`text-[10px] font-mono uppercase tracking-widest ${currentAsset?.symbol === token.symbol ? 'text-white/40' : 'text-black/30'}`}>{token.symbol}</div>
                                                    </div>
                                                </div>
                                                {currentAsset?.symbol === token.symbol && <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm"><Check className="w-3 h-3 text-black" /></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {currentAsset && (
                                    <div className="p-5 bg-black/5 rounded-3xl border border-black/5 space-y-4">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-black/50 font-black uppercase tracking-widest">Active Network</span>
                                            <span className="text-black font-black uppercase tracking-tight px-2 py-1 bg-white rounded-lg shadow-sm">{activeChain?.name}</span>
                                        </div>
                                        {currentAsset.address !== 'native' && activeChain?.blockExplorers?.default.url && (
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-black/50 font-black uppercase tracking-widest">Token Contract</span>
                                                <a href={`${activeChain.blockExplorers.default.url}/address/${currentAsset.address}`} target="_blank" rel="noreferrer" className="text-black font-mono font-bold flex items-center gap-1 hover:text-black/60 transition-colors px-2 py-1 bg-white rounded-lg shadow-sm">
                                                    {currentAsset.address.slice(0, 6)}...{currentAsset.address.slice(-4)}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                        <div className="p-3 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-xl flex gap-3">
                                            <AlertCircle className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-[#FF8A00] font-black tracking-widest uppercase leading-relaxed">
                                                Only send {currentAsset.symbol} on {activeChain?.name}. Incorrect routing will permanently burn assets.
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
