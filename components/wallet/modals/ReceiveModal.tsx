"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAddress: string;
}

export default function ReceiveModal({ isOpen, onClose, userAddress }: ReceiveModalProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [copied,setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && userAddress) {
            generateQR();
        }
    }, [isOpen, userAddress]);

    const generateQR = async () => {
        try {
            const qr = await QRCodeLib.toDataURL(userAddress, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrCodeDataUrl(qr);
        } catch (error) {
            console.error('QR generation failed', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(userAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `wallet-${userAddress.slice(0, 8)}.png`;
        link.click();
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
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
                            <X size={20} className="text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <QrCode className="text-green-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Receive Crypto</h2>
                                <p className="text-sm text-white/60">Scan QR or copy address</p>
                            </div>
                        </div>

                        {qrCodeDataUrl && (
                            <div className="bg-white p-4 rounded-2xl mb-6">
                                <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-auto" />
                            </div>
                        )}

                        <div className="mb-4 p-4 bg-white/5 rounded-xl">
                            <p className="text-white/60 text-xs mb-2">Your Address</p>
                            <p className="text-white font-mono text-sm break-all">{userAddress}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Copy size={18} />
                                {copied ? 'Copied!' : 'Copy Address'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
