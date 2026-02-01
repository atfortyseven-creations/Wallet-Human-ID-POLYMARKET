"use client";

import React from 'react';
import { FloatingImmersiveBackground } from '@/components/landing/FloatingImmersiveBackground';
import { ImmersiveKittens } from '@/components/immersive/ImmersiveKittens';

export default function DeveloperPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#F5F5DC] overflow-hidden pt-24 pb-12">
            {/* Layer 0: Global Background */}
            <FloatingImmersiveBackground density="high" kittenCount={15} />
            <ImmersiveKittens variant="floating" />

            {/* Layer 1: Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center">
                <h1 className="text-5xl md:text-7xl font-black text-[#4F2683] mb-8 tracking-tighter">
                    DEVELOPER HUB
                </h1>
                <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-12">
                    Build on top of the Human DeFi Protocol. Access our SDKs, Smart Contracts, and Identity Primitives.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Placeholder Cards */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-8 bg-white/50 backdrop-blur-xl rounded-3xl border border-[#4F2683]/10 hover:border-[#4F2683]/30 transition-all group">
                            <div className="h-12 w-12 bg-[#4F2683]/10 rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#4F2683] mb-2">Resource {i}</h3>
                            <p className="text-neutral-500">Documentation and tools for building the future of finance.</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
