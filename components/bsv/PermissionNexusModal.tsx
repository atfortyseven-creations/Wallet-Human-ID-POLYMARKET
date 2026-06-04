"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';

interface PermissionNexusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onRefuse: () => void;
  origin: string;
  action: string;
  params: any;
}

/**
 * PERMISSION NEXUS (Phase 35)
 * The System Authorization Portal for dApp Protocol Handshakes.
 */
export const PermissionNexusModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onRefuse, 
  origin, 
  action, 
  params 
}: PermissionNexusModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative w-full max-w-xl bg-[#0d0d0d] border border-red-500/20 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.1)]"
          >
            {/* Warning Header */}
            <div className="p-10 border-b border-white/5 bg-red-500/[0.03] flex items-center gap-6">
               <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl animate-pulse">
                  <ShieldAlert size={32} />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Security Handshake</span>
                  <h2 className="text-2xl font-aztec-serif font-black uppercase tracking-tighter">Authorization <span className="text-white">Required</span></h2>
               </div>
            </div>

            {/* Context Section */}
            <div className="p-10 space-y-8">
               <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Requesting Analytics</p>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black">?</div>
                     <div>
                        <p className="text-sm font-black text-[var(--aztec-chartreuse)]">{origin}</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">External Protocol</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-[var(--aztec-orchid)]" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Action: <span className="text-white">{action}</span></p>
                  </div>
                  <pre className="p-6 bg-black/40 rounded-2xl border border-white/5 font-aztec-mono text-[10px] text-white/60 overflow-x-auto">
                    {JSON.stringify(params, null, 2)}
                  </pre>
               </div>

               <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <Info size={16} className="text-white/40 shrink-0" />
                  <p className="text-[9px] text-white/30 italic">
                    Granting this permission allows the dApp to interact with your identity substrate. Always verify the protocol origin.
                  </p>
               </div>
            </div>

            {/* Actions */}
            <div className="p-10 bg-white/[0.01] border-t border-white/5 flex gap-6">
               <button 
                onClick={onRefuse}
                className="flex-1 py-6 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white/60 hover:text-red-500"
               >
                 <XCircle size={18} /> Refuse
               </button>
               <button 
                onClick={onApprove}
                className="flex-1 py-6 bg-white text-black hover:bg-[var(--aztec-chartreuse)] rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
               >
                 <CheckCircle2 size={18} /> Authorize
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
