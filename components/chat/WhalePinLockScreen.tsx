"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';

interface WhalePinLockScreenProps {
  onVerify: (pin: string) => Promise<boolean>;
  lockError: string | null;
  isSetupMode?: boolean;
  onSetup?: (pin: string) => Promise<boolean>;
}

const PIN_LENGTH = 6;

export function WhalePinLockScreen({ onVerify, lockError, isSetupMode = false, onSetup }: WhalePinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>(isSetupMode ? 'enter' : 'enter');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    setPin(prev => prev + digit);
    setLocalError(null);
  }, [pin.length]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setLocalError(null);
  }, []);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length < PIN_LENGTH) return;

    const timer = setTimeout(async () => {
      if (isSetupMode && onSetup) {
        if (setupStep === 'enter') {
          setConfirmPin(pin);
          setPin('');
          setSetupStep('confirm');
        } else {
          // confirm step
          if (pin !== confirmPin) {
            setLocalError('PINs do not match. Try again.');
            setPin('');
            setConfirmPin('');
            setSetupStep('enter');
            setShakeKey(k => k + 1);
          } else {
            const ok = await onSetup(pin);
            if (ok) setSuccess(true);
            else setLocalError('Failed to save PIN.');
          }
        }
      } else {
        const ok = await onVerify(pin);
        if (!ok) {
          setPin('');
          setShakeKey(k => k + 1);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pin, isSetupMode, setupStep, confirmPin, onVerify, onSetup]);

  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => i < pin.length);

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[99999] bg-black flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          ✅
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[99999] bg-[#1c1c1e] flex flex-col items-center justify-center p-8 select-none"
    >
      {/* Whale branding */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="text-5xl">🐋</div>
        <h1 className="text-[22px] font-black text-white tracking-tight">
          {isSetupMode ? (setupStep === 'confirm' ? 'Confirm PIN' : 'Set PIN') : 'Ledger Chat Locked'}
        </h1>
        <p className="text-[13px] text-white/40 font-medium">
          {isSetupMode
            ? setupStep === 'confirm'
              ? 'Re-enter your PIN to confirm'
              : 'Choose a secure 6-digit PIN'
            : 'Enter your PIN to continue'}
        </p>
      </motion.div>

      {/* PIN Dots */}
      <motion.div
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center gap-4 mb-6"
      >
        {dots.map((filled, i) => (
          <motion.div
            key={i}
            animate={filled ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.15 }}
            className={`w-4 h-4 rounded-full border-2 transition-all ${filled ? 'bg-white border-white' : 'bg-transparent border-white/30'}`}
          />
        ))}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {(lockError || localError) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[13px] text-red-400 font-bold mb-4 text-center"
          >
            {localError || lockError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />;

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (d === '⌫') handleDelete();
                else handleDigit(d);
              }}
              className={`aspect-square flex items-center justify-center rounded-full text-white font-black text-[22px] transition-colors ${
                d === '⌫'
                  ? 'text-white/50 hover:text-white active:bg-white/10'
                  : 'bg-white/10 hover:bg-white/20 active:bg-white/30'
              }`}
            >
              {d === '⌫' ? <Delete size={22} className="text-white/60" /> : d}
            </motion.button>
          );
        })}
      </div>

      {/* Skip / Later */}
      {!isSetupMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 text-[13px] text-white/30 font-medium hover:text-white/60 transition-colors"
        >
          Use Biometrics Instead
        </motion.button>
      )}
    </motion.div>
  );
}
