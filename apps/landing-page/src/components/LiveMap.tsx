'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Generate some random positions for "wallets connecting"
const generatePings = (count: number) => {
  return Array.from({ length: count }).map((_idx, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
  }));
};

export default function LiveMap() {
  const [pings, setPings] = useState<{id: number, x: number, y: number, delay: number}[]>([]);

  useEffect(() => {
    const initTimer = setTimeout(() => setPings(generatePings(15)), 0);
    const interval = setInterval(() => {
      setPings(generatePings(Math.floor(Math.random() * 10) + 10));
    }, 6000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="py-24 px-4 bg-parchment border-b-2 border-ink overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            Global Adoption, Real-Time.
          </h2>
          <p className="text-xl text-ink/80 max-w-3xl mx-auto">
            Watch the Ledger Network grow as new wallets connect globally. Completely decentralized, radically transparent on the macro level, completely private on the micro level.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[600px] border-2 border-ink bg-parchment rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Abstract World Map Grid (Light mode friendly) */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-multiply"></div>
          
          {pings.map((ping) => (
            <motion.div
              key={ping.id}
              className="absolute w-3 h-3 bg-orchid rounded-full shadow-[0_0_15px_5px_rgba(255,45,244,0.5)]"
              style={{ left: `${ping.x}%`, top: `${ping.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 2, 0],
                opacity: [0, 1, 0, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: ping.delay,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Map Overlay Text */}
          <div className="absolute bottom-6 left-6 font-mono text-sm text-ink font-bold bg-parchment/80 p-2 border-2 border-ink">
            <p>LIVE CONNECTIONS: {pings.length * 342} / HR</p>
            <p>NETWORK STATUS: OPTIMAL</p>
          </div>
        </div>
      </div>
    </section>
  );
}
