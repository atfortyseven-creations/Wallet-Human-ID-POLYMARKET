"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const RAINBOW_ASSET = "official-whale-legendary.png";
const KITTEN_ASSET = "official-whale-legendary.png"; 

// Only Rainbows allowed
const ASSETS = [RAINBOW_ASSET];

interface FloatingElement {
    id: number;
    src: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    scale: number;
    rotation: number;
    depth: number; // 0-1, affects scroll speed
    delay: number;
}

interface FloatingImmersiveBackgroundProps {
    density?: 'high' | 'medium' | 'low';
    kittenCount?: number;
    rainbowCount?: number;
}

export function FloatingImmersiveBackground({ 
    density = 'high', 
    kittenCount: propKittenCount = 0,
    rainbowCount: propRainbowCount
}: FloatingImmersiveBackgroundProps = {}) {
    const [elements, setElements] = useState<FloatingElement[]>([]);
    const { scrollY } = useScroll();
    const isMobile = useIsMobile();

    useEffect(() => {
        // Adjust counts for mobile to prevent lag - OPTIMIZED REDUCTION
        let rainbowCount = isMobile ? 8 : 20; // Reduced from 15/50 for performance
        let kittenCount = propKittenCount;

        if (propRainbowCount !== undefined) {
            rainbowCount = isMobile ? Math.floor(propRainbowCount / 3) : Math.floor(propRainbowCount / 2);
        } else {
            if (density === 'medium') rainbowCount = isMobile ? 6 : 15;
            if (density === 'low') rainbowCount = isMobile ? 3 : 8;
        }

        if (isMobile && kittenCount > 0) {
            kittenCount = Math.max(1, Math.floor(kittenCount / 2));
        }

        // Create random rainbow elements
        const rainbowElements = Array.from({ length: rainbowCount }).map((_, i) => {
            return {
                id: Date.now() + i, 
                src: RAINBOW_ASSET,
                x: Math.random() * 100, 
                y: Math.random() * 100, 
                scale: (0.4 + Math.random() * 0.6) * (isMobile ? 0.6 : 1), 
                rotation: Math.random() * 360,
                depth: 0.1 + Math.random() * 1.2, 
                delay: Math.random() * 2 
            };
        });

        // Create kitten elements if requested
        const kittenElements = Array.from({ length: kittenCount }).map((_, i) => {
            return {
                id: Date.now() + 1000 + i, 
                src: KITTEN_ASSET,
                x: Math.random() * 90 + 5, // Avoid edges
                y: Math.random() * 90 + 5, 
                scale: (0.8 + Math.random() * 0.5) * (isMobile ? 0.7 : 1), 
                rotation: Math.random() * 20 - 10, // Less rotation for kittens
                depth: 0.8 + Math.random() * 0.5, 
                delay: Math.random() * 1.5
            };
        });

        setElements([...rainbowElements, ...kittenElements]);
    }, [density, propKittenCount, propRainbowCount, isMobile]);

    const spawnRainbow = useCallback((e: React.MouseEvent | MouseEvent) => {
        // Disable spawning on mobile to save resources
        if (window.innerWidth < 768) return; 
        
        // Rate limit spawning (simple)
        if (Math.random() > 0.3) return;

        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth) * 100;
        const yPercent = (clientY / window.innerHeight) * 100;

        const newElement: FloatingElement = {
            id: Date.now() + Math.random(), 
            src: RAINBOW_ASSET,
            x: xPercent, 
            y: yPercent, 
            scale: 0.2, // Start small
            rotation: Math.random() * 360,
            depth: 0.5 + Math.random() * 0.5, 
            delay: 0
        };

        setElements(prev => {
            if (prev.length > 40) return prev.slice(1); // Cap total elements
            return [...prev, newElement];
        });
    }, []);

    useEffect(() => {
        if (!isMobile) {
            window.addEventListener('click', spawnRainbow as any);
            return () => window.removeEventListener('click', spawnRainbow as any);
        }
    }, [spawnRainbow, isMobile]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 backface-hidden will-change-transform">
            <AnimatePresence>
                {elements.map((el) => (
                    <FloatingItem key={el.id} element={el} scrollY={scrollY} isMobile={isMobile} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function FloatingItem({ element, scrollY, isMobile }: { element: FloatingElement, scrollY: any, isMobile: boolean }) {
    // Parallax effect - Only for Desktop
    const yTransform = useTransform(scrollY, [0, 1000], [0, element.depth * -150]); // Reduced parallax distance
    const y = useSpring(yTransform, { stiffness: 40, damping: 20 }); // Softer spring
    
    // Mobile optimized animations
    const mobileAnimation = {
        opacity: 0.5,
        scale: element.scale,
        rotate: [0, 360], 
        y: 0 
    };

    const desktopAnimation = {
        opacity: 0.6, 
        scale: element.scale,
        rotate: [element.rotation - 10, element.rotation + 10, element.rotation - 10], 
        y: [0, -15, 0] 
    };

    const mobileTransition = {
        opacity: { duration: 0.5, delay: element.delay },
        scale: { duration: 0.5, delay: element.delay },
        rotate: { duration: 30 + Math.random() * 10, repeat: Infinity, ease: "linear" as any }, // Slower rotation
    };

    const desktopTransition = {
        opacity: { duration: 0.5, delay: element.delay },
        scale: { duration: 0.5, delay: element.delay, type: "spring" },
        rotate: { duration: 5 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
    };

    return (
        <motion.div
            style={{
                top: `${element.y}%`,
                left: `${element.x}%`,
                position: 'absolute',
                y: isMobile ? 0 : y
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={isMobile ? mobileAnimation : desktopAnimation}
            exit={{ opacity: 0, scale: 0 }}
            transition={isMobile ? mobileTransition : desktopTransition}
            className="w-16 h-16 md:w-24 md:h-24 opacity-80 flex items-center justify-center pointer-events-none will-change-transform"
        >
            <img 
                src={`/models/${element.src}`} 
                alt="Magic Element" 
                className="w-full h-full object-contain drop-shadow-sm"
            />
        </motion.div>
    );
}

