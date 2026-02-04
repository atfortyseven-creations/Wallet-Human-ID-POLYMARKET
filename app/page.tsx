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
import { ParallaxStickers } from '@/components/landing/ParallaxStickers';
import { Footer } from '@/components/layout/Footer';
import { LaunchCountdown } from '@/components/landing/LaunchCountdown';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { StackedFeatureCards } from '@/components/landing/StackedFeatureCards';
import BubblesView from '@/components/premium/BubblesView';
import MarketTable from '@/components/premium/MarketTable';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { motion } from 'framer-motion';

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
        <SmoothScroll>
            <main className="relative min-h-screen w-full bg-black text-[#1F1F1F] dark:text-white selection:bg-[#00ff9d] selection:text-black overflow-x-hidden transition-colors duration-700">
                
                {/* 1. Background Layers */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    {/* <FluidBeigeBackground /> */}
                </div>

                {/* 2. Parallax Stickers Layer */}
                <ParallaxStickers />

                {/* 2. Main Content */}
                <div className="relative z-10 flex flex-col">
                    
                    {/* HERO SECTION */}
                    <section className="relative w-full h-[100dvh]">
                        <LandingHero onStart={handleStart} />
                    </section>

                    {/* BUBBLES - Now second, moved up for immediate impact */}
                    <motion.section 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full px-4 md:px-8 flex justify-center py-12"
                    >
                        <div className="w-full max-w-7xl h-[600px] md:h-[700px]">
                            <BubblesView />
                        </div>
                    </motion.section>

                    {/* MARKET TABLE - Now third */}
                    <motion.section 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="w-full px-4 md:px-8 flex justify-center py-12"
                    >
                        <div className="w-full max-w-7xl">
                            <MarketTable />
                        </div>
                    </motion.section>

                    {/* FEATURE CARDS (Stacked) - Moved to bottom as a final fluid stack */}
                    <motion.section 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full flex justify-center pb-0"
                    >
                        <StackedFeatureCards />
                    </motion.section>

                    {/* LAUNCH COUNTDOWN & IMMERSIVE IMAGE */}
                    <div className="mt-[-60px] md:mt-[-80px] relative z-10">
                        <LaunchCountdown />
                    </div>

                    {/* FOOTER */}
                    <Footer />
                </div>
            </main>
        </SmoothScroll>
  );
}
