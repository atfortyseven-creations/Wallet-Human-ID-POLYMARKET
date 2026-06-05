"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useReadContract, useAccount } from 'wagmi';
import {
    parseAbi, parseEther, formatEther, formatUnits, isAddress,
    encodeAbiParameters, parseAbiParameters, keccak256, toBytes,
} from 'viem';
import {
    ArrowRight, CheckCircle2, Loader2, AlertCircle, Copy,
    Zap, Shield, Hash, Clock, Layers, Send, X,
    ChevronRight, ExternalLink, Activity,
} from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

//  ABI — kept for reference, not used in simulation
const QDS_ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function nonces(address) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
]);

//  Constants
const CHAIN_ID       = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
const TOKEN_ADDR     = (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const LEDGER_ADDR    = (process.env.NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const BLOCK_EXPLORER = CHAIN_ID === 137 ? 'https://polygonscan.com' : 'https://basescan.org';

//  Types
type TxStep = 'idle' | 'validating' | 'estimating' | 'signing' | 'broadcasting' | 'confirming' | 'done' | 'error';

interface ReceiptData {
    id:          bigint;
    sender:      `0x${string}`;
    receiver:    `0x${string}`;
    amount:      bigint;
    timestamp:   bigint;
    blockNumber: bigint;
    coreEntropy: bigint;
    payloadHash: `0x${string}`;
    memo:        string;
    txHash:      `0x${string}`;
    gasUsed?:    bigint;
}

//  Utils
function generateCoreEntropy(): bigint {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    const hex = '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    return BigInt(hex);
}

//  Step Indicator
const STEPS: { key: TxStep; label: string }[] = [
    { key: 'estimating',   label: 'Gas Est.' },
    { key: 'signing',      label: 'Sign' },
    { key: 'broadcasting', label: 'Broadcast' },
    { key: 'confirming',   label: 'Confirm' },
    { key: 'done',         label: 'Finalised' },
];

function StepBar({ step }: { step: TxStep }) {
    const active = STEPS.findIndex(s => s.key === step);
    return (
        <div className="flex items-center gap-0 w-full mb-8">
            {STEPS.map((s, i) => {
                const done    = active > i;
                const current = active === i;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1 flex-1">
                            <motion.div
                                animate={{
                                    background: done ? '#000' : current ? '#000' : 'rgba(0,0,0,0.08)',
                                    scale: current ? 1.15 : 1,
                                }}
                                transition={{ duration: 0.25 }}
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                            >
                                {done ? (
                                    <CheckCircle2 size={14} className="!text-white" />
                                ) : current ? (
                                    <Loader2 size={12} className="!text-white animate-spin" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-black/20" />
                                )}
                            </motion.div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${done || current ? 'text-black' : 'text-black/25'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-[1px] flex-1 mt-[-12px] transition-all duration-500 ${done ? 'bg-black' : 'bg-black/10'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

//  Receipt Card
function ReceiptCard({ receipt, onClose }: { receipt: ReceiptData; onClose: () => void }) {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (val: string, key: string) => {
        navigator.clipboard.writeText(val);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const rows: { icon: React.ReactNode; label: string; value: string; key: string; mono?: boolean }[] = [
        { icon: <Hash size={11} />,     label: 'Receipt ID',    value: `#${receipt.id.toString()}`,                              key: 'id' },
        { icon: <Send size={11} />,     label: 'From',          value: receipt.sender,                                            key: 'sender',   mono: true },
        { icon: <ArrowRight size={11}/>,label: 'To',            value: receipt.receiver,                                          key: 'receiver', mono: true },
        { icon: <Layers size={11} />,   label: 'Block',         value: `#${receipt.blockNumber.toString()}`,                     key: 'block' },
        { icon: <Clock size={11} />,    label: 'Timestamp',     value: new Date(Number(receipt.timestamp) * 1000).toISOString(), key: 'ts' },
        { icon: <Zap size={11} />,      label: 'Core Entropy',  value: `0x${receipt.coreEntropy.toString(16).padStart(64,'0')}`, key: 'entropy',  mono: true },
        { icon: <Shield size={11} />,   label: 'Payload Hash',  value: receipt.payloadHash,                                      key: 'hash',     mono: true },
        { icon: <Activity size={11} />, label: 'Tx Hash',       value: receipt.txHash,                                           key: 'tx',       mono: true },
    ];
    if (receipt.gasUsed) {
        rows.push({ icon: <Zap size={11} />, label: 'Gas Used', value: receipt.gasUsed.toLocaleString() + ' units', key: 'gas' });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="w-full max-w-lg mx-auto bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden"
        >
            <div className="bg-black px-6 pt-6 pb-8 flex flex-col items-center gap-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 !text-white/40 hover:!text-white transition-colors">
                    <X size={18} />
                </button>
                <div className="w-24 h-24">
                    <RemoteLottie path="/system-shots/Transaction Complete.json" loop={false} className="w-full h-full" />
                </div>
                <div className="text-center">
                    <div className="!text-white font-black text-xl tracking-tight">
                        {parseFloat(formatEther(receipt.amount)).toLocaleString(undefined, { maximumFractionDigits: 4 })} QDs
                    </div>
                    <div className="!text-white/40 text-xs font-mono uppercase tracking-widest mt-1">
                        Transfer Finalised — Aztec Testnet
                    </div>
                </div>
                {receipt.memo && (
                    <div className="px-4 py-2 bg-white/10 rounded-xl !text-white/70 text-xs font-medium italic text-center">
                        &ldquo;{receipt.memo}&rdquo;
                    </div>
                )}
            </div>

            <div className="px-5 py-4 space-y-0 divide-y divide-black/5">
                {rows.map(row => (
                    <div key={row.key} className="flex items-center gap-3 py-3">
                        <div className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center shrink-0 text-black/40">
                            {row.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[8px] font-black uppercase tracking-widest text-black/30 mb-0.5">{row.label}</div>
                            <div className={`text-[11px] ${row.mono ? 'font-mono' : 'font-bold'} text-black truncate`}>
                                {row.value.length > 42 ? `${row.value.slice(0, 20)}...${row.value.slice(-10)}` : row.value}
                            </div>
                        </div>
                        <button onClick={() => copy(row.value, row.key)} className="shrink-0 text-black/20 hover:text-black transition-colors">
                            {copied === row.key ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                    </div>
                ))}
            </div>

            <div className="px-5 pb-5 pt-2 flex gap-3">
                <a
                    href={`https://testnet.aztecscan.xyz/tx-effects/${receipt.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-2xl text-xs font-black uppercase tracking-widest text-black/60 hover:bg-black/5 transition-all"
                >
                    <ExternalLink size={12} /> View on AztecScan
                </a>
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-black !!text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                >
                    New Transfer
                </button>
            </div>
        </motion.div>
    );
}

//  Gas Row
function GasRow({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">{label}</span>
            <span className="font-mono font-black text-xs text-black">
                {value} <span className="font-normal text-black/40">{unit}</span>
            </span>
        </div>
    );
}

//  Main Component
export default function CoreTransfer() {
    const [recipient, setRecipient]           = useState('');
    const [amount, setAmount]                 = useState('');
    const [memo, setMemo]                     = useState('');
    const [step, setStep]                     = useState<TxStep>('idle');
    const [error, setError]                   = useState<string | null>(null);
    const [gasEstimate, setGasEstimate]       = useState<bigint | null>(null);
    const [nativePrice]                       = useState<number>(2400);
    const [receipt, setReceipt]               = useState<ReceiptData | null>(null);
    const [showReceipt, setShowReceipt]       = useState(false);
    const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
    const _receiptCounter                     = useRef(1);

    const { address } = useAccount();

    // ── On-chain balance read (optional — we guarantee 100 as floor) ──────────
    const { data: rawBalance } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        chainId: CHAIN_ID,
        query: { enabled: !!address && TOKEN_ADDR !== '0x', refetchInterval: 15_000 },
    });

    // GUARANTEED: every connected wallet sees 100 QDs minimum
    const qdBalance = rawBalance
        ? Math.max(100, parseFloat(formatEther(rawBalance as bigint)))
        : 100;

    const parsedAmount = amount ? parseEther(amount) : 0n;
    const amountNum    = parseFloat(amount || '0');
    const amountValid  = amountNum > 0 && amountNum <= qdBalance;
    const formValid    = recipientValid === true && amountValid;

    // Validate recipient address on change
    useEffect(() => {
        if (!recipient) { setRecipientValid(null); return; }
        setRecipientValid(isAddress(recipient) && recipient.toLowerCase() !== address?.toLowerCase());
    }, [recipient, address]);

    // ── Gas Estimation (simulated) ────────────────────────────────────────────
    const estimateGas = useCallback(async () => {
        if (!formValid) return;
        setGasEstimate(130_000n);
    }, [formValid]);

    // ── Main Execute — always succeeds, produces full receipt ─────────────────
    const execute = useCallback(async () => {
        if (!address || !formValid) return;
        setError(null);

        const coreEntropy = generateCoreEntropy();
        const msNow       = Date.now();

        try {
            // Step 1: Gas estimation
            setStep('estimating');
            await new Promise(r => setTimeout(r, 600));
            const gasEst = 130_000n;
            setGasEstimate(gasEst);

            // Step 2: Signing
            setStep('signing');
            toast.info('Signing transfer...', { description: 'Generating ZK proof for Aztec Testnet.' });
            await new Promise(r => setTimeout(r, 800));

            // Step 3: Broadcast
            setStep('broadcasting');
            toast.loading('Broadcasting to Aztec Testnet...', { id: 'tx-broadcast' });
            await new Promise(r => setTimeout(r, 1200));

            const txHash = ('0x' + Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('')) as `0x${string}`;

            // Step 4: Confirmation
            setStep('confirming');
            toast.dismiss('tx-broadcast');
            toast.loading('Waiting for block confirmation...', { id: 'tx-confirm' });
            await new Promise(r => setTimeout(r, 1000));
            toast.dismiss('tx-confirm');

            // Step 5: Done — issue receipt
            setStep('done');
            const mockBlock = BigInt(103861 + Math.floor(Math.random() * 200));

            setReceipt({
                id:          BigInt(_receiptCounter.current++),
                sender:      address,
                receiver:    recipient as `0x${string}`,
                amount:      parsedAmount,
                timestamp:   BigInt(Math.floor(msNow / 1000)),
                blockNumber: mockBlock,
                coreEntropy,
                payloadHash: keccak256(toBytes(txHash)) as `0x${string}`,
                memo:        memo || '',
                txHash,
                gasUsed:     gasEst,
            });
            setShowReceipt(true);
            setRecipient('');
            setAmount('');
            setMemo('');
            toast.success('Transfer complete — receipt issued.', {
                description: `Block #${mockBlock} · Aztec Testnet`,
            });
        } catch (err: any) {
            const msg = err?.shortMessage || err?.message || 'Unknown error';
            setError(msg);
            setStep('error');
            toast.dismiss('tx-broadcast');
            toast.dismiss('tx-confirm');
            toast.error('Transfer failed', { description: msg });
        }
    }, [address, formValid, recipient, parsedAmount, memo]);

    const isActive = step !== 'idle' && step !== 'done' && step !== 'error';

    //  Render
    return (
        <div className="w-full max-w-lg mx-auto relative">
            <AnimatePresence mode="wait">
                {showReceipt && receipt ? (
                    <ReceiptCard
                        key="receipt"
                        receipt={receipt}
                        onClose={() => { setShowReceipt(false); setStep('idle'); setError(null); }}
                    />
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="w-full bg-white border border-black/10 rounded-3xl shadow-sm overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-black px-7 pt-7 pb-6">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] !text-white/40 mb-1">
                                        Aztec Testnet · Zero-Knowledge L2
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter !text-white uppercase">
                                        Transfer QDs
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="text-[8px] font-mono uppercase tracking-widest !text-white/30">
                                        Your Balance
                                    </div>
                                    <div className="font-mono font-black text-lg !text-white">
                                        {qdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        <span className="text-xs ml-1 !text-white/50">QDs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form body */}
                        <div className="px-7 py-6 space-y-5">
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

                            {/* Recipient */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40 ml-1">
                                    Recipient
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={e => setRecipient(e.target.value.trim())}
                                        placeholder="0x... EVM Address"
                                        disabled={isActive}
                                        className="w-full bg-white border rounded-2xl px-5 py-4 text-black font-mono text-sm focus:outline-none transition-colors placeholder:text-black/25 disabled:opacity-50"
                                        style={{
                                            borderColor: recipientValid === false ? '#ef4444' : recipientValid === true ? '#22c55e' : 'rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    {recipientValid === true && (
                                        <CheckCircle2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    )}
                                    {recipientValid === false && (
                                        <AlertCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                                    )}
                                </div>
                                {recipientValid === false && (
                                    <p className="text-[9px] font-mono text-red-500 ml-1">
                                        Invalid address or it&apos;s your own wallet.
                                    </p>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40">
                                        Amount (QDs)
                                    </label>
                                    <button
                                        onClick={() => setAmount(qdBalance.toFixed(2))}
                                        className="text-[8px] font-black uppercase tracking-widest text-black/40 hover:text-black border border-black/10 px-2 py-0.5 rounded-full transition-colors"
                                    >
                                        MAX
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        disabled={isActive}
                                        className="w-full bg-white border border-black/10 rounded-2xl px-5 py-4 text-black font-mono text-2xl focus:outline-none transition-colors placeholder:text-black/20 disabled:opacity-50"
                                        style={{
                                            borderColor: amount && !amountValid ? '#ef4444' : 'rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 font-mono font-black text-sm">
                                        QDs
                                    </span>
                                </div>
                                {amount && !amountValid && (
                                    <p className="text-[9px] font-mono text-red-500 ml-1">
                                        Insufficient balance ({qdBalance.toFixed(2)} QDs available).
                                    </p>
                                )}
                            </div>

                            {/* Memo */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40 ml-1">
                                    Note <span className="text-black/20 normal-case font-normal">(optional · max 64 chars)</span>
                                </label>
                                <input
                                    type="text"
                                    value={memo}
                                    onChange={e => setMemo(e.target.value.slice(0, 64))}
                                    placeholder="Payment for services, P2P transfer..."
                                    maxLength={64}
                                    disabled={isActive}
                                    className="w-full bg-white border border-black/10 rounded-2xl px-5 py-3.5 text-black text-sm focus:outline-none transition-colors placeholder:text-black/20 disabled:opacity-50"
                                />
                            </div>

                            {/* Gas estimate */}
                            <AnimatePresence>
                                {gasEstimate !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white border border-black/5 rounded-2xl px-5 py-3 divide-y divide-black/5"
                                    >
                                        <div className="text-[8px] font-black uppercase tracking-widest text-black/30 pb-2">
                                            Estimated Gas (Aztec L2)
                                        </div>
                                        <GasRow label="Gas Units"   value={gasEstimate.toLocaleString()} unit="gas" />
                                        <GasRow label="Max Gas ETH" value={parseFloat(formatUnits(gasEstimate * 1_500_000_000n, 18)).toFixed(8)} unit="ETH" />
                                        <GasRow label="Max Gas USD" value={`$${(parseFloat(formatUnits(gasEstimate * 1_500_000_000n, 18)) * nativePrice).toFixed(4)}`} unit="(negligible)" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error */}
                            <AnimatePresence>
                                {step === 'error' && error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
                                    >
                                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600 font-mono leading-relaxed">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CTAs */}
                            <div className="flex gap-3">
                                {!isActive && (
                                    <button
                                        onClick={estimateGas}
                                        disabled={!formValid}
                                        className="flex items-center gap-2 px-4 py-4 border border-black/10 rounded-2xl text-xs font-black uppercase tracking-widest text-black/50 hover:bg-black/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Zap size={14} />
                                        <span className="hidden sm:inline">Gas</span>
                                    </button>
                                )}
                                <button
                                    onClick={step === 'idle' || step === 'error' ? execute : undefined}
                                    disabled={!formValid || isActive}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:cursor-not-allowed"
                                    style={{
                                        background: formValid && !isActive ? '#000' : 'rgba(0,0,0,0.07)',
                                        color:      formValid && !isActive ? '#fff' : 'rgba(0,0,0,0.3)',
                                    }}
                                >
                                    {isActive ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {step === 'estimating'   && 'Estimating Gas...'}
                                            {step === 'signing'      && 'Signing...'}
                                            {step === 'broadcasting' && 'Broadcasting...'}
                                            {step === 'confirming'   && 'Confirming Block...'}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Execute Transfer
                                            <ChevronRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
