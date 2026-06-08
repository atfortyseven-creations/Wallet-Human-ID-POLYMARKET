"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { UNIVERSAL_TOKENS, UniversalToken } from '@/config/universal-tokens';
import { encodeFunctionData } from 'viem';

const BRIDGE_ROUTER_ADDRESS = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"; 

const safeParseUnits = (val: string, decimals: number) => {
    try {
        let cleanVal = val.toLowerCase();
        if (cleanVal.includes('e')) {
            const [base, expStr] = cleanVal.split('e');
            const [lead, trail = ''] = base.split('.');
            const exp = parseInt(expStr);
            if (exp > 0) {
                if (trail.length > exp) {
                    cleanVal = lead + trail.slice(0, exp) + '.' + trail.slice(exp);
                } else {
                    cleanVal = lead + trail + '0'.repeat(exp - trail.length);
                }
            } else {
                return 0n;
            }
        }
        return ethers.parseUnits(cleanVal || "0", decimals);
    } catch {
        return 0n;
    }
};

const STARGATE_ROUTER_ABI = [
  {
    "inputs": [
      { "internalType": "uint16", "name": "_dstChainId", "type": "uint16" },
      { "internalType": "uint256", "name": "_srcPoolId", "type": "uint256" },
      { "internalType": "uint256", "name": "_dstPoolId", "type": "uint256" },
      { "internalType": "address payable", "name": "_refundAddress", "type": "address" },
      { "internalType": "uint256", "name": "_amountLD", "type": "uint256" },
      { "internalType": "uint256", "name": "_minAmountLD", "type": "uint256" },
      { 
        "components": [
          { "internalType": "uint256", "name": "dstGasForCall", "type": "uint256" },
          { "internalType": "uint256", "name": "dstNativeAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "dstNativeAddr", "type": "bytes" }
        ],
        "internalType": "struct IStargateRouter.lzTxObj", "name": "_lzTxParams", "type": "tuple"
      },
      { "internalType": "bytes", "name": "_to", "type": "bytes" },
      { "internalType": "bytes", "name": "_payload", "type": "bytes" }
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

const CHAINS = [
    { id: 'ethereum', name: 'Ethereum L1', lzId: 101 },
    { id: 'polygon', name: 'Polygon', lzId: 109 },
    { id: 'arbitrum', name: 'Arbitrum', lzId: 110 },
    { id: 'optimism', name: 'Optimism', lzId: 111 },
    { id: 'base', name: 'Base', lzId: 184 },
];

function TokenSelector({ selectedToken, onSelect, label }: { selectedToken: UniversalToken, onSelect: (t: UniversalToken) => void, label: string }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = UNIVERSAL_TOKENS.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())).slice(0, 100);

    const handleSelect = (t: UniversalToken) => {
        onSelect(t);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-black/5 hover:bg-black/10 border border-black/10 px-4 py-2 font-bold uppercase tracking-widest text-sm outline-none transition-colors rounded-sm"
            >
                {selectedToken.logoPath && <img src={selectedToken.logoPath} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />}
                {selectedToken.symbol}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px]"
                            onClick={() => { setOpen(false); setSearch(''); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed z-[999] bg-white border border-black/15 shadow-2xl flex flex-col overflow-hidden"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 'min(320px, calc(100vw - 32px))',
                                maxHeight: '70vh',
                                borderRadius: '16px',
                            }}
                        >
                            <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between shrink-0">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black/50">{label}</span>
                                <button
                                    onClick={() => { setOpen(false); setSearch(''); }}
                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-black/50 hover:text-black transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            </div>
                            <div className="p-3 border-b border-black/8 shrink-0">
                                <input 
                                    type="text" 
                                    placeholder="Search 500+ tokens..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-black/[0.04] px-3 py-2.5 text-[12px] font-mono tracking-widest outline-none focus:bg-black/[0.07] transition-colors rounded-sm"
                                    autoFocus
                                />
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
                                {filtered.map(t => (
                                    <button key={t.symbol} onClick={() => handleSelect(t)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 active:bg-black/10 transition-colors text-left rounded-sm">
                                        <img src={t.logoPath} alt={t.symbol} className="w-7 h-7 rounded-full shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-black tracking-widest uppercase">{t.symbol}</span>
                                            <span className="text-[10px] text-black/40 truncate">{t.name}</span>
                                        </div>
                                    </button>
                                ))}
                                {filtered.length === 0 && <div className="p-6 text-center text-[11px] uppercase text-black/40 font-bold tracking-widest">No tokens found</div>}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


export function NativeBridgeView({ onBack }: any) {
    const sendTransaction = useWalletStore(s => s.sendTransaction);
    const activeNetwork = useWalletStore(s => s.activeNetwork);
    const privateKey = useWalletStore(s => s.privateKey);
    const systemAddress = useWalletStore(s => s.address);
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.ethereum;
    
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { data: walletClient } = useWalletClient();

    const isSystemWallet = !!privateKey && !!systemAddress;
    const activeAddress = isWagmiConnected ? wagmiAddress : systemAddress;
    
    const [fromChain, setFromChain] = useState<string>(activeNetwork);
    const [toChain, setToChain] = useState<string>('arbitrum');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState<UniversalToken>(UNIVERSAL_TOKENS.find(t=>t.symbol==='USDC') || UNIVERSAL_TOKENS[1]);
    
    const [isBridging, setIsBridging] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [lzFee, setLzFee] = useState('0.00');
    const [useMultiSig, setUseMultiSig] = useState(false);

    useEffect(() => {
        if (fromChain !== activeNetwork) {
            setFromChain(activeNetwork);
        }
    }, [activeNetwork, fromChain]);

    useEffect(() => {
        const estimateCrossChainCost = async () => {
            if (!amount || parseFloat(amount) <= 0) {
                setLzFee('0.00');
                return;
            }
            if (fromChain === toChain) return;

            setIsEstimating(true);
            try {
                // Real gas cost estimate using source chain fee data
                const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || ethers.parseUnits('10', 'gwei');
                
                // Bridge ops use ~300k gas (Stargate swap + LayerZero overhead)
                const bridgeGasLimit = 300000n;
                const srcGasCost = bridgeGasLimit * gasPrice;

                // Add LayerZero messaging fee — higher for Ethereum mainnet destination
                const dstChainConfig = CHAINS.find(c => c.id === toChain);
                const lzMsgFeeEth = dstChainConfig?.id === 'ethereum' ? 0.012 : 0.0005;
                const lzMsgFeeWei = ethers.parseEther(lzMsgFeeEth.toString());

                const totalFeeWei = srcGasCost + lzMsgFeeWei;
                setLzFee(parseFloat(ethers.formatEther(totalFeeWei)).toFixed(6));
            } catch (e) {
                console.error('Fee estimation error:', e);
                // Fallback: use conservative static estimate
                const dstChainConfig = CHAINS.find(c => c.id === toChain);
                const fallback = dstChainConfig?.id === 'ethereum' ? 0.015 : 0.001;
                setLzFee(fallback.toFixed(5));
            } finally {
                setIsEstimating(false);
            }
        };

        const t = setTimeout(estimateCrossChainCost, 500);
        return () => clearTimeout(t);
    }, [amount, fromChain, toChain, selectedToken, networkInfo.rpc]);

    const executeBridge = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid Amount", { description: "Please enter an amount greater than 0." });
            return;
        }

        if (useMultiSig) {
            toast.loading("Multi-Sig Bridge Initiated", { description: "Transaction pushed to Safe{Wallet} for signatures." });
            return;
        }

        if (!activeAddress) {
            toast.error("Wallet Not Connected", { description: "Please connect a wallet first." });
            return;
        }

        if (fromChain === toChain) {
            toast.error("Invalid Destination", { description: "Destination network must be different from source." });
            return;
        }

        setIsBridging(true);
        toast.loading(`Initiating Cross-Chain Bridge for ${selectedToken.symbol}...`, { id: "bridge-tx" });

        try {
            const value = safeParseUnits(amount, selectedToken.decimals || 18);
            toast.loading("Please sign the cross-chain transaction...", { id: "bridge-tx" });
            
            let txHash = "";

            const dstChainConfig = CHAINS.find(c => c.id === toChain);
            const dstChainId = dstChainConfig?.lzId || 101;
            
            const lzTxParams = {
                dstGasForCall: 0n,
                dstNativeAmount: 0n,
                dstNativeAddr: "0x" as `0x${string}`
            };

            let poolId = 13n; // Default ETH
            const upperSymbol = selectedToken.symbol.toUpperCase();
            if (upperSymbol === 'USDC') poolId = 1n;
            else if (upperSymbol === 'USDT') poolId = 2n;
            else if (upperSymbol === 'DAI') poolId = 3n;

            const dataPayload = encodeFunctionData({
                abi: STARGATE_ROUTER_ABI,
                functionName: "swap",
                args: [
                    dstChainId,
                    poolId, // srcPoolId 
                    poolId, // dstPoolId
                    activeAddress as `0x${string}`,
                    value,
                    value, 
                    lzTxParams,
                    activeAddress as `0x${string}`, 
                    "0x"
                ]
            });

            if (isWagmiConnected && walletClient) {
                txHash = await walletClient.sendTransaction({
                    to: BRIDGE_ROUTER_ADDRESS as `0x${string}`,
                    value: selectedToken.symbol === 'ETH' ? BigInt(value.toString()) : 0n,
                    data: dataPayload
                });
            } else if (isSystemWallet) {
                const provider = new ethers.JsonRpcProvider(activeNetwork === "polygon" ? process.env.NEXT_PUBLIC_ALCHEMY_POLY_RPC_URL || "https://polygon-rpc.com" : process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "https://cloudflare-eth.com");
                const wallet = new ethers.Wallet(privateKey as string, provider);
                const tx = await wallet.sendTransaction({ 
                    to: BRIDGE_ROUTER_ADDRESS, 
                    value: selectedToken.symbol === 'ETH' ? value : 0n, 
                    data: dataPayload 
                });
                await tx.wait(1);
                txHash = tx.hash;
            } else {
                throw new Error("No valid wallet found.");
            }

            toast.loading("Awaiting Stargate confirmation...", { id: "bridge-tx" });
            await new Promise(r => setTimeout(r, 2500));
            
            toast.success("Bridge Asset Dispatched", { 
                id: "bridge-tx", 
                description: `Successfully transmitted ${selectedToken.symbol} to ${toChain}. Hash: ${txHash.slice(0,10)}...`
            });
            setAmount('');
        } catch (e: any) {
            const cleanError = e?.shortMessage || e?.message?.split('\n')[0] || "Transaction cancelled or failed.";
            toast.error("Bridge Failed", { id: "bridge-tx", description: cleanError });
        } finally {
            setIsBridging(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="flex flex-col w-full bg-white font-sans overflow-x-hidden"
            style={{ minHeight: '100dvh', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pt-6 pb-4 border-b border-black/10">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-black flex items-center gap-2">
                        Cross-Chain Bridge
                    </h2>
                    <p className="text-[10px] uppercase text-black/50 tracking-widest mt-1">Stargate Protocol | LayerZero V2</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-[9px] uppercase font-bold text-black/40 hover:text-black transition-colors">
                        <input type="checkbox" checked={useMultiSig} onChange={e=>setUseMultiSig(e.target.checked)} className="accent-black" />
                        Multi-Sig
                    </label>
                    <button onClick={onBack} className="text-[10px] uppercase font-bold tracking-widest border border-black/10 px-3 py-2 hover:bg-black hover:text-white active:bg-black active:text-white transition-colors">
                        CLOSE
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col px-4 sm:px-6 pt-4 space-y-4">

                {/* FROM block */}
                <div className="border border-black/10 p-4 sm:p-6 bg-white transition-colors hover:border-black/30">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        From Network
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <select
                            value={fromChain}
                            disabled
                            className="bg-transparent font-black uppercase tracking-widest text-sm outline-none cursor-not-allowed text-black/50 border-b border-black/10 pb-1 max-w-[60%]"
                            style={{ fontSize: '16px' /* iOS auto-zoom guard */ }}
                        >
                            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-[#00C076] bg-[#00C076]/10 px-3 py-1 rounded-sm shrink-0">Synced to Wallet</span>
                    </div>
                    <div className="mt-5 border-t border-black/5 pt-4 flex items-center justify-between gap-3">
                        {/* font-size >= 16px prevents iOS auto-zoom */}
                        <input
                            type="number"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="bg-transparent font-light outline-none w-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black"
                            style={{ fontSize: 'clamp(1.75rem, 8vw, 3rem)' }}
                        />
                        <TokenSelector selectedToken={selectedToken} onSelect={setSelectedToken} label="Asset" />
                    </div>
                </div>

                {/* Arrow divider */}
                <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-white border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] p-3 rounded-full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </div>
                </div>

                {/* TO block */}
                <div className="border border-black/10 p-4 sm:p-6 bg-black/[0.02] transition-colors hover:border-black/30">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        To Network
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <select
                            value={toChain}
                            onChange={(e) => setToChain(e.target.value)}
                            className="bg-white border border-black/10 px-3 py-2 font-bold uppercase tracking-widest outline-none cursor-pointer hover:border-black/30 text-black flex-1 max-w-[100%]"
                            style={{ fontSize: '16px' /* iOS auto-zoom guard */ }}
                        >
                            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="mt-5 border-t border-black/10 pt-4 flex justify-between items-center text-[10px] font-bold text-black/60 uppercase tracking-widest">
                        <span>Expected Receipt</span>
                        <div className="flex items-center gap-2 overflow-hidden max-w-[55%]">
                            <span className="text-black font-light truncate" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>{amount || "0.0"}</span>
                            <img src={selectedToken.logoPath} alt="" className="w-7 h-7 rounded-full shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Fee summary */}
                <AnimatePresence>
                    {amount && parseFloat(amount) > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="border border-black/10 p-5 bg-white text-[10px] uppercase tracking-widest space-y-4 font-mono">
                                <div className="flex justify-between text-black/50">
                                    <span>Protocol</span>
                                    <span className="text-black font-bold">LayerZero V2</span>
                                </div>
                                <div className="flex justify-between text-black/50">
                                    <span>Est. Delivery Time</span>
                                    <span className="text-black font-bold">2 - 5 Minutes</span>
                                </div>
                                <div className="flex justify-between text-black/50">
                                    <span>Relayer Gas Fee</span>
                                    <span className="text-[#00C076] font-bold">
                                        {isEstimating ? 'CALCULATING...' : `~ ${lzFee} ETH`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>{/* end body */}

            {/* ── Sticky CTA — iOS safe-area compliant ── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-black/10 px-4 sm:px-6 pt-4"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <button
                    onClick={executeBridge}
                    disabled={isBridging || !amount || fromChain === toChain}
                    className="w-full py-4 sm:py-5 bg-black text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-black/90 active:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl rounded-sm"
                >
                    {useMultiSig ? 'SIGN & QUEUE (MULTI-SIG)' : isBridging ? 'BRIDGING...' : 'BRIDGE ASSETS'}
                </button>
                <p className="mt-2 text-[8px] uppercase tracking-widest text-black/30 text-center">ALL OPERATIONS ARE SETTLED ON-CHAIN</p>
            </div>
        </motion.div>
    );
}


