// components/dashboard/CryptographicID.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Key, CheckCircle2, QrCode, Copy, UserCheck } from 'lucide-react';
import { useSystemFormatter } from '@/hooks/useSystemFormatter';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { toast } from 'sonner';

export default function CryptographicID() {
  const { address, isConnected } = useAccount();
  const { formatAddress } = useSystemFormatter();
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateKeys = () => {
    setIsRotating(true);
    const tid = toast.loading("Executing Elliptic Curve Key Rotation...");
    setTimeout(() => {
      toast.success("Identity Keys Re-Synchronized", { id: tid });
      setIsRotating(false);
    }, 2000);
  };

  return (
    <div className="h-full w-full min-h-0 bg-black text-white font-mono flex flex-col p-8 gap-8">
      
      {/*  ACADEMIC INTRO  */}
      <div className="border border-white/5 bg-white/[0.01] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/15 text-white/90">
            <Fingerprint size={24} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.4em]">Cryptographic identity</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Immutable digital identity anchoring on-chain credentials and access levels.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Identity Grid */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="border border-white/5 bg-white/[0.02] p-8 space-y-8">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-white/20 uppercase tracking-[0.4em]">Primary_Registry</span>
              {isConnected ? (
                <div className="flex items-center gap-2 text-[8px] text-white/80 border border-white/20 px-3 py-1 bg-white/5">
                  <UserCheck size={10} /> AUTHENTICATED
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[8px] text-rose-500 border border-rose-500/20 px-3 py-1 bg-rose-500/5">
                  ANONYMOUS_SESSION
                </div>
              )}
            </div>

            <div className="space-y-4">
               <div className="text-[10px] text-white/40 uppercase">EVM_DERIVATION_PATH</div>
               <div className="bg-black border border-white/5 p-4 flex items-center justify-between group">
                  <span className="text-xs font-bold tracking-widest truncate">{address ? formatAddress(address as string) : '0x0000000000000000000000000000000000000000'}</span>
                  <button onClick={() => { if(address) { navigator.clipboard.writeText(address); toast.success("ID_COPIED"); } }} className="text-white/10 hover:text-white transition-all">
                     <Copy size={14} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                  <span className="text-[8px] text-white/20 uppercase tracking-widest">Access_Clearance</span>
                  <div className="text-xs font-black uppercase">GENESIS_LEVEL_01</div>
               </div>
               <div className="space-y-2">
                  <span className="text-[8px] text-white/20 uppercase tracking-widest">Attestation_Status</span>
                  <div className="text-xs font-black uppercase text-white/90">Verified account</div>
               </div>
            </div>
          </div>

          <div className="border border-white/5 bg-white/[0.01] p-8">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">Security_Handshake</h3>
             <div className="flex gap-4">
                <button 
                  onClick={handleRotateKeys}
                  disabled={isRotating}
                  className="flex-1 py-4 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                >
                  {isRotating ? 'Rotating_Entropy...' : 'Rotate_Signing_Keys'}
                </button>
                <button className="flex-1 py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Export_Identity_JSON
                </button>
             </div>
          </div>

        </div>

        {/* Sidebar / Additional Info */}
        <div className="space-y-6">
           <div className="border border-white/5 bg-white/[0.02] p-6 text-center">
              <div className="flex justify-center mb-6 opacity-40">
                 <QrCode size={120} />
              </div>
              <span className="text-[8px] text-white/20 uppercase tracking-widest block mb-4">Mobile_Handshake_Node</span>
              <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-widest">
                 Scan with System Mobile to synchronize your biometric identity with the terminal.
              </p>
           </div>
           
           <div className="border border-white/5 bg-white/[0.01] p-6">
              <h4 className="text-[9px] font-black uppercase tracking-widest mb-4">Identity_History</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] text-white/40">GENESIS_MINT</span>
                    <span className="text-[8px] text-white/20 font-mono">2026.04.10</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] text-white/40">KEY_ROTATION</span>
                    <span className="text-[8px] text-white/20 font-mono">2026.04.12</span>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/*  FOOTER  */}
      <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center text-[8px] text-white/20 uppercase tracking-[0.5em]">
         <span>System_ID_v3.1_Production</span>
         <span>Security_Rating:_SSS</span>
      </div>

    </div>
  );
}
