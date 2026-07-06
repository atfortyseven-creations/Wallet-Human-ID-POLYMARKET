'use client';

import { Shield, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Lock className="w-8 h-8 text-ink" />,
    title: 'Programmable Privacy',
    description: 'You choose exactly what data is encrypted and what is visible. Keep your balances and strategies entirely private while still participating in DeFi.'
  },
  {
    icon: <Cpu className="w-8 h-8 text-ink" />,
    title: 'Hybrid State',
    description: 'Perform private transactions that seamlessly interact with public Ethereum smart contracts without ever leaking your personal activity.'
  },
  {
    icon: <Shield className="w-8 h-8 text-ink" />,
    title: 'Client-Side Proving',
    description: 'Your sensitive data never leaves your device. Execute transactions locally and submit only the cryptographic proof to the network.'
  }
];

export default function About() {
  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            What is Whale Network?
          </h2>
          <p className="text-xl text-ink/80 max-w-3xl mx-auto">
            We are transforming Ethereum into a private world computer. Powered by Aztec Network, Whale Network provides native, programmable privacy at the L2 infrastructure layer using Noir ZK circuits—bringing true decentralization and confidentiality to Web3.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="border-2 border-ink p-8 bg-parchment shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="bg-chartreuse w-16 h-16 flex items-center justify-center border-2 border-ink rounded-full mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-serif font-bold text-ink mb-4">{feature.title}</h3>
              <p className="text-ink/80 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
