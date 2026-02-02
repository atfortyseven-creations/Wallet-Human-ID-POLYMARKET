"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useAppKitAccount, useAppKit } from '@reown/appkit/react';
import { useLanguage } from '@/src/context/LanguageContext';

// ============================================
// 1. CRITICAL IMPORTS
// ============================================
import { LandingHero } from '@/components/landing/LandingHero';
import FluidBeigeBackground from '@/components/layout/FluidBeigeBackground';
import { useGateState } from '@/components/layout/TitaniumGate';
import { FloatingImmersiveBackground } from '@/components/landing/FloatingImmersiveBackground';
import { Footer } from '@/components/layout/Footer';
import { LaunchCountdown } from '@/components/landing/LaunchCountdown';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { StackedFeatureCards } from '@/components/landing/StackedFeatureCards';
import { TrustCarousel } from '@/components/landing/TrustCarousel';

export default function Home() {
  const { isConnected } = useAppKitAccount();
  const { isAuthenticated } = useAuth();
  const { open } = useAppKit();
  const { t } = useLanguage();
  
  const [isMounted, setIsMounted] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== 'undefined') {
      (document.body.style as any).webkitFontSmoothing = 'antialiased';
    }
  }, []);

  const { state } = useGateState();

  const handleStart = () => {
      if (!isConnected && !isAuthenticated) {
        open(); 
      }
  };

  return (
        <main className="relative min-h-screen w-full bg-[#EAEADF] dark:bg-[#0a0a0a] text-[#1F1F1F] dark:text-white selection:bg-[#00ff9d] selection:text-black overflow-x-hidden transition-colors duration-700">
            
            {/* 1. Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="block dark:hidden">
                    <FluidBeigeBackground />
                 </div>
                 <div className="hidden dark:block">
                    <FloatingImmersiveBackground />
                 </div>
            </div>

            {/* 2. Main Content */}
            <div className="relative z-10 flex flex-col">
                
                {/* HERO SECTION */}
                <section className="relative w-full h-[100dvh]">
                    <LandingHero onStart={handleStart} />
                </section>

                {/* FEATURE CARDS (Restored) */}
                <section className="w-full py-20 flex justify-center">
                    <StackedFeatureCards />
                </section>

                {/* TRUST CAROUSEL - Why Choose Human DeFi */}
                <TrustCarousel />

                {/* LAUNCH COUNTDOWN & IMMERSIVE IMAGE */}
                <LaunchCountdown />

                {/* FOOTER */}
                <Footer />
            </div>
        </main>
  );
}
