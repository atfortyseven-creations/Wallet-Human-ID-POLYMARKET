"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Heart, Users, Loader2, AlertCircle } from 'lucide-react';

interface DeadMansSwitchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DeadMansSwitchModal({ isOpen, onClose }: DeadMansSwitchModalProps) {
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [inactivityMonths, setInactivityMonths] = useState(12);
    const [loading, setLoading] = useState(false);
    const [switchStatus, setSwitchStatus] = useState<any>(null);

    useEffect(() => {
        if (isOpen) fetchStatus();
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/wallet/deadman/status');
            const data = await res.json();
            setSwitchStatus(data);
        } catch (e) {
            console.error('Failed to fetch dead man switch status');
        }
    };

    const setupSwitch = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wallet/deadman/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beneficiaryAddress,
                    inactivityMonths,
                }),
            });
            const data = await res.json();
            alert(` Dead Man's Switch activated! Beneficiary: ${beneficiaryAddress.slice(0, 10)}...`);
            fetchStatus();
        } catch (e: any) {
            alert(e.message || 'Failed to setup switch');
        } finally {
            setLoading(false);
        }
    };

    const pingAlive = async () => {
        try {
            await fetch('/api/wallet/deadman/ping', { method: 'POST' });
            alert(' Activity recorded! Switch timer reset.');
            fetchStatus();
        } catch (e: any) {
            alert('Failed to ping');
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
                        className="relative w-full max-w-lg bg-gradient-to-br from-red-900/90 to-black/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
                            <X size={20} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <Skull className="text-red-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Dead Man's Switch</h2>
                                <p className="text-sm text-white/60">Auto-transfer if inactive</p>
                            </div>
                        </div>

                        {switchStatus?.active ? (
                            <div>
                                <div className="bg-white/5 rounded-2xl p-6 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-white/60">Status</span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-white/60">Beneficiary</span>
                                        <span className="text-white font-mono text-sm">
                                            {switchStatus.beneficiary.slice(0, 10)}...
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60">Last Activity</span>
                                        <span className="text-white font-bold">
                                            {new Date(switchStatus.lastActivity).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={pingAlive}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                                >
                                    <Heart size={20} />
                                    I'm Alive! (Reset Timer)
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-red-400 text-sm">
                                        <strong>How it works:</strong> If you don't make any transaction for {inactivityMonths} months, 
                                        all funds will automatically transfer to your chosen beneficiary. This ensures your crypto doesn't get lost forever.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="text-white/80 text-sm mb-2 block">Beneficiary Address</label>
                                    <input
                                        type="text"
                                        value={beneficiaryAddress}
                                        onChange={(e) => setBeneficiaryAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="text-white/80 text-sm mb-2 block">
                                        Inactivity Period (Months): <strong>{inactivityMonths}</strong>
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="24"
                                        value={inactivityMonths}
                                        onChange={(e) => setInactivityMonths(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <button
                                    onClick={setupSwitch}
                                    disabled={loading || !beneficiaryAddress}
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Skull size={20} />}
                                    {loading ? 'Activating...' : 'Activate Dead Man\'s Switch'}
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

