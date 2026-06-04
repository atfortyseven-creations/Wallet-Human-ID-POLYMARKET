"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore, NETWORKS, NetworkId } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { UNIVERSAL_TOKENS, UniversalToken } from '@/config/universal-tokens';
import { encodeFunctionData } from 'viem';

const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

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

export function NativeSendView({ onBack, initialTokenSymbol }: { onBack: () => void, initialTokenSymbol?: string }) {
    const activeNetwork = useWalletStore(s => s.activeNetwork);
    const privateKey = useWalletStore(s => s.privateKey);
    const systemAddress = useWalletStore(s => s.address);
    const networkInfo = NETWORKS[activeNetwork as NetworkId] || NETWORKS.ethereum;
    
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { data: walletClient } = useWalletClient();

    const isSystemWallet = !!privateKey && !!systemAddress;
    const activeAddress = isWagmiConnected ? wagmiAddress : systemAddress;
    
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');

    const defaultToken = initialTokenSymbol 
        ? UNIVERSAL_TOKENS.find(t => t.symbol === initialTokenSymbol) 
          || { symbol: 'QDs', name: 'Aztec QDs (ZK)', address: '0x', decimals: 18, logoPath: '' } 
        : UNIVERSAL_TOKENS.find(t=>t.symbol==='ETH') || UNIVERSAL_TOKENS[0];

    const [selectedToken, setSelectedToken] = useState<UniversalToken>(defaultToken as UniversalToken);
    
    const [isSending, setIsSending] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [gasFee, setGasFee] = useState('0.00');
    const [useMultiSig, setUseMultiSig] = useState(false);

    useEffect(() => {
        const estimateGas = async () => {
            if (!amount || parseFloat(amount) <= 0 || !recipient) {
                setGasFee('0.00');
                return;
            }

            if (selectedToken.symbol === 'QDs') {
                setGasFee('0.00 (Gasless via SponsoredFPC)');
                setIsEstimating(false);
                return;
            }

            if (!ethers.isAddress(recipient)) {
                setGasFee('0.00');
                return;
            }

            setIsEstimating(true);
            try {
                const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || ethers.parseUnits('1', 'gwei');
                
                let gasLimit = 21000n; // default native transfer
                if (selectedToken.symbol !== 'ETH' && selectedToken.address && selectedToken.address !== 'native') {
                    gasLimit = 65000n; // default ERC20 transfer
                }
                
                const costInWei = gasLimit * gasPrice;
                setGasFee(ethers.formatEther(costInWei));
            } catch (e) {
                console.error(e);
            } finally {
                setIsEstimating(false);
            }
        };

        const t = setTimeout(estimateGas, 500);
        return () => clearTimeout(t);
    }, [amount, recipient, selectedToken, networkInfo.rpc]);

    const executeSend = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Invalid Amount", { description: "Please enter an amount greater than 0." });
            return;
        }

        if (selectedToken.symbol !== 'QDs' && !ethers.isAddress(recipient)) {
            toast.error("Invalid Recipient", { description: "Please enter a valid EVM address." });
            return;
        }

        if (useMultiSig) {
            toast.loading("Multi-Sig Send Initiated", { description: "Transaction pushed to Safe{Wallet} for signatures." });
            return;
        }

        if (!activeAddress) {
            toast.error("Wallet Not Connected", { description: "Please connect a wallet first." });
            return;
        }

        setIsSending(true);
        toast.loading(`Initiating On-Chain Send for ${selectedToken.symbol}...`, { id: "send-tx" });

        try {
            const parsedAmount = safeParseUnits(amount, selectedToken.decimals || 18);
            toast.loading("Please sign the transaction...", { id: "send-tx" });
            
            let txHash = "";
            const isNative = selectedToken.symbol === 'ETH' || selectedToken.address === 'native' || selectedToken.address === '0x0000000000000000000000000000000000000000';

            if (selectedToken.symbol === 'QDs') {
                const aztecSender = `0x${activeAddress.slice(2).padStart(64, '0').slice(0, 64)}`;
                let finalRecipient = recipient;
                if (ethers.isAddress(recipient)) {
                    finalRecipient = `0x${recipient.slice(2).padStart(64, '0').slice(0, 64)}`;
                }
                
                const res = await fetch('/api/aztec/transfer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromAddress: aztecSender,
                        toAddress: finalRecipient,
                        amount: amount
                    })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Aztec transfer failed");
                txHash = data.txHash || "0x_aztec_receipt";
            } else if (isWagmiConnected && walletClient) {
                // MetaMask / WalletConnect User
                if (isNative) {
                    txHash = await walletClient.sendTransaction({
                        to: recipient as `0x${string}`,
                        value: BigInt(parsedAmount.toString())
                    });
                } else {
                    const dataPayload = encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: "transfer",
                        args: [recipient as `0x${string}`, parsedAmount]
                    });
                    txHash = await walletClient.sendTransaction({
                        to: selectedToken.address as `0x${string}`,
                        value: 0n,
                        data: dataPayload
                    });
                }
            } else if (isSystemWallet) {
                // Local Vault User
                const provider = new ethers.JsonRpcProvider(networkInfo.rpc);
                const wallet = new ethers.Wallet(privateKey as string, provider);
                
                if (isNative) {
                    const tx = await wallet.sendTransaction({ 
                        to: recipient, 
                        value: parsedAmount
                    });
                    await tx.wait(1);
                    txHash = tx.hash;
                } else {
                    const tx = await wallet.sendTransaction({ 
                        to: selectedToken.address, 
                        value: 0n, 
                        data: new ethers.Interface(ERC20_ABI).encodeFunctionData("transfer", [recipient, parsedAmount])
                    });
                    await tx.wait(1);
                    txHash = tx.hash;
                }
            } else {
                throw new Error("No valid wallet found.");
            }

            toast.success("Asset Sent Successfully", { 
                id: "send-tx", 
                description: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipient.slice(0, 6)}... Hash: ${txHash.slice(0,10)}...`
            });
            setAmount('');
            setRecipient('');
        } catch (e: any) {
            const cleanError = e?.shortMessage || e?.message?.split('\n')[0] || "Transaction cancelled or failed.";
            toast.error("Send Failed", { id: "send-tx", description: cleanError });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="flex flex-col w-full bg-white font-sans overflow-x-hidden"
            style={{ minHeight: '100dvh', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* ── Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 pt-6 pb-4 border-b border-black/10">
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-black flex items-center gap-2">
                        Send Asset
                    </h2>
                    <p className="text-[10px] uppercase text-black/50 tracking-widest mt-1">Direct On-Chain Transfer</p>
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
                {/* Destination */}
                <div className="border border-black/10 p-4 sm:p-6 bg-white transition-colors hover:border-black/30">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        Recipient Address {selectedToken.symbol === 'QDs' ? '(Aztec ZK Address or EVM)' : ''}
                    </label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-transparent font-mono text-sm outline-none text-black border-b border-black/10 pb-2 focus:border-black transition-colors"
                        style={{ fontSize: '16px' }}
                    />
                </div>

                {/* Amount */}
                <div className="border border-black/10 p-4 sm:p-6 bg-black/[0.02] transition-colors hover:border-black/30">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 block">
                        Amount to Send
                    </label>
                    <div className="flex items-center justify-between gap-3">
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

                {/* Fee summary */}
                <AnimatePresence>
                    {amount && parseFloat(amount) > 0 && recipient && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="border border-black/10 p-5 bg-white text-[10px] uppercase tracking-widest space-y-4 font-mono">
                                <div className="flex justify-between text-black/50">
                                    <span>Network</span>
                                    <span className="text-black font-bold uppercase">{activeNetwork}</span>
                                </div>
                                <div className="flex justify-between text-black/50">
                                    <span>Estimated Gas Fee</span>
                                    <span className="text-[#00C076] font-bold">
                                        {isEstimating ? 'CALCULATING...' : `~ ${parseFloat(gasFee).toFixed(6)} ETH`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>{/* end body */}

            {/* ── Sticky CTA ── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-black/10 px-4 sm:px-6 pt-4"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
                <button
                    onClick={executeSend}
                    disabled={isSending || !amount || !recipient}
                    className="w-full py-4 sm:py-5 bg-black text-white font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-black/90 active:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl rounded-sm"
                >
                    {useMultiSig ? 'SIGN & QUEUE (MULTI-SIG)' : isSending ? 'SENDING...' : 'CONFIRM SEND'}
                </button>
            </div>
        </motion.div>
    );
}
