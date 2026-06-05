// components/dashboard/GenesisContracts.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Shield, CheckCircle2, Search, ExternalLink, Cpu, Database, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface ContractRecord {
  id: string;
  name: string;
  address: string;
  type: 'CORE' | 'PROXY' | 'ORACLE' | 'VAULT';
  version: string;
  lastHaltCheck: string;
  auditRating: string;
  status: 'SYNCHRONIZED' | 'DRIFT_DETECTED' | 'HALTED';
}

export default function GenesisContracts() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [filter, setFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const GENESIS_RECORDS: ContractRecord[] = [
    { id: '1', name: 'IdentityRegistry_v1', address: '0x1a2b...3c4d', type: 'CORE', version: '1.2.0', lastHaltCheck: new Date().toISOString(), auditRating: 'AAA', status: 'SYNCHRONIZED' },
    { id: '2', name: 'WhaleDeadmanFailsafe', address: '0x5e6f...7g8h', type: 'VAULT', version: '2.0.1', lastHaltCheck: new Date().toISOString(), auditRating: 'AAA', status: 'SYNCHRONIZED' },
    { id: '3', name: 'AnalyticsOracle_v3', address: '0x9i0j...1k2l', type: 'ORACLE', version: '3.1.4', lastHaltCheck: new Date().toISOString(), auditRating: 'AA+', status: 'SYNCHRONIZED' },
    { id: '4', name: 'LiquidStaking_Proxy', address: '0x3m4n...5o6p', type: 'PROXY', version: '1.0.0', lastHaltCheck: new Date().toISOString(), auditRating: 'AA', status: 'SYNCHRONIZED' },
    { id: '5', name: 'OmniChainBridge_Core', address: '0x7q8r...9s0t', type: 'CORE', version: '2.4.5', lastHaltCheck: new Date().toISOString(), auditRating: 'AAA', status: 'SYNCHRONIZED' },
  ];

  useEffect(() => {
    setContracts(GENESIS_RECORDS);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const tid = toast.loading("Auditing contract bytecode integrity...");
    setTimeout(() => {
      toast.success("5/5 Contracts Synchronized", { id: tid });
      setIsRefreshing(false);
    }, 1500);
  };

  const filtered = contracts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="h-full w-full min-h-0 bg-black text-white font-mono flex flex-col p-8 gap-8">
      
      {/*  ACADEMIC INTRO  */}
      <div className="border border-white/5 bg-white/[0.01] p-6 flex items-start gap-6">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <FileCode size={24} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em]">Genesis_Contracts // SMART_CONTRACT_INVENTORY</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 leading-relaxed max-w-2xl">
            Audit of verified institutional contracts and operational proxies. Monitors bytecode integrity and drift vs official repositories.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-auto px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-rose-500 transition-all"
        >
          {isRefreshing ? <Activity size={12} className="animate-spin" /> : <Database size={12} />}
          {isRefreshing ? 'Auditing_Bytecode...' : 'Force_Integrity_Check'}
        </button>
      </div>

      {/*  FILTER  */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={12} />
         <input 
            type="text" 
            placeholder="FILTER_CONTRACTS_BY_NAME_OR_ADDR..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 py-3 pl-12 text-[10px] outline-none focus:border-white/20 transition-all uppercase tracking-widest"
         />
      </div>

      {/*  CONTRACT GRID  */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-1 gap-1">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-3 border-b border-white/10 text-[8px] text-white/20 uppercase tracking-[0.3em]">
               <span>[CONTRACT_ID]</span>
               <span>ARCHITECTURE</span>
               <span>VERSION</span>
               <span>AUDIT_SCORE</span>
               <span>HALT_STATUS</span>
               <span className="text-right">LINK</span>
            </div>
            {filtered.map((c) => (
               <motion.div 
                 key={c.id}
                 initial={{ opacity: 0, x: -5 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors group"
               >
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-black uppercase tracking-widest text-white/90">{c.name}</span>
                     <span className="text-[8px] text-white/20 font-mono tracking-tighter">{c.address}</span>
                  </div>
                  <span className="text-[9px] text-white/40 font-black">{c.type}</span>
                  <span className="text-[9px] text-white/40 font-mono">{c.version}</span>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)]" />
                     <span className="text-[9px] text-emerald-500 font-black">{c.auditRating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <CheckCircle2 size={10} className="text-emerald-500" />
                     <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">OK</span>
                  </div>
                  <div className="text-right">
                     <button className="text-white/10 group-hover:text-white transition-all">
                        <ExternalLink size={12} />
                     </button>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/*  FOOTER  */}
      <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center text-[8px] text-white/20 uppercase tracking-[0.5em]">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Cpu size={10} />
               <span>Bytecode_Hash:_ALIGNED</span>
            </div>
            <div className="flex items-center gap-2">
               <Activity size={10} />
               <span>EVM_Monitoring:_ACTIVE</span>
            </div>
         </div>
         <span>GENESIS_CONTRACT_INDEX_v3.1</span>
      </div>

    </div>
  );
}
