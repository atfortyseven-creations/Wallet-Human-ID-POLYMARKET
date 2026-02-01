"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown, Settings, Loader2, RefreshCw, Zap, Sparkles, Route } from "lucide-react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// Constants for Mock Solver
const TOKENS = [
    { symbol: "ETH", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png", chain: "Ethereum", color: "bg-blue-600" },
    { symbol: "USDC", name: "USD Coin", icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", chain: "Polygon", color: "bg-blue-500" },
    { symbol: "MATIC", name: "Polygon", icon: "https://cryptologos.cc/logos/polygon-matic-logo.png", chain: "Polygon", color: "bg-purple-600" },
    { symbol: "BTC", name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", chain: "Bitcoin", color: "bg-orange-500" },
];

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const { address, isConnected } = useAccount();
    const [payAmount, setPayAmount] = useState("");
    const [receiveAmount, setReceiveAmount] = useState("");
    
    // Intent State
    const [payToken, setPayToken] = useState(TOKENS[0]); // Default ETH
    const [receiveToken, setReceiveToken] = useState(TOKENS[1]); // Default USDC
    const [solverState, setSolverState] = useState<'IDLE' | 'SOLVING' | 'FOUND'>('IDLE');
    const [route, setRoute] = useState<string | null>(null);

    // Mock Solver Logic
    useEffect(() => {
        if (!payAmount || parseFloat(payAmount) <= 0) {
            setSolverState('IDLE');
            setReceiveAmount("");
            return;
        }

        setSolverState('SOLVING');
        const timeout = setTimeout(() => {
            // Mock Calculation: ETH = $3000, USDC = $1, MATIC = $0.5
            let rate = 3000;
            if (payToken.symbol === 'ETH' && receiveToken.symbol === 'USDC') rate = 3000;
            if (payToken.symbol === 'USDC' && receiveToken.symbol === 'ETH') rate = 1/3000;
            if (payToken.symbol === 'ETH' && receiveToken.symbol === 'MATIC') rate = 6000;

            const received = (parseFloat(payAmount) * rate).toFixed(4);
            setReceiveAmount(received);
            setRoute(`Best Route: ${payToken.chain} ➝ Bridge ➝ ${receiveToken.chain}`);
            setSolverState('FOUND');
        }, 1200); // Simulate network delay

        return () => clearTimeout(timeout);
    }, [payAmount, payToken, receiveToken]);


    const handleSwap = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: 'Solving best route across chains...',
            success: `Swapped ${payAmount} ${payToken.symbol} for ${receiveAmount} ${receiveToken.symbol} via Intent Solver!`,
            error: 'Swap failed',
        });
        setTimeout(onClose, 2500);
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
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-[#EAEADF] border border-[#1F1F1F]/10 rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto relative">
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 pb-2">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1F1F1F] tracking-tight">Smart Swap</h2>
                                    <p className="text-xs font-bold text-[#1F1F1F]/50 uppercase tracking-widest">Invisible Bridging Enabled</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-[#1F1F1F]" />
                                </button>
                            </div>

                            <div className="p-6 space-y-2">
                                {/* PAY INPUT */}
                                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-transparent hover:border-[#1F1F1F]/5 transition-all group">
                                    <div className="flex justify-between text-xs font-bold text-[#1F1F1F]/40 mb-2 uppercase tracking-wide">
                                        <span>You Pay</span>
                                        <span>Balance: 2.45</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number" 
                                            value={payAmount}
                                            onChange={(e) => setPayAmount(e.target.value)}
                                            placeholder="0" 
                                            className="w-full bg-transparent text-4xl font-black text-[#1F1F1F] focus:outline-none placeholder:text-[#1F1F1F]/10"
                                        />
                                        <button className="flex items-center gap-2 bg-[#1F1F1F] text-[#EAEADF] px-4 py-2 rounded-full hover:scale-105 transition-transform">
                                            <span className="font-bold">{payToken.symbol}</span>
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-[#1F1F1F]/40">
                                        on {payToken.chain}
                                    </div>
                                </div>

                                {/* SWITCHER */}
                                <div className="relative h-4 z-10">
                                    <div className="absolute left-1/2 -translate-x-1/2 -top-5">
                                        <div className="bg-[#EAEADF] p-2 rounded-xl border-4 border-[#EAEADF]">
                                            <div className="bg-white p-2 rounded-lg shadow-sm text-[#1F1F1F]">
                                                <ArrowDown size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RECEIVE INPUT */}
                                <div className="bg-white p-5 rounded-[32px] shadow-sm border border-transparent hover:border-[#1F1F1F]/5 transition-all">
                                    <div className="flex justify-between text-xs font-bold text-[#1F1F1F]/40 mb-2 uppercase tracking-wide">
                                        <span>You Receive</span>
                                        {solverState === 'SOLVING' && <span className="flex items-center gap-1 text-purple-600"><Loader2 size={10} className="animate-spin"/> Finding Best Route...</span>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="text" 
                                            value={receiveAmount}
                                            readOnly
                                            placeholder="0" 
                                            className={`w-full bg-transparent text-4xl font-black text-[#1F1F1F] focus:outline-none placeholder:text-[#1F1F1F]/10 transition-opacity ${solverState === 'SOLVING' ? 'opacity-50' : 'opacity-100'}`}
                                        />
                                        <button className="flex items-center gap-2 bg-[#1F1F1F] text-[#EAEADF] px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-lg">
                                            <span className="font-bold">{receiveToken.symbol}</span>
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-[#1F1F1F]/40">
                                        on {receiveToken.chain}
                                    </div>
                                </div>

                                {/* SOLVER INFO */}
                                <AnimatePresence>
                                    {solverState === 'FOUND' && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-[#1F1F1F] text-[#EAEADF] p-4 rounded-3xl mt-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/20 rounded-full text-purple-300">
                                                    <Sparkles size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-[#EAEADF]/60 uppercase tracking-widest">AI Solver Route</div>
                                                    <div className="font-bold text-sm">{route}</div>
                                                </div>
                                            </div>
                                            <div className="text-green-400 font-bold text-xs bg-green-900/30 px-2 py-1 rounded-lg">
                                                Fastest
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ACTION BUTTON */}
                                <button 
                                    disabled={!payAmount || solverState === 'SOLVING'}
                                    onClick={handleSwap}
                                    className="w-full py-5 mt-4 bg-[#1F1F1F] text-white rounded-[24px] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    {solverState === 'SOLVING' ? (
                                        <>Searching...</>
                                    ) : (
                                        <>
                                            <Zap fill="currentColor" className="text-yellow-400" />
                                            EXECUTE SWAP
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
