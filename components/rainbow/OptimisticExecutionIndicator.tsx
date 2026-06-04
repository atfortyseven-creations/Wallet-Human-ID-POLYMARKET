import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { getExplorerTxUrl } from '@/lib/wallet/chains';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
interface Transaction {
    hash: string;
    status: string;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromChain: number;
    createdAt: string;
}

/**
 * [Elite] Optimistic Execution Indicator
 * Displays pending transactions with Flashbots and Sync status.
 */
export function OptimisticExecutionIndicator({ userId }: { userId: string }) {
    const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchPending = async () => {
            try {
                const res = await fetch(`/api/transactions?userId=${userId}`);
                const data = await res.json();
                const pending = data.filter((tx: any) => tx.status === 'PENDING_RELAY' || tx.status === 'SUBMITTED');
                setPendingTxs(pending);
            } catch (e) {
                console.error("Failed to fetch pending txs", e);
            }
        };

        fetchPending();
        const interval = setInterval(fetchPending, 5000); // Polling every 5s for Elite precision
        return () => clearInterval(interval);
    }, [userId]);

    if (pendingTxs.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3">
            <AnimatePresence>
                {pendingTxs.map((tx) => (
                    <motion.div
                        key={tx.hash}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-[#161A1E]/80 backdrop-blur-2xl border border-purple-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Loader2 className="animate-spin text-purple-400" size={24} />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-[#161A1E]">
                                <Zap size={10} className="text-black fill-current" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Elite Execution</span>
                                <div className="flex items-center gap-1 text-[8px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">
                                    <ShieldCheck size={8} className="text-green-500" />
                                    FLASHBOTS ACTIVE
                                </div>
                            </div>
                            <h4 className="text-sm font-black tracking-tight text-white truncate">
                                Swapping {safeToFixed(tx.fromAmount, 4)} {tx.fromToken}  {tx.toToken}
                            </h4>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                Awaiting block finality...
                            </p>
                        </div>

                        <button 
                            onClick={() => window.open(getExplorerTxUrl(tx.fromChain, tx.hash), '_blank')}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                        >
                            <ExternalLink size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

