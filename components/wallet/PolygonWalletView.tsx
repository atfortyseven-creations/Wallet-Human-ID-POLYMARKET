"use client";

import { useState } from "react";
import {
    Copy,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    ArrowLeftRight,
    ExternalLink,
    CheckCircle2,
    Clock,
    ChevronDown
} from "lucide-react";
import { useAccount, useDisconnect, useBalance } from "wagmi";

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// Default Initial Data
const ASSETS = [
    { symbol: "POL", name: "Polygon Ecosystem Token", balance: "145.20", price: 0.72, value: 104.54, icon: "" },
    { symbol: "USDC.e", name: "Bridged USDC", balance: "2,450.00", price: 1.00, value: 2450.00, icon: "" },
    { symbol: "WETH", name: "Wrapped Ether", balance: "0.05", price: 2300.00, value: 115.00, icon: "" },
];

const TRANSACTIONS = [
    { hash: "0x8f...29a1", type: "Received", amount: "+ 500 USDC.e", date: "2 mins ago", status: "Confirmed" },
    { hash: "0x3a...b1c2", type: "Sent", amount: "- 12 POL", date: "4 hrs ago", status: "Confirmed" },
    { hash: "0x1d...e4f5", type: "Bridge", amount: "ETH -> WETH", date: "1 day ago", status: "Confirmed" },
];

export default function PolygonWalletView() {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [activeTab, setActiveTab] = useState<"tokens" | "activity">("tokens");
    const [isCopied, setIsCopied] = useState(false);

    // Helper to copy address
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-slate-100">

            {/* 1. Header Minimalista */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-slate-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-600">Polygon Mainnet</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {address && (
                            <button
                                onClick={copyAddress}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 hover:bg-black/5 rounded-lg"
                            >
                                {truncateAddress(address)}
                                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        <button
                            onClick={() => disconnect()}
                            className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">

                {/* 2. Balance Principal */}
                <section className="text-center space-y-4">
                    <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Balance</h2>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-950">$2,669.54</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/5 rounded-full text-sm font-medium text-slate-600">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>145.20 POL Available for Gas</span>
                    </div>
                </section>

                {/* 3. Grid de Acciones */}
                <section className="grid grid-cols-4 gap-4">
                    <ActionButton icon={<ArrowDownLeft />} label="Receive" />
                    <ActionButton icon={<ArrowUpRight />} label="Send" />
                    <ActionButton icon={<RefreshCw />} label="Swap" highlight />
                    <ActionButton icon={<ExternalLink />} label="Bridge" />
                </section>

                {/* 4. Listas (Tokens / Activity) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6 border-b border-slate-100 pb-1">
                        <TabButton active={activeTab === "tokens"} onClick={() => setActiveTab("tokens")} label="Assets" />
                        <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} label="Activity" />
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === "tokens" ? (
                            <div className="space-y-1">
                                {ASSETS.map((asset) => (
                                    <div key={asset.symbol} className="group flex items-center justify-between p-4 hover:bg-black/5 rounded-xl transition-colors cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-lg">
                                                {asset.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{asset.name}</p>
                                                <p className="text-sm text-slate-500">{asset.balance} {asset.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-slate-900">${safeToFixed(asset.value, 2)}</p>
                                            <p className="text-sm text-slate-400">${safeToFixed(asset.price, 2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {TRANSACTIONS.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${tx.type === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-black/5 text-slate-600'}`}>
                                                {tx.type === 'Received' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{tx.type}</p>
                                                <p className="text-xs text-slate-500">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-medium ${tx.type === 'Received' ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.amount}</p>
                                            <p className="text-xs text-slate-400 font-mono">{tx.hash}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}

function ActionButton({ icon, label, highlight }: { icon: React.ReactNode, label: string, highlight?: boolean }) {
    return (
        <button className="flex flex-col items-center gap-3 p-4 group">
            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                ${highlight
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 group-hover:scale-105'
                    : 'bg-white border border-slate-200 text-slate-900 group-hover:border-slate-300 group-hover:bg-black/5'
                }
            `}>
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
        </button>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                pb-3 text-sm font-medium transition-all relative
                ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}
            `}
        >
            {label}
            {active && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 rounded-t-full" />
            )}
        </button>
    );
}

