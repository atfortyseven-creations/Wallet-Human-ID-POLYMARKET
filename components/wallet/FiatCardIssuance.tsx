"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, ChevronRight, Lock, Shield, Smartphone, Globe } from 'lucide-react';

export default function FiatCardIssuance() {
    const [step, setStep] = useState<'intro' | 'customize' | 'kyc' | 'success'>('intro');
    const [cardTier, setCardTier] = useState<'standard' | 'black' | 'metal'>('black');
    const [isIssuing, setIsIssuing] = useState(false);

    const handleIssue = () => {
        setIsIssuing(true);
        setTimeout(() => {
            setIsIssuing(false);
            setStep('success');
        }, 2000);
    };

    return (
        <div className="w-full bg-[#EAEADF] rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-sm">
            
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-white/40 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 mb-12 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-[#1F1F1F] tracking-tight mb-4">
                    The Human Card.
                </h2>
                <p className="text-lg text-[#1F1F1F]/60 max-w-xl font-medium leading-relaxed">
                    Spend your crypto instantly, anywhere. Apple Pay ready. Zero foreign transaction fees. 
                    <span className="block mt-2 text-[#1F1F1F] font-bold">Minimalist. Secure. Limitless.</span>
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
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent" />

                        <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Shield size={32} className="opacity-80" />
                                <span className="font-mono text-lg tracking-widest opacity-60">DEBIT</span>
                            </div>
                            
                            <div>
                                <div className="font-mono text-xl tracking-[0.2em] mb-4 opacity-80">
                                    •••• •••• •••• 4288
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Cardholder</div>
                                        <div className="font-bold text-lg tracking-wide">HUMAN ID</div>
                                    </div>
                                    <div className={`w-12 h-8 rounded ${cardTier === 'black' ? 'bg-white/20' : 'bg-black/10'}`} />
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
                                    <FeatureItem icon={<Smartphone size={20}/>} text="Instant Apple Pay & Google Pay integration" />
                                    <FeatureItem icon={<Lock size={20}/>} text="Bank-grade security with freeze toggle" />
                                </div>
                                <button 
                                    onClick={() => setStep('customize')}
                                    className="w-full py-4 bg-[#1F1F1F] text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 group"
                                >
                                    Design Your Card <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
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
                                <h3 className="text-xl font-bold text-[#1F1F1F]">Select Material</h3>
                                <div className="space-y-3">
                                    <MaterialOption 
                                        name="Obsidian Black" 
                                        desc="Matte finish. The classic choice." 
                                        active={cardTier === 'black'} 
                                        onClick={() => setCardTier('black')}
                                    />
                                    <MaterialOption 
                                        name="Titanium White" 
                                        desc="Clean, minimalist, pristine." 
                                        active={cardTier === 'standard'} 
                                        onClick={() => setCardTier('standard')}
                                    />
                                    <MaterialOption 
                                        name="Brushed Metal" 
                                        desc="Premium weight. Laser etched. (VIP)" 
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
                                        onClick={() => setStep('kyc')} // Skip KYC for demo, straight to issue
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
                                <h3 className="text-xl font-bold text-[#1F1F1F]">Verifying Identity...</h3>
                                <p className="text-[#1F1F1F]/60">We are using your Human ID to verify your eligibility instantly.</p>
                                
                                <div className="h-1 lg:w-64 mx-auto bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
                                        onAnimationComplete={handleIssue}
                                        className="h-full bg-green-500"
                                    />
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
                                <h3 className="text-2xl font-black text-[#1F1F1F]">Card Issued.</h3>
                                <p className="text-[#1F1F1F]/60">Your virtual card is ready for use.</p>
                                
                                <button className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity">
                                    <span className="font-brands"></span> Add to Apple Wallet
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
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
