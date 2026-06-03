"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    useWriteContract, useAccount, useSignTypedData,
    useReadContract, usePublicClient, useEstimateGas,
    useBalance,
} from 'wagmi';
import {
    parseAbi, parseEther, formatEther, formatUnits, isAddress,
    encodeAbiParameters, parseAbiParameters, keccak256, toBytes,
    type TransactionReceipt,
} from 'viem';
import {
    ArrowRight, CheckCircle2, Loader2, AlertCircle, Copy,
    Zap, Shield, Hash, Clock, Layers, Lock, Send, X,
    ChevronRight, ExternalLink, Activity, RefreshCw,
} from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

//  ABI 
const LEDGER_ABI = parseAbi([
    'function transferWithReceiptPermit(address to, uint256 amount, string calldata memo, uint256 deadline, uint8 v, bytes32 r, bytes32 s, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
    'function transferWithReceipt(address to, uint256 amount, string calldata memo, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
    'function getUserReceiptCount(address user) view returns (uint256)',
    'function totalReceipts() view returns (uint256)',
    'function getReceipt(uint256 receiptId) view returns ((uint256 id, address sender, address receiver, uint256 amount, uint256 timestamp, uint256 blockNumber, uint256 coreEntropy, bytes advancedMetadata, bytes32 payloadHash, string memo))',
]);

const QDS_ABI = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function nonces(address) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
]);

//  Constants 
const CHAIN_ID   = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
const TOKEN_ADDR = (process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const LEDGER_ADDR = (process.env.NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const BLOCK_EXPLORER = CHAIN_ID === 137 ? 'https://polygonscan.com' : 'https://basescan.org';

//  Types 
type TxStep = 'idle' | 'validating' | 'estimating' | 'signing' | 'broadcasting' | 'confirming' | 'done' | 'error';

interface ReceiptData {
    id:              bigint;
    sender:          `0x${string}`;
    receiver:        `0x${string}`;
    amount:          bigint;
    timestamp:       bigint;
    blockNumber:     bigint;
    coreEntropy:  bigint;
    payloadHash:     `0x${string}`;
    memo:            string;
    txHash:          `0x${string}`;
    gasUsed?:        bigint;
}

//  Utils 
function shortAddr(a: string) {
    return a ? `${a.slice(0, 8)}...${a.slice(-6)}` : '';
}

function generateCoreEntropy(): bigint {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    const hex = '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    return BigInt(hex);
}

function buildAdvancedMetadata(msTimestamp: number, routeId: string): `0x${string}` {
    try {
        return encodeAbiParameters(
            parseAbiParameters('string platform, uint64 msTimestamp, bytes32 routeId'),
            [
                'CoreLedger/v2',
                BigInt(msTimestamp),
                keccak256(toBytes(routeId)) as `0x${string}`,
            ]
        );
    } catch {
        return '0x';
    }
}

//  Step Indicator 
const STEPS: { key: TxStep; label: string }[] = [
    { key: 'estimating', label: 'Gas Est.' },
    { key: 'signing',    label: 'Sign' },
    { key: 'broadcasting', label: 'Broadcast' },
    { key: 'confirming', label: 'Confirm' },
    { key: 'done',       label: 'Finalised' },
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
                                    <CheckCircle2 size={14} className="text-white" />
                                ) : current ? (
                                    <Loader2 size={12} className="text-white animate-spin" />
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
        {
            icon: <Hash size={11} />,
            label: 'Receipt ID',
            value: `#${receipt.id.toString()}`,
            key: 'id',
        },
        {
            icon: <Send size={11} />,
            label: 'From',
            value: receipt.sender,
            key: 'sender',
            mono: true,
        },
        {
            icon: <ArrowRight size={11} />,
            label: 'To',
            value: receipt.receiver,
            key: 'receiver',
            mono: true,
        },
        {
            icon: <Layers size={11} />,
            label: 'Block',
            value: `#${receipt.blockNumber.toString()}`,
            key: 'block',
        },
        {
            icon: <Clock size={11} />,
            label: 'Timestamp',
            value: new Date(Number(receipt.timestamp) * 1000).toISOString(),
            key: 'ts',
        },
        {
            icon: <Zap size={11} />,
            label: 'Core Entropy',
            value: `0x${receipt.coreEntropy.toString(16).padStart(64, '0')}`,
            key: 'entropy',
            mono: true,
        },
        {
            icon: <Shield size={11} />,
            label: 'Payload Hash',
            value: receipt.payloadHash,
            key: 'hash',
            mono: true,
        },
        {
            icon: <Activity size={11} />,
            label: 'Tx Hash',
            value: receipt.txHash,
            key: 'tx',
            mono: true,
        },
    ];
    if (receipt.gasUsed) {
        rows.push({
            icon: <Zap size={11} />,
            label: 'Gas Used',
            value: receipt.gasUsed.toLocaleString() + ' units',
            key: 'gas',
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="w-full max-w-lg mx-auto bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-black px-6 pt-6 pb-8 flex flex-col items-center gap-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                {/* Transaction Complete Lottie */}
                <div className="w-24 h-24">
                    <RemoteLottie
                        path="/system-shots/Transaction Complete.json"
                        loop={false}
                        className="w-full h-full"
                    />
                </div>

                <div className="text-center">
                    <div className="text-white font-black text-xl tracking-tight">
                        {parseFloat(formatEther(receipt.amount)).toLocaleString(undefined, { maximumFractionDigits: 4 })} QDs
                    </div>
                    <div className="text-white/40 text-xs font-mono uppercase tracking-widest mt-1">
                        Transfer Finalised On-Chain
                    </div>
                </div>

                {receipt.memo && (
                    <div className="px-4 py-2 bg-white/10 rounded-xl text-white/70 text-xs font-medium italic text-center">
                        "{receipt.memo}"
                    </div>
                )}
            </div>

            {/* Metadata rows */}
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
                        <button
                            onClick={() => copy(row.value, row.key)}
                            className="shrink-0 text-black/20 hover:text-black transition-colors"
                        >
                            {copied === row.key ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer actions */}
            <div className="px-5 pb-5 pt-2 flex gap-3">
                <a
                    href={`${BLOCK_EXPLORER}/tx/${receipt.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-black/10 rounded-2xl text-xs font-black uppercase tracking-widest text-black/60 hover:bg-black/5 transition-all"
                >
                    <ExternalLink size={12} /> View on Explorer
                </a>
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                >
                    New Transfer
                </button>
            </div>
        </motion.div>
    );
}

//  Gas Estimator Row 
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
    const [recipient, setRecipient]         = useState('');
    const [amount, setAmount]               = useState('');
    const [memo, setMemo]                   = useState('');
    const [step, setStep]                   = useState<TxStep>('idle');
    const [error, setError]                 = useState<string | null>(null);
    const [gasEstimate, setGasEstimate]     = useState<bigint | null>(null);
    const [nativePrice, setNativePrice]     = useState<number>(2400); // ETH/MATIC price for display
    const [receipt, setReceipt]             = useState<ReceiptData | null>(null);
    const [showReceipt, setShowReceipt]     = useState(false);
    const [recipientValid, setRecipientValid] = useState<boolean | null>(null);

    const { address }       = useAccount();
    const publicClient      = usePublicClient();
    const { writeContractAsync }  = useWriteContract();
    const { signTypedDataAsync }  = useSignTypedData();

    //  On-Chain Reads 
    const { data: rawBalance, refetch: refetchBalance } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        chainId: CHAIN_ID,
        query: { enabled: !!address, refetchInterval: 15_000 },
    });

    const { data: nonce, refetch: refetchNonce } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'nonces',
        args: [address as `0x${string}`],
        chainId: CHAIN_ID,
        query: { enabled: !!address },
    });

    const { data: allowanceRaw } = useReadContract({
        address: TOKEN_ADDR,
        abi: QDS_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, LEDGER_ADDR],
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

    //  Derived values 
    const qdBalance    = rawBalance ? parseFloat(formatEther(rawBalance as bigint)) : 0;
    const allowance    = allowanceRaw ? (allowanceRaw as bigint) : 0n;
    const parsedAmount = amount ? parseEther(amount) : 0n;
    const hasSufficientAllowance = allowance >= parsedAmount && parsedAmount > 0n;

    const amountNum     = parseFloat(amount || '0');
    const amountValid   = amountNum > 0 && amountNum <= qdBalance;
    const formValid     = recipientValid === true && amountValid;

    // Validate recipient on change
    useEffect(() => {
        if (!recipient) { setRecipientValid(null); return; }
        setRecipientValid(isAddress(recipient) && recipient.toLowerCase() !== address?.toLowerCase());
    }, [recipient, address]);

    // Fetch native price for gas USD display
    useEffect(() => {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd')
            .then(r => r.json())
            .then(d => {
                const price = CHAIN_ID === 137 ? d['matic-network']?.usd : d['ethereum']?.usd;
                if (price) setNativePrice(price);
            })
            .catch(() => {});
    }, []);

    //  Gas Estimation 
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
            }).catch(() => 120_000n); // Fallback estimate
            setGasEstimate(gas);
        } catch {
            setGasEstimate(120_000n);
        }
    }, [publicClient, address, formValid, recipient, parsedAmount, memo]);

    //  Main Execute 
    const execute = useCallback(async () => {
        if (!address || !formValid || !publicClient) return;
        setError(null);

        const coreEntropy = generateCoreEntropy();
        const msNow          = Date.now();
        const routeId        = `${address}->${recipient}@${msNow}`;
        const advancedMetadata = buildAdvancedMetadata(msNow, routeId);
        const deadline       = BigInt(Math.floor(msNow / 1000) + 3600);

        try {
            //  Step 1: Gas Estimation 
            setStep('estimating');
            const gasEst = await publicClient.estimateContractGas({
                address: LEDGER_ADDR,
                abi: LEDGER_ABI,
                functionName: 'transferWithReceipt',
                args: [recipient as `0x${string}`, parsedAmount, memo || '', coreEntropy, advancedMetadata],
                account: address,
            }).catch(() => 130_000n);
            setGasEstimate(gasEst);

            //  Step 2: Sign ERC-2612 Permit 
            setStep('signing');
            toast.info('Cryptographic signature requested...', { description: 'Authorize ERC-2612 Permit in your wallet.' });

            const { data: latestNonce } = await refetchNonce();
            const currentNonce = (latestNonce as bigint) ?? 0n;

            let txHash: `0x${string}`;

            try {
                const sig = await signTypedDataAsync({
                    domain: {
                        name:             'CoreDots',
                        version:          '1',
                        chainId:          CHAIN_ID,
                        verifyingContract: TOKEN_ADDR,
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
                    message: {
                        owner:    address,
                        spender:  LEDGER_ADDR,
                        value:    parsedAmount,
                        nonce:    currentNonce,
                        deadline,
                    },
                });

                const r = sig.slice(0, 66) as `0x${string}`;
                const s = `0x${sig.slice(66, 130)}` as `0x${string}`;
                const v = Number(`0x${sig.slice(130, 132)}`);

                //  Step 3: Broadcast 
                setStep('broadcasting');
                toast.loading('Injecting core entropy into the blockchain...', { id: 'tx-broadcast' });

                txHash = await writeContractAsync({
                    address:      LEDGER_ADDR,
                    abi:          LEDGER_ABI,
                    functionName: 'transferWithReceiptPermit',
                    args:         [
                        recipient as `0x${string}`,
                        parsedAmount,
                        memo || '',
                        deadline,
                        v,
                        r,
                        s,
                        coreEntropy,
                        advancedMetadata,
                    ],
                    gas: gasEst + (gasEst / 5n), // +20% buffer
                });
            } catch (permitErr: any) {
                // Fallback: use existing allowance path
                if (!hasSufficientAllowance) throw new Error('Insufficient allowance and Permit rejected.');
                setStep('broadcasting');
                toast.loading('Broadcast on-chain...', { id: 'tx-broadcast' });
                txHash = await writeContractAsync({
                    address:      LEDGER_ADDR,
                    abi:          LEDGER_ABI,
                    functionName: 'transferWithReceipt',
                    args:         [
                        recipient as `0x${string}`,
                        parsedAmount,
                        memo || '',
                        coreEntropy,
                        advancedMetadata,
                    ],
                    gas: gasEst + (gasEst / 5n),
                });
            }

            //  Step 4: Wait for confirmation 
            setStep('confirming');
            toast.dismiss('tx-broadcast');
            toast.loading('Waiting for block confirmation...', { id: 'tx-confirm' });

            let txReceipt: TransactionReceipt | null = null;
            if (publicClient) {
                txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
            }
            toast.dismiss('tx-confirm');

            //  Step 5: Done 
            setStep('done');
            await refetchBalance();

            setReceipt({
                id:             BigInt(_receiptCounter.current++),
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
            });
            setShowReceipt(true);
            setRecipient('');
            setAmount('');
            setMemo('');
            toast.success('Immutable transfer completed.', { description: `On-Chain receipt minted in CoreLedger.` });
        } catch (err: any) {
            console.error('CoreTransfer error:', err);
            const msg = err?.shortMessage || err?.message || 'Unknown error';
            setError(msg);
            setStep('error');
            toast.dismiss('tx-broadcast');
            toast.dismiss('tx-confirm');
            toast.error('Operation rejected', { description: msg });
        }
    }, [
        address, formValid, publicClient, recipient, parsedAmount, memo,
        refetchNonce, signTypedDataAsync, writeContractAsync, refetchBalance,
        hasSufficientAllowance,
    ]);

    // Counter for receipt ID display (local optimistic)
    const _receiptCounter = useRef(0);
    useEffect(() => {
        if (totalReceiptsRaw) _receiptCounter.current = Number(totalReceiptsRaw as bigint) + 1;
    }, [totalReceiptsRaw]);

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
                        {/*  Header  */}
                        <div className="bg-black px-7 pt-7 pb-6">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                                        CoreLedger v2 · {CHAIN_ID === 137 ? 'Polygon' : 'Base'}
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
                                        Transfer QDs
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="text-[8px] font-mono uppercase tracking-widest text-white/30">
                                        Your Balance
                                    </div>
                                    <div className="font-mono font-black text-lg text-white">
                                        {qdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        <span className="text-xs ml-1 text-white/50">QDs</span>
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/*  Form body  */}
                        <div className="px-7 py-6 space-y-5">
                            {/* Step bar  shown while active */}
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
                                        placeholder="0x...   EVM Address"
                                        disabled={isActive}
                                        className="w-full bg-[#FFFFFF] border rounded-2xl px-5 py-4 text-black font-mono text-sm focus:outline-none transition-colors placeholder:text-black/25 disabled:opacity-50"
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
                                        Invalid address or it's your own wallet.
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
                                        onClick={() => setAmount(qdBalance.toFixed(6))}
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
                                        step="0.000001"
                                        disabled={isActive}
                                        className="w-full bg-[#FFFFFF] border border-black/10 rounded-2xl px-5 py-4 text-black font-mono text-2xl focus:outline-none transition-colors placeholder:text-black/20 disabled:opacity-50"
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
                                        Insufficient balance ({qdBalance.toFixed(4)} QDs available).
                                    </p>
                                )}
                            </div>

                            {/* Memo */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40 ml-1">
                                    Public Note <span className="text-black/20 normal-case font-normal">(optional · max 64 chars)</span>
                                </label>
                                <input
                                    type="text"
                                    value={memo}
                                    onChange={e => setMemo(e.target.value.slice(0, 64))}
                                    placeholder="Asset purchase, P2P payment..."
                                    maxLength={64}
                                    disabled={isActive}
                                    className="w-full bg-[#FFFFFF] border border-black/10 rounded-2xl px-5 py-3.5 text-black text-sm focus:outline-none transition-colors placeholder:text-black/20 disabled:opacity-50"
                                />
                            </div>

                            {/* Gas estimate panel */}
                            <AnimatePresence>
                                {gasEstimate !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-[#FFFFFF] border border-black/5 rounded-2xl px-5 py-3 divide-y divide-black/5"
                                    >
                                        <div className="text-[8px] font-black uppercase tracking-widest text-black/30 pb-2">
                                            Estimated Gas (L2)
                                        </div>
                                        <GasRow
                                            label="Gas Units"
                                            value={gasEstimate.toLocaleString()}
                                            unit="gas"
                                        />
                                        <GasRow
                                            label="Max Gas ETH"
                                            value={parseFloat(formatUnits(gasEstimate * 1_500_000_000n, 18)).toFixed(8)}
                                            unit={CHAIN_ID === 137 ? 'MATIC' : 'ETH'}
                                        />
                                        <GasRow
                                            label="Max Gas USD"
                                            value={` $${(parseFloat(formatUnits(gasEstimate * 1_500_000_000n, 18)) * nativePrice).toFixed(4)}`}
                                            unit="(negligible)"
                                        />
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

                            {/* CTA buttons */}
                            <div className="flex gap-3">
                                {/* Estimate Gas */}
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

                                {/* Execute */}
                                <button
                                    onClick={step === 'idle' || step === 'error' ? execute : undefined}
                                    disabled={!formValid || isActive}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:cursor-not-allowed"
                                    style={{
                                        background: formValid && !isActive ? '#000' : 'rgba(0,0,0,0.07)',
                                        color: formValid && !isActive ? '#fff' : 'rgba(0,0,0,0.3)',
                                    }}
                                >
                                    {isActive ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {step === 'estimating'  && 'Estimating Gas...'}
                                            {step === 'signing'     && 'Awaiting Signature...'}
                                            {step === 'broadcasting' && 'Broadcasting...'}
                                            {step === 'confirming'  && 'Confirming Block...'}
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

                            {/* Network stats footer */}
                            {totalReceiptsRaw !== undefined && (
                                <div className="flex items-center justify-between pt-1">
                                    <div className="text-[8px] font-mono text-black/25 uppercase tracking-widest">
                                        CoreLedger Global Receipts
                                    </div>
                                    <div className="font-mono font-black text-[10px] text-black/40">
                                        #{(totalReceiptsRaw as bigint).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
