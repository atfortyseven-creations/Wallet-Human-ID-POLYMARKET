"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Globe, Smartphone, Bell, Shield, Moon, ChevronRight, Key, ShieldCheck } from 'lucide-react';
import { WalletConnectSessions } from '@/components/wallet/WalletConnectSessions';
import BiometricGuard from '@/components/wallet/BiometricGuard';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'sonner';

export default function SettingsPanel() {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [showSecret, setShowSecret] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  // Hardcoded for now, real app should get from auth context
  const authUserId = "cm6lcm2b600003b6m7k8j9l0n"; 

  const registerPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      // 1. Get options from server
      const resp = await fetch(`/api/auth/webauthn/register?userId=${authUserId}`);
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      // 2. Start registration with browser
      const attResp = await startRegistration(options);

      // 3. Verify with server
      const verifyResp = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attResp, userId: authUserId }),
      });

      const verification = await verifyResp.json();

      if (verification.verified) {
        toast.success('Passkey registered successfully!');
      } else {
        throw new Error(verification.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to register passkey');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#1F1F1F]">Settings</h2>

      {/* Preferences */}
      <section className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Preferences</h3>
        
        <div className="space-y-1">
          <SettingsInfoRow 
            icon={<DollarSign size={20} />} 
            label="Currency" 
            value={currency} 
            onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')} 
          />
          <SettingsInfoRow 
            icon={<Globe size={20} />} 
            label="Language" 
            value={language} 
            onClick={() => {}} 
          />
          <SettingsInfoRow 
            icon={<Moon size={20} />} 
            label="Theme" 
            value={theme} 
            onClick={() => setTheme(theme === 'Light' ? 'Dark' : 'Light')} 
          />
        </div>
      </section>

      {/* Connections (WalletConnect) */}
      <section>
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Active Sessions</h3>
        <WalletConnectSessions />
      </section>

      {/* Security */}
      <section className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Security</h3>
        
        <div className="space-y-1">
          <SettingsToggleRow 
            icon={<Smartphone size={20} />} 
            label="Biometric Auth" 
            enabled={true} 
            onToggle={() => {}} 
          />
          <button 
            onClick={registerPasskey}
            disabled={isRegisteringPasskey}
            className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1F1F1F]/5 rounded-xl flex items-center justify-center text-[#1F1F1F] group-hover:bg-[#1F1F1F] group-hover:text-[#EAEADF] transition-colors">
                <Key size={20} />
                </div>
                <div className="text-left">
                    <div className="font-bold text-[#1F1F1F]">Add Passkey</div>
                    <div className="text-xs text-[#1F1F1F]/50">For passwordless login</div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[#1F1F1F]/60">
                {isRegisteringPasskey ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#1F1F1F] border-t-transparent" />
                ) : (
                    <ChevronRight size={16} />
                )}
            </div>
          </button>
          <SettingsToggleRow 
            icon={<Shield size={20} />} 
            label="Auto-Lock Timer" 
            sublabel="5 Minutes"
            enabled={true} 
            onToggle={() => {}} 
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-[#1F1F1F]/10">
        <h3 className="text-sm font-bold text-[#1F1F1F]/50 uppercase mb-4 tracking-wider">Notifications</h3>
        
        <div className="space-y-1">
          <SettingsToggleRow 
            icon={<Bell size={20} />} 
            label="Transaction Alerts" 
            enabled={true} 
            onToggle={() => {}} 
          />
          <SettingsToggleRow 
            icon={<DollarSign size={20} />} 
            label="Price Alerts" 
            enabled={false} 
            onToggle={() => {}} 
          />
        </div>
      </section>

      {/* Advanced Security Zone */}
      <section className="bg-[#EAEADF] rounded-3xl p-6 border-2 border-red-500/10">
        <h3 className="text-sm font-bold text-red-600 uppercase mb-4 tracking-wider flex items-center gap-2">
            <Shield size={16} /> Danger Zone
        </h3>
        
        {!showSecret ? (
             <DangerZoneReveal onSuccess={() => setShowSecret(true)} />
        ) : (
            <div className="h-[300px]">
                <div className="p-6 bg-white rounded-xl border border-[#1F1F1F]/10 text-center space-y-4">
                    <p className="font-mono text-lg font-bold text-[#1F1F1F]">
                        abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
                    </p>
                    <p className="text-xs text-red-500 font-bold">
                        DO NOT SHARE THIS PHRASE WITH ANYONE.
                    </p>
                    <button 
                        onClick={() => setShowSecret(false)}
                        className="text-sm text-[#1F1F1F]/50 underline"
                    >
                        Hide Secret
                    </button>
                </div>
            </div>
        )}
      </section>

      <div className="text-center text-xs text-[#1F1F1F]/30 pt-4">
        Human Wallet v1.0.0 (Phase 4 Build)
      </div>
    </div>
  );
}

function DangerZoneReveal({ onSuccess }: { onSuccess: () => void }) {
    const [input, setInput] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    
    const correctPhrase = "Human DeFi Corp.";
    const isMatched = input === correctPhrase;

    return (
        <div className="relative group">
            {/* Glassmorphism Container */}
            <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/10 rounded-2xl p-6 space-y-4 transition-all hover:bg-red-500/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-red-600 uppercase tracking-widest">
                        Security Verification
                    </label>
                    <p className="text-sm text-[#1F1F1F]/60">
                        Type <span className="font-mono font-bold bg-white/50 px-1 rounded text-red-500">{correctPhrase}</span> to reveal your secret phrase.
                    </p>
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type verification phrase..."
                        className="w-full px-4 py-3 bg-white/60 border-2 border-transparent focus:border-red-500/20 rounded-xl outline-none font-bold text-[#1F1F1F] placeholder:text-[#1F1F1F]/20 transition-all"
                    />
                    
                    {isMatched && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500"
                        >
                            <ShieldCheck size={20} />
                        </motion.div>
                    )}
                </div>

                <motion.button
                    disabled={!isMatched}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={() => {
                        if (isMatched) onSuccess();
                    }}
                    className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all overflow-hidden relative ${
                        isMatched 
                        ? 'bg-red-500 text-white cursor-pointer shadow-lg shadow-red-500/20' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                     {/* Hover Animation Overlay */}
                     {isMatched && (
                         <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: isHovering ? '100%' : '-100%' }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute inset-0 bg-white/30 skew-x-12"
                         />
                     )}
                     
                     <span className="relative z-10 flex items-center gap-2">
                        {isMatched ? <Key size={18} /> : <Shield size={18} />}
                        {isMatched ? 'Click to Reveal' : 'Locked'}
                     </span>
                </motion.button>
            </div>
        </div>
    );
}

function SettingsInfoRow({ icon, label, value, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1F1F1F]/5 rounded-xl flex items-center justify-center text-[#1F1F1F] group-hover:bg-[#1F1F1F] group-hover:text-[#EAEADF] transition-colors">
          {icon}
        </div>
        <span className="font-bold text-[#1F1F1F]">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-[#1F1F1F]/60">
        <span className="text-sm">{value}</span>
        <ChevronRight size={16} />
      </div>
    </button>
  );
}

function SettingsToggleRow({ icon, label, sublabel, enabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1F1F1F]/5 rounded-xl flex items-center justify-center text-[#1F1F1F]">
          {icon}
        </div>
        <div className="text-left">
          <div className="font-bold text-[#1F1F1F]">{label}</div>
          {sublabel && <div className="text-xs text-[#1F1F1F]/50">{sublabel}</div>}
        </div>
      </div>
      
      <button 
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-all ${
          enabled ? 'bg-[#1F1F1F]' : 'bg-[#1F1F1F]/20'
        }`}
      >
        <div className={`w-5 h-5 bg-[#EAEADF] rounded-full shadow-sm transition-all ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

