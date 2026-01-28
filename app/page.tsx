import { MarketFeed } from '@/components/MarketFeed';
import { NewsGrid } from '@/components/crystalline/NewsGrid';

export default function Home() {
    return (
        <main className="min-h-screen relative bg-slate-900 selection:bg-cyan-500/30 pb-20 overflow-x-hidden">

            {/* FONDOS DINÁMICOS (The "Wallpaper") */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-blob mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full animate-blob animation-delay-4000 mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* SECCIÓN PRINCIPAL: Global Intel Engine (Top Priority) */}
            <div className="relative z-10 pt-10">
                <NewsGrid />
            </div>

            {/* SECCIÓN MARKETS: Mercados en Base Sepolia (Bottom Layer) */}
            <div className="relative z-10 container mx-auto px-4">
                <section className="py-20 relative">
                    <MarketFeed />
                </section>
            </div>
        </main>
    );
}
