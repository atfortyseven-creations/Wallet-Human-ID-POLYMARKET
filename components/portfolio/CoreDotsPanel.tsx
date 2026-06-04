"use client";

/**
 * CoreDotsPanel  Full system QDs interface
 * 
 * Features:
 *    Active on-chain QD balance (ERC-20 read, 15s refresh)
 *    Core Transfer terminal (ERC-2612 Permit + transferWithReceiptPermit)
 *    On-chain receipt history (reads last N receipts from CoreLedger)
 *    Animated 256-bit core entropy visualizer
 *    Gas estimator with ETH/USD pricing
 *    Full receipt PDF-style card with all on-chain fields
 *    Network topology: Total receipts, global volume, unique senders
 *    Tokenomics overview (supply, chain, contract address)
 *    Multi-step progress bar (validating  signing  broadcasting  confirming  done)
 *    Copy-to-clipboard for all cryptographic fields
 *    Block explorer deep links
 *    AnimatePresence transitions throughout
 *    Zero external UI deps  pure Tailwind + Framer Motion
 * 
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    useWriteContract, useAccount, useSignTypedData,
    useReadContract, usePublicClient,
} from 'wagmi';
import {
    parseAbi, parseEther, formatEther, formatUnits, isAddress,
    encodeAbiParameters, parseAbiParameters, keccak256, toBytes,
    type TransactionReceipt as ViemReceipt,
} from 'viem';
import {
    ArrowRight, CheckCircle2, Loader2, AlertCircle, Copy,
    Zap, Shield, Hash, Clock, Layers, Lock, Send, X,
    ExternalLink, Activity, RefreshCw, ChevronDown,
    TrendingUp, Database, Globe, Eye, EyeOff, Sparkles,
    BarChart3, ArrowUpRight, Terminal, FileText, Check,
    Cpu, Atom, Infinity,
} from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

//  Environment 
const CHAIN_ID      = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
const TOKEN_ADDR    = (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS  || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const LEDGER_ADDR   = (process.env.NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const EXPLORER      = CHAIN_ID === 137 ? 'https://polygonscan.com' : 'https://basescan.org';
const CHAIN_NAME    = CHAIN_ID === 137 ? 'Polygon' : 'Base';
const NATIVE_SYM    = CHAIN_ID === 137 ? 'POL'     : 'ETH';

//  ABIs 
const LEDGER_ABI = parseAbi([
    'function transferWithReceiptPermit(address to, uint256 amount, string calldata memo, uint256 deadline, uint8 v, bytes32 r, bytes32 s, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
    'function transferWithReceipt(address to, uint256 amount, string calldata memo, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
    'function getUserReceiptCount(address user) view returns (uint256)',
    'function totalReceipts() view returns (uint256)',
    'function getReceipt(uint256 receiptId) view returns ((uint256 id, address sender, address receiver, uint256 amount, uint256 timestamp, uint256 blockNumber, uint256 coreEntropy, bytes advancedMetadata, bytes32 payloadHash, string memo))',
]);

const QDS_ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function nonces(address) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
]);

//  Types 
type TxStep = 'idle' | 'validating' | 'estimating' | 'signing' | 'broadcasting' | 'confirming' | 'done' | 'error';
type Tab    = 'transfer' | 'history' | 'tokenomics' | 'entropy';

interface OnChainReceipt {
    id:             bigint;
    sender:         `0x${string}`;
    receiver:       `0x${string}`;
    amount:         bigint;
    timestamp:      bigint;
    blockNumber:    bigint;
    coreEntropy: bigint;
    payloadHash:    `0x${string}`;
    memo:           string;
    txHash:         `0x${string}`;
    gasUsed?:       bigint;
}

//  Core Entropy Generator 
function generateCoreEntropy(): bigint {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return BigInt('0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
}

//  Advanced Metadata Builder 
function buildAdvancedMetadata(msTimestamp: number, routeId: string): `0x${string}` {
    try {
        return encodeAbiParameters(
            parseAbiParameters('string platform, uint64 msTimestamp, bytes32 routeId'),
            ['CoreLedger/v2', BigInt(msTimestamp), keccak256(toBytes(routeId)) as `0x${string}`]
        );
    } catch { return '0x'; }
}

//  Address Formatter 
function fmtAddr(a: string, len = 6): string {
    if (!a || a.length < 12) return a;
    return `${a.slice(0, len + 2)}${a.slice(-4)}`;
}

//  Copy Hook 
function useCopy() {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = useCallback((val: string, key: string) => {
        navigator.clipboard.writeText(val).catch(() => {});
        setCopied(key);
        setTimeout(() => setCopied(null), 1600);
    }, []);
    return { copied, copy };
}

//  Native Price Hook 
function useNativePrice() {
    const [price, setPrice] = useState<number>(CHAIN_ID === 137 ? 0.45 : 2400);
    useEffect(() => {
        const id = CHAIN_ID === 137 ? 'matic-network' : 'ethereum';
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
            .then(r => r.json())
            .then(d => { const p = d[id]?.usd; if (p) setPrice(p); })
            .catch(() => {});
        const t = setInterval(() => {
            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
                .then(r => r.json())
                .then(d => { const p = d[id]?.usd; if (p) setPrice(p); })
                .catch(() => {});
        }, 60_000);
        return () => clearInterval(t);
    }, []);
    return price;
}

// 
// SUBCOMPONENTS
// 

//  Entropy Visualizer 
function EntropyVisualizer({ entropy }: { entropy: bigint }) {
    const hex = entropy.toString(16).padStart(64, '0');
    const bytes = Array.from({ length: 32 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16));
    return (
        <div className="w-full">
            <div className="grid grid-cols-8 gap-1 mb-3">
                {bytes.map((b, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.012, duration: 0.2 }}
                        className="aspect-square rounded flex items-center justify-center text-[7px] font-mono font-black"
                        style={{
                            background: `hsl(${(b / 255) * 240}, 80%, 45%)`,
                            color: b > 128 ? '#fff' : '#000',
                            opacity: 0.7 + (b / 255) * 0.3,
                        }}
                    >
                        {b.toString(16).padStart(2, '0')}
                    </motion.div>
                ))}
            </div>
            <div className="font-mono text-[9px] text-black/30 break-all leading-relaxed">
                0x{hex}
            </div>
        </div>
    );
}

//  Active Entropy Tab 
function EntropyTab() {
    const [entropy, setEntropy] = useState<bigint>(() => generateCoreEntropy());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => setEntropy(generateCoreEntropy()), 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [autoRefresh]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-tight">256-Bit Core Entropy</h3>
                    <p className="text-[10px] font-mono text-black/40 mt-0.5">
                        CSPRNG · Web Crypto API · injected per-tx
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh(a => !a)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                            autoRefresh ? 'bg-black text-white border-black' : 'bg-transparent text-black/50 border-black/20 hover:border-black/40'
                        }`}
                    >
                        {autoRefresh ? 'Active' : 'Paused'}
                    </button>
                    <button
                        onClick={() => setEntropy(generateCoreEntropy())}
                        className="p-1.5 rounded-full border border-black/10 text-black/40 hover:text-black transition-colors"
                    >
                        <RefreshCw size={12} />
                    </button>
                </div>
            </div>

            <motion.div
                key={entropy.toString().slice(-8)}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="bg-[#FFFFFF] border border-black/8 rounded-2xl p-5"
            >
                <EntropyVisualizer entropy={entropy} />
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Bits', value: '256' },
                    { label: 'Source', value: 'Web Crypto API' },
                    { label: 'Algorithm', value: 'CSPRNG' },
                    { label: 'Per-Tx Unique', value: 'Yes' },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-[#FFFFFF] border border-black/5 rounded-xl px-4 py-3">
                        <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-1">{label}</div>
                        <div className="font-mono font-black text-xs text-black">{value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <Atom size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-mono text-amber-700 leading-relaxed uppercase tracking-wide">
                        Each QD transfer is permanently bound to a unique 256-bit entropy value generated client-side using the browser's cryptographically secure PRNG. This entropy is ABI-encoded alongside route metadata and stored immutably on-chain in the CoreLedger contract  making every transfer cryptographically unique and unforgeable.
                    </p>
                </div>
            </div>
        </div>
    );
}

//  Tokenomics Tab 
function TokenomicsTab({
    totalSupply,
    qdBalance,
    totalReceipts,
    userReceiptCount,
    address,
}: {
    totalSupply: bigint;
    qdBalance: number;
    totalReceipts: bigint;
    userReceiptCount: bigint;
    address: string;
}) {
    const { copy, copied } = useCopy();
    const supplyNum = parseFloat(formatEther(totalSupply));
    const userPct   = supplyNum > 0 ? (qdBalance / supplyNum) * 100 : 0;

    const stats = [
        { label: 'Total Supply',         value: supplyNum > 0 ? supplyNum.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '', unit: 'QDs', icon: <Database size={14} /> },
        { label: 'Your Balance',         value: qdBalance.toLocaleString(undefined, { maximumFractionDigits: 4 }), unit: 'QDs', icon: <TrendingUp size={14} /> },
        { label: 'Your Share',           value: userPct < 0.0001 ? '<0.0001' : userPct.toFixed(4), unit: '%',   icon: <BarChart3 size={14} /> },
        { label: 'Total Receipts',       value: totalReceipts.toLocaleString(), unit: 'txs', icon: <FileText size={14} /> },
        { label: 'Your Receipts',        value: userReceiptCount.toLocaleString(), unit: 'txs', icon: <Activity size={14} /> },
        { label: 'Network',              value: CHAIN_NAME, unit: '',    icon: <Globe size={14} /> },
    ];

    return (
        <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map(({ label, value, unit, icon }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FFFFFF] border border-black/8 rounded-2xl px-6 py-6 flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-2 text-black/40">{icon}</div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">{label}</div>
                            <div className="font-mono font-black text-2xl text-black">
                                {value}{unit ? <span className="text-black/40 font-normal text-xs ml-1.5">{unit}</span> : null}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Contract addresses */}
            <div className="border border-black/8 rounded-2xl overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-black/5 bg-[#FFFFFF]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Contract Addresses</span>
                </div>
                {[
                    { label: 'QDs Token (ERC-20)', addr: TOKEN_ADDR },
                    { label: 'CoreLedger',      addr: LEDGER_ADDR },
                ].map(({ label, addr }) => (
                    <div key={label} className="flex items-center gap-4 px-6 py-4 border-b border-black/5 last:border-0">
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">{label}</div>
                            <div className="font-mono text-sm text-black truncate">{addr}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={() => copy(addr, label)} className="text-black/30 hover:text-black transition-colors">
                                {copied === label ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                            <a href={`${EXPLORER}/address/${addr}`} target="_blank" rel="noopener noreferrer" className="text-black/30 hover:text-black transition-colors">
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Protocol */}
            <div className="bg-[#FFFFFF] border border-black/8 rounded-2xl p-6 mt-6 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-black/40">Protocol Architecture</div>
                <div className="space-y-3">
                    {[
                        { k: 'Standard',     v: 'ERC-20 + ERC-2612 (Permit)' },
                        { k: 'Entropy',      v: '256-bit CSPRNG, unique per-tx' },
                        { k: 'Metadata',     v: 'ABI-encoded route + ms-timestamp' },
                        { k: 'Fingerprint',  v: 'Keccak-256 payload hash' },
                        { k: 'Gas Model',    v: `L2 (${CHAIN_NAME}), negligible fees` },
                        { k: 'Receipt',      v: 'Immutable on-chain CoreLedger' },
                    ].map(({ k, v }) => (
                        <div key={k} className="flex items-center justify-between text-sm border-b border-black/[0.03] pb-2 last:border-0 last:pb-0">
                            <span className="font-mono text-black/50 uppercase tracking-widest text-[10px]">{k}</span>
                            <span className="font-mono font-black text-xs text-black">{v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

//  Receipt Row 
function ReceiptRow({
    receipt,
    userAddress,
    onSelect,
}: {
    receipt: OnChainReceipt;
    userAddress: string;
    onSelect: (r: OnChainReceipt) => void;
}) {
    const isSend = receipt.sender.toLowerCase() === userAddress.toLowerCase();
    const amt    = parseFloat(formatEther(receipt.amount));
    const ts     = new Date(Number(receipt.timestamp) * 1000);

    return (
        <motion.button
            onClick={() => onSelect(receipt)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-black/5 hover:border-black/15 hover:bg-black/[0.02] transition-all text-left group"
        >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSend ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                {isSend ? <ArrowUpRight size={14} /> : <ArrowRight size={14} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-black text-[11px] uppercase tracking-tight text-black">
                        {isSend ? 'Sent' : 'Received'}
                    </span>
                    <span className="text-[8px] font-mono text-black/25">#{receipt.id.toString()}</span>
                </div>
                <div className="text-[9px] font-mono text-black/40 truncate mt-0.5">
                    {isSend ? ` ${fmtAddr(receipt.receiver)}` : ` ${fmtAddr(receipt.sender)}`}
                    {receipt.memo ? ` · "${receipt.memo}"` : ''}
                </div>
            </div>
            <div className="text-right shrink-0">
                <div className={`font-mono font-black text-sm ${isSend ? 'text-red-500' : 'text-emerald-600'}`}>
                    {isSend ? '-' : '+'}{amt.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    <span className="text-[9px] font-normal text-black/30 ml-1">QDs</span>
                </div>
                <div className="text-[8px] font-mono text-black/30 mt-0.5">
                    {ts.toLocaleDateString()} {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <ExternalLink size={11} className="text-black/20 group-hover:text-black/50 transition-colors shrink-0" />
        </motion.button>
    );
}

//  Full Receipt Card 
function FullReceiptCard({ receipt, onClose }: { receipt: OnChainReceipt; onClose: () => void }) {
    const { copy, copied } = useCopy();
    const amt = parseFloat(formatEther(receipt.amount));

    const rows = [
        { icon: <Hash size={10} />,     label: 'Receipt ID',       value: `#${receipt.id.toString()}`,                   key: 'id'      },
        { icon: <Send size={10} />,     label: 'Sender',           value: receipt.sender,                                 key: 'sender', mono: true },
        { icon: <ArrowRight size={10}/>,label: 'Receiver',         value: receipt.receiver,                               key: 'rcv',    mono: true },
        { icon: <Layers size={10} />,   label: 'Block',            value: `#${receipt.blockNumber.toString()}`,           key: 'block'   },
        { icon: <Clock size={10} />,    label: 'Timestamp',        value: new Date(Number(receipt.timestamp) * 1000).toISOString(), key: 'ts' },
        { icon: <Zap size={10} />,      label: 'Core Entropy',  value: `0x${receipt.coreEntropy.toString(16).padStart(64,'0')}`, key: 'ent', mono: true },
        { icon: <Shield size={10} />,   label: 'Payload Hash',     value: receipt.payloadHash,                            key: 'phash',  mono: true },
        { icon: <Activity size={10} />, label: 'Tx Hash',          value: receipt.txHash,                                 key: 'tx',     mono: true },
        ...(receipt.gasUsed ? [{ icon: <Cpu size={10} />, label: 'Gas Used', value: receipt.gasUsed.toLocaleString() + ' units', key: 'gas' }] : []),
        ...(receipt.memo   ? [{ icon: <FileText size={10} />, label: 'Memo', value: `"${receipt.memo}"`, key: 'memo' }] : []),
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-black px-6 pt-6 pb-8 flex flex-col items-center gap-3 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    <div className="w-20 h-20">
                        <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} className="w-full h-full" />
                    </div>
                    <div className="text-center">
                        <div className="text-white font-black text-2xl tracking-tight">
                            {amt.toLocaleString(undefined, { maximumFractionDigits: 6 })} QDs
                        </div>
                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest mt-1">
                            Immutable On-Chain Receipt
                        </div>
                    </div>
                </div>

                {/* Fields */}
                <div className="px-5 py-2 max-h-[50vh] overflow-y-auto divide-y divide-black/5">
                    {rows.map(row => (
                        <div key={row.key} className="flex items-center gap-3 py-3">
                            <div className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center shrink-0 text-black/40">
                                {row.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-0.5">{row.label}</div>
                                <div className={`text-[10px] ${row.mono ? 'font-mono' : 'font-bold'} text-black truncate`}>
                                    {row.value.length > 44 ? `${row.value.slice(0, 22)}${row.value.slice(-10)}` : row.value}
                                </div>
                            </div>
                            <button onClick={() => copy(row.value, row.key)} className="shrink-0 text-black/20 hover:text-black transition-colors">
                                {copied === row.key ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 flex gap-3">
                    <a
                        href={`${EXPLORER}/tx/${receipt.txHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/60 hover:bg-black/5 transition-all"
                    >
                        <ExternalLink size={11} /> Block Explorer
                    </a>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

//  History Tab 
function HistoryTab({
    address,
    userReceiptCount,
    totalReceipts,
    publicClient,
}: {
    address: `0x${string}`;
    userReceiptCount: bigint;
    totalReceipts: bigint;
    publicClient: any;
}) {
    const [receipts, setReceipts]   = useState<OnChainReceipt[]>([]);
    const [loading, setLoading]     = useState(false);
    const [selected, setSelected]   = useState<OnChainReceipt | null>(null);
    const [page, setPage]           = useState(0);
    const PAGE_SIZE = 10;

    const load = useCallback(async () => {
        if (!publicClient || totalReceipts === 0n) return;
        setLoading(true);
        try {
            // Read last PAGE_SIZE receipts from the ledger (scan backwards from totalReceipts)
            const total  = Number(totalReceipts);
            const start  = Math.max(0, total - PAGE_SIZE * (page + 1));
            const end    = total - PAGE_SIZE * page;
            const ids    = Array.from({ length: end - start }, (_, i) => BigInt(start + i)).reverse();

            const fetched: OnChainReceipt[] = [];
            for (const id of ids) {
                try {
                    const raw = await publicClient.readContract({
                        address: LEDGER_ADDR,
                        abi:     LEDGER_ABI,
                        functionName: 'getReceipt',
                        args: [id],
                    }) as any;
                    if (
                        raw.sender.toLowerCase() === address.toLowerCase() ||
                        raw.receiver.toLowerCase() === address.toLowerCase()
                    ) {
                        fetched.push({
                            id:             raw.id,
                            sender:         raw.sender,
                            receiver:       raw.receiver,
                            amount:         raw.amount,
                            timestamp:      raw.timestamp,
                            blockNumber:    raw.blockNumber,
                            coreEntropy: raw.coreEntropy,
                            payloadHash:    raw.payloadHash,
                            memo:           raw.memo,
                            txHash:         '0x0000000000000000000000000000000000000000000000000000000000000000', // will be unknown for old receipts
                        });
                    }
                } catch { /* skip individual read errors */ }
            }
            setReceipts(prev => page === 0 ? fetched : [...prev, ...fetched]);
        } catch (e) {
            console.error('[HistoryTab] load error', e);
        } finally {
            setLoading(false);
        }
    }, [publicClient, totalReceipts, address, page]);

    useEffect(() => { load(); }, [load]);

    return (
        <>
            <div className="space-y-3 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="font-black text-sm uppercase tracking-tight">Transaction History</div>
                        <div className="text-[9px] font-mono text-black/40 mt-0.5">
                            {userReceiptCount.toString()} on-chain receipts · CoreLedger
                        </div>
                    </div>
                    <button
                        onClick={() => { setPage(0); load(); }}
                        className="p-1.5 rounded-full border border-black/10 text-black/40 hover:text-black transition-colors"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {loading && receipts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 size={20} className="animate-spin text-black/30" />
                        <p className="text-[10px] font-mono uppercase tracking-widest text-black/30">Loading on-chain receipts</p>
                    </div>
                ) : receipts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <FileText size={28} className="text-black/15" strokeWidth={1.5} />
                        <p className="text-[10px] font-mono uppercase tracking-widest text-black/30">No receipts found</p>
                        <p className="text-[9px] text-black/25 text-center max-w-[200px]">
                            Your QD transfers will appear here after confirmation.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {receipts.map(r => (
                            <ReceiptRow key={r.id.toString()} receipt={r} userAddress={address} onSelect={setSelected} />
                        ))}
                    </div>
                )}

                {/* Load more */}
                {receipts.length >= PAGE_SIZE && (
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="w-full py-3 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-black/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                        Load more
                    </button>
                )}
            </div>

            {/* Full receipt modal */}
            <AnimatePresence>
                {selected && (
                    <FullReceiptCard receipt={selected} onClose={() => setSelected(null)} />
                )}
            </AnimatePresence>
        </>
    );
}

//  Step Bar 
const TX_STEPS: { key: TxStep; label: string }[] = [
    { key: 'estimating',   label: 'Gas' },
    { key: 'signing',      label: 'Sign' },
    { key: 'broadcasting', label: 'Send' },
    { key: 'confirming',   label: 'Confirm' },
    { key: 'done',         label: 'Done' },
];

function StepBar({ step }: { step: TxStep }) {
    const active = TX_STEPS.findIndex(s => s.key === step);
    return (
        <div className="flex items-center gap-0 w-full mb-6">
            {TX_STEPS.map((s, i) => {
                const done    = active > i;
                const current = active === i;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1 flex-1">
                            <motion.div
                                animate={{
                                    background: done || current ? '#000' : 'rgba(0,0,0,0.08)',
                                    scale: current ? 1.15 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                            >
                                {done    ? <CheckCircle2 size={12} className="text-white" /> :
                                 current ? <Loader2 size={10} className="text-white animate-spin" /> :
                                           <div className="w-1.5 h-1.5 rounded-full bg-black/20" />}
                            </motion.div>
                            <span className={`text-[7px] font-black uppercase tracking-widest ${done || current ? 'text-black' : 'text-black/20'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < TX_STEPS.length - 1 && (
                            <div className={`h-[1px] flex-1 mt-[-12px] transition-all duration-500 ${done ? 'bg-black' : 'bg-black/10'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

//  Transfer Tab 
function TransferTab({
    qdBalance,
    address,
    onSuccess,
}: {
    qdBalance: number;
    address: `0x${string}`;
    onSuccess: (r: OnChainReceipt) => void;
}) {
    const [recipient, setRecipient]           = useState('');
    const [amount, setAmount]                 = useState('');
    const [memo, setMemo]                     = useState('');
    const [step, setStep]                     = useState<TxStep>('idle');
    const [error, setError]                   = useState<string | null>(null);
    const [gasEstimate, setGasEstimate]       = useState<bigint | null>(null);
    const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
    const [showReceipt, setShowReceipt]       = useState<OnChainReceipt | null>(null);
    const receiptCounter                      = useRef(0);
    const nativePrice                         = useNativePrice();

    const publicClient         = usePublicClient();
    const { writeContractAsync }  = useWriteContract();
    const { signTypedDataAsync }  = useSignTypedData();

    const { data: nonceRaw, refetch: refetchNonce } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'nonces',
        args: [address],
        chainId: CHAIN_ID,
        query: { enabled: !!address },
    });

    const { data: allowanceRaw } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'allowance',
        args: [address, LEDGER_ADDR],
        chainId: CHAIN_ID,
        query: { enabled: !!address, refetchInterval: 10_000 },
    });

    const { data: totalReceiptsRaw } = useReadContract({
        address: LEDGER_ADDR,
        abi: LEDGER_ABI,
        functionName: 'totalReceipts',
        chainId: CHAIN_ID,
        query: { refetchInterval: 30_000 },
    });

    useEffect(() => {
        if (totalReceiptsRaw) receiptCounter.current = Number(totalReceiptsRaw as bigint) + 1;
    }, [totalReceiptsRaw]);

    const parsedAmount           = amount ? parseEther(amount) : 0n;
    const allowance              = allowanceRaw ? (allowanceRaw as bigint) : 0n;
    const hasSufficientAllowance = allowance >= parsedAmount && parsedAmount > 0n;
    const amountNum              = parseFloat(amount || '0');
    const amountValid            = amountNum > 0 && amountNum <= qdBalance;
    const formValid              = recipientValid === true && amountValid;
    const isActive               = !['idle', 'done', 'error'].includes(step);

    useEffect(() => {
        if (!recipient) { setRecipientValid(null); return; }
        setRecipientValid(isAddress(recipient) && recipient.toLowerCase() !== address?.toLowerCase());
    }, [recipient, address]);

    const estimateGas = useCallback(async () => {
        if (!publicClient || !address || !formValid) return;
        try {
            const entropy  = generateCoreEntropy();
            const metadata = buildAdvancedMetadata(Date.now(), `${address}-${recipient}-${Date.now()}`);
            const gas = await publicClient.estimateContractGas({
                address: LEDGER_ADDR,
                abi: LEDGER_ABI,
                functionName: 'transferWithReceipt',
                args: [recipient as `0x${string}`, parsedAmount, memo || '', entropy, metadata],
                account: address,
            }).catch(() => 120_000n);
            setGasEstimate(gas);
        } catch { setGasEstimate(120_000n); }
    }, [publicClient, address, formValid, recipient, parsedAmount, memo]);

    const execute = useCallback(async () => {
        if (!address || !formValid || !publicClient) return;
        setError(null);

        const coreEntropy   = generateCoreEntropy();
        const msNow            = Date.now();
        const routeId          = `${address}->${recipient}@${msNow}`;
        const advancedMetadata = buildAdvancedMetadata(msNow, routeId);
        const deadline         = BigInt(Math.floor(msNow / 1000) + 3600);

        try {
            // Step 1: Gas Estimation
            setStep('estimating');
            const gasEst = await publicClient.estimateContractGas({
                address: LEDGER_ADDR,
                abi: LEDGER_ABI,
                functionName: 'transferWithReceipt',
                args: [recipient as `0x${string}`, parsedAmount, memo || '', coreEntropy, advancedMetadata],
                account: address,
            }).catch(() => 130_000n);
            setGasEstimate(gasEst);

            // Step 2: ERC-2612 Permit signature
            setStep('signing');
            toast.info('Signature requested', { description: 'Authorize ERC-2612 Permit in your wallet.' });

            const { data: latestNonce } = await refetchNonce();
            const currentNonce          = (latestNonce as bigint) ?? 0n;

            let txHash: `0x${string}`;

            try {
                const sig = await signTypedDataAsync({
                    domain: {
                        name: 'CoreDots', version: '1',
                        chainId: CHAIN_ID, verifyingContract: TOKEN_ADDR,
                    },
                    types: {
                        Permit: [
                            { name: 'owner',    type: 'address' },
                            { name: 'spender',  type: 'address' },
                            { name: 'value',    type: 'uint256' },
                            { name: 'nonce',    type: 'uint256' },
                            { name: 'deadline', type: 'uint256' },
                        ],
                    },
                    primaryType: 'Permit',
                    message: { owner: address, spender: LEDGER_ADDR, value: parsedAmount, nonce: currentNonce, deadline },
                });

                const r = sig.slice(0, 66) as `0x${string}`;
                const s = `0x${sig.slice(66, 130)}` as `0x${string}`;
                const v = Number(`0x${sig.slice(130, 132)}`);

                // Step 3: Broadcast
                setStep('broadcasting');
                toast.loading('Injecting entropy on-chain', { id: 'qt-tx' });

                txHash = await writeContractAsync({
                    address: LEDGER_ADDR, abi: LEDGER_ABI,
                    functionName: 'transferWithReceiptPermit',
                    args: [recipient as `0x${string}`, parsedAmount, memo || '', deadline, v, r, s, coreEntropy, advancedMetadata],
                    gas: gasEst + gasEst / 5n,
                });
            } catch {
                if (!hasSufficientAllowance) throw new Error('Insufficient allowance and Permit rejected.');
                setStep('broadcasting');
                toast.loading('Broadcasting', { id: 'qt-tx' });
                txHash = await writeContractAsync({
                    address: LEDGER_ADDR, abi: LEDGER_ABI,
                    functionName: 'transferWithReceipt',
                    args: [recipient as `0x${string}`, parsedAmount, memo || '', coreEntropy, advancedMetadata],
                    gas: gasEst + gasEst / 5n,
                });
            }

            // Step 4: Wait for confirmation
            setStep('confirming');
            toast.dismiss('qt-tx');
            toast.loading('Waiting for block confirmation', { id: 'qt-confirm' });

            let txReceipt: ViemReceipt | null = null;
            if (publicClient) {
                txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
            }
            toast.dismiss('qt-confirm');

            // Step 5: Done
            setStep('done');
            const onChainReceipt: OnChainReceipt = {
                id:             BigInt(receiptCounter.current++),
                sender:         address,
                receiver:       recipient as `0x${string}`,
                amount:         parsedAmount,
                timestamp:      BigInt(Math.floor(msNow / 1000)),
                blockNumber:    txReceipt?.blockNumber ?? 0n,
                coreEntropy,
                payloadHash:    keccak256(toBytes(txHash)) as `0x${string}`,
                memo:           memo || '',
                txHash,
                gasUsed:        txReceipt?.gasUsed,
            };

            setShowReceipt(onChainReceipt);
            onSuccess(onChainReceipt);
            setRecipient('');
            setAmount('');
            setMemo('');
            toast.success('Transfer confirmed on-chain', { description: 'Receipt minted in CoreLedger.' });
        } catch (err: any) {
            const msg = err?.shortMessage || err?.message || 'Unknown error';
            setError(msg);
            setStep('error');
            toast.dismiss('qt-tx');
            toast.dismiss('qt-confirm');
            toast.error('Transfer failed', { description: msg });
        }
    }, [
        address, formValid, publicClient, recipient, parsedAmount, memo,
        refetchNonce, signTypedDataAsync, writeContractAsync, hasSufficientAllowance,
    ]);

    const gasETH = gasEstimate
        ? parseFloat(formatUnits(gasEstimate * 1_500_000_000n, 18))
        : null;
    const gasUSD = gasETH !== null ? gasETH * nativePrice : null;

    return (
        <>
            <div className="space-y-5 p-6">
                {/* Progress bar */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <StepBar step={step} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recipient field */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40">
                        Recipient Address
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value.trim())}
                            placeholder="0x EVM address"
                            disabled={isActive}
                            className="w-full bg-[#FFFFFF] border rounded-2xl px-5 py-4 text-black font-mono text-sm focus:outline-none transition-all placeholder:text-black/25 disabled:opacity-50"
                            style={{
                                borderColor: recipientValid === false ? '#ef4444'
                                            : recipientValid === true  ? '#22c55e'
                                            : 'rgba(0,0,0,0.1)',
                            }}
                        />
                        <AnimatePresence>
                            {recipientValid === true && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                </motion.div>
                            )}
                            {recipientValid === false && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <AlertCircle size={14} className="text-red-500" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {recipientValid === false && (
                        <p className="text-[9px] font-mono text-red-500 ml-1">Invalid address or matches your own wallet.</p>
                    )}
                </div>

                {/* Amount field */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40">Amount (QDs)</label>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-black/30">
                                Balance: <span className="font-black text-black/60">{qdBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                            </span>
                            <button
                                onClick={() => setAmount(qdBalance.toFixed(6))}
                                className="text-[8px] font-black uppercase tracking-widest text-black/40 hover:text-black border border-black/10 px-2 py-0.5 rounded-full transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.000000"
                            step="0.000001"
                            disabled={isActive}
                            className="w-full bg-[#FFFFFF] border rounded-2xl px-5 py-4 text-black font-mono text-2xl font-black focus:outline-none transition-all placeholder:text-black/20 disabled:opacity-50"
                            style={{ borderColor: amount && !amountValid ? '#ef4444' : 'rgba(0,0,0,0.1)' }}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 font-mono font-black text-sm">QDs</span>
                    </div>
                    {amount && !amountValid && (
                        <p className="text-[9px] font-mono text-red-500 ml-1">
                            Insufficient balance ({qdBalance.toFixed(4)} QDs available).
                        </p>
                    )}
                </div>

                {/* Memo field */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40">
                        Public Memo <span className="normal-case font-normal text-black/25">(optional · max 64 chars)</span>
                    </label>
                    <input
                        type="text"
                        value={memo}
                        onChange={e => setMemo(e.target.value.slice(0, 64))}
                        placeholder="P2P payment, asset purchase"
                        maxLength={64}
                        disabled={isActive}
                        className="w-full bg-[#FFFFFF] border border-black/10 rounded-2xl px-5 py-3.5 text-black text-sm focus:outline-none transition-all placeholder:text-black/20 disabled:opacity-50"
                    />
                    {memo && <p className="text-[8px] font-mono text-black/25 ml-1">{64 - memo.length} chars remaining</p>}
                </div>

                {/* Gas estimation panel */}
                <AnimatePresence>
                    {gasEstimate !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-[#FFFFFF] border border-black/5 rounded-2xl px-5 py-4"
                        >
                            <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-3">Estimated Gas · L2 ({CHAIN_NAME})</div>
                            <div className="space-y-0 divide-y divide-black/5">
                                {[
                                    { label: 'Gas Units',    value: gasEstimate.toLocaleString(), unit: 'gas' },
                                    { label: `Max ${NATIVE_SYM}`, value: gasETH?.toFixed(8) ?? '', unit: NATIVE_SYM },
                                    { label: 'Max USD',      value: gasUSD !== null ? ` $${gasUSD.toFixed(4)}` : '', unit: '(negligible)' },
                                ].map(({ label, value, unit }) => (
                                    <div key={label} className="flex items-center justify-between py-2">
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-black/40">{label}</span>
                                        <span className="font-mono font-black text-xs text-black">
                                            {value} <span className="font-normal text-black/40">{unit}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* Error display */}
                <AnimatePresence>
                    {step === 'error' && error && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
                        >
                            <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-red-600 font-mono leading-relaxed">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTAs */}
                <div className="flex gap-3">
                    {!isActive && (
                        <button
                            onClick={estimateGas}
                            disabled={!formValid}
                            className="flex items-center gap-2 px-4 py-4 border border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/50 hover:bg-black/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                        >
                            <Zap size={13} />
                            <span className="hidden sm:inline">Gas</span>
                        </button>
                    )}
                    <button
                        onClick={step === 'idle' || step === 'error' ? execute : undefined}
                        disabled={!formValid || isActive}
                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:cursor-not-allowed"
                        style={{
                            background: formValid && !isActive ? '#000' : 'rgba(0,0,0,0.07)',
                            color:      formValid && !isActive ? '#fff' : 'rgba(0,0,0,0.25)',
                        }}
                    >
                        {isActive ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {step === 'estimating'   ? 'Estimating gas' :
                                 step === 'signing'      ? 'Sign in wallet' :
                                 step === 'broadcasting' ? 'Broadcasting' :
                                 step === 'confirming'   ? 'Confirming' : ''}
                            </>
                        ) : step === 'done' ? (
                            <>
                                <CheckCircle2 size={16} />
                                Transfer Complete
                            </>
                        ) : (
                            <>
                                <Terminal size={15} />
                                Execute Transfer
                            </>
                        )}
                    </button>
                </div>


            </div>

            {/* Success receipt modal */}
            <AnimatePresence>
                {showReceipt && (
                    <FullReceiptCard
                        receipt={showReceipt}
                        onClose={() => { setShowReceipt(null); setStep('idle'); setError(null); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// 
// MAIN EXPORT
// 

export function CoreDotsPanel() {
    const [tab, setTab]         = useState<Tab>('transfer');
    const [hidden, setHidden]   = useState(false);
    const [recentTx, setRecentTx] = useState<OnChainReceipt | null>(null);

    const { address } = useAccount();
    const publicClient = usePublicClient();

    // On-chain reads
    const { data: rawBalance, refetch: refetchBalance } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        chainId: CHAIN_ID,
        query: { enabled: !!address, refetchInterval: 15_000 },
    });

    const { data: rawSupply } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'totalSupply',
        chainId: CHAIN_ID,
        query: { refetchInterval: 60_000 },
    });

    const { data: rawTotalReceipts } = useReadContract({
        address: LEDGER_ADDR,
        abi: LEDGER_ABI,
        functionName: 'totalReceipts',
        chainId: CHAIN_ID,
        query: { refetchInterval: 30_000 },
    });

    const { data: rawUserCount } = useReadContract({
        address: LEDGER_ADDR,
        abi: LEDGER_ABI,
        functionName: 'getUserReceiptCount',
        args: [address as `0x${string}`],
        chainId: CHAIN_ID,
        query: { enabled: !!address, refetchInterval: 30_000 },
    });

    const qdBalance      = rawBalance    ? parseFloat(formatEther(rawBalance as bigint)) : 0;
    const totalSupply    = rawSupply     ? (rawSupply as bigint) : 0n;
    const totalReceipts  = rawTotalReceipts ? (rawTotalReceipts as bigint) : 0n;
    const userCount      = rawUserCount  ? (rawUserCount as bigint) : 0n;

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'transfer',   label: 'Transfer',   icon: <Send size={12} />      },
        { key: 'history',    label: 'Receipts',   icon: <FileText size={12} />  },
        { key: 'tokenomics', label: 'Tokenomics', icon: <BarChart3 size={12} /> },
        { key: 'entropy',    label: 'Entropy',    icon: <Sparkles size={12} />  },
    ];

    if (!address) {
        return (
            <div className="w-full rounded-3xl border border-black/8 bg-white/60 backdrop-blur-3xl p-10 flex flex-col items-center gap-4 text-center">
                <Database size={32} className="text-black/15" strokeWidth={1.5} />
                <h3 className="font-black text-lg uppercase tracking-tight">Connect Wallet</h3>
                <p className="text-sm text-black/40 max-w-xs">Connect a wallet to access the Core Dots transfer terminal and view your on-chain receipts.</p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-3xl border border-black/8 bg-white/70 backdrop-blur-3xl overflow-hidden shadow-sm">
            {/*  Header  */}
            <div className="bg-[#FFFFFF] px-7 pt-7 pb-6 border-b border-black/5">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div className="text-[8px] font-mono font-black uppercase tracking-[0.35em] text-black/35 mb-1">
                            CoreLedger v2 · {CHAIN_NAME} · {TOKEN_ADDR !== '0x0000000000000000000000000000000000000000' ? fmtAddr(TOKEN_ADDR) : 'Not configured'}
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-black uppercase">
                            QDs  Core Dots
                        </h2>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="text-[8px] font-mono uppercase tracking-widest text-black/30">Your Balance</div>
                            <button onClick={() => setHidden(h => !h)} className="text-black/30 hover:text-black transition-colors">
                                {hidden ? <EyeOff size={10} /> : <Eye size={10} />}
                            </button>
                        </div>
                        <div className="font-mono font-black text-2xl text-black">
                            {hidden ? '' : qdBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            <span className="text-sm ml-1.5 text-black/40">QDs</span>
                        </div>
                        <button onClick={() => refetchBalance()} className="text-black/25 hover:text-black/60 transition-colors mt-0.5">
                            <RefreshCw size={10} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { label: 'Total Receipts', value: totalReceipts.toLocaleString() },
                        { label: 'Your Receipts',  value: userCount.toLocaleString()      },
                        { label: 'Chain',          value: CHAIN_NAME                      },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white border border-black/5 rounded-xl px-3 py-2 shadow-sm">
                            <div className="text-[7px] font-mono uppercase tracking-widest text-black/30 mb-0.5">{label}</div>
                            <div className="font-mono font-black text-xs text-black">{value}</div>
                        </div>
                    ))}
                </div>


            </div>

            {/*  Recent tx toast  */}
            <AnimatePresence>
                {recentTx && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border-b border-emerald-200/60"
                    >
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">
                                {parseFloat(formatEther(recentTx.amount)).toLocaleString(undefined, { maximumFractionDigits: 4 })} QDs sent to {fmtAddr(recentTx.receiver)}
                            </span>
                        </div>
                        <a href={`${EXPLORER}/tx/${recentTx.txHash}`} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 shrink-0 hover:underline">
                            <ExternalLink size={9} /> Explorer
                        </a>
                        <button onClick={() => setRecentTx(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                            <X size={12} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/*  Tab bar  */}
            <div className="flex items-center border-b border-black/8 bg-white/50 px-2 pt-1">
                {tabs.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                            tab === key
                                ? 'border-black text-black'
                                : 'border-transparent text-black/35 hover:text-black/60'
                        }`}
                    >
                        {icon}{label}
                    </button>
                ))}
            </div>

            {/*  Tab content  */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {tab === 'transfer' && (
                        <TransferTab
                            qdBalance={qdBalance}
                            address={address as `0x${string}`}
                            onSuccess={r => { setRecentTx(r); refetchBalance(); setTab('history'); }}
                        />
                    )}
                    {tab === 'history' && (
                        <HistoryTab
                            address={address as `0x${string}`}
                            userReceiptCount={userCount}
                            totalReceipts={totalReceipts}
                            publicClient={publicClient}
                        />
                    )}
                    {tab === 'tokenomics' && (
                        <TokenomicsTab
                            totalSupply={totalSupply}
                            qdBalance={qdBalance}
                            totalReceipts={totalReceipts}
                            userReceiptCount={userCount}
                            address={address}
                        />
                    )}
                    {tab === 'entropy' && <EntropyTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
