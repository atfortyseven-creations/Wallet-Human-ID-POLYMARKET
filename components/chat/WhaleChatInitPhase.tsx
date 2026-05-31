"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { ShieldCheck, Cpu, Network, Lock, Zap, Server, Globe, Key, CheckCircle } from 'lucide-react';

const PHASES = [
  { id: 1, label: "Bootstrapping P2P Nodes", icon: Network },
  { id: 2, label: "Verifying On-Chain Identity", icon: ShieldCheck },
  { id: 3, label: "Negotiating E2E Encryption Keys", icon: Key },
  { id: 4, label: "Establishing Secure Tunnels", icon: Globe },
  { id: 5, label: "Synchronizing Decentralized Inbox", icon: Server },
  { id: 6, label: "Resolving ENS Protocols", icon: Cpu },
  { id: 7, label: "Loading Encrypted Storage", icon: Lock },
  { id: 8, label: "Finalizing Zero-Knowledge Proofs", icon: Zap },
  { id: 9, label: "Connection Established", icon: CheckCircle },
];

export default function WhaleChatInitPhase({ onComplete }: { onComplete: () => void }) {
  const [currentPhase, setCurrentPhase] = useState(0);
  // [FIX] Capture onComplete in a ref so the effect never re-runs due to
  // parent re-renders creating a new arrow-function reference each time.
  // Without this, the effect restarted on every render and never completed.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let isMounted = true;
    
    const runPhases = async () => {
      for (let i = 0; i < PHASES.length; i++) {
        // Complex variable timing to simulate heavy on-chain cryptographic operations
        const delay = 600 + Math.random() * 800;
        await new Promise(r => setTimeout(r, delay));
        if (!isMounted) return;
        setCurrentPhase(i);
      }
      
      // Final delay before transitioning to chat
      await new Promise(r => setTimeout(r, 1200));
      if (isMounted) onCompleteRef.current();
    };

    runPhases();

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: run once on mount only

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-white"
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full max-w-[500px] px-6 flex flex-col items-center">
        {/* Core Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="w-48 h-48 mb-10 relative"
        >
          <RemoteLottie path="/system-shots/block abstract.json" loop={true} className="w-full h-full object-contain mix-blend-multiply opacity-90" />
        </motion.div>
      </div>
    </motion.div>
  );
}
