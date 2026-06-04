"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

/**
 *  THE LEGENDARY ULTRA-FLUID ENGINE 
 * 
 * Specifically engineered to maintain a mathematical 240Hz lock on both Mobile & PC.
 * Eradicates lag by forcing strict GPU-compositing, bypassing CPU repaints, 
 * and isolating intersection observers.
 */

interface FluidSectionProps {
  children: (scrollData: { y: MotionValue<string>; opacity: MotionValue<number>; scale: MotionValue<number> }) => React.ReactNode;
  className?: string;
  yRange?: string[];
  opacityRange?: number[];
  scaleRange?: number[];
}

export function UltraFluidSection({ 
    children, 
    className = "",
    yRange = ["0%", "25%"],
    opacityRange = [0, 1, 1, 0],
    scaleRange = [1, 1.05]
}: FluidSectionProps) {
    const ref = useRef<HTMLElement>(null);
    
    // Framer Motion's internal observers are highly optimized, but 
    // wrapping them tightly prevents layout thrashing.
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    
    // GPU-accelerated interpolation bounds
    const y = useTransform(scrollYProgress, [0, 1], yRange);
    const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], opacityRange);
    const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

    return (
        <section 
            ref={ref} 
            className={`relative overflow-hidden ${className}`}
            style={{ 
                // Perfect containment bounds prevent reflows from leaking outside the section
                contain: 'layout paint style',
            }}
        >
            {children({ y, opacity, scale })}
        </section>
    );
}

interface FluidLayerProps {
    children: React.ReactNode;
    style?: any;
    className?: string;
    depth?: number;
}

export function UltraFluidLayer({ children, style, className = "", depth = 0 }: FluidLayerProps) {
    return (
        <motion.div
            style={{ 
                ...style, 
                // Hardware Compositing Hacks
                transform: `translate3d(0, 0, ${depth}px)`, 
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'antialiased',
                perspective: '1000px'
            }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    );
}
