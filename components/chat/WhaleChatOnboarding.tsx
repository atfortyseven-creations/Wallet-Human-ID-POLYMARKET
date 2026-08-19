"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronRight, Check, MapPin, AtSign } from 'lucide-react';
import { useWhaleSettings } from '@/components/terminal/WhaleChatSettings';

interface OnboardingProps {
  address: string;
  onComplete: () => void;
}

const COUNTRIES = [
  "Global (Earth)", "United States", "United Kingdom", "Spain", "Mexico", 
  "Argentina", "Colombia", "Brazil", "France", "Germany", "Japan", "South Korea"
];

export function WhaleChatOnboarding({ address, onComplete }: OnboardingProps) {
  const { updateBatch, isLoaded } = useWhaleSettings(address);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [country, setCountry] = useState('Global (Earth)');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isLoaded) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setAvatar(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1 && username.trim().length >= 3) {
      // Ensure nickname starts with @
      let finalUsername = username.trim();
      if (!finalUsername.startsWith('@')) {
        finalUsername = '@' + finalUsername;
      }
      setUsername(finalUsername);
      setStep(2);
    } else if (step === 2 && pin.length >= 4) {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    // Enforce nickname format one last time
    let finalUsername = username.trim();
    if (!finalUsername.startsWith('@')) finalUsername = '@' + finalUsername;

    await updateBatch({
      displayName: finalUsername,
      avatar_url: avatar,
      bio: `From ${country}`,
      privacy_last_seen: 'everybody',
    });
    
    // Set PIN in local storage as well for simplicity (usually handled by vault)
    if (typeof window !== 'undefined') {
       localStorage.setItem(`whale_onboarded_${address}`, 'true');
    }
    
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-[#050505] flex flex-col items-center justify-center p-6 sm:p-12 font-sans overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#f5f5f7]">
          <motion.div 
            className="h-full bg-[#1c7aff]"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-3xl font-black text-[#050505] mb-2 text-center tracking-tight">Create your Identity</h2>
              <p className="text-[#050505]/50 text-[15px] font-medium text-center mb-8">
                Set up your profile to connect with others.
              </p>

              {/* Avatar Upload */}
              <div 
                className="w-32 h-32 rounded-full bg-[#f5f5f7] border-[3px] border-dashed border-black/10 flex items-center justify-center relative cursor-pointer hover:border-[#1c7aff] transition-colors mb-8 overflow-hidden shadow-sm"
                onClick={() => fileRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-[#1c7aff]">
                    <Camera size={32} />
                    <span className="text-[12px] font-bold mt-2">Upload Photo</span>
                  </div>
                )}
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Nickname Input */}
              <div className="w-full mb-6">
                <label className="block text-[13px] font-bold text-[#050505] mb-2">Nickname (e.g. @satoshi)</label>
                <div className="relative">
                  <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="satoshi"
                    className="w-full bg-[#f5f5f7] border-2 border-transparent focus:border-[#1c7aff] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[16px] font-bold text-black outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="w-full mb-10">
                <label className="block text-[13px] font-bold text-[#050505] mb-2">Country / Region</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#f5f5f7] border-2 border-transparent focus:border-[#1c7aff] focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[16px] font-bold text-black outline-none transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={username.trim().length < 3}
                className="w-full py-4 bg-[#1c7aff] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#1c7aff] rounded-2xl text-white font-black text-[16px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Continue <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-3xl font-black text-[#050505] mb-2 text-center tracking-tight">Secure your Vault</h2>
              <p className="text-[#050505]/50 text-[15px] font-medium text-center mb-8">
                Create a PIN to lock your private messages and encrypted files.
              </p>

              <div className="w-full mb-10">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 4-8 digit PIN"
                  maxLength={8}
                  className="w-full bg-[#f5f5f7] border-2 border-transparent focus:border-[#1c7aff] focus:bg-white rounded-2xl p-6 text-center text-3xl tracking-[0.5em] font-black text-black outline-none transition-all shadow-inner"
                />
              </div>

              <button 
                onClick={handleNext}
                disabled={pin.length < 4}
                className="w-full py-4 bg-[#1c7aff] hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-[#1c7aff] rounded-2xl text-white font-black text-[16px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Continue <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6"
            >
              <div className="w-24 h-24 rounded-full bg-[#30d158]/10 flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#30d158] flex items-center justify-center shadow-[0_0_20px_#30d158]">
                  <Check size={32} className="text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-[#050505] mb-3 tracking-tight">All Set!</h2>
              <p className="text-[#050505]/60 text-[16px] font-medium mb-10 leading-relaxed">
                Your identity is secured. Welcome to the native Web3 social network, <strong className="text-[#050505]">{username.startsWith('@') ? username : `@${username}`}</strong> from {country}.
              </p>

              <button 
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full py-4 bg-[#050505] hover:bg-black/80 rounded-2xl text-white font-black text-[16px] flex items-center justify-center transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {isSubmitting ? 'Finalizing...' : 'Enter Whale Chat'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
