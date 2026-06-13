"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode as QrIcon, Check, AlertCircle, ChevronDown } from "lucide-react";
import { useChains, useSwitchChain } from "wagmi";
import { useSystemAccount } from "@/hooks/useSystemAccount";
import { toast } from "sonner";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";
import { TokenLogo } from '@/components/ui/TokenLogo';

// ─── Non-EVM chains that show a static receive address (same EVM address)  ───
// Bitcoin and Tron use different address formats — we display the EVM address
// with a clear notice. Solana uses a completely different key scheme; we show
// the EVM address as reference only (mirrors MetaMask behaviour).
const NON_EVM_CHAINS = [
    { id: 999001, name: 'Bitcoin',    symbol: 'BTC', decimals: 8,  logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',    notice: 'Bitcoin uses a different address format. Use your native BTC wallet address to receive on Bitcoin mainnet.' },
    { id: 999002, name: 'Solana',     symbol: 'SOL', decimals: 9,  logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',    notice: 'Solana uses a different address scheme. Use your native SOL wallet address to receive on Solana.' },
    { id: 999003, name: 'Tron',       symbol: 'TRX', decimals: 6,  logo: 'https://cryptologos.cc/logos/tron-trx-logo.png',      notice: 'Tron uses a different address format. Use your TRX wallet address to receive on Tron.' },
] as const;

// Known chain logos
const CHAIN_LOGO: Record<number, string> = {
    1:     'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    56:    'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    137:   'https://cryptologos.cc/logos/polygon-matic-logo.png',
    8453:  'https://raw.githubusercontent.com/base-org/brand-kit/001c0e9b40a67799ebe0418671ac4e02a0c683ce/logo/in-product/Base_Network_Logo.svg',
    42161: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    10:    'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
    480:   'https://worldcoin.org/favicon.ico',
    59144: 'https://cryptologos.cc/logos/linea-logo.png',
    43114: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    10143: 'https://monad.xyz/favicon.ico',
    324:   'https://cryptologos.cc/logos/zksync-logo.png',
    999001: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    999002: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    999003: 'https://cryptologos.cc/logos/tron-trx-logo.png',
};

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    address?: string;
    userAssets?: any[];
}

export default function ReceiveModal({ isOpen, onClose, address: propAddress, userAssets = [] }: ReceiveModalProps) {
    const { address: wagmiAddress, chainId } = useSystemAccount();
    const address = propAddress || wagmiAddress;
    const evmChains = useChains();
    const { switchChain } = useSwitchChain();
    const [copied, setCopied] = useState(false);
    const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
    const [selectedChainId, setSelectedChainId] = useState<number>(chainId || evmChains[0]?.id || 1);
    const [statusData, setStatusData] = useState<{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', message: string }>({ status: 'IDLE', message: '' });

    // Combined chain list: EVM wagmi chains + non-EVM custom chains
    const allChains = useMemo(() => {
        return [...evmChains, ...NON_EVM_CHAINS];
    }, [evmChains]);

    const activeChain = useMemo(() => {
        return allChains.find(c => c.id === selectedChainId) ?? evmChains[0];
    }, [allChains, selectedChainId, evmChains]);

    const isNonEVM = NON_EVM_CHAINS.some(c => c.id === selectedChainId);
    const nonEvmInfo = NON_EVM_CHAINS.find(c => c.id === selectedChainId);

    // Token list for selected EVM chain
    const tokens = useMemo(() => {
        if (isNonEVM) return [];
        const nativeCurrency = (activeChain as any)?.nativeCurrency;
        const nativeToken = {
            symbol: nativeCurrency?.symbol || 'ETH',
            name: (activeChain as any)?.name || 'Native Token',
            address: 'native',
            decimals: nativeCurrency?.decimals || 18,
            logoURI: CHAIN_LOGO[selectedChainId] || undefined,
            chainId: selectedChainId,
        };
        const networkAssets = userAssets
            .filter(a => a.chainId === selectedChainId && a.symbol !== 'QDs' && a.address !== 'native')
            .map((a: any) => ({
                symbol: a.symbol,
                name: a.name,
                address: a.address,
                decimals: a.decimals,
                logoURI: a.logoURI,
                chainId: a.chainId,
            }));
        const merged = [nativeToken, ...networkAssets];
        return Array.from(new Map(merged.map(item => [item.symbol, item])).values());
    }, [selectedChainId, activeChain, userAssets, isNonEVM]);

    const [currentAsset, setCurrentAsset] = useState<any>(null);
    useEffect(() => {
        setCurrentAsset(tokens[0] ?? null);
    }, [tokens, selectedChainId]);

    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Address copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNetworkChange = (chain: any) => {
        const id = chain.id;
        if (NON_EVM_CHAINS.some(c => c.id === id)) {
            setSelectedChainId(id);
            setShowNetworkDropdown(false);
            return;
        }
        if (typeof switchChain !== 'function') {
            setSelectedChainId(id);
            setShowNetworkDropdown(false);
            return;
        }
        setStatusData({ status: 'LOADING', message: 'Switching network...' });
        try {
            switchChain({ chainId: id }, {
                onSuccess: () => {
                    setSelectedChainId(id);
                    setStatusData({ status: 'SUCCESS', message: 'Network switched' });
                    setShowNetworkDropdown(false);
                    setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 1200);
                },
                onError: (err) => {
                    setStatusData({ status: 'ERROR', message: 'Network switch rejected' });
                    toast.error(err.message.split('\n')[0]);
                    setTimeout(() => setStatusData({ status: 'IDLE', message: '' }), 2000);
                }
            });
        } catch {
            setSelectedChainId(id);
            setShowNetworkDropdown(false);
            setStatusData({ status: 'IDLE', message: '' });
        }
    };

    const chainName = (activeChain as any)?.name ?? 'Network';
    const qrData = address || '';

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

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-white border border-black/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden flex flex-col max-h-[92vh]">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
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

                            <div className="overflow-y-auto p-6 space-y-5 scrollbar-hide">

                                {/* Network selector */}
                                <div className="space-y-2 relative z-20">
                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Select Network</label>
                                    <button
                                        onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                                        className="w-full flex items-center justify-between bg-white border border-black/10 shadow-sm hover:shadow-md rounded-2xl px-4 py-4 text-black transition-all"
                                    >
                                        <span className="font-black text-sm uppercase tracking-tight flex items-center gap-3">
                                            {CHAIN_LOGO[selectedChainId] && (
                                                <img src={CHAIN_LOGO[selectedChainId]} alt="" className="w-5 h-5 rounded-full object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                                            )}
                                            {chainName}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-black/40 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showNetworkDropdown && (
                                        <div className="absolute top-[110%] left-0 right-0 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: 320 }}>
                                            {/* EVM chains */}
                                            <div className="px-4 py-2 text-[9px] font-black tracking-widest uppercase text-black/30 border-b border-black/5">EVM Networks</div>
                                            {evmChains.map(chain => (
                                                <button
                                                    key={chain.id}
                                                    onClick={() => handleNetworkChange(chain)}
                                                    className={`w-full text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center gap-3 ${selectedChainId === chain.id ? 'text-black bg-black/5' : 'text-black/50'}`}
                                                >
                                                    {CHAIN_LOGO[chain.id] && (
                                                        <img src={CHAIN_LOGO[chain.id]} alt="" className="w-5 h-5 rounded-full object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                                                    )}
                                                    <span className="flex-1">{chain.name}</span>
                                                    {selectedChainId === chain.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                            {/* Non-EVM chains */}
                                            <div className="px-4 py-2 text-[9px] font-black tracking-widest uppercase text-black/30 border-t border-black/5">Other Networks</div>
                                            {NON_EVM_CHAINS.map(chain => (
                                                <button
                                                    key={chain.id}
                                                    onClick={() => handleNetworkChange(chain)}
                                                    className={`w-full text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center gap-3 ${selectedChainId === chain.id ? 'text-black bg-black/5' : 'text-black/50'}`}
                                                >
                                                    <img src={chain.logo} alt="" className="w-5 h-5 rounded-full object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                                                    <span className="flex-1">{chain.name}</span>
                                                    {selectedChainId === chain.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* QR + address */}
                                <div className="flex flex-col items-center justify-center py-8 bg-white rounded-[28px] border border-black/10 shadow-sm relative overflow-hidden">
                                    {/* Chain name above QR */}
                                    <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        {CHAIN_LOGO[selectedChainId] && (
                                            <img src={CHAIN_LOGO[selectedChainId]} alt="" className="w-4 h-4 rounded-full object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                                        )}
                                        {chainName}
                                    </div>

                                    {/* QR Code */}
                                    <div className="p-4 bg-white rounded-3xl shadow-lg border border-black/5 z-10">
                                        {address ? (
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&color=000000&bgcolor=FFFFFF&margin=0`}
                                                alt={`QR code for ${chainName}`}
                                                className="w-[180px] h-[180px] object-contain rounded-xl"
                                            />
                                        ) : (
                                            <div className="w-[180px] h-[180px] bg-black/5 animate-pulse rounded-xl" />
                                        )}
                                    </div>

                                    {/* "That's your address of ___" */}
                                    <div className="mt-5 text-center px-6 w-full z-10">
                                        <p className="text-black font-black text-[13px] tracking-tight mb-3">
                                            That's your address of <span className="text-black">{chainName}</span>
                                        </p>

                                        {/* Full address with copy */}
                                        <button
                                            onClick={handleCopy}
                                            className="group w-full flex items-center justify-between font-mono text-black font-bold text-[11px] bg-black/5 hover:bg-black hover:text-white transition-all duration-200 px-4 py-3 rounded-2xl border border-black/10"
                                        >
                                            <span className="truncate">{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '—'}</span>
                                            {copied
                                                ? <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                                : <Copy className="w-4 h-4 text-black/30 group-hover:text-white/60 transition-colors shrink-0" />
                                            }
                                        </button>

                                        {/* "use this QR to receive your assets on ___" */}
                                        <p className="mt-3 text-[10px] text-black/40 font-black tracking-widest uppercase">
                                            use this QR to receive your assets on {chainName}
                                        </p>
                                    </div>
                                </div>

                                {/* Non-EVM notice */}
                                {isNonEVM && nonEvmInfo && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                            {nonEvmInfo.notice}
                                        </p>
                                    </div>
                                )}

                                {/* EVM token list */}
                                {!isNonEVM && tokens.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest pl-1">Supported Assets</label>
                                        <div className="space-y-2">
                                            {tokens.map((token, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setCurrentAsset(token)}
                                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${currentAsset?.symbol === token.symbol ? 'bg-black text-white border-black shadow-md' : 'bg-white border-black/5 hover:border-black/20'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <TokenLogo symbol={token.symbol} address={token.address} logoURI={token.logoURI} className="w-9 h-9 rounded-full" fallbackClassName="w-9 h-9 rounded-full text-xs" />
                                                        <div>
                                                            <div className={`text-sm font-black uppercase tracking-tight ${currentAsset?.symbol === token.symbol ? 'text-white' : 'text-black'}`}>{token.name}</div>
                                                            <div className={`text-[10px] font-mono uppercase tracking-widest ${currentAsset?.symbol === token.symbol ? 'text-white/40' : 'text-black/30'}`}>{token.symbol}</div>
                                                        </div>
                                                    </div>
                                                    {currentAsset?.symbol === token.symbol && (
                                                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                            <Check className="w-3 h-3 text-black" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Warning */}
                                {currentAsset && !isNonEVM && (
                                    <div className="p-4 bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded-2xl flex gap-3">
                                        <AlertCircle className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-[#FF8A00] font-black tracking-widest uppercase leading-relaxed">
                                            Only send {currentAsset.symbol} on {chainName}. Incorrect routing will permanently burn assets.
                                        </p>
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
