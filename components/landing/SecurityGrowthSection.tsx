"use client";

import React from 'react';
import LottieCard from '../ui/LottieCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { motion } from 'framer-motion';

export function SecurityGrowthSection() {
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-32">
            
            {/* Center Text Interlude with Background */}
            <div className="py-32 flex flex-col items-center justify-center text-center relative rounded-[3rem] overflow-hidden my-24 shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/models/fondoparaseguridad.jpg" 
                        alt="Security Background" 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5DC] via-transparent to-[#F5F5DC]" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative z-10"
                >
                    <h2 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-black/40 to-transparent tracking-tighter opacity-30 leading-none">
                        {t('sec.max')}
                    </h2>
                    <h2 className="text-6xl md:text-9xl font-black text-indigo-950 tracking-[0.2em] mt-[-20px] md:mt-[-50px] drop-shadow-2xl uppercase leading-none">
                        {t('sec.title')}
                    </h2>
                </motion.div>
            </div>

            {/* 4 Cards: Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-40">
                <LottieCard
                    lottieSrc="https://lottie.host/1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d/LockSecure.lottie"
                    title={t('sec.card1_title')}
                    subtitle={t('sec.card1_desc')}
                    lottieSize="md"
                    className="bg-white/80 backdrop-blur-xl border-white/40 hover:scale-[1.02] transition-transform duration-500 rounded-[2.5rem]"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e/ShieldCheck.lottie"
                    title={t('sec.card2_title')}
                    subtitle={t('sec.card2_desc')}
                    lottieSize="md"
                    className="bg-white/80 backdrop-blur-xl border-white/40 hover:scale-[1.02] transition-transform duration-500 rounded-[2.5rem]"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f/Fingerprint.lottie"
                    title={t('sec.card3_title')}
                    subtitle={t('sec.card3_desc')}
                    lottieSize="md"
                    className="bg-white/80 backdrop-blur-xl border-white/40 hover:scale-[1.02] transition-transform duration-500 rounded-[2.5rem]"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a/PrivacyEye.lottie"
                    title={t('sec.card4_title')}
                    subtitle={t('sec.card4_desc')}
                    lottieSize="md"
                    className="bg-white/80 backdrop-blur-xl border-white/40 hover:scale-[1.02] transition-transform duration-500 rounded-[2.5rem]"
                />
            </div>

            {/* Growth Section */}
            <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-white mb-12 pl-6 border-l-8 border-blue-500 uppercase tracking-tighter"
            >
                {t('growth.title')}
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LottieCard
                    lottieSrc="https://lottie.host/5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b/Investment.lottie"
                    title={t('growth.card1_title')}
                    subtitle={t('growth.card1_desc')}
                    lottieSize="md"
                    className="bg-blue-600/10 border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600/20 transition-all duration-500"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c/GlobeNetwork.lottie"
                    title={t('growth.card2_title')}
                    subtitle={t('growth.card2_desc')}
                    lottieSize="md"
                    className="bg-blue-600/10 border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600/20 transition-all duration-500"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d/Trophy.lottie"
                    title={t('growth.card3_title')}
                    subtitle={t('growth.card3_desc')}
                    lottieSize="md"
                    className="bg-blue-600/10 border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600/20 transition-all duration-500"
                />
                <LottieCard
                    lottieSrc="https://lottie.host/8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e/AwardMedal.lottie"
                    title={t('growth.card4_title')}
                    subtitle={t('growth.card4_desc')}
                    lottieSize="md"
                    className="bg-blue-600/10 border-blue-500/20 rounded-[2.5rem] hover:bg-blue-600/20 transition-all duration-500"
                />
            </div>

        </div>
    );
}
