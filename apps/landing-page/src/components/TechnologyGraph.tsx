'use client';

import { motion } from 'framer-motion';

const techStack = [
  { category: 'Privacy Layer', name: 'Aztec Network', desc: 'Zero-knowledge rollups' },
  { category: 'Base Settlement', name: 'Ethereum L1', desc: 'Global finality & security' },
  { category: 'Data Availability', name: 'EigenDA', desc: 'Ultra-high throughput DA' },
  { category: 'Client Proving', name: 'Noir', desc: 'Universal ZK programming' },
  { category: 'Web App', name: 'Next.js 15', desc: 'App router & React Server Components' },
  { category: 'Authentication', name: 'WalletConnect / AppKit', desc: 'EIP-4361 / Session keys' },
];

export default function TechnologyGraph() {
  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            The Technology Engine
          </h2>
          <p className="text-xl text-ink/80 max-w-3xl mx-auto">
            A radical synthesis of privacy primitives and decentralized infrastructure. No compromises on security.
          </p>
        </div>

        <div className="relative p-8 border-4 border-ink bg-parchment shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          {/* Abstract node connections background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="20" y1="20" x2="50" y2="50" stroke="#1A1400" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="80" y1="20" x2="50" y2="50" stroke="#1A1400" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="50" y1="50" x2="50" y2="80" stroke="#1A1400" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="20" y1="80" x2="50" y2="50" stroke="#1A1400" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="80" y1="80" x2="50" y2="50" stroke="#1A1400" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {techStack.map((tech, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-2 border-ink p-6 bg-parchment hover:bg-chartreuse transition-colors group cursor-default"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-ink/50 group-hover:text-ink/70 mb-2">
                  {tech.category}
                </div>
                <h3 className="text-2xl font-serif font-bold text-ink mb-2">{tech.name}</h3>
                <p className="text-ink/80 text-sm font-sans">
                  {tech.desc}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 p-6 border-2 border-ink bg-orchid text-parchment text-center font-bold font-sans uppercase tracking-widest">
            100% Open Source Architecture
          </div>
        </div>
      </div>
    </section>
  );
}
