"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Globe, Smartphone, Bell, Shield, Moon, ChevronRight, Key } from 'lucide-react';
import { WalletConnectSessions } from '@/components/wallet/WalletConnectSessions';
import BiometricGuard from '@/components/wallet/BiometricGuard';

export default function SettingsPanel() {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [showSecret, setShowSecret] = useState(false);

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
             <button 
                onClick={() => setShowSecret(true)}
                className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
             >
                <Key size={18} />
                Reveal Recovery Phrase
            </button>
        ) : (
            <div className="h-[300px]">
                <BiometricGuard reason="Reveal Secret Phrase" onSuccess={() => {}}>
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
                </BiometricGuard>
            </div>
        )}
      </section>

      <div className="text-center text-xs text-[#1F1F1F]/30 pt-4">
        Human Wallet v1.0.0 (Phase 4 Build)
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
