"use client";

import { SmoothScroller } from './SmoothScroller';
import { Hero3D } from './Hero3D';
import { ScrollJourney } from './ScrollJourney';
import { SystemCore } from './SystemCore';
import { EpicFooter } from './EpicFooter';

export function LegendaryLanding() {
    return (
        <SmoothScroller>
            <main className="w-full bg-[#030303] text-white overflow-hidden selection:bg-indigo-500/30">
                {/* Fase 1: El Hook */}
                <Hero3D />

                {/* Fase 2: Inmersión Scroll-Jacking */}
                <ScrollJourney />

                {/* Fase 3: La Arquitectura (Core) */}
                <SystemCore />

                {/* Fase 4: Cierre Colosal */}
                <EpicFooter />
            </main>
        </SmoothScroller>
    );
}

