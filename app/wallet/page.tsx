"use client";

import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic';

import WalletSection from "@/components/WalletSection";
import { FloatingImmersiveBackground } from "@/components/landing/FloatingImmersiveBackground";
import { ImmersiveKittens } from "@/components/immersive/ImmersiveKittens";

export default function WalletPage() {
    return (
        <main className="relative flex min-h-screen w-full flex-col items-center pt-24 pb-12 overflow-hidden">
            {/* Global Immersive Elements */}
            <FloatingImmersiveBackground />
            <ImmersiveKittens variant="center" />

            <div className="relative z-10 w-full max-w-7xl px-4">
                <Suspense fallback={<div className="text-white text-center py-20">Loading Wallet...</div>}>
                    <WalletSection />
                </Suspense>
            </div>
        </main>
    );
}
