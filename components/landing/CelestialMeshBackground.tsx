'use client';

import { motion } from 'framer-motion';

/**
 * CelestialMeshBackground  System Wallpaper System, v2
 *
 * Layer stack:
 *   L0  Institutional ivory base (#FFFFFF)
 *   L1  Patron Cosmico 4K  slow parallax drift, opacity 6%, multiply blend
 *   L2  Hokusai 4K  bottom-anchored, full-width, natural aspect ratio
 *   L3  Gradient vignette  top-to-bottom for typography legibility
 *
 * The patron-cosmico pattern drifts at a perceptible but non-distracting
 * velocity: 32-second cycle, 50px horizontal / 30px vertical displacement.
 * This creates a living, breathing substrate without visual noise.
 */

interface CelestialMeshBackgroundProps {
    baseColor?:       string;
    waveOpacity?:     number;
    patternOpacity?:  number;
    gradientOpacity?: number;
}

export function CelestialMeshBackground({
    baseColor      = '#FFFFFF',
    waveOpacity    = 0.9,
    patternOpacity = 0.06,
    gradientOpacity = 0.85,
}: CelestialMeshBackgroundProps = {}) {
    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{ backgroundColor: baseColor }}
        >
            {/*  L1: Patron Cosmico  animated parallax drift  */}
            {/*
             * The pattern tile occupies 140% of the container so drift never
             * exposes the base color at the edges. The motion is a smooth
             * mirror-loop: forward 32s, reverse 32s, infinitely.
             */}
            <motion.div
                className="absolute pointer-events-none mix-blend-multiply"
                style={{
                    inset: '-20%',
                    width: '140%',
                    height: '140%',
                    backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                    backgroundSize: 'clamp(200px, 20vw, 380px) auto',
                    backgroundRepeat: 'repeat',
                    opacity: patternOpacity,
                    willChange: 'transform',
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 32,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatType: 'mirror',
                }}
            />

            {/*  L2: Hokusai Great Wave  bottom-locked, zero-zoom  */}
            {/*
             * height: auto preserves native aspect ratio  the wave sits
             * naturally at the bottom without zoom, crop or distortion.
             * translateZ(0) promotes to a GPU compositor layer.
             */}
            <img
                src="/api/checkpoint-image?name=olas-hokusai-4k.png"
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                className="absolute bottom-0 left-0 w-full z-[2]"
                style={{
                    height: 'auto',
                    minHeight: '42%',
                    objectFit: 'cover',
                    objectPosition: 'bottom',
                    display: 'block',
                    opacity: waveOpacity,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                }}
            />

            {/*  L3: Top-bottom vignette for headline legibility  */}
            <div
                className="absolute inset-0 z-[3]"
                style={{
                    background: `linear-gradient(to bottom, ${baseColor} 0%, transparent 50%, transparent 60%, ${baseColor} 100%)`,
                    opacity: gradientOpacity,
                }}
            />
        </div>
    );
}
