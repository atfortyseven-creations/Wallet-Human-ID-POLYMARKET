"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownUp, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', icon: '₮', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', icon: '◈', decimals: 18 },
];

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const { address } = useAccount();
    const [fromToken, setFromToken] = useState(TOKENS[0]);
    const [toToken, setToToken] = useState(TOKENS[1]);
    const [fromAmount, setFromAmount] = useState('');
    const [estimatedTo, setEstimatedTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [swapping, setSwapping] = useState(false);
    const [quote, setQuote] = useState<any>(null);

    // Get swap quote when amounts change
    useEffect(() => {
        if (fromAmount && parseFloat(fromAmount) > 0) {
            const timer = setTimeout(() => {
                fetchQuote(fromAmount);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setEstimatedTo('');
            setQuote(null);
        }
    }, [fromAmount, fromToken, toToken]);

    const fetchQuote = async (val: string) => {
        if (!val || parseFloat(val) <= 0 || !address) {
            setEstimatedTo('');
            setQuote(null);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/wallet/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId: 1, // Default to Mainnet for now
                    fromToken: fromToken.symbol,
                    toToken: toToken.symbol,
                    amount: parseUnits(val, fromToken.decimals).toString(),
                    fromAddress: address,
                    mode: 'quote'
                }),
            });
            const data = await response.json();
            if (data.quote) {
                const resultAmount = formatUnits(BigInt(data.quote.dstAmount), toToken.decimals);
                setEstimatedTo(resultAmount);
                // Calculate rates for display
                const rate = (parseFloat(resultAmount) / parseFloat(val)).toFixed(4);
                setQuote({ ...data.quote, rate, gasFee: (parseInt(data.quote.gas) * 20 / 1e9).toFixed(2) });
            } else {
                setEstimatedTo('');
                setQuote(null);
                toast.error(data.error || 'Failed to get quote');
            }
        } catch (error) {
            console.error('Quote error:', error);
            setEstimatedTo('');
            setQuote(null);
            toast.error('Connection error fetching quote');
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = async () => {
        if (!address || !fromAmount || parseFloat(fromAmount) <= 0) {
            toast.error('Please enter a valid amount and connect your wallet.');
            return;
        }
        setSwapping(true);
        try {
            const response = await fetch('/api/wallet/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId: 1,
                    fromToken: fromToken.symbol,
                    toToken: toToken.symbol,
                    amount: parseUnits(fromAmount, fromToken.decimals).toString(),
                    fromAddress: address,
                    mode: 'swap'
                }),
            });
            const data = await response.json();
            if (data.transaction) {
                toast.success('¡Transacción construida exitosamente!');
                // Sign/broadcast logic here
                onClose();
            } else {
                toast.error(data.error || 'Error al iniciar swap');
            }
        } catch (error) {
            console.error('Swap error:', error);
            toast.error('Error de conexión');
        } finally {
            setSwapping(false);
        }
    };

    const flipTokens = () => {
        const tempToken = fromToken;
        setFromToken(toToken);
        setToToken(tempToken);
        setFromAmount(estimatedTo);
        setEstimatedTo('');
    };

    const handleFromTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = TOKENS.find(t => t.symbol === e.target.value);
        if (selected) setFromToken(selected);
    };

    const handleToTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = TOKENS.find(t => t.symbol === e.target.value);
        if (selected) setToToken(selected);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            <X size={20} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-full">
                                <ArrowDownUp className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Intercambio</h2>
                                <p className="text-sm text-white/60">Las mejores rutas vía 1inch</p>
                            </div>
                        </div>

                        {/* From Token */}
                        <div className="mb-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest">Pagas</label>
                                <span className="text-white/40 text-[10px] font-bold">Balance: --</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={fromToken.symbol}
                                    onChange={handleFromTokenChange}
                                    className="bg-white/10 text-white rounded-xl px-3 py-2 text-sm font-black outline-none border-none focus:ring-1 focus:ring-purple-500"
                                >
                                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol} className="bg-[#1a1a1a]">{t.icon} {t.symbol}</option>)}
                                </select>
                                <input
                                    type="number"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="flex-1 bg-transparent text-white text-2xl font-black outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        {/* Flip Button */}
                        <div className="flex justify-center -my-4 relative z-10">
                            <button
                                onClick={flipTokens}
                                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-2xl transition-all hover:rotate-180 duration-500 shadow-lg"
                            >
                                <ArrowDownUp size={18} className="text-white" />
                            </button>
                        </div>

                        {/* To Token */}
                        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white/40 text-[10px] font-black uppercase tracking-widest">Recibes</label>
                                <span className="text-white/40 text-[10px] font-bold">Balance: --</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={toToken.symbol}
                                    onChange={handleToTokenChange}
                                    className="bg-white/10 text-white rounded-xl px-3 py-2 text-sm font-black outline-none border-none focus:ring-1 focus:ring-purple-500"
                                >
                                    {TOKENS.map(t => <option key={t.symbol} value={t.symbol} className="bg-[#1a1a1a]">{t.icon} {t.symbol}</option>)}
                                </select>
                                <div className="flex-1 text-white text-2xl font-black text-right truncate">
                                    {loading ? <Loader2 size={18} className="animate-spin inline-block mr-2" /> : estimatedTo || '0.0'}
                                </div>
                            </div>
                        </div>

                        {quote && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest"
                            >
                                <div className="flex justify-between text-white/40 mb-2">
                                    <span>Tasa de cambio</span>
                                    <span className="text-white">1 {fromToken.symbol} = {quote.rate} {toToken.symbol}</span>
                                </div>
                                <div className="flex justify-between text-white/40">
                                    <span>Comisión de red</span>
                                    <span className="text-[#00ff9d]">${quote.gasFee}</span>
                                </div>
                            </motion.div>
                        )}

                        <button
                            onClick={handleSwap}
                            disabled={loading || swapping || !fromAmount}
                            className="w-full py-5 bg-white text-black hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            {swapping ? (
                                <><Loader2 className="animate-spin" size={16} /> Procesando...</>
                            ) : (
                                <>Intercambiar Ahora</>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

