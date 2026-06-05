"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction, useAccount, useSwitchChain, useChainId } from "wagmi";
import { polymarketRouterService } from "@/lib/blockchain/PolymarketRouterService";
import { useActivePortfolio } from "@/hooks/useActivePortfolio";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PolymarketExecutionPanelProps {
    symbol: string;
    probability: number;
    direction: "BULLISH" | "BEARISH" | "NEUTRAL";
    marketId?: string; // We'll pass a dummy fallback if none, but logic will build tx
}

export function PolymarketExecutionPanel({ symbol, probability, direction, marketId = "0x0000000000000000000000000000000000000000000000000000000000000001" }: PolymarketExecutionPanelProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState<string>("100");
    const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
    const [isBuildingTx, setIsBuildingTx] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { address } = useAccount();
    const chainId = useChainId();
    const { switchChain, switchChainAsync } = useSwitchChain();
    const { sendTransaction, isPending, isSuccess } = useSendTransaction();
    const { usdcBalance } = useActivePortfolio();

    const isPolygon = chainId === 137;

    useEffect(() => {
        if (isSuccess && !isModalOpen) {
            // Success handler if needed globally, but local state handles it
        }
    }, [isSuccess]);

    const handleExecute = async () => {
        if (!isPolygon && switchChainAsync) {
            try {
                toast.loading("Switching to Polygon...");
                await switchChainAsync({ chainId: 137 });
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error("Failed to switch chain:", err);
                return;
            }
        }

        try {
            setIsBuildingTx(true);
            const { tx } = await polymarketRouterService.buildTradeTransaction(marketId, outcome, amount);
            
            sendTransaction({
                to: tx.to,
                data: tx.data,
                value: BigInt(tx.value)
            }, {
                onSuccess: (hash) => setTxHash(hash),
            });
        } catch (error) {
            console.error("Execution failed:", error);
        } finally {
            setIsBuildingTx(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 bg-[#00FFAA] hover:bg-[#00e699] text-[#050505] font-black font-sans uppercase tracking-widest text-[11px] py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,255,170,0.3)] hover:shadow-[0_6px_20px_rgba(0,255,170,0.5)] transform hover:-translate-y-0.5"
            >
                BUY ON POLYMARKET
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/70 backdrop-blur-md p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#FFFFFF] border border-[#E5E5E5] w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            <button 
                                onClick={() => { setIsModalOpen(false); setTxHash(null); }}
                                className="absolute top-6 right-6 text-[#050505]/40 hover:text-[#050505] transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-[#111111] uppercase tracking-tighter">Polymarket Execution</h3>
                                <p className="text-xs font-bold tracking-widest text-[#888888] mt-1">{symbol} REVERSAL CONTRACT</p>
                            </div>

                            {txHash ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <CheckCircle size={48} className="text-[#00FFAA]" />
                                    <h4 className="text-lg font-black text-[#111111] uppercase tracking-wider">Transaction Sent</h4>
                                    <a 
                                        href={`https://polygonscan.com/tx/${txHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-mono font-bold text-[#06b6d4] hover:underline break-all px-4 text-center"
                                    >
                                        {txHash}
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Selection */}
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setOutcome("YES")}
                                            className={`flex-1 py-3 rounded-xl border-2 font-black uppercase tracking-widest text-xs transition-all ${outcome === "YES" ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]' : 'bg-transparent border-[#E5E5E5] text-[#888888]'}`}
                                        >
                                            YES <span className="text-[10px] text-[#050505]/40 ml-1">@{Math.round(probability)}¢</span>
                                        </button>
                                        <button 
                                            onClick={() => setOutcome("NO")}
                                            className={`flex-1 py-3 rounded-xl border-2 font-black uppercase tracking-widest text-xs transition-all ${outcome === "NO" ? 'bg-[#f97316]/10 border-[#f97316] text-[#f97316]' : 'bg-transparent border-[#E5E5E5] text-[#888888]'}`}
                                        >
                                            NO <span className="text-[10px] text-[#050505]/40 ml-1">@{100 - Math.round(probability)}¢</span>
                                        </button>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Amount (USDC)</label>
                                            <span className="text-[10px] font-mono font-black text-[#111111]">Bal: ${usdcBalance}</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl px-4 py-3 text-lg font-mono font-black text-[#111111] focus:outline-none focus:border-[#00FFAA] transition-colors"
                                        />
                                    </div>

                                    {/* Preview Fees */}
                                    <div className="bg-[#111111]/[0.02] rounded-xl p-4 border border-[#E5E5E5] space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono font-bold text-[#888888]">
                                            <span>Est. Shares</span>
                                            <span className="text-[#111111]">{((parseFloat(amount) || 0) / ((outcome === "YES" ? probability : 100 - probability) / 100)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono font-bold text-[#888888]">
                                            <span>Slippage</span>
                                            <span className="text-amber-500">0.5% (Auto)</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono font-bold text-[#888888]">
                                            <span>Relayer Fee</span>
                                            <span className="text-[#00FFAA] uppercase">Free (Gasless)</span>
                                        </div>
                                    </div>

                                    {/* Exec Button */}
                                    {!isPolygon ? (
                                        <button 
                                            onClick={() => switchChain?.({ chainId: 137 })}
                                            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black font-sans uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle size={14} />
                                            SWITCH TO POLYGON (137)
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleExecute}
                                            disabled={isPending || isBuildingTx || parseFloat(amount) <= 0}
                                            className="w-full bg-[#00FFAA] hover:bg-[#00e699] disabled:bg-[#E5E5E5] disabled:text-[#888888] text-[#050505] font-black font-sans uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,255,170,0.3)] disabled:shadow-none"
                                        >
                                            {isPending ? 'CONFIRM IN WALLET...' : isBuildingTx ? 'BUILDING TX...' : 'EXECUTE BUY TRANSACTION'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
