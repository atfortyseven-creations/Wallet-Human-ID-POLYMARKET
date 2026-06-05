"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, AlertTriangle, Crown, Terminal } from 'lucide-react';

interface UIStoreAlert {
    id: string;
    type: string;
    chain: string;
    amount: string;
    severity: string;
    timestamp: string;
}

export function MegalodonWhalePulse() {
    const [alerts, setAlerts] = useState<UIStoreAlert[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(true);

    // Connect to the REAL on-chain mempool stream  only whale events ($500k+) arrive here
    useEffect(() => {
        if (!isMonitoring) return;
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchPulse = async () => {
            if (!isMounted) return;
            try {
                const res = await fetch('/api/network/whale/mempool-stream');
                if (res.ok) {
                    const tx = await res.json();
                    if (tx && tx.type === 'whale') {
                        const ethValue = typeof tx.value === 'number' ? tx.value : 0;
                        const usdEstimate = ethValue * 3000;
                        const formatted = usdEstimate >= 1_000_000
                            ? `$${(usdEstimate / 1_000_000).toFixed(1)}M`
                            : `$${(usdEstimate / 1_000).toFixed(0)}K`;
                        
                        const alert: UIStoreAlert = {
                            id: tx.hash?.slice(0, 10) || Date.now().toString(36),
                            type: 'WHALE_TX',
                            chain: 'ETH',
                            amount: formatted,
                            severity: usdEstimate > 5_000_000 ? 'ASTRONOMICAL' : 'CRITICAL',
                            timestamp: new Date(tx.timestamp || Date.now()).toLocaleTimeString(),
                        };
                        
                        setAlerts(prev => [alert, ...prev].slice(0, 5));
                    }
                }
            } catch (e) {
                // Silently retry
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchPulse, 2500); // 2.5s polling
                }
            }
        };

        fetchPulse();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [isMonitoring]);

    const [alertStats, setAlertStats] = useState<{ eth24h: number; btc24h: number; sol24h: number; base24h: number } | null>(null);

    useEffect(() => {
        fetch('/api/network/whale/alert-stats')
            .then(r => r.json())
            .then(data => { if (data.stats) setAlertStats(data.stats); })
            .catch(() => {});
        // Refresh every 5 min
        const t = setInterval(() => {
            fetch('/api/network/whale/alert-stats')
                .then(r => r.json())
                .then(data => { if (data.stats) setAlertStats(data.stats); })
                .catch(() => {});
        }, 300000);
        return () => clearInterval(t);
    }, []);

    function fmtCount(n: number | undefined): string {
        if (n === undefined || n === null) return '';
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return n.toString();
    }

    return (
        <div className="w-full bg-[#0A0A12] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Header / Status */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-0.5">Megalodon Whale Pulse</h3>
                        <p className="text-white/30 font-mono text-[9px] uppercase tracking-widest">Global Omni-Channel Dispatcher: Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                       <span className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest">Active · SSE Stream</span>
                   </div>
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className={`p-4 rounded-2xl border transition-all duration-500 ${
                                alert.severity === 'ASTRONOMICAL' 
                                ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
                                : 'bg-white/[0.03] border-white/5'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${
                                        alert.severity === 'ASTRONOMICAL' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'
                                    }`}>
                                        {alert.type === 'WHALE_TX' ? <Crown className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm tracking-tight">{alert.amount}</span>
                                            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest border border-white/5">{alert.chain}</span>
                                        </div>
                                        <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mt-1">
                                            {alert.type === 'WHALE_TX' ? 'Large Transfer Detected' : 'Massive Liquidation Event'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${
                                        alert.severity === 'ASTRONOMICAL' ? 'text-indigo-400' : 'text-white/20'
                                    }`}>
                                        {alert.severity}
                                    </span>
                                    <span className="text-[9px] font-mono text-white/20">{alert.timestamp}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {alerts.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 opacity-20">
                       <Terminal className="w-10 h-10 mb-4" />
                       <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Scanning Ethereum mainnet for whale events (&gt;$500k)...</p>
                   </div>
                )}
            </div>

            {/* Sub-footer stats  REAL data from mempool.space */}
            <div className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
                <MiniStat label="ETH 24H" value={`${fmtCount(alertStats?.eth24h)} Txs`} />
                <MiniStat label="BTC 24H" value={`${fmtCount(alertStats?.btc24h)} Txs`} />
                <MiniStat label="Solana" value={`${fmtCount(alertStats?.sol24h)} Est.`} />
                <MiniStat label="Base" value={`${fmtCount(alertStats?.base24h)} Est.`} />
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{label}</span>
            <span className="text-[10px] text-white/60 font-mono">{value}</span>
        </div>
    );
}

