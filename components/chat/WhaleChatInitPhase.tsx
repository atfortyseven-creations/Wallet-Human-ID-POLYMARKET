"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { Delete } from 'lucide-react';

export default function WhaleChatInitPhase({ onComplete }: { onComplete: () => void }) {
  const { address } = useSystemAccount();
  const [phase, setPhase] = useState<'CHECKING' | 'CREATE' | 'CONFIRM' | 'VERIFY'>('CHECKING');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [errorText, setErrorText] = useState('');

  const PIN_LENGTH = 4;

  useEffect(() => {
    if (!address) return;
    const stored = localStorage.getItem(`whale_pin_${address.toLowerCase()}`);
    if (stored) {
      setPhase('VERIFY');
    } else {
      setPhase('CREATE');
    }
  }, [address]);

  // Very simple irreversible hash for local storage security
  const hashPin = async (rawPin: string) => {
    const msgUint8 = new TextEncoder().encode(rawPin + "whale_salt");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleKeyPress = async (key: string) => {
    if (pin.length >= PIN_LENGTH && key !== 'backspace') return;
    
    setErrorText('');
    
    if (key === 'backspace') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      if (phase === 'CREATE') {
        setTimeout(() => {
          setFirstPin(newPin);
          setPin('');
          setPhase('CONFIRM');
        }, 200);
      } else if (phase === 'CONFIRM') {
        if (newPin === firstPin) {
          const hashed = await hashPin(newPin);
          localStorage.setItem(`whale_pin_${address?.toLowerCase()}`, hashed);
          onComplete();
        } else {
          setErrorText('PINs do not match');
          setTimeout(() => {
            setPin('');
            setFirstPin('');
            setPhase('CREATE');
          }, 800);
        }
      } else if (phase === 'VERIFY') {
        const stored = localStorage.getItem(`whale_pin_${address?.toLowerCase()}`);
        const hashed = await hashPin(newPin);
        if (stored === hashed) {
          onComplete();
        } else {
          setErrorText('Incorrect PIN');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  if (phase === 'CHECKING') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[250] flex flex-col items-center justify-between bg-white text-black px-6 pt-16 pb-12"
      style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <div className="flex flex-col items-center w-full max-w-sm mt-12">
        {/* Lottie Animation */}
        <div className="w-24 h-24 mb-6">
          <RemoteLottie
            path="/system-shots/LOTTIECHAT/f11799a0-d141-11ee-97cd-efa7b53770fd.json"
            className="w-full h-full"
          />
        </div>

        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-2">
          {phase === 'CREATE' ? 'Setup Passcode' : phase === 'CONFIRM' ? 'Confirm Passcode' : 'Enter Passcode'}
        </h2>
        
        <p className="text-[10px] md:text-[11px] font-mono text-black/40 uppercase tracking-[0.1em] mb-12 h-4">
          {errorText ? (
            <span className="text-red-500 font-bold">{errorText}</span>
          ) : phase === 'CREATE' ? (
            'Secure your local encrypted keys'
          ) : phase === 'CONFIRM' ? (
            'Please re-enter to confirm'
          ) : (
            'Unlock Whale Chat Protocol'
          )}
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center gap-6 mb-16">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                i < pin.length ? 'bg-black border-black scale-110' : 'bg-transparent border-black/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-y-6 gap-x-4 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="h-16 flex items-center justify-center text-3xl font-black text-black hover:bg-black/5 active:bg-black/10 rounded-2xl transition-colors"
          >
            {num}
          </button>
        ))}
        <div /> {/* Empty space */}
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 flex items-center justify-center text-3xl font-black text-black hover:bg-black/5 active:bg-black/10 rounded-2xl transition-colors"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('backspace')}
          className="h-16 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 active:bg-black/10 rounded-2xl transition-colors"
        >
          <Delete size={28} strokeWidth={2} />
        </button>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center gap-2 mt-auto">
        <span className="w-1.5 h-1.5 bg-black rounded-full" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/30">End-to-End Encrypted</span>
      </div>
    </motion.div>
  );
}
