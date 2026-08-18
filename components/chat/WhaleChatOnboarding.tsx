"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronRight, Check } from 'lucide-react';
import { useWhaleSettings } from '@/components/terminal/WhaleChatSettings';

interface OnboardingProps {
  address: string;
  onComplete: () => void;
}

export function WhaleChatOnboarding({ address, onComplete }: OnboardingProps) {
  const { updateBatch, isLoaded } = useWhaleSettings(address);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    // Persist PIN to secure vault
    if (pin.length === 4) {
      localStorage.setItem(`whale_pin_${address.toLowerCase()}`, pin);
    }
    
    // Update PXE settings
    await updateBatch({
      username: username.replace('@', '').toLowerCase(),
      displayName: username,
      avatar_url: avatar,
      passcode_enabled: pin.length === 4
    });
    
    // Mark onboarding complete in local storage as a quick-check flag
    localStorage.setItem(`whale_onboarding_${address.toLowerCase()}`, 'true');
    
    setIsSubmitting(false);
    onComplete();
  };

  if (!isLoaded) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] items-center justify-center p-6 fixed inset-0 z-[100000]">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none p-10 flex flex-col items-center relative overflow-hidden">
        
        {/* Progress Bar Brutalist */}
        <div className="absolute top-0 left-0 w-full h-2 bg-black/10">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="w-16 h-16 bg-black flex items-center justify-center mb-6">
          <span className="text-3xl">🐋</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-[28px] font-black tracking-tighter text-black mb-2 uppercase">Claim Handle</h2>
              <p className="text-[13px] font-mono text-[#555] text-center mb-8">
                Your cryptographic alias on the sovereign network. Irrevocable.
              </p>
              
              <div className="w-full relative flex items-center mb-8">
                <span className="absolute left-4 text-2xl font-black text-black/40">@</span>
                <input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="nickname"
                  className="w-full bg-[#f4f4f4] border-2 border-black p-4 pl-12 text-2xl font-black tracking-tight text-black outline-none focus:bg-white transition-colors uppercase"
                  maxLength={15}
                />
              </div>

                            <button
                onClick={() => fileRef.current?.click()}
                className="w-32 h-32 rounded-full border-4 border-black mb-8 overflow-hidden bg-[#f4f4f4] flex items-center justify-center relative group"
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  // Procedural identicon fallback based on the address
                  <div className="w-full h-full flex flex-wrap" style={{ background: `hsl(${parseInt(address.slice(2,8), 16) % 360}, 60%, 80%)` }}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-1/3 h-1/3" style={{ opacity: (parseInt(address.slice(i+2, i+3), 16) % 2 === 0) ? 1 : 0, background: 'black' }} />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-white font-bold text-[10px] uppercase tracking-widest">Override</span>
                </div>
              </button>

              <button
                onClick={() => setStep(3)}
                className="w-full h-[60px] bg-black text-white font-black uppercase tracking-widest text-[14px] flex items-center justify-center gap-2 hover:bg-[#111] active:translate-y-1 transition-all"
              >
                {avatar ? 'Continue' : 'Skip for now'} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-[28px] font-black tracking-tighter text-black mb-2 uppercase">Secure Vault</h2>
              <p className="text-[13px] font-mono text-[#555] text-center mb-6">
                Set a 4-digit master PIN. If forgotten, your local chat vault is permanently lost.
              </p>
              
              {/* PIN dots */}
              <div className="flex gap-4 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-14 h-14 border-b-4 ${pin.length > i ? 'border-black' : 'border-black/20'} flex items-center justify-center text-3xl font-black text-black`}>
                    {pin[i] ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Number pad */}
              <div className="w-full grid grid-cols-3 gap-2 mb-6">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => {
                  if (k === '') return <div key={i} />;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (k === '⌫') { setPin(p => p.slice(0,-1)); return; }
                        if (pin.length < 4) setPin(p => p + k);
                      }}
                      className="h-[60px] bg-[#f4f4f4] border-2 border-black text-black text-[22px] font-black flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-0.5"
                    >
                      {k}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={pin.length < 4 || isSubmitting}
                onClick={finishOnboarding}
                className="w-full h-[60px] bg-[#30d158] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-[14px] flex items-center justify-center gap-2 hover:bg-[#28b34c] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0"
              >
                {isSubmitting ? 'Securing...' : 'Finalize Initialization'} <Check size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
