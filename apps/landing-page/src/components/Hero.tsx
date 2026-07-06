'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactModal from './ContactModal';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden border-b-2 border-ink">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto z-10"
      >
        <h1 className="text-6xl md:text-8xl font-serif font-semibold tracking-tight text-ink mb-6">
          Digital Product<br/>Passports with Privacy.
        </h1>
        
        <p className="text-xl md:text-2xl text-ink/80 max-w-2xl mx-auto mb-10 font-sans">
          Comply with the 2027 EU Battery Passport regulation without exposing your sensitive supply chain data. Built on Aztec Network.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#pricing" className="bg-chartreuse text-ink px-8 py-4 text-lg font-bold border-2 border-ink hover:bg-ink hover:text-parchment transition-colors uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center">
            Start Compliance Pilot
          </a>
          <button onClick={() => setIsModalOpen(true)} className="bg-orchid text-parchment px-8 py-4 text-lg font-bold border-2 border-ink hover:bg-ink hover:text-parchment transition-colors uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
            Book a Demo
          </button>
        </div>
      </motion.div>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Decorative Elements matching Aztec's style */}
      <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-ink/20 rounded-tl-3xl hidden md:block" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-ink/20 rounded-br-3xl hidden md:block" />
    </section>
  );
}
