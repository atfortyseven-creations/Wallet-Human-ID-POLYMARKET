"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, Fingerprint, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SecurityVault() {
    const { t } = useLanguage();
    const [spendingLimit, setSpendingLimit] = useState(1000);
    const [timeLockEnabled, setTimeLockEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-6">
            
            {/* HERO STATUS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[40px] bg-[#1F1F1F] text-white p-8 md:p-12 shadow-2xl"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest text-sm mb-4">
                            <Shield size={20} />
                            {t.vault.title}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            {t.vault.status}
                        </h2>
                        <p className="text-white/60 text-lg max-w-md">
                            {t.vault.description}
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
                        <StatusRow icon={<Lock size={18} className="text-green-400"/>} label={t.vault.activeProtection} value="Active" />
                        <StatusRow icon={<Clock size={18} className="text-blue-400"/>} label={t.vault.timeLock} value="24 Hours" />
                        <StatusRow icon={<Fingerprint size={18} className="text-purple-400"/>} label={t.vault.biometric} value="Required" />
                    </div>
                </div>
            </motion.div>

            {/* CONTROLS */}
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Spending Limit */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] p-8 border border-[#1F1F1F]/5 shadow-sm"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#1F1F1F] mb-1">{t.vault.dailyLimit}</h3>
                            <p className="text-[#1F1F1F]/50 text-sm">Max transaction without 2FA</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <Shield size={24} />
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="text-4xl font-black text-[#1F1F1F] mb-2">
                            {formatCurrency(spendingLimit)}
                        </div>
                        <input 
                            type="range" 
                            min="100" 
                            max="10000" 
                            step="100"
                            value={spendingLimit}
                            onChange={(e) => setSpendingLimit(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1F1F1F]"
                        />
                         <div className="flex justify-between text-xs text-[#1F1F1F]/40 font-bold mt-2">
                            <span>$100</span>
                            <span>$10,000</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-[#F5F5F0] text-[#1F1F1F] font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        {t.common.confirm}
                    </button>
                </motion.div>

                {/* Advanced Security */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] p-8 border border-[#1F1F1F]/5 shadow-sm space-y-6"
                >
                    <h3 className="text-xl font-bold text-[#1F1F1F] mb-6">{t.vault.advancedSettings}</h3>

                    <ToggleRow 
                        icon={<Clock size={20} />}
                        label={t.vault.timeLock}
                        desc="Delay withdrawals > $5k by 24h"
                        active={timeLockEnabled}
                        onToggle={() => setTimeLockEnabled(!timeLockEnabled)}
                    />

                    <ToggleRow 
                        icon={<Fingerprint size={20} />}
                        label={t.vault.biometric}
                        desc="FaceID required for all logins"
                        active={biometricEnabled}
                        onToggle={() => setBiometricEnabled(!biometricEnabled)}
                    />

                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3 text-orange-800 text-sm">
                        <AlertTriangle size={18} className="shrink-0" />
                        <p>Disabling these features will require a 24-hour cooling off period.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatusRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between pb-3 border-b border-white/10 last:border-0 last:pb-0">
            <div className="flex items-center gap-3 text-white/70 font-medium">
                {icon}
                {label}
            </div>
            <div className="font-bold text-white">{value}</div>
        </div>
    )
}

function ToggleRow({ icon, label, desc, active, onToggle }: { icon: any, label: string, desc: string, active: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${active ? 'bg-[#1F1F1F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {icon}
                </div>
                <div>
                    <div className="font-bold text-[#1F1F1F]">{label}</div>
                    <div className="text-xs text-[#1F1F1F]/50 font-medium">{desc}</div>
                </div>
            </div>
            <button 
                onClick={onToggle}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${active ? 'bg-green-500' : 'bg-gray-200'}`}
            >
                <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    )
}
