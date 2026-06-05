"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Heart, Loader2, Shield } from 'lucide-react';

interface PrivacyMixerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyMixerModal({ isOpen, onClose }: PrivacyMixerModalProps) {
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const sendPrivate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet/mixer/donate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipientAddress,
                    amount,
                }),
            });
            const data = await res.json();
            alert(` Anonymous donation sent! Your identity is protected via privacy protocol.`);
            onClose();
        } catch (e: any) {
            alert(e.message || 'Privacy send failed');
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
                        className="relative w-full max-w-md bg-gradient-to-br from-indigo-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
                            <X size={20} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-500/20 rounded-full">
                                <EyeOff className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Privacy Mixer</h2>
                                <p className="text-sm text-white/60">Anonymous donations</p>
                            </div>
                        </div>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                            <p className="text-indigo-400 text-sm flex items-center gap-2">
                                <Shield size={14} />
                                <span>
                                    Your donation will be mixed through multiple wallets via a zkSNARK privacy protocol. 
                                    The recipient receives funds, but cannot trace them back to you.
                                </span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="text-white/80 text-sm mb-2 block">Recipient Address</label>
                            <input
                                type="text"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                placeholder="0x... or charity.eth"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-white/80 text-sm mb-2 block">Amount (ETH)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                step="0.01"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                            />
                        </div>

                        <div className="mb-6 p-3 bg-white/5 rounded-xl text-sm">
                            <div className="flex justify-between text-white/60 mb-2">
                                <span>Privacy Fee</span>
                                <span className="text-white font-bold">0.5%</span>
                            </div>
                            <div className="flex justify-between text-white/60">
                                <span>Mixing Time</span>
                                <span className="text-white font-bold">~5 minutes</span>
                            </div>
                        </div>

                        <button
                            onClick={sendPrivate}
                            disabled={loading || !recipientAddress || !amount}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Heart size={20} />}
                            {loading ? 'Mixing & Sending...' : 'Send Anonymously'}
                        </button>

                        <p className="text-white/40 text-xs text-center mt-4">
                            Powered by zkSNARK privacy protocol. Your identity is mathematically protected.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

