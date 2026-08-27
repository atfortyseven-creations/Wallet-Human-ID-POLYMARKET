'use client';

import { motion } from 'framer-motion';
import { MessageSquare, PieChart, Store, Palette } from 'lucide-react';

const apps = [
  {
    title: 'LedgerChat',
    description: 'Encrypted, untraceable communication native to the Ethereum ecosystem.',
    icon: <MessageSquare className="w-10 h-10 text-ink" />,
    color: 'bg-aqua'
  },
  {
    title: 'Portfolio',
    description: 'Track your holdings and DeFi positions privately. Only you hold the viewing keys.',
    icon: <PieChart className="w-10 h-10 text-ink" />,
    color: 'bg-orchid'
  },
  {
    title: 'Markets',
    description: 'Access deep liquidity and trade assets without revealing your strategies to the public.',
    icon: <Store className="w-10 h-10 text-ink" />,
    color: 'bg-vermillion'
  },
  {
    title: 'Studio Provenance',
    description: 'Deploy verifiable but private smart contracts with zero-knowledge tooling out of the box.',
    icon: <Palette className="w-10 h-10 text-ink" />,
    color: 'bg-chartreuse'
  }
];

export default function Ecosystem() {
  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
              The Ecosystem,<br/>Ready for Mainstream.
            </h2>
            <p className="text-xl text-ink/80 mb-8">
              We are building a suite of standalone, consumer-ready applications that leverage the Ledger Network privacy layer. El día 1 de enero de 2027, las primeras apps (LedgerChat, Portfolio y Markets) se subirán oficialmente a la App Store y Google Play, perfectamente renderizadas y listas para todo el público.
            </p>
            <button className="bg-ink text-parchment px-8 py-4 text-lg font-bold border-2 border-ink hover:bg-transparent hover:text-ink transition-colors uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
              Join the Waitlist
            </button>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {apps.map((app, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="border-2 border-ink p-6 bg-parchment relative group"
              >
                <div className={`absolute -inset-2 ${app.color} opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-lg`} />
                <div className={`${app.color} w-16 h-16 flex items-center justify-center border-2 border-ink rounded-lg mb-6`}>
                  {app.icon}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">{app.title}</h3>
                <p className="text-ink/80 text-sm">
                  {app.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
