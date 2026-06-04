'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'sonner';
import { Fingerprint, Check, Loader2 } from 'lucide-react';

interface PasskeyRegisterProps {
  userId: string;
  onSuccess?: () => void;
}

export function PasskeyRegister({ userId, onSuccess }: PasskeyRegisterProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      // 1. Get registration options from server
      const optionsRes = await fetch(`/api/auth/webauthn/register?userId=${userId}`);
      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.error || 'Failed to get registration options');
      }

      const options = await optionsRes.json();

      // 2. Trigger biometric creation (FaceID/TouchID/Fingerprint)
      const credential = await startRegistration(options);

      // 3. Verify with backend
      const verifyRes = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...credential,
          userId
        }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Registration verification failed');
      }

      const result = await verifyRes.json();

      if (result.verified) {
        toast.success('Biometrics registered successfully');
        onSuccess?.();
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Biometric registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="passkey-register-card p-6 rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/40 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F1F1F] rounded-xl flex items-center justify-center text-[#EAEADF]">
            <Fingerprint size={20} />
          </div>
          <div>
            <h4 className="text-[#1F1F1F] font-bold text-lg">Whale Alert Network ID Biometrics</h4>
            <p className="text-xs text-[#1F1F1F]/40 font-medium tracking-tight uppercase">Security Standard v4.0</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#1F1F1F]/60 font-medium leading-relaxed mb-6">
        Enable ultra-secure, passwordless access to your account using industry-leading WebAuthn standards. Biometric data never leaves your device.
      </p>

      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className="w-full py-4 bg-[#1F1F1F] text-[#EAEADF] rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
      >
        {isRegistering ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Configurando...</span>
          </>
        ) : (
          <>
            <Fingerprint size={20} />
            <span>ENROLL FACEID / TOUCHID</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center gap-2 px-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold text-[#1F1F1F]/30 uppercase tracking-tighter">FIPS 140-2 Compliant Execution Environment</span>
      </div>
    </div>
  );
}

