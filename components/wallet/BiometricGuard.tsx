"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, X } from 'lucide-react';
import { checkBiometricAvailability, authenticateBiometric, registerBiometric } from '@/lib/wallet/biometrics';

interface BiometricGuardProps {
  children: React.ReactNode;
  reason?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BiometricGuard({ children, reason = "Unlock Wallet", onSuccess, onCancel }: BiometricGuardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const status = await checkBiometricAvailability();
    setIsAvailable(status.isAvailable);
    if (!status.isAvailable) {
      setIsLocked(false); // Fallback to open if no biometrics (in production, fallback to password)
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authenticateBiometric();
      if (result.success) {
        setIsLocked(false);
        onSuccess?.();
      } else {
        setError(result.msg || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerBiometric("My Device");
      if (result.success) {
        // Once registered, try unlocking immediately
        handleUnlock();
      } else {
        setError(result.msg || "Registration failed");
      }
    } catch (err) {
      setError("Registration error");
    } finally {
      setLoading(false);
    }
  };

  // If unlocked or no biometrics, show children
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[200px] bg-[#EAEADF] rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 text-center border-2 border-[#1F1F1F]/10">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xs w-full"
      >
        <div className="w-20 h-20 bg-[#1F1F1F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Fingerprint size={40} className="text-[#EAEADF]" />
        </div>

        <h3 className="text-2xl font-black text-[#1F1F1F] mb-2">{reason}</h3>
        <p className="text-[#1F1F1F]/70 mb-8">
          Verify your identity to access this feature
        </p>

        {error && (
          <div className="mb-4 text-red-600 text-sm font-bold bg-red-100 p-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={20} />
                Unlock with Face ID
              </>
            )}
          </button>

          {/* Dev Mode Registration Shortcut */}
          <button
            onClick={handleRegister}
            className="text-xs text-[#1F1F1F]/50 underline hover:text-[#1F1F1F]"
          >
            Setup Passkey (Dev Mode)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
