'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: "Is Whale Network fully decentralized?",
    a: "Yes. Whale Network operates with its own decentralized sequencer set and bridges directly to Ethereum L1, inheriting its finality and security without centralized points of failure."
  },
  {
    q: "How does it protect my privacy?",
    a: "We use zero-knowledge proofs (zk-SNARKs) computed entirely on your device. Only a mathematical proof is sent to the network, meaning nobody—not even the sequencers—can see your balances or transaction details."
  },
  {
    q: "Can I use existing Ethereum apps on Whale Network?",
    a: "Through our Hybrid State architecture, you can execute private logic that seamlessly interacts with public Ethereum contracts. It's the best of both worlds."
  },
  {
    q: "When will the mobile apps launch?",
    a: "El día 1 de enero de 2027, las primeras apps (Whale Chat, Portfolio y Markets) se subirán oficialmente a la App Store y Google Play, perfectamente renderizadas y listas para todo el público."
  }
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-12 text-center">
          Questions & Answers
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-2 border-ink bg-parchment shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none hover:bg-chartreuse/20 transition-colors"
              >
                <h3 className="font-bold text-xl text-ink font-serif">{faq.q}</h3>
                {openIdx === idx ? <ChevronUp className="w-6 h-6 text-ink" /> : <ChevronDown className="w-6 h-6 text-ink" />}
              </button>
              
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t-2 border-ink"
                  >
                    <div className="p-6 text-ink/80 text-lg">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
