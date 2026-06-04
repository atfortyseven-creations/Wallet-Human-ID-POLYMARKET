"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleHeader } from '../dashboard/ModuleHeader';
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';

interface RealTransaction {
    id: string;
    hash: string;
    valueEth: number;
    gasPriceGwei: number;
    timestamp: number;
    from: string;
    to: string;
    time: string;
    nonce: number;
    gasLimit: number;
}

interface RealBlock {
    id: number;
    hash: string;
    status: 'MINED' | 'CONFIRMED';
    totalFee: number;
    gasUsedPct: number;
    miner: string;
    sizeKb: string;
    age: string;
    txCount: number;
}

export default function AztecMempoolSpace() {
    const wagmiClient = usePublicClient();
    const { data: wagmiBlock } = useBlockNumber({ watch: true });

    const [fallbackClient, setFallbackClient] = useState<any>(null);
    const [fallbackBlock, setFallbackBlock] = useState<bigint | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!wagmiClient) {
            import('viem').then(({ createPublicClient, http }) => {
                const client = createPublicClient({
                    chain: { id: 1, name: 'Ethereum', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: ['https://eth.llamarpc.com'] }, public: { http: ['https://eth.llamarpc.com'] } } } as any,
                    transport: http()
                });
                setFallbackClient(client);
                client.getBlockNumber().then(setFallbackBlock);
                interval = setInterval(() => {
                    client.getBlockNumber().then(setFallbackBlock).catch(() => {});
                }, 12000);
            });
        }
        return () => clearInterval(interval);
    }, [wagmiClient]);

    const publicClient = wagmiClient || fallbackClient;
    const blockNumber = wagmiBlock || fallbackBlock;

    const [transactions, setTransactions] = useState<RealTransaction[]>([]);
    const [blocks, setBlocks] = useState<RealBlock[]>([]);
    const [globalStats, setGlobalStats] = useState({
        tps: 0,
        avgGasPrice: 0,
        totalEthMoved: 0,
        blocksTracked: 0
    });

    const [selectedBlock, setSelectedBlock] = useState<RealBlock | null>(null);
    const [selectedTx, setSelectedTx] = useState<RealTransaction | null>(null);

    //  Real Data Extraction (L1 Mainnet) 
    useEffect(() => {
        if (!publicClient || !blockNumber) return;

        const syncState = async () => {
            try {
                const block = await publicClient.getBlock({
                    blockNumber: blockNumber,
                    includeTransactions: true
                });

                const rawTxs = block.transactions as any[];
                
                const totalFeeEther = Number(formatEther(block.baseFeePerGas || 0n)) * rawTxs.length * 21000;
                const fillPercent = block.gasLimit > 0 ? (Number(block.gasUsed) / Number(block.gasLimit)) * 100 : 0;

                const newBlock: RealBlock = {
                    id: Number(block.number),
                    hash: block.hash,
                    status: 'CONFIRMED',
                    totalFee: totalFeeEther > 0 ? totalFeeEther : 0.054,
                    gasUsedPct: fillPercent,
                    miner: block.miner ? (block.miner.substring(0,6) + '...' + block.miner.substring(38)) : '0xUnknown',
                    sizeKb: (Number(block.size) / 1024).toFixed(2) + ' KB',
                    age: new Date(Number(block.timestamp) * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    txCount: rawTxs.length
                };

                setBlocks(prev => {
                    const exists = prev.find(p => p.id === newBlock.id);
                    if (exists) return prev;
                    return [newBlock, ...prev].slice(0, 4);
                });

                const highValueTxs = rawTxs
                    .filter((t: any) => t.value && t.value > 0n)
                    .sort((a,b) => (a.value < b.value ? 1 : -1))
                    .slice(0, 8); // top 8 transfers

                let ethSum = 0;

                if (highValueTxs.length > 0) {
                    const mappedTxs: RealTransaction[] = highValueTxs.map(t => {
                        const val = Number(formatEther(t.value));
                        ethSum += val;
                        return {
                            id: t.hash,
                            hash: t.hash,
                            valueEth: val,
                            gasPriceGwei: Number((t.gasPrice || t.maxFeePerGas || 0n)) / 1e9,
                            timestamp: Date.now(),
                            from: t.from,
                            to: t.to || 'Contract Creation',
                            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            nonce: Number(t.nonce),
                            gasLimit: Number(t.gas)
                        };
                    });
                    
                    setTransactions(prev => {
                        const merged = [...mappedTxs, ...prev];
                        // Deduplicate
                        const unique = Array.from(new Map(merged.map(item => [item.hash, item])).values());
                        return unique.slice(0, 20); // keep last 20 whale txs
                    });
                }

                setGlobalStats(prev => ({
                    tps: rawTxs.length / 12,
                    avgGasPrice: Number(block.baseFeePerGas || 0n) / 1e9,
                    totalEthMoved: prev.totalEthMoved + ethSum,
                    blocksTracked: prev.blocksTracked + 1
                }));

            } catch (error) {
                console.error("L1 Sync Error:", error);
            }
        };

        syncState();
    }, [blockNumber, publicClient]);

    return (
        <div className="absolute inset-0 flex flex-col bg-[#FFFFFF]  text-[#050505]  font-sans overflow-hidden">
            <div className="shrink-0 pt-4 px-2 bg-white ">
                <ModuleHeader moduleId="markets" />
            </div>
            <div className="flex items-center justify-center px-8 pb-8 border-b border-[#E5E5E5]  bg-white  shrink-0 -mt-8">


                <div className="flex items-center justify-center gap-8 w-full max-w-4xl">
                    {[
                        { label: 'Network TPS', val: globalStats.tps, unit: 'tx/s', isNum: true, format: (v: number) => v.toFixed(2) },
                        { label: 'Avg Base Fee', val: globalStats.avgGasPrice, unit: 'GWEI', isNum: true, format: (v: number) => v.toFixed(2) },
                        { label: 'Blocks Tracked', val: globalStats.blocksTracked, unit: 'blk', isNum: true },
                        { label: 'Vol (Session)', val: globalStats.totalEthMoved, unit: 'ETH', isNum: true, format: (v: number) => `${v.toFixed(1)} ETH` },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#888888]  mb-1.5">{stat.label}</span>
                            <div className="flex items-end gap-1">
                                <AnimatedCounter 
                                    value={stat.val}
                                    format={stat.format ? stat.format : (v) => Math.floor(v).toString()}
                                    className="text-2xl font-bold font-mono tracking-tighter text-[#050505]  leading-none"
                                />
                                <span className="text-[9px] text-[#A0A0A0]  font-bold uppercase mb-[2px]">{stat.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-2/3 p-8 flex flex-col border-r border-[#E5E5E5]  bg-[#FFFFFF]  relative">
                    <div className="flex items-center gap-3 mb-8 shrink-0">
                        <div className="px-4 py-1.5 rounded-lg border border-emerald-500/20 text-[9px] font-black text-emerald-600  uppercase tracking-widest bg-emerald-50 ">
                            LIVE: ETHEREUM MAINNET
                        </div>
                        <h3 className="text-sm font-black text-[#050505]  uppercase tracking-[0.2em]">Latest Network Blocks</h3>
                    </div>

                    <div className="absolute bottom-12 left-8 right-8 flex items-end justify-end gap-6 overflow-visible">
                        {blocks.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-[10px] font-mono font-bold text-[#888888]  uppercase tracking-[0.2em] animate-pulse">Syncing Ethereum L1 State...</div>
                            </div>
                        )}
                        <AnimatePresence mode="popLayout">
                            {blocks.map((block) => {
                                return (
                                    <motion.button
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, x: 50, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSelectedBlock(block)}
                                        className={`shrink-0 w-64 h-80 bg-white  border-2 border-[#388E3C] rounded-xl flex flex-col overflow-hidden relative shadow-md hover:shadow-xl  transition-shadow text-left`}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 1] }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="absolute inset-0 bg-[#E8F5E9]  z-0 pointer-events-none"
                                        />

                                        <div className="p-4 border-b border-[#E5E5E5]  relative z-10 bg-white/95  backdrop-blur-sm shadow-sm w-full">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black text-[#888888]  uppercase tracking-widest">Block #{block.id}</span>
                                                <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest bg-[#E8F5E9] text-[#388E3C] `}>
                                                    {block.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-2xl font-black font-mono text-[#050505]  tracking-tighter">{block.txCount}</span>
                                                    <span className="text-[10px] text-[#888888]  ml-1 font-bold">TXS</span>
                                                </div>
                                                <span className="text-[11px] font-mono font-black text-[#388E3C]">{Math.floor(block.gasUsedPct)}% GAS</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-4 relative z-10 grid grid-cols-6 gap-2 content-start overflow-hidden w-full">
                                            {Array.from({ length: Math.min(block.txCount > 0 ? 50 : 0, 50) }).map((_, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.005 }}
                                                    className={`w-full aspect-square rounded-[3px] border bg-[#E8F5E9] border-[#C8E6C9]  `}
                                                />
                                            ))}
                                        </div>
                                        
                                        <div className={`p-3 text-center border-t border-[#E5E5E5]  relative z-10 w-full bg-[#FAFAFA] `}>
                                            <p className={`text-[9px] uppercase tracking-widest font-black text-[#388E3C]`}>
                                                Verified on L1
                                            </p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-1/3 p-8 flex flex-col bg-white ">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E5E5] ">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-[#050505]  uppercase tracking-widest">WHALE TRANSACTIONS</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
                        {transactions.length === 0 && (
                            <div className="p-12 text-center text-[10px] font-mono font-bold text-[#888888]  uppercase tracking-[0.2em] animate-pulse">Awaiting Whale Transfers...</div>
                        )}
                        <AnimatePresence>
                            {transactions.map(tx => {
                                return (
                                    <motion.button
                                        key={tx.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        onClick={() => setSelectedTx(tx)}
                                        className="bg-[#FAFAFA]  border border-[#E5E5E5]  rounded-sm p-4 hover:bg-[#F0F0F0]  transition-colors group text-left w-full"
                                    >
                                        <div className="flex justify-between items-start mb-3 border-b border-[#E5E5E5]  border-dashed pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-black/30 ">{tx.time}</span>
                                                <span className="text-black/20  text-[12px]"></span>
                                                <span className="text-[11px] font-mono text-[#050505] ">{tx.hash.slice(0,14)}...</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-[#00C076] font-black">{tx.valueEth.toFixed(2)} ETH</span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ">
                                                    Transfer
                                                </span>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black uppercase tracking-widest bg-[#E8F5E9]  text-[#388E3C] border-[#C8E6C9] `}>
                                                CONFIRMED
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(selectedBlock || selectedTx) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/90  backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-white  border border-[#E5E5E5]  rounded shadow-xl overflow-hidden relative"
                        >
                            <button 
                                onClick={() => { setSelectedBlock(null); setSelectedTx(null); }}
                                className="absolute top-6 right-6 w-8 h-8 rounded flex items-center justify-center text-[#888888] hover:text-[#050505]  hover:bg-[#FFFFFF]  transition-all"
                            >
                                X
                            </button>

                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-6 mb-10 pb-6 border-b border-[#E5E5E5] ">
                                    <div className="w-12 h-12 bg-[#FFFFFF]  border border-[#E5E5E5]  rounded flex items-center justify-center">
                                        <div className="w-5 h-5 bg-black " />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold uppercase tracking-[0.1em] text-[#050505] ">
                                            {selectedBlock ? 'BLOCK DETAILS' : 'TRANSACTION DETAILS'}
                                        </h3>
                                        <p className="text-[9px] text-[#A0A0A0] font-bold tracking-[0.2em] uppercase">Verified Ethereum L1 Data</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {selectedBlock ? (
                                        <>
                                            <DetailRow label="Block Height" value={selectedBlock.id} />
                                            <DetailRow label="Block Hash" value={selectedBlock.hash} copy />
                                            <DetailRow label="Miner / Validator" value={selectedBlock.miner} copy />
                                            <DetailRow label="Timestamp" value={selectedBlock.age} />
                                            <DetailRow label="Payload Size" value={selectedBlock.sizeKb} />
                                            <DetailRow label="Transactions" value={selectedBlock.txCount + ' Txs'} />
                                            <DetailRow label="Gas Used" value={selectedBlock.gasUsedPct.toFixed(2) + '%'} />
                                        </>
                                    ) : (
                                        <>
                                            <DetailRow label="Transaction Hash" value={selectedTx?.hash} copy />
                                            <DetailRow label="From" value={selectedTx?.from} copy />
                                            <DetailRow label="To" value={selectedTx?.to} copy />
                                            <DetailRow label="Value" value={(selectedTx?.valueEth || 0).toFixed(4) + ' ETH'} green />
                                            <DetailRow label="Gas Limit" value={selectedTx?.gasLimit} />
                                            <DetailRow label="Gas Price" value={(selectedTx?.gasPriceGwei || 0).toFixed(2) + ' GWEI'} />
                                            <DetailRow label="Nonce" value={selectedTx?.nonce} />
                                        </>
                                    )}
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <a
                                        href={selectedBlock ? `https://etherscan.io/block/${selectedBlock.id}` : `https://etherscan.io/tx/${selectedTx?.hash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-3 bg-[#050505]  text-white  rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#A0A0A0] transition-colors text-center"
                                    >
                                        VERIFY ON ETHERSCAN
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailRow({ label, value, copy, green }: any) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] ">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#888888] ">{label}</span>
            <div className="flex items-center gap-3">
                <span className={`text-[12px] font-mono ${green ? 'text-[#00C076] font-bold' : 'text-[#050505] '}`}>
                    {value}
                </span>
                {copy && (
                    <button className="p-2 hover:bg-black/5  rounded-xl transition-all text-black/10  hover:text-black ">
                        [COPY]
                    </button>
                )}
            </div>
        </div>
    );
}
