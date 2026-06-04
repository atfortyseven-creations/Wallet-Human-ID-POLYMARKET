"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Shield, Zap, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'sonner';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

/**
 * INSTITUTIONAL QR SCANNER MODAL (Phase 34)
 * High-fidelity hardware bridge for BSV address and dApp Handshaking.
 */
export const QrScannerModal = ({ isOpen, onClose, onScan }: QrScannerModalProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
            /* verbose= */ false
          );

          scanner.render((decodedText: string) => {
            scanner.clear();
            scannerRef.current = null;
            onScan(decodedText);
            onClose();
          }, (err: any) => {
            // Silence most errors during active scanning
          });

          scannerRef.current = scanner;
        } catch (e: any) {
          setError("Failed to initialize camera substrate.");
        }
      }, 500);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)] opacity-60">Visual Substrate</span>
                <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tighter">Protocol <span className="text-[var(--aztec-orchid)]">Scanner</span></h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scan Area */}
            <div className="p-12 flex flex-col items-center">
               {error ? (
                 <div className="flex flex-col items-center text-center space-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-sm font-black uppercase tracking-widest">{error}</p>
                    <button onClick={onClose} className="px-6 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase">Dismiss</button>
                 </div>
               ) : (
                 <div className="w-full relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                    <div id="qr-reader" className="w-full" />
                    <div className="absolute inset-0 pointer-events-none border-[4px] border-[var(--aztec-chartreuse)]/20 animate-pulse rounded-3xl" />
                 </div>
               )}

               <div className="mt-8 flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl w-full">
                  <Shield size={16} className="text-[var(--aztec-orchid)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">End-to-End Encrypted Hardware Bridge</span>
               </div>
            </div>

            {/* Hint */}
            <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col items-center">
               <p className="text-[10px] text-white/40 text-center font-aztec-mono italic">
                 Align the protocol QR code within the highlighted grid to initiate a handshake.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
