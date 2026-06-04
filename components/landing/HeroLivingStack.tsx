'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export function HeroLivingStack() {
    const { scrollY } = useScroll();
    
    // Parallax intensities for each layer
    const yBG = useTransform(scrollY, [0, 1000], [0, -300]);
    const y1 = useTransform(scrollY, [0, 500], [0, -150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -250]);
    const y3 = useTransform(scrollY, [0, 500], [0, -100]);
    const rotate = useTransform(scrollY, [0, 1000], [0, 45]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0.4]);

    return (
        <motion.div 
            style={{ opacity }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0"
        >
            {/* Background Immersion Layer (Logan Voss) */}
            <motion.div 
                style={{ y: yBG }}
                className="absolute inset-0 z-[-1]"
            >
                <Image 
                    src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg" 
                    alt="Immersion Backdrop" 
                    fill 
                    className="object-cover opacity-80 mix-blend-multiply transition-opacity duration-1000 group-hover:opacity-100"
                    priority
                />
            </motion.div>

            {/* Ambient Lighting Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_80%)] mix-blend-screen pointer-events-none" />
        </motion.div>
    );
}
