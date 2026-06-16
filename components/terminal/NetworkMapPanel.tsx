"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function NetworkMapPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FFFFFF] overflow-hidden relative font-sans text-[#050505] select-none">
      {/* Background Dotted Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full h-full overflow-auto no-scrollbar p-8 md:p-16 flex flex-col items-center">
        
        {/* Title Area */}
        <div className="w-full max-w-[1200px] mb-12 flex flex-col items-start">
          <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-black/40 mb-2">
            System Topology
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Architecture Map</h1>
        </div>

        <div className="w-full max-w-[1200px] flex flex-col gap-16 pb-32">
          
          {/* SECTION 1: Dual Client Architecture & Synchronization */}
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black/50 bg-white px-2 self-start border border-black/10 rounded-sm">
              1. Client Synchronization Boundary
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              
              {/* Web Domain */}
              <div className="flex flex-col p-6 border-2 border-dashed border-black/20 rounded-2xl bg-white/80 backdrop-blur-sm relative">
                <div className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-mono font-black uppercase tracking-widest text-black">
                  Web Domain (PC)
                </div>
                <div className="text-sm font-bold mb-1">HumanIDFi Web Client</div>
                <div className="text-[10px] font-mono text-black/60 mb-4">humanidfi.com · Browser Context</div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-black/5 border border-black/10 rounded text-[9px] font-mono font-bold">Session State</div>
                  <div className="px-2 py-1 bg-black/5 border border-black/10 rounded text-[9px] font-mono font-bold">Local PXE Node</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex flex-col items-center justify-center relative h-16 md:h-auto">
                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-black"></div>
                <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[2px] bg-black"></div>
                <div className="relative z-10 w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center font-mono font-black text-[10px] shadow-sm">
                  QR
                </div>
                <div className="absolute top-full mt-2 text-[8px] font-mono text-black/50 uppercase tracking-widest whitespace-nowrap text-center">
                  Out-of-band Sync<br/>ECDSA / Schnorr
                </div>
              </div>

              {/* Mobile Domain */}
              <div className="flex flex-col p-6 border-2 border-dashed border-black/20 rounded-2xl bg-white/80 backdrop-blur-sm relative">
                <div className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-mono font-black uppercase tracking-widest text-black">
                  Mobile Domain
                </div>
                <div className="text-sm font-bold mb-1">Native Authenticator</div>
                <div className="text-[10px] font-mono text-black/60 mb-4">iOS / Android · Secure Enclave</div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-black/5 border border-black/10 rounded text-[9px] font-mono font-bold">Key Custody</div>
                  <div className="px-2 py-1 bg-black/5 border border-black/10 rounded text-[9px] font-mono font-bold">Signature Gen</div>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Core Aztec Pipeline */}
          <div className="flex flex-col gap-4 mt-8">
            <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black/50 bg-white px-2 self-start border border-black/10 rounded-sm">
              2. Core Protocol Pipeline
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 p-8 border border-black/10 rounded-3xl bg-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
              
              {/* PXE */}
              <div className="flex-1 flex items-center justify-center p-4 border-2 border-dashed border-black/40 rounded-xl bg-white relative z-10">
                <span className="font-mono font-bold text-sm">Client PXE</span>
                <span className="absolute -bottom-5 text-[8px] font-mono text-black/40 uppercase tracking-widest">Private State</span>
              </div>

              {/* Line */}
              <div className="hidden md:block w-8 h-[2px] bg-black/80"></div>
              <div className="md:hidden h-6 w-[2px] bg-black/80 mx-auto"></div>

              {/* ZK */}
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-black bg-white flex items-center justify-center relative z-10 shadow-sm">
                <span className="font-mono font-black text-sm">ZK</span>
                <span className="absolute -bottom-5 text-[8px] font-mono text-black/40 uppercase tracking-widest whitespace-nowrap">Proof Gen</span>
              </div>

              {/* Line */}
              <div className="hidden md:block w-8 h-[2px] bg-black/80"></div>
              <div className="md:hidden h-6 w-[2px] bg-black/80 mx-auto"></div>

              {/* Aztec L2 */}
              <div className="flex-1 flex items-center justify-center p-4 border-2 border-solid border-black rounded-xl bg-white relative z-10 shadow-sm">
                <span className="font-mono font-bold text-sm">Aztec L2</span>
                <span className="absolute -bottom-5 text-[8px] font-mono text-black/40 uppercase tracking-widest">Rollup Layer</span>
              </div>

              {/* Line */}
              <div className="hidden md:block w-8 h-[2px] bg-black/80"></div>
              <div className="md:hidden h-6 w-[2px] bg-black/80 mx-auto"></div>

              {/* Ethereum L1 */}
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-[#050505] text-[#FFFFFF] flex items-center justify-center relative z-10 shadow-md">
                <span className="font-mono font-black text-lg">L1</span>
                <span className="absolute -bottom-5 text-[8px] font-mono text-black/40 uppercase tracking-widest">Ethereum</span>
              </div>

            </div>
          </div>

          {/* SECTION 3: System Modules Hierarchy */}
          <div className="flex flex-col gap-4 mt-8">
            <div className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-black/50 bg-white px-2 self-start border border-black/10 rounded-sm">
              3. System Modules Hierarchy
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <ModuleGroup title="Dashboard" items={[
                "Markets", "Explorer", "Roadmap", "Logs", "Identity", "Studio Provenance"
              ]} />
              
              <ModuleGroup title="Registry" items={[
                "Network Map", "Whale Network Activity", "Wallets", "Block Roots", "Circuit Roots", "Overview"
              ]} />

              <ModuleGroup title="Developers" items={[
                "API Docs", 
                <Link href="/developer/sandbox" className="text-blue-600 hover:underline">ZK Sandbox (↗)</Link>, 
                "Architecture", 
                "GitHub"
              ]} />

              <ModuleGroup title="Portfolio" items={["Aztec Identity"]} />
              
              <ModuleGroup title="Communications" items={["Whale Chat"]} />
              
              <ModuleGroup title="Token Economics" items={["QDs (Quantum Dust)"]} />

              <ModuleGroup title="Company" items={["Vision"]} />
              
              <ModuleGroup title="Regulatory" items={["Compliance Docs"]} />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ModuleGroup({ title, items }: { title: string, items: (string | React.ReactNode)[] }) {
  return (
    <div className="flex flex-col p-5 border border-black/10 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[11px] font-black uppercase tracking-widest border-b border-black/5 pb-2 mb-3">
        {title}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-mono text-black/70">
            <div className="w-1 h-1 bg-black/20 rounded-full"></div>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
