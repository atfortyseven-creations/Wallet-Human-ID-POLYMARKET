"use client";

import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { OptimizedLocalLottie } from './OptimizedLocalLottie';
import { WaveFooter } from './WaveFooter';

export function SystemManifesto() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="relative w-full bg-[#0a0a0a] text-white pt-24 pb-0 z-20 flex flex-col items-center overflow-x-hidden selection:bg-[#00f5ff]/30"
         style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        <div className="w-full max-w-[1720px] mx-auto px-6 md:px-16 lg:px-24 relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <motion.div style={{ y: yParallax }} className="text-center max-w-4xl mx-auto mb-40 mt-32">
               <span className="text-[10px] font-mono text-[#00f5ff] uppercase tracking-[0.3em] mb-6 block">Declassified Technical Briefing</span>
               <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] text-white">
                 Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#bd00ff]">Lexicon</span>
               </h2>
               <p className="mt-8 text-neutral-400 font-medium leading-relaxed text-base md:text-xl">
                 An empirical outline of the systemic infrastructure required to transition away from centralized reliance. This document establishes the core tenets of an immutable consensus network resilient to external vector degradation.
               </p>
            </motion.div>

            {/* Sections */}
            <div className="flex flex-col gap-32 lg:gap-48 w-full">
                <ManifestoSection 
                   title="01 / Architectural Foundation" 
                   description="The basal layer of the protocol operates autonomously via decentralized cryptographic ledgers. Distributed networks ensure redundancy while asset management relies strictly on programmatic mathematical guarantees, avoiding institutional custodianship entirely."
                   lotties={[
                     { file: "Earth globe rotating with Seamless loop animation.json", title: "Global Node Distribution Geometry", desc: "Topographic dispersion of decentralized validating machines." },
                     { file: "DeeWork About Blockchain.json", title: "Decentralized Ledger Cryptography", desc: "Cryptographic hashing algorithms binding immutable chained state." },
                     { file: "Crypto coins.json", title: "Core-Resistant Asset Management", desc: "Non-custodial, peer-to-peer liquidity handling and custody vectors." }
                   ]}
                />

                <ManifestoSection 
                   title="02 / Quantitative Analytics" 
                   description="Thermodynamic telemetry processes macroscopic on-chain anomalies in real-time. By leveraging predictive isometric modeling and algorithmic auditing constraints, the protocol isolates state derivations to generate asymmetrical alpha signals before transaction finality."
                   lotties={[
                     { file: "Big Data Analytics.json", title: "Thermodynamic Telemetry", desc: "Processing raw hex-encoded block data into behavioral maps." },
                     { file: "Isometric data analysis.json", title: "Predictive Vector Modeling", desc: "Machine learning heuristics tracking whale migration patterns." },
                     { file: "A Female Employee is Reading Financial Statements.json", title: "Algorithmic Integrity Auditing", desc: "Automated verification of smart-contract liquidity reserves." }
                   ]}
                   reverse
                />

                <ManifestoSection 
                   title="03 / Institutional Execution" 
                   description="Achieving cross-border infrastructure synchronization requires zero-latency operational efficiency. Protocol scalability relies on an enterprise-grade execution framework, ensuring that consensus engines function symmetrically under immense infrastructural load logic."
                   lotties={[
                     { file: "enterprice.json", title: "Enterprise Redundancy Grid", desc: "Fail-over clustering preventing catastrophic single-point failures." },
                     { file: "Manufacturing Industry Working Staff.json", title: "Infrastructural Load Balancing", desc: "Dynamic resource allocation across synchronized cluster nodes." },
                     { file: "Business Analysis.json", title: "Yield Assessment Heuristics", desc: "Yield aggregation evaluation across diverse decentralized exchanges." },
                     { file: "Browser Loading.json", title: "Sub-Second State Synchronization", desc: "Light-client propagation over decentralized peer gossip networks." },
                     { file: "Abstract Isometric Loader #1.json", title: "Consensus State Compilation", desc: "Aggregating valid mempool injections into finalized block proposals." }
                   ]}
                />

                <ManifestoSection 
                   title="04 / Settlement Fluidity" 
                   description="The terminal phase of execution rigorously guarantees deterministic transaction finality. Overcoming geographical frictions involves atomic algorithmic settlement parameters, replacing legacy liquidity pipelines with direct peer-to-peer economic kinetic transfer layers."
                   lotties={[
                     { file: "Trade.json", title: "Algorithmic Market Execution", desc: "Programmatic order routing ensuring zero slippage and MEV resistance." },
                     { file: "Online Payment.json", title: "Frictionless Decentralized Transfer", desc: "Censorship-resistant cross-chain value transmission models." },
                     { file: "Payments.json", title: "Cross-Border Terminal Liquidity", desc: "Atomic swapping infrastructure eliminating intermediary banks." },
                     { file: "Payment Success.json", title: "Immutable Transaction Finality", desc: "Deterministic block validation proving unequivocal ownership transfer." }
                   ]}
                   reverse
                />

                <ManifestoSection 
                   title="05 / Protocol Interaction Abstractions" 
                   description="Synthesizing the global layer demands robust integration paradigms. Utilizing optimized Zero-Knowledge rollup computations, users interact securely with the computational ether. The abstract UI interface completely obfuscates the complex cryptographic reality underneath."
                   lotties={[
                     { file: "website.json", title: "Interface Abstraction Logic", desc: "Translating raw bytecode execution into human-readable topography." },
                     { file: "File Loading.json", title: "Zero-Knowledge Rollup Processing", desc: "Compressing thousands of verifications into a single mathematical proof." },
                     { file: "Share.json", title: "Distributed State Propagation", desc: "Ensuring all remote nodes possess identical consensus validation signatures." },
                     { file: "Metaverse animations.json", title: "Spatial Web3 Computations", desc: "Immersive logic layers overlaying traditional internet TCP/IP structures." }
                   ]}
                />
            </div>

            {/* Footer Summary */}
            <div className="mt-40 mb-10 max-w-4xl mx-auto flex flex-col items-center relative z-20">
                <OptimizedLocalLottie filename="successfully.json" className="w-32 h-32 mb-6" />
                <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white mb-4 text-center">Protocol Synchronized</h3>
                <p className="text-center text-neutral-500 font-medium text-sm max-w-sm mb-16">All required Lottie telemetry nodes have been successfully rendered into the DOM with strict zero-delay execution.</p>
                
                <div className="flex gap-6 justify-center opacity-30 mt-6 grayscale">
                   <OptimizedLocalLottie filename="Interactive Save & Bookmark Button with Dark Mode.json" className="w-10 h-10" />
                   <OptimizedLocalLottie filename="Ball playing.json" className="w-10 h-10" />
                   <OptimizedLocalLottie filename="Business.json" className="w-10 h-10" />
                </div>
            </div>

        </div>

        {/* Full-width Wave Footer at the bottom */}
        <WaveFooter />

    </div>
  );
}

function ManifestoSection({ title, description, lotties, reverse = false }: { title: string, description: string, lotties: {file: string, title: string, desc: string}[], reverse?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={`flex flex-col ${reverse ? 'xl:flex-row-reverse' : 'xl:flex-row'} items-start lg:items-center gap-12 xl:gap-24 w-full`}>
       
       {/* Lexicon Text Column */}
       <div className="flex-1 flex flex-col w-full z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-8 xl:mb-12"
          >
             <h3 className="text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
                {title}
             </h3>
             <p className="text-base lg:text-lg text-neutral-400 font-medium leading-relaxed max-w-2xl">
                {description}
             </p>
          </motion.div>

          <div className="flex flex-col gap-3">
             {lotties.map((lottie, index) => {
               const isActive = activeIndex === index;
               return (
                 <motion.button 
                   key={index}
                   initial={{ opacity: 0, x: reverse ? 20 : -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   viewport={{ once: true }}
                   onMouseEnter={() => setActiveIndex(index)}
                   className={`text-left p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                     ${isActive 
                        ? 'border-[#00f5ff]/30 bg-[#00f5ff]/[0.03]' 
                        : 'border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.02]'
                     }`}
                 >
                    {isActive && (
                      <motion.div layoutId={`active-highlight-${title}`} className="absolute left-0 top-0 w-1 h-full bg-[#00f5ff]" />
                    )}
                    <h4 className={`text-xs md:text-sm font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#00f5ff]' : 'text-neutral-300'}`}>
                       {lottie.title}
                    </h4>
                    <p className={`text-xs md:text-sm mt-2 transition-colors ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                       {lottie.desc}
                    </p>
                 </motion.button>
               );
             })}
          </div>
       </div>

       {/* Visual Terminal / Isolated Lottie Viewer */}
       <div className="flex-1 w-full max-w-2xl xl:max-w-full mx-auto relative hidden md:block">
          {/* Fixed-size terminal box with GPU-composited layer */}
          <div className="w-full aspect-[4/3] rounded-3xl border border-white/10 bg-[#060606] shadow-2xl relative overflow-hidden flex items-center justify-center p-8 lg:p-12"
               style={{ transform: 'translateZ(0)' }}>
             <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/5 to-transparent opacity-50 block pointer-events-none" />
             
             {/* Decorative UI elements for the terminal */}
             <div className="absolute top-4 left-4 flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             </div>
             <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/20 uppercase">
                Vector Rendering Engine | {lotties[activeIndex].file}
             </div>

             {/* ONLY render the active lottie  not all with opacity:0.
                 AnimatePresence handles the crossfade transition.
                 This reduces concurrent Lottie instances from N to 1.
             */}
             <AnimatePresence mode="wait">
               <motion.div
                 key={`${title}-${activeIndex}`}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.4 }}
                 className="absolute inset-8 flex items-center justify-center"
               >
                 <div className="w-full h-full max-w-[80%] max-h-[80%]">
                   <OptimizedLocalLottie
                     filename={lotties[activeIndex].file}
                     className="w-full h-full mix-blend-screen opacity-90"
                     isActive={true}
                   />
                 </div>
               </motion.div>
             </AnimatePresence>

          </div>
       </div>

    </div>
  );
}
