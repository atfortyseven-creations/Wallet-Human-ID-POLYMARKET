"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image as ImageIcon, Zap } from 'lucide-react';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
    const [isScanning, setIsScanning] = useState(true);

    // Mock scan after 2 seconds for demo purposes if no real camera
    const handleMockScan = () => {
        setIsScanning(false);
        setTimeout(() => {
            onScan("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
                    >
                        <X size={24} />
                    </button>

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md h-[80vh] flex flex-col items-center justify-center relative"
                    >
                        {/* Scanner Frame */}
                        <div className="relative w-72 h-72 border-2 border-white/20 rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(168,85,247,0.5)]">
                            
                            {/* Scanning Animation */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent w-full h-full animate-scan" />
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_20px_#a855f7] animate-scan-line" />

                            {/* Camera Feed Placeholder */}
                            <div 
                                className="w-full h-full bg-black flex items-center justify-center cursor-pointer"
                                onClick={handleMockScan}
                            >
                                <div className="text-center text-white/50 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-2 animate-pulse">
                                        <Camera size={32} />
                                    </div>
                                    <p className="text-sm font-medium">Tap to simulate scan</p>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />
                        </div>

                        {/* Instructions */}
                        <div className="mt-8 text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">Scan QR Code</h3>
                            <p className="text-white/50 text-sm max-w-[200px] mx-auto">
                                Point camera at a Wallet address or WalletConnect QR
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-4">
                            <button className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <ImageIcon size={20} />
                                </div>
                                <span className="text-xs">Upload</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <span className="text-xs">Flash</span>
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Add these animations to your global css or tailwind config
// @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
