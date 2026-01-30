"use client";

import React from 'react';
import LottieCard from '../ui/LottieCard';
import { TrendingUp } from 'lucide-react';

export function FeatureCardsSection() {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-20">
            
            {/* 1. Buy & Redeem - Payment Animation */}
            <LottieCard 
                lottieSrc="https://lottie.host/0f8c4e3d-9b7a-4f6c-8d2e-1a3b4c5d6e7f/9KJh8G7F6D.lottie"
                title="Compra y canjea" 
                subtitle="Soporte nativo para USD y ETH"
                lottieSize="lg"
            >
                <div className="flex gap-4 justify-center mt-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-xs text-white backdrop-blur-sm border border-white/20">USD</div>
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-xs text-white backdrop-blur-sm border border-white/20">ETH</div>
                </div>
            </LottieCard>

            {/* 2. Secure Accounts (Spans 2 cols on large) - Shield Animation */}
            <div className="lg:col-span-2">
                <LottieCard 
                    lottieSrc="https://lottie.host/c23a350f-3be4-44e2-89b6-7cf4c5f92945/H25gv2upyV.lottie"
                    title="Human Defi" 
                    subtitle="Rompiendo límites 2027"
                    lottieSize="lg"
                    className="h-full"
                >
                    <div className="mt-2 text-center">
                        <div className="text-3xl font-bold text-white">$124,592.21</div>
                        <div className="text-green-300 text-sm flex items-center justify-center gap-1 mt-2">
                             <TrendingUp size={14} /> Portfolio Seguro On-Chain
                        </div>
                    </div>
                </LottieCard>
            </div>

            {/* 3. Rewards - Coins Animation */}
            <LottieCard 
                lottieSrc="https://lottie.host/8e4d2f1c-9bfa-4b77-8db5-3c5f1b2e6a9d/RainCoins.lottie"
                title="Recompensas" 
                subtitle="Gana royalties automáticamente"
                lottieSize="lg"
            >
               <div className="mt-4 text-center text-xs text-white/50">
                   Stake y gana pasivamente con Human ID
               </div>
            </LottieCard>

            {/* 4. Earn with Crypto - Chart Growth Animation */}
            <LottieCard 
                lottieSrc="https://lottie.host/7a3b1c8d-4e5f-6a7b-8c9d-0e1f2a3b4c5d/ChartUp.lottie"
                title="Haz crecer tu cripto" 
                subtitle="Yield farming simplificado"
                lottieSize="lg"
            />

             {/* 5. Speed/Bonus - Lightning Animation */}
             <LottieCard 
                lottieSrc="https://lottie.host/9f6e4d2c-1a8b-7c5d-3e9f-0a1b2c3d4e5f/Lightning.lottie"
                title="Ultra Rápido" 
                subtitle="Ejecución instantánea en L2"
                lottieSize="lg"
            />
        </div>
    );
}
