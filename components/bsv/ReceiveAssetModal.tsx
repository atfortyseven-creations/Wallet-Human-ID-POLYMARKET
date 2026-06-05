"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';

import { useCWI } from '@/lib/bsv/CWIContext';
import { toast } from 'sonner';

interface ReceiveAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * INSTITUTIONAL RECEIVE MODAL (Phase 34)
 * High-fidelity QR generation for the SirDeggen Substrate.
 */
export const ReceiveAssetModal = ({ isOpen, onClose }: ReceiveAssetModalProps) => {
  const { identity } = useCWI();
  const address = identity?.getAddress() || 'Initializing...';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address Copied to Secure Clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

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
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--aztec-chartreuse)] opacity-60">Protocol Inbound</span>
                <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tighter">Receive <span className="text-[var(--aztec-orchid)]">Assets</span></h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* QR Section */}
            <div className="p-12 flex flex-col items-center space-y-8">
              <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${address}&color=000000&bgcolor=ffffff`} alt="QR" className="w-[240px] h-[240px] object-contain" />
              </div>

              <div className="w-full space-y-4">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Your Institutional BSV Address</span>
                  <div 
                    onClick={handleCopy}
                    className="group flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-[var(--aztec-chartreuse)] transition-all w-full justify-between"
                  >
                    <code className="text-xs font-aztec-mono text-[var(--aztec-chartreuse)] truncate max-w-[300px]">
                      {address}
                    </code>
                    {copied ? <Check size={16} className="text-[var(--aztec-chartreuse)]" /> : <Copy size={16} className="opacity-40 group-hover:opacity-100" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
               <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <Download size={14} /> Save Image
               </button>
               <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                 <Share2 size={14} /> Share Link
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
