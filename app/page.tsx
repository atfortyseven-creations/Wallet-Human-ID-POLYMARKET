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
        <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-[#00ff9d] selection:text-black overflow-x-hidden">
            
            {/* 0. Video Loading Screen */}
            {showLoading && (
                <div className="fixed inset-0 z-[9999]">
                    <LoadingScreen onComplete={() => setShowLoading(false)} />
                </div>
            )}

            {/* 1. Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <FloatingImmersiveBackground />
            </div>

            {/* 2. Main Content */}
            <div className="relative z-10 flex flex-col">
                
                {/* HERO SECTION */}
                <section className="relative w-full h-[100dvh]">
                    <LandingHero onStart={handleStart} />
                </section>

                {/* LAUNCH COUNTDOWN & IMMERSIVE IMAGE */}
                <LaunchCountdown />

                {/* FOOTER */}
                <Footer />
            </div>
        </main>
  );
}
