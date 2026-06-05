"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, ChevronRight, Lock, Shield, Smartphone, Globe, Loader2 } from 'lucide-react';

export default function FiatCardIssuance({ walletAddress, balance }: { walletAddress: string, balance: string }) {
    const [step, setStep] = useState<'intro' | 'customize' | 'kyc' | 'success'>('intro');
    const [cardTier, setCardTier] = useState<'standard' | 'black' | 'metal'>('black');
    const [isIssuing, setIsIssuing] = useState(false);
    const [cardData, setCardData] = useState<any>(null);
    const [kycRequired, setKycRequired] = useState(false);
    const [isAddingWallet, setIsAddingWallet] = useState<'google' | 'apple' | null>(null);

    // Load card on mount
    React.useEffect(() => {
        async function loadCard() {
            try {
                const res = await fetch('/api/user/card');
                const data = await res.json();
                if (data.card) {
                    setCardData(data.card);
                    setCardTier(data.card.tier.toLowerCase() as any);
                    setKycRequired(data.card.status === 'PENDING_KYC');
                    setStep('success'); // Already has a card (or record of one)
                }
            } catch (e) {
                console.error("Failed to load card", e);
            }
        }
        loadCard();
    }, []);

    const handleIssue = async () => {
        setIsIssuing(true);
        try {
            const res = await fetch('/api/user/card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    tier: cardTier.toUpperCase(),
                    linkedAddress: walletAddress
                }),
            });
            const data = await res.json();
            if (data.card) {
                setCardData(data.card);
                if (data.kycRequired) {
                    setKycRequired(true);
                }
                setStep('success');
            }
        } catch (e) {
            console.error("Issuance failed", e);
            alert("Failed to issue card. Please try again.");
        } finally {
            setIsIssuing(false);
        }
    };

    const handleAddToGoogleWallet = async () => {
        setIsAddingWallet('google');
        try {
            const res = await fetch('/api/wallet/pass/google', { method: 'POST' });
            const data = await res.json();
            if (data.saveUrl) {
                // In a real app, we'd redirect or open a new window
                window.open(data.saveUrl, '_blank');
            }
        } catch (e) {
            console.error("Google Wallet failed", e);
        } finally {
            setIsAddingWallet(null);
        }
    };

    // Helper to format card number
    const formatCardNumber = (num: string) => {
        if (!num) return "   4288";
        return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12)}`;
    };

    return (
        <div className="w-full bg-[#EAEADF] rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-sm border border-black/5">
            
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-white/40 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 mb-12 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-[#1F1F1F] tracking-tight mb-4">
                    The Whale Card.
                </h2>
                <p className="text-lg text-[#1F1F1F]/60 max-w-xl font-medium leading-relaxed">
                    Spend your crypto instantly, anywhere. Android & Apple Pay ready. Zero foreign transaction fees. 
                    <span className="block mt-2 text-[#1F1F1F] font-bold">Authenticated by KYC. Spendable for real.</span>
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 relative z-10 items-center">
                
                {/* LEFT: 3D CARD PREVIEW */}
                <div className="flex justify-center perspective-1000">
                    <motion.div 
                        initial={{ rotateY: 10, rotateX: 5 }}
                        animate={{ 
                            rotateY: [10, -5, 10],
                            rotateX: [5, 5, 5]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className={`
                            w-[340px] h-[215px] md:w-[420px] md:h-[265px] rounded-[32px] shadow-2xl relative overflow-hidden backdrop-blur-md border border-white/20
                            ${cardTier === 'black' ? 'bg-[#1F1F1F] text-white' : ''}
                            ${cardTier === 'metal' ? 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300 text-[#1F1F1F]' : ''}
                            ${cardTier === 'standard' ? 'bg-white text-[#1F1F1F]' : ''}
                        `}
                    >
                        {/* Card Noise Texture */}
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent" />

                        <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <Shield size={32} className="opacity-80" />
                                    <div className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">KYC VERIFIED</div>
                                </div>
                                <span className="font-mono text-lg tracking-widest opacity-60">DEBIT</span>
                            </div>
                            
                            <div>
                                <div className="font-mono text-lg md:text-xl tracking-[0.2em] mb-4 opacity-80">
                                    {cardData ? formatCardNumber(cardData.cardNumber) : "   4288"}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Active Balance</div>
                                        <div className="font-bold text-lg tracking-wide">${balance} USD</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">CVV</div>
                                        <div className="font-mono font-bold text-lg">{cardData?.cvv || ""}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT: CONFIGURATOR FLOW */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/50 shadow-lg min-h-[400px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        
                        {/* INTRO STEP */}
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <FeatureItem icon={<Globe size={20}/>} text="Global acceptance via Visa network" />
                                    <FeatureItem icon={<Smartphone size={20}/>} text="Instant Android & iOS Tap-to-Pay" />
                                    <FeatureItem icon={<Lock size={20}/>} text="On-chain balance verification" />
                                </div>
                                <button 
                                    onClick={() => setStep('customize')}
                                    className="w-full py-4 bg-[#1F1F1F] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group"
                                >
                                    Get Your Whale Card <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                                </button>
                            </motion.div>
                        )}

                        {/* CUSTOMIZE STEP */}
                        {step === 'customize' && (
                            <motion.div
                                key="customize"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-xl font-bold text-[#1F1F1F]">Select Tier</h3>
                                <div className="space-y-3">
                                    <MaterialOption 
                                        name="Obsidian Black" 
                                        desc="Standard digital & plastic. 0% fees." 
                                        active={cardTier === 'black'} 
                                        onClick={() => setCardTier('black')}
                                    />
                                    <MaterialOption 
                                        name="Brushed Metal" 
                                        desc="Premium titanium. Laser etched. (VIP)" 
                                        active={cardTier === 'metal'} 
                                        onClick={() => setCardTier('metal')}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setStep('intro')}
                                        className="px-6 py-4 rounded-2xl font-bold text-[#1F1F1F]/60 hover:bg-black/5"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setStep('kyc');
                                            handleIssue();
                                        }}
                                        className="flex-1 py-4 bg-[#1F1F1F] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* KYC / ISSUE STEP */}
                        {step === 'kyc' && (
                            <motion.div
                                key="kyc"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 text-center"
                            >
                                <div className="w-20 h-20 bg-[#1F1F1F] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Shield size={32} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1F1F1F]">Contacting Financial Provider...</h3>
                                <p className="text-[#1F1F1F]/60">Securely initializing your account with our BaaS partner.</p>
                                
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 size={40} className="animate-spin text-[#1F1F1F]" />
                                    <div className="text-[10px] font-bold text-[#1F1F1F]/40 tracking-widest uppercase">Striga Infrastructure Connection</div>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS STEP */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center"
                            >
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                                    <Check size={40} className="text-white" strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-black text-[#1F1F1F]">
                                    {kycRequired ? "KYC Verification Needed" : "Authentic Card Issued."}
                                </h3>
                                <p className="text-[#1F1F1F]/60">
                                    {kycRequired 
                                        ? "Your account is created on Striga. Please check your email to complete verification." 
                                        : "Your Whale Card is active and spendable."}
                                </p>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {!kycRequired ? (
                                        <>
                                            <button 
                                                onClick={handleAddToGoogleWallet}
                                                disabled={isAddingWallet === 'google'}
                                                className="w-full py-4 bg-[#1B1B1B] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isAddingWallet === 'google' ? <Loader2 size={24} className="animate-spin"/> : (
                                                    <>
                                                        <Smartphone size={24} /> Add to Google Wallet
                                                    </>
                                                )}
                                            </button>
                                            
                                            <button className="w-full py-4 bg-[#F5F5F7] text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors">
                                                <span className="text-2xl mb-1"></span> Add to Apple Wallet
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-700 transition-colors"
                                            onClick={() => window.open('https://portal.striga.com', '_blank')}
                                        >
                                            <Shield size={24} /> Complete Real KYC
                                        </button>
                                    )}

                                    <div className="pt-2 border-t border-black/5 mt-2 space-y-4">
                                        <div className="text-left">
                                            <div className="text-[10px] font-black uppercase text-[#1F1F1F]/40 mb-3 tracking-widest">Financial Status</div>
                                            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                                                kycRequired 
                                                    ? "bg-orange-500/5 border-orange-500/20 text-orange-700"
                                                    : "bg-green-500/5 border-green-500/20 text-green-700"
                                            }`}>
                                                <Shield size={16}/>
                                                {kycRequired ? "Verification in Progress" : "Real Striga Provider Connected"}
                                            </div>
                                        </div>

                                        <button className="text-sm font-bold text-[#1F1F1F]/40 hover:text-[#1F1F1F] transition-colors flex items-center justify-center gap-2 mx-auto">
                                            <Lock size={14}/> Ver Detalles Completos de Tarjeta
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function ActivityRow({ merchant, amount, date }: { merchant: string, amount: string, date: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-black/[0.03]">
            <div>
                <div className="font-bold text-sm text-[#1F1F1F]">{merchant}</div>
                <div className="text-[10px] text-[#1F1F1F]/40">{date}</div>
            </div>
            <div className="font-mono font-bold text-sm text-[#1F1F1F]">{amount}</div>
        </div>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-white/50">
            <div className="p-2 bg-[#1F1F1F] text-white rounded-full">
                {icon}
            </div>
            <span className="font-bold text-[#1F1F1F]">{text}</span>
        </div>
    )
}

function MaterialOption({ name, desc, active, onClick }: { name: string, desc: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group
                ${active ? 'border-[#1F1F1F] bg-white shadow-md' : 'border-transparent bg-white/50 hover:bg-white'}
            `}
        >
            <div>
                <div className="font-black text-[#1F1F1F]">{name}</div>
                <div className="text-xs text-[#1F1F1F]/50 font-bold">{desc}</div>
            </div>
            {active && <div className="w-6 h-6 bg-[#1F1F1F] rounded-full flex items-center justify-center"><Check size={14} className="text-white"/></div>}
        </button>
    )
}

