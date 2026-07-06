'use client';

import { Shield, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Lock className="w-8 h-8 text-ink" />,
    title: 'Selective Disclosure',
    description: 'Provide regulators and partners with exactly the data they need to verify compliance, while keeping your proprietary supply chain data completely private using Zero-Knowledge proofs.'
  },
  {
    icon: <Shield className="w-8 h-8 text-ink" />,
    title: 'EU DPP Compliant',
    description: 'Built specifically to meet the February 2027 Battery Passport requirements and future European Digital Product Passport regulations.'
  },
  {
    icon: <Cpu className="w-8 h-8 text-ink" />,
    title: 'Powered by Aztec',
    description: 'We leverage Aztec Network\'s privacy-preserving L2 infrastructure on Ethereum to guarantee immutable, verifiable, yet completely confidential product passports.'
  }
];

export default function About() {
  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            Why Studio Provenance?
          </h2>
          <p className="text-xl text-ink/80 max-w-3xl mx-auto">
            European companies face strict new regulations like the 2027 Battery Passport, requiring them to digitize their supply chains. Studio Provenance allows you to comply with these laws without exposing your trade secrets, suppliers, or sensitive data to the public.
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
