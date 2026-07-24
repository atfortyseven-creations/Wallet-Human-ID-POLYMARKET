"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

export function AztecWTFSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section ref={ref} className="w-full bg-[#FAFAFA] border-t border-black/[0.05] py-24 md:py-32">
      <div className="w-full max-w-[900px] mx-auto px-6">
        
        {/* Intro */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} className="mb-16 md:mb-24 text-center">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black/40 block mb-4">
            Fundamental Manifesto
          </span>
          <h2 className="text-[40px] md:text-[72px] font-bold tracking-tight leading-[1.05] text-black mb-6" style={{ fontFamily: 'var(--font-aztec-serif), Georgia, serif' }}>
            WTF is Aztec?
          </h2>
          <p className="text-[18px] md:text-[24px] text-black/60 leading-relaxed font-medium max-w-2xl mx-auto">
            Blockchains like Bitcoin and Ethereum provide humanity with programmable digital money. Aztec enables a critical dimension that has heretofore been ignored: <strong className="text-black">privacy.</strong>
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} custom={0.1} className="w-full rounded-[24px] overflow-hidden bg-black/5 border border-black/10 mb-20 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <img src="https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574/68aefb9095a0a1447e9d5536_Aztec%20Blog%20Template_Archive.webp" alt="Aztec Concept" className="w-full h-auto object-cover" />
        </motion.div>

        {/* What is it */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} custom={0.15} className="mb-20">
          <h3 className="text-[28px] md:text-[40px] font-bold text-black mb-6 tracking-tight">What is Aztec?</h3>
          <p className="text-[17px] md:text-[19px] text-black/70 leading-relaxed mb-6">
            Aztec is a <strong className="text-black">privacy-first</strong> Layer 2 on Ethereum. It uses advanced zero-knowledge (ZK) cryptography to ensure that your transactions, identity, and balances remain entirely confidential, while still inheriting the uncompromisable security of the Ethereum mainnet.
          </p>
          <img src="https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574/68a35dcfe6c0178ab9ab92d4_65d8b665f2958ed62f9ed3f7_image-7.webp" alt="L2 Ecosystem" className="w-full rounded-[16px] my-10 border border-black/5" />
        </motion.div>

        {/* The Mission */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} custom={0.2} className="mb-20">
          <h3 className="text-[28px] md:text-[40px] font-bold text-black mb-6 tracking-tight">The Mission</h3>
          <p className="text-[17px] md:text-[19px] text-black/70 leading-relaxed mb-6">
            To build the world&apos;s first global, sovereign private state computer. In the traditional Web2 world, you surrender your data to corporate silos. In public Web3, you expose your entire financial and social history to any observer on the planet.
          </p>
          <p className="text-[17px] md:text-[19px] text-black/70 leading-relaxed mb-10">
            Aztec shatters this false dichotomy. It allows individuals to maintain absolute ownership and privacy by default. We are writing software that verifies cryptographic properties without ever revealing the underlying data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <img src="https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574/6a43f0c5d58842c195813081_bargain.webp" alt="Web2 Bargain" className="w-full rounded-[16px] border border-black/5 object-cover h-full" />
             <img src="https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574/6a43f3663656490e3cfc2585_txn.webp" alt="Web3 Public Tx" className="w-full rounded-[16px] border border-black/5 object-cover h-full" />
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} custom={0.25} className="mb-20">
          <h3 className="text-[28px] md:text-[40px] font-bold text-black mb-6 tracking-tight">How it Works</h3>
          <p className="text-[17px] md:text-[19px] text-black/70 leading-relaxed mb-6">
            Aztec consists of several technological layers operating in perfect harmony to achieve programmable privacy:
          </p>
          
          <div className="space-y-8 mt-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold shrink-0">1</div>
              <div>
                <h4 className="text-[20px] font-bold text-black mb-2">Noir (The Universal ZK Language)</h4>
                <p className="text-black/60 leading-relaxed">
                  The universal language for writing Zero-Knowledge applications. It compiles down to cryptographic circuits that can prove any complex logic without ever revealing the private inputs (like your identity or balance).
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold shrink-0">2</div>
              <div>
                <h4 className="text-[20px] font-bold text-black mb-2">PXE (Private Execution Environment)</h4>
                <p className="text-black/60 leading-relaxed">
                  Your local device acts as the prover node. Your keys generate the zero-knowledge proof *before* any data ever leaves your phone or PC. The network only sees the cryptographic proof, never the data.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold shrink-0">3</div>
              <div>
                <h4 className="text-[20px] font-bold text-black mb-2">The Aztec Rollup</h4>
                <p className="text-black/60 leading-relaxed">
                  A parallel state machine where Private State (encrypted UTXOs) and Public State interact seamlessly in a single transaction. The Rollup sequencer compresses thousands of these client-side proofs and settles them securely on Ethereum.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conclusion image */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} custom={0.3} className="w-full">
          <img src="https://cdn.prod.website-files.com/6853ac4c855c81d9ecabc574/6a5f540122f0906f82bbdf1e_alpha-og.webp" alt="Aztec Alpha" className="w-full rounded-[24px] border border-black/10" />
        </motion.div>

      </div>
    </section>
  );
}
