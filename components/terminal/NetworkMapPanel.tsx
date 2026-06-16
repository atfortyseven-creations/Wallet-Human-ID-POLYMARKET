"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function NetworkMapPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FDFCFB] overflow-x-hidden overflow-y-auto no-scrollbar relative font-sans text-[#050505] select-none">
      {/* Background Dotted Grid - Premium Minimalist */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full min-h-full p-6 md:p-12 lg:p-20 flex flex-col items-center">
        
        {/* Title Area */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[1400px] mb-16 md:mb-24 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.4em] text-black/40 mb-4 px-4 py-1.5 border border-black/10 rounded-full bg-white/50 backdrop-blur-sm shadow-sm inline-block">
            System Topology
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter leading-none text-black drop-shadow-sm">
            Architecture <span className="text-black/30">Map</span>
          </h1>
          <p className="mt-6 text-sm md:text-base text-black/60 font-medium max-w-2xl leading-relaxed">
            A high-level technical overview of the Whale Network infrastructure, spanning from dual-client synchronization to the core Aztec Protocol pipeline on Ethereum L1.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[1400px] flex flex-col gap-24 lg:gap-32 pb-32"
        >
          {/* ==========================================
              SECTION 1: CLIENT BOUNDARY 
             ========================================== */}
          <div className="relative flex flex-col w-full">
            {/* Background Container for Section */}
            <div className="absolute -inset-8 md:-inset-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] z-0" />
            
            <div className="relative z-10 w-full">
              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black font-mono shadow-lg">1</div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Client Boundary</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent ml-4" />
              </motion.div>
              
              <div className="flex flex-col xl:flex-row items-center justify-between gap-12 lg:gap-16 w-full">
                
                {/* Desktop Web Client */}
                <motion.div variants={itemVariants} className="w-full xl:w-[45%] flex flex-col p-8 md:p-10 border border-black/[0.08] rounded-3xl bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v12H4zM2 6c0-1.1.9-2 2-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v2h2V8H6z"/></svg>
                  </div>
                  <div className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.3em] text-black/50 mb-4">Web Domain (PC)</div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2">Whale Web Client</h3>
                  <p className="text-sm text-black/60 font-mono mb-8 break-words">whalenetwork.io • Browser Context</p>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <span className="px-4 py-2 bg-[#F5F5F5] border border-black/5 rounded-lg text-[10px] md:text-xs font-bold font-mono text-black/80">Session State</span>
                    <span className="px-4 py-2 bg-[#F5F5F5] border border-black/5 rounded-lg text-[10px] md:text-xs font-bold font-mono text-black/80">Local PXE Node</span>
                  </div>
                </motion.div>

                {/* Connection Mechanism */}
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center relative w-full xl:w-auto shrink-0 py-8 xl:py-0">
                  {/* Connecting lines */}
                  <div className="hidden xl:block absolute top-1/2 left-[-100px] lg:left-[-150px] w-[100px] lg:w-[150px] h-[2px] bg-gradient-to-r from-black/20 to-black/80" />
                  <div className="hidden xl:block absolute top-1/2 right-[-100px] lg:right-[-150px] w-[100px] lg:w-[150px] h-[2px] bg-gradient-to-l from-black/20 to-black/80" />
                  <div className="xl:hidden absolute top-[-50px] left-1/2 w-[2px] h-[50px] bg-gradient-to-b from-black/20 to-black/80" />
                  <div className="xl:hidden absolute bottom-[-50px] left-1/2 w-[2px] h-[50px] bg-gradient-to-t from-black/20 to-black/80" />
                  
                  <div className="w-20 h-20 bg-black text-white rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.2)] z-10 relative group cursor-crosshair hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                    <span className="font-mono font-black text-xl">QR</span>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-[10px] md:text-xs font-mono font-bold text-black uppercase tracking-widest">Out-of-band Sync</div>
                    <div className="text-[9px] font-mono text-black/50 uppercase tracking-widest mt-1">ECDSA / Schnorr</div>
                  </div>
                </motion.div>

                {/* Mobile Authenticator */}
                <motion.div variants={itemVariants} className="w-full xl:w-[45%] flex flex-col p-8 md:p-10 border border-black/[0.08] rounded-3xl bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                     <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h10V4H7zm4 13h2v2h-2v-2z"/></svg>
                  </div>
                  <div className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.3em] text-black/50 mb-4">Mobile Domain</div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2">Native Authenticator</h3>
                  <p className="text-sm text-black/60 font-mono mb-8">iOS / Android • Secure Enclave</p>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <span className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-900 rounded-lg text-[10px] md:text-xs font-bold font-mono">Key Custody</span>
                    <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-lg text-[10px] md:text-xs font-bold font-mono">Signature Gen</span>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>

          {/* ==========================================
              SECTION 2: CORE PROTOCOL PIPELINE 
             ========================================== */}
          <div className="relative flex flex-col w-full mt-12">
            <div className="absolute -inset-8 md:-inset-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.05)] z-0" />
            
            <div className="relative z-10 w-full">
              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-16">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-black font-mono shadow-lg">2</div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Protocol Pipeline</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-black/10 to-transparent ml-4" />
              </motion.div>

              <motion.div variants={itemVariants} className="relative w-full rounded-3xl bg-white border border-black/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 overflow-visible">
                
                {/* Continuous Background Line for Desktop */}
                <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-[4px] bg-black/10 -translate-y-1/2 rounded-full z-0 overflow-hidden">
                   <motion.div 
                     className="w-1/3 h-full bg-gradient-to-r from-transparent via-black to-transparent opacity-50"
                     animate={{ x: ['-100%', '300%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   />
                </div>
                
                {/* Vertical Line for Mobile */}
                <div className="lg:hidden absolute left-1/2 top-[10%] bottom-[10%] w-[4px] bg-black/10 -translate-x-1/2 rounded-full z-0 overflow-hidden">
                   <motion.div 
                     className="h-1/3 w-full bg-gradient-to-b from-transparent via-black to-transparent opacity-50"
                     animate={{ y: ['-100%', '300%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   />
                </div>

                {/* Node 1: Client PXE */}
                <div className="relative z-10 flex flex-col items-center group w-full lg:w-1/4">
                  <div className="w-full max-w-[280px] h-28 md:h-32 bg-white border-2 border-dashed border-black/40 rounded-2xl flex flex-col items-center justify-center shadow-md group-hover:border-black transition-colors duration-300">
                    <span className="font-mono font-black text-xl md:text-2xl text-black">Client PXE</span>
                  </div>
                  <div className="mt-6 p-4 bg-white border border-black/5 rounded-xl shadow-sm text-center w-full max-w-[280px]">
                    <span className="block text-[10px] md:text-xs font-mono text-black/50 uppercase tracking-[0.2em] font-bold">Execution Environment</span>
                    <span className="block text-sm font-bold mt-1 text-black/80">Private State</span>
                  </div>
                </div>

                {/* Node 2: ZK Prover */}
                <div className="relative z-10 flex flex-col items-center group w-full lg:w-1/5 py-8 lg:py-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-[3px] border-black rounded-full flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <span className="font-mono font-black text-2xl md:text-3xl text-black">ZK</span>
                  </div>
                  <div className="mt-6 p-4 bg-white border border-black/5 rounded-xl shadow-sm text-center w-full max-w-[240px]">
                     <span className="block text-[10px] md:text-xs font-mono text-black/50 uppercase tracking-[0.2em] font-bold">Cryptography</span>
                     <span className="block text-sm font-bold mt-1 text-black/80">Proof Generation</span>
                  </div>
                </div>

                {/* Node 3: Aztec L2 */}
                <div className="relative z-10 flex flex-col items-center group w-full lg:w-1/4">
                  <div className="w-full max-w-[280px] h-28 md:h-32 bg-white border-2 border-black rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="font-mono font-black text-2xl md:text-3xl text-black relative z-10">Aztec L2</span>
                  </div>
                  <div className="mt-6 p-4 bg-white border border-black/5 rounded-xl shadow-sm text-center w-full max-w-[280px]">
                    <span className="block text-[10px] md:text-xs font-mono text-black/50 uppercase tracking-[0.2em] font-bold">Network</span>
                    <span className="block text-sm font-bold mt-1 text-black/80">Rollup Layer</span>
                  </div>
                </div>

                {/* Node 4: Ethereum L1 */}
                <div className="relative z-10 flex flex-col items-center group w-full lg:w-1/4">
                  <div className="w-28 h-28 md:w-36 md:h-36 bg-black rounded-[2rem] flex flex-col items-center justify-center shadow-2xl group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 border border-white/20 rounded-[2rem] m-2 pointer-events-none" />
                    <span className="font-mono font-black text-4xl md:text-5xl text-white">L1</span>
                  </div>
                  <div className="mt-6 p-4 bg-white border border-black/5 rounded-xl shadow-sm text-center w-full max-w-[280px]">
                    <span className="block text-[10px] md:text-xs font-mono text-black/50 uppercase tracking-[0.2em] font-bold">Settlement</span>
                    <span className="block text-sm font-bold mt-1 text-black/80">Ethereum Mainnet</span>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
