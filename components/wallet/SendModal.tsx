"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowRight, Wallet, AlertCircle, Loader2, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { useSendTransaction, useWriteContract, useEstimateGas, useBalance, useAccount, useChainId, useConnect, useReadContracts } from "wagmi";
import { parseEther, parseUnits, isAddress, formatEther, formatUnits, erc20Abi } from "viem";
import { toast } from "sonner";
import { TOKENS_BY_CHAIN } from "@/config/tokens";
import { mainnet } from "wagmi/chains";
import { TransactionStatusModal } from "@/components/ui/TransactionStatusModal";

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ERC20 ABI for transfer (Standard)
const ERC20_ABI = [
    {
        name: "transfer",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bool" }]
    }
] as const;

export default function SendModal({ isOpen, onClose }: SendModalProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    
    // Asset Management
    // Define available tokens based on chain
    const availableAssets = useMemo(() => {
        const chainTokens = TOKENS_BY_CHAIN[chainId] || [];
        const nativeToken = {
            symbol: 'NATIVE', // Special Marker
            visibleSymbol: chainId === 137 ? 'POL' : 'ETH', // Simplification, ideally use chain.nativeCurrency
            name: 'Native Token',
            address: '0x0000000000000000000000000000000000000000',
            decimals: 18,
            logo: undefined
        };
        return [nativeToken, ...chainTokens];
    }, [chainId]);

    const [selectedAsset, setSelectedAsset] = useState<any>(availableAssets[0]);
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);

    // Sync selected asset if chain changes
    useEffect(() => {
        setSelectedAsset(availableAssets[0]);
    }, [availableAssets]);

    // Status tracking
    const [status, setStatus] = useState<"IDLE" | "ESTIMATING" | "SIGNING" | "SENDING" | "SUCCESS">("IDLE");
    const [txHash, setTxHash] = useState("");

    // NEW: Detailed Message for Modal
    const [statusMessage, setStatusMessage] = useState("");

    // Wagmi Hooks
    const {
        sendTransaction,
        isPending: isSendingNative,
        isSuccess: isNativeSuccess,
        data: nativeTxData,
        error: nativeError
    } = useSendTransaction();

    const {
        writeContract,
        isPending: isWritingToken,
        isSuccess: isTokenSuccess,
        data: tokenTxData,
        error: tokenError
    } = useWriteContract();

    // Balances
    const { data: nativeBalance } = useBalance({ address });
    
    // Fetch balance for selected token if not native
    const { data: tokenBalanceData } = useBalance({
        address,
        token: selectedAsset.symbol !== 'NATIVE' ? selectedAsset.address : undefined,
        query: {
            enabled: !!address && selectedAsset.symbol !== 'NATIVE'
        }
    });

    // Derived Balance Display
    const currentBalance = useMemo(() => {
        if (selectedAsset.symbol === 'NATIVE') {
            return nativeBalance;
        }
        return tokenBalanceData;
    }, [selectedAsset, nativeBalance, tokenBalanceData]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStatus("IDLE");
            setRecipient("");
            setAmount("");
            setTxHash("");
            setShowAssetDropdown(false);
        }
    }, [isOpen]);

    // Handle Success/Error side effects
    useEffect(() => {
        if (isNativeSuccess && nativeTxData) {
            setStatus("SUCCESS");
            setTxHash(nativeTxData);
            setStatusMessage("Transacción completada exitosamente.");
            // Optional: Auto close after a few seconds?
            // setTimeout(onClose, 4000); 
        }
        if (isTokenSuccess && tokenTxData) {
            setStatus("SUCCESS");
            setTxHash(tokenTxData);
            setStatusMessage("Transacción completada exitosamente.");
        }
    }, [isNativeSuccess, isTokenSuccess, nativeTxData, tokenTxData]);

    useEffect(() => {
        if (nativeError) {
            setStatus("IDLE");
            toast.error(nativeError.message.split('\n')[0] || "Transaction failed");
        }
        if (tokenError) {
            setStatus("IDLE");
            toast.error(tokenError.message.split('\n')[0] || "Transaction failed");
        }
    }, [nativeError, tokenError]);


    const handleMax = () => {
        if (!currentBalance) return;
        
        if (selectedAsset.symbol === 'NATIVE') {
            // Leave 0.01 for gas
            const buffer = chainId === mainnet.id ? 0.02 : 0.01;
            const val = parseFloat(formatEther(currentBalance.value)) - buffer;
            setAmount(val > 0 ? val.toFixed(4) : "0");
        } else {
            setAmount(formatUnits(currentBalance.value, currentBalance.decimals));
        }
    };

    const { connect, connectors } = useConnect();

    const handleSend = async () => {
        if (!address) {
            toast.info("Connecting wallet...");
            connect({ connector: connectors[0] }); 
            return;
        }
        if (!isAddress(recipient)) {
            toast.error("Invalid recipient address");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid amount");
            return;
        }

        setStatus("SIGNING");
        setStatusMessage("Por favor confirma la transacción en tu wallet...");

        try {
            if (selectedAsset.symbol === 'NATIVE') {
                sendTransaction({
                    to: recipient,
                    value: parseEther(amount)
                });
            } else {
                writeContract({
                    address: selectedAsset.address,
                    abi: ERC20_ABI,
                    functionName: "transfer",
                    args: [recipient, parseUnits(amount, selectedAsset.decimals)]
                });
            }
        } catch (e) {
            setStatus("IDLE");
            console.error(e);
        }
    };

    // Derived Status for Modal
    const modalStatus = useMemo(() => {
        if (status === 'SIGNING' || status === 'SENDING' || status === 'ESTIMATING') return 'LOADING';
        if (status === 'SUCCESS') return 'SUCCESS';
        return 'IDLE'; 
    }, [status]);
    
    // Update message based on status if not manually set
    useEffect(() => {
        if (status === 'SIGNING') setStatusMessage("Conectándose a Human DeFi...");
        if (status === 'SENDING') setStatusMessage("Enviando transacción a la red...");
    }, [status]);


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Status Overlay Modal */}
                    <TransactionStatusModal 
                        isOpen={modalStatus !== 'IDLE'}
                        status={modalStatus}
                        message={statusMessage}
                        txHash={txHash}
                        onClose={() => {
                            // If success, user can close modal which basically resets form or closes parent
                             if (status === 'SUCCESS') {
                                onClose();
                             } else {
                                // If loading, maybe prevent close? Or allow to cancel?
                                // Allowing close acts as "Minimize"
                                setStatus('IDLE'); // Just hide
                             }
                        }}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" // Higher z-index than navbar
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#1a1b23]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-indigo-400" />
                                    Send Assets
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Gas Warning for Mainnet */}
                                {chainId === mainnet.id && (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-500">High Gas Fee Warning</h4>
                                            <p className="text-xs text-amber-500/80 mt-1">
                                                You are on Ethereum Mainnet. Transactions may be expensive.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                
                                {/* Asset Selector */}
                                <div className="space-y-2 relative z-20">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Asset</label>
                                    <button 
                                        onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                                        className="w-full flex items-center justify-between bg-black/30 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {selectedAsset.logo ? (
                                                <img src={selectedAsset.logo} className="w-6 h-6 rounded-full" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                                    {selectedAsset.symbol === 'NATIVE' ? selectedAsset.visibleSymbol[0] : selectedAsset.symbol[0]}
                                                </div>
                                            )}
                                            <span className="font-bold">
                                                {selectedAsset.symbol === 'NATIVE' ? selectedAsset.visibleSymbol : selectedAsset.symbol}
                                                <span className="text-white/40 font-normal ml-2">{selectedAsset.name}</span>
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {showAssetDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1f2a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 p-1">
                                            {availableAssets.map((asset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedAsset(asset);
                                                        setShowAssetDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-3 rounded-lg font-medium text-sm hover:bg-white/5 transition-colors flex items-center gap-3
                                                        ${selectedAsset.symbol === asset.symbol ? 'bg-white/5' : ''}
                                                    `}
                                                >
                                                    {asset.logo ? (
                                                        <img src={asset.logo} className="w-5 h-5 rounded-full" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                                {asset.symbol === 'NATIVE' ? asset.visibleSymbol[0] : asset.symbol[0]}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold leading-none">
                                                            {asset.symbol === 'NATIVE' ? asset.visibleSymbol : asset.symbol}
                                                        </span>
                                                        <span className="text-white/40 text-xs leading-none mt-1">{asset.name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Recipient */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider pl-1">Recipient Address</label>
                                    <div className="relative">
                                        <input
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
                                        />
                                        {recipient && isAddress(recipient) && (
                                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center pl-1">
                                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Amount</label>
                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                            Balance: 
                                            <span className="text-white font-mono">
                                                {currentBalance ? parseFloat(formatUnits(currentBalance.value, currentBalance.decimals)).toFixed(4) : "0.00"}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-20 text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button
                                                onClick={handleMax}
                                                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs font-bold text-indigo-300 transition-colors"
                                            >
                                                MAX
                                            </button>
                                            <span className="font-bold text-white/50 text-sm">
                                                {selectedAsset.symbol === 'NATIVE' ? selectedAsset.visibleSymbol : selectedAsset.symbol}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    disabled={status === "SIGNING" || status === "SENDING" || !amount || !recipient || !address}
                                    onClick={handleSend}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {!address ? "Connect Wallet" :
                                        (
                                            <>
                                                Send Assets <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                </button>
                                
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
