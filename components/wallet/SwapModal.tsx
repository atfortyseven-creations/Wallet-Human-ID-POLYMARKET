"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown, Settings, Loader2, RefreshCw } from "lucide-react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// Mock Router ABI for demonstration (Uniswap V2/V3 style)
const ROUTER_ABI = [
    {
        name: "swapExactETHForTokens",
        type: "function",
        stateMutability: "payable",
        inputs: [
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" }
        ],
        outputs: []
    }
] as const;

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const { address, isConnected } = useAccount();
    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock Exchange Rate
    const ETH_PRICE = 3500; // USDC per ETH

    const { data: ethBalance } = useBalance({ address });

    useEffect(() => {
        if (inputAmount && !isNaN(parseFloat(inputAmount))) {
            const out = parseFloat(inputAmount) * ETH_PRICE;
            setOutputAmount(out.toFixed(2));
        } else {
            setOutputAmount("");
        }
    }, [inputAmount]);

    const { writeContract, data: hash, isPending, error } = useWriteContract();
    
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isSuccess) {
            toast.success("Swap Successful!");
            setIsLoading(false);
            onClose();
        }
        if (error) {
            toast.error("Swap Failed: " + (error as any).shortMessage || error.message);
            setIsLoading(false);
        }
    }, [isSuccess, error, onClose]);

    const handleSwap = () => {
        if (!inputAmount || parseFloat(inputAmount) <= 0) return;
        
        setIsLoading(true);
        // Ensure this points to a real Router on the active chain
        // This is a placeholder for the "Business Logic" requested
        // In a real app, you'd use a map of Router Addresses by ChainID
        const MOCK_ROUTER_ADDRESS = "0x1234567890123456789012345678901234567890"; 

        try {
            writeContract({
                address: MOCK_ROUTER_ADDRESS,
                abi: ROUTER_ABI,
                functionName: "swapExactETHForTokens",
                args: [
                    BigInt(0), // amountOutMin (slippage handled by FE usually)
                    ["0x...WETH", "0x...USDC"], // Path
                    address!,
                    BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // Deadline
                ],
                value: parseUnits(inputAmount, 18)
            });
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#1a1b23]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-auto overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white">Swap</h2>
                                <button onClick={onClose}><X className="w-5 h-5 text-neutral-400 hover:text-white" /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* From Input */}
                                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-neutral-400">
                                        <span>Sell</span>
                                        <span>Bal: {ethBalance?.formatted.slice(0, 6)} {ethBalance?.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number" 
                                            value={inputAmount}
                                            onChange={(e) => setInputAmount(e.target.value)}
                                            placeholder="0" 
                                            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none placeholder:text-neutral-600"
                                        />
                                        <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <div className="w-5 h-5 rounded-full bg-blue-500" />
                                            <span className="font-bold text-white">ETH</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Switcher */}
                                <div className="flex justify-center -my-3 relative z-10">
                                    <div className="bg-[#1a1b23] p-1.5 rounded-xl border border-white/10 text-neutral-400">
                                        <ArrowDown size={18} />
                                    </div>
                                </div>

                                {/* To Input */}
                                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-neutral-400">
                                        <span>Buy</span>
                                        <span>~${ETH_PRICE} / ETH</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="text" 
                                            value={outputAmount}
                                            readOnly
                                            placeholder="0" 
                                            className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none placeholder:text-neutral-600"
                                        />
                                        <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
                                            <div className="w-5 h-5 rounded-full bg-green-500" />
                                            <span className="font-bold text-white">USDC</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Rate</span>
                                        <span className="font-bold">1 ETH = {ETH_PRICE} USDC</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Network Cost</span>
                                        <span className="font-bold">~$1.50</span>
                                    </div>
                                </div>

                                <button 
                                    disabled={!inputAmount || isPending || isConfirming || !isConnected}
                                    onClick={handleSwap}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {(isPending || isConfirming) ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                    Swap Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
