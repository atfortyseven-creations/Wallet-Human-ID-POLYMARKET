"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowUpRight, Loader2, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAddress: string;
}

export default function SendModal({ isOpen, onClose, userAddress }: SendModalProps) {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [gasEstimate, setGasEstimate] = useState('');

    // Estimate gas on amount/address change
    const estimateGas = async () => {
        if (!recipientAddress || !amount) return;
        
        try {
            const res = await fetch('/api/wallet/estimate-gas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: recipientAddress, amount }),
            });
            const data = await res.json();
            setGasEstimate(data.gasFeeUSD);
        } catch (e) {
            console.error('Gas estimation failed', e);
        }
    };

    const handleSend = async () => {
        setLoading(true);
        setError('');

        // Validate address
        if (!ethers.isAddress(recipientAddress)) {
            setError('Invalid Ethereum address');
            setLoading(false);
            return;
        }

        // Validate amount
        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than 0');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/wallet/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipientAddress,
                    amount: amount,
                    token: 'ETH',
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Transaction failed');
            }

            const data = await res.json();
            setTxHash(data.txHash);
            setSuccess(true);
        } catch (e: any) {
            setError(e.message || 'Failed to send transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md bg-gradient-to-br from-purple-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-full">
                                <Send className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Send Crypto</h2>
                                <p className="text-sm text-white/60">Transfer ETH securely</p>
                            </div>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowUpRight className="text-green-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Transaction Sent!</h3>
                                <p className="text-white/60 text-sm mb-4">Your transaction is being processed</p>
                                <a
                                    href={`https://etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 text-sm hover:underline"
                                >
                                    View on Etherscan →
                                </a>
                            </div>
                        ) : (
                            <>
                                {/* Recipient Address */}
                                <div className="mb-4">
                                    <label className="text-white/80 text-sm font-medium mb-2 block">
                                        Recipient Address
                                    </label>
                                    <input
                                        type="text"
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        onBlur={estimateGas}
                                        placeholder="0x..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>

                                {/* Amount */}
                                <div className="mb-4">
                                    <label className="text-white/80 text-sm font-medium mb-2 block">
                                        Amount (ETH)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        onBlur={estimateGas}
                                        placeholder="0.0"
                                        step="0.001"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>

                                {/* Gas Estimate */}
                                {gasEstimate && (
                                    <div className="mb-4 p-3 bg-white/5 rounded-xl">
                                        <p className="text-white/60 text-xs">Estimated Gas Fee</p>
                                        <p className="text-white font-bold">${gasEstimate}</p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                                        <AlertTriangle className="text-red-400" size={16} />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Send Button */}
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !recipientAddress || !amount}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Transaction
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
