"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useSocialHub } from "@/hooks/useSocialHub";

interface TipButtonProps {
    traderName: string;
    traderAddress: string;
}

export default function TipButton({ traderName, traderAddress }: TipButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [isPending, setIsPending] = useState(false); // Local loading state
    const { sendTip } = useSocialHub();

    const handleTip = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        setIsPending(true);
        try {
            await sendTip(traderAddress, amount);
            toast.success(`Tipped ${amount} USDC to ${traderName}!`);
            setIsOpen(false);
            setAmount("");
        } catch (error: any) {
            toast.error("Failed to send tip");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition-all hover:scale-105"
                title={`Tip ${traderName}`}
            >
                <Coins className="w-4 h-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setIsOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-sm relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c]/90 shadow-2xl ring-1 ring-white/5"
                            >
                                {/* Background Gradient */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

                                <div className="relative p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                                                Send Tip
                                            </h3>
                                            <p className="text-xs text-white/40 font-mono mt-1">
                                                To: <span className="text-emerald-400">{traderName}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Amount Input */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-emerald-500 font-bold">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-16 text-3xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-mono"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <span className="text-xs font-bold text-white/30 uppercase">USDC</span>
                                            </div>
                                        </div>

                                        {/* Quick Select Grid */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 5, 10, 20, 50, 100].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setAmount(val.toString())}
                                                    className="py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-sm font-medium text-white/60 hover:text-emerald-400 transition-all active:scale-95"
                                                >
                                                    ${val}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Info */}
                                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/30 font-bold px-1">
                                            <span>Protocol Fee: 5%</span>
                                            <span>Network: Polygon</span>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={handleTip}
                                            disabled={isPending || !amount || parseFloat(amount) <= 0}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-3"
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Coins className="w-4 h-4" />
                                            )}
                                            {isPending ? "Processing Transaction..." : "Confirm Tip"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
