"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface TransactionStatusModalProps {
    isOpen: boolean;
    status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';
    title?: string;
    message?: string;
    onClose?: () => void;
    txHash?: string;
}

export function TransactionStatusModal({ isOpen, status, title, message, onClose, txHash }: TransactionStatusModalProps) {
    // Determine content based on status
    const isSuccess = status === 'SUCCESS';
    const isLoading = status === 'LOADING';
    const isError = status === 'ERROR';

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
                    >
                        {/* Close button (only visible on success or error? or generic?) */}
                        {(isSuccess || isError) && onClose && (
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="mb-8 mt-4 relative flex items-center justify-center w-24 h-24">
                            {isLoading && (
                                <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                            )}
                            
                            {/* Loading Spinner */}
                            {isLoading && (
                                <motion.div 
                                    className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            )}

                            {/* Center Icon logic */}
                            {isLoading && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                >
                                     {/* Fox/Logo Simplified or Brand Logo */}
                                     {/* Using a simple H for Human or relevant icon */}
                                     <span className="text-white font-bold text-xl">H</span>
                                </motion.div>
                            )}

                            {/* Success Animation */}
                            {isSuccess && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl"
                                >
                                    <Check size={40} className="text-white" strokeWidth={4} />
                                </motion.div>
                            )}

                             {/* Error Animation */}
                             {isError && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl"
                                >
                                    <X size={40} className="text-white" strokeWidth={4} />
                                </motion.div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2 mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {isSuccess ? "¡Terminado!" : isError ? "Error" : "Conectando..."}
                            </h3>
                            <p className="text-gray-500 font-medium">
                                {message || (isLoading ? "Conectándose a Human DeFi..." : "")}
                            </p>
                            
                            {/* TX Hash Link if Success */}
                            {isSuccess && txHash && (
                                <a 
                                    href={`https://polygonscan.com/tx/${txHash}`} // TODO: Dynamic chain explorer
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-block mt-4 text-orange-500 font-bold text-sm hover:underline"
                                >
                                    Ver transacción en Explorer
                                </a>
                            )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
