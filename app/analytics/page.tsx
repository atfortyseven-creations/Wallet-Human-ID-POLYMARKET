"use client";

import { AdvancedAnalytics } from '@/components/market/AdvancedAnalytics';
import { FloatingImmersiveBackground } from '@/components/landing/FloatingImmersiveBackground';

export default function AnalyticsPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-[#00ff9d] selection:text-black font-sans relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <FloatingImmersiveBackground />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-32">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                        MARKET <span className="text-[#00ff9d]">PULSE</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl">
                        Advanced algorithmic trading terminal with sub-second latency.
                        <br />
                        <span className="text-xs font-mono uppercase tracking-widest text-[#00ff9d]">Powered by Human Oracle Network</span>
                    </p>
                </div>
                
                <AdvancedAnalytics />
            </div>
        </main>
    );
}
