"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, QrCode } from "lucide-react";

//  Design Tokens (Ivory Model) 
const BG     = "#FFFFFF";
const INK    = "#050505";
const MUTED  = "rgba(5,5,5,0.45)";
const BORDER = "rgba(5,5,5,0.08)";
const CARD   = "#FFFFFF";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function DepositModal({ isOpen, onClose, address }: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(250,249,246,0.8)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 15 }}
            className="relative w-full max-w-sm"
          >
            <div className="border rounded-3xl overflow-hidden shadow-2xl p-8" style={{ borderColor: BORDER, background: BG }}>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 transition-colors hover:bg-black/5 p-2 rounded-full"
                style={{ color: MUTED }}
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8 mt-2">
                <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter" style={{ color: INK }}>Receive</h2>
                <p className="text-xs uppercase tracking-widest font-mono" style={{ color: MUTED }}>On-chain Deposit</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 rounded-3xl flex items-center justify-center border shadow-sm p-4" style={{ borderColor: BORDER, background: CARD }}>
                  {address ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}&color=050505&bgcolor=FFFFFF`} 
                      alt="Wallet QR Code" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <QrCode size={100} style={{ color: MUTED }} />
                  )}
                </div>
              </div>

              {/* Address Box */}
              <div 
                onClick={copyToClipboard}
                className="border rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.02] transition-colors active:scale-[0.98]"
                style={{ borderColor: BORDER, background: CARD }}
              >
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest mb-1" style={{ color: MUTED }}>Your Address</span>
                    <span className="font-mono text-xs truncate font-bold" style={{ color: INK }}>{address || "Not connected"}</span>
                </div>
                <div className="p-2 rounded-xl border transition-colors" style={{ borderColor: BORDER, background: BG, color: copied ? "#10B981" : MUTED }}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </div>
              </div>

              <div className="mt-8 text-center">
                  <p className="text-[10px] uppercase font-mono tracking-widest leading-relaxed" style={{ color: MUTED }}>
                      Supported Networks:<br/>
                      <span className="font-bold">Ethereum, Base, Optimism, Polygon</span>
                  </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

