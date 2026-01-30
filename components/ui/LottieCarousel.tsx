
'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LottieCard from './LottieCard';

// Temporary mock data if files aren't found yet - will check availability next
const MOCK_LOTTIES = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    src: '/assets/animations/placeholder.json', // Will replace with real ones
    title: `Feature ${i + 1}`,
    subtitle: 'Interactive human identity verification system.'
}));

export function LottieCarousel() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });

    return (
        <div className="w-full py-12 relative group">
             {/* Gradient Edges */}
             <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-900 to-transparent z-10 pointer-events-none" />
             <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-900 to-transparent z-10 pointer-events-none" />

            <div 
                ref={containerRef}
                className="flex gap-6 overflow-x-auto pb-8 pt-4 px-12 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {MOCK_LOTTIES.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-80 snap-center transform transition-transform hover:scale-105">
                        <LottieCard 
                            lottieSrc={item.src}
                            title={item.title}
                            subtitle={item.subtitle}
                            lottieSize="lg" 
                        />
                    </div>
                ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-6 gap-2">
                {MOCK_LOTTIES.map((_, i) => (
                    <motion.div 
                        key={i}
                        className="w-2 h-2 rounded-full bg-white/20"
                        animate={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)', // Basic indicator for now
                             scale: 1
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
