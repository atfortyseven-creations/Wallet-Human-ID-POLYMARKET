"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const RAINBOW_ASSET = "e21b27e8-7b2c-4faf-b6fd-5f7a0bcef130.png";
const KITTEN_ASSET = "cat12.png"; 

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
    kittenCount = 0,
    rainbowCount: propRainbowCount
}: FloatingImmersiveBackgroundProps = {}) {
    const [elements, setElements] = useState<FloatingElement[]>([]);
    const { scrollY } = useScroll();

    useEffect(() => {
        let rainbowCount = 50;
        if (propRainbowCount !== undefined) {
            rainbowCount = propRainbowCount;
        } else {
            if (density === 'medium') rainbowCount = 30;
            if (density === 'low') rainbowCount = 10;
        }

        // Create random rainbow elements
        const rainbowElements = Array.from({ length: rainbowCount }).map((_, i) => {
            return {
                id: Date.now() + i, 
                src: RAINBOW_ASSET,
                x: Math.random() * 100, 
                y: Math.random() * 100, 
                scale: 0.4 + Math.random() * 0.6, 
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
                scale: 0.8 + Math.random() * 0.5, // Kittens larger
                rotation: Math.random() * 20 - 10, // Less rotation for kittens
                depth: 0.8 + Math.random() * 0.5, 
                delay: Math.random() * 1.5
            };
        });

        setElements([...rainbowElements, ...kittenElements]);
    }, [density, kittenCount, propRainbowCount]);

    const spawnRainbow = useCallback((e: React.MouseEvent | MouseEvent) => {
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

        setElements(prev => [...prev, newElement]);
    }, []);

    useEffect(() => {
        window.addEventListener('click', spawnRainbow as any);
        return () => window.removeEventListener('click', spawnRainbow as any);
    }, [spawnRainbow]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <AnimatePresence>
                {elements.map((el) => (
                    <FloatingItem key={el.id} element={el} scrollY={scrollY} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function FloatingItem({ element, scrollY }: { element: FloatingElement, scrollY: any }) {
    // Parallax effect
    const yTransform = useTransform(scrollY, [0, 1000], [0, element.depth * -300]);
    const y = useSpring(yTransform, { stiffness: 50, damping: 20 });

    return (
        <motion.div
            style={{
                top: `${element.y}%`,
                left: `${element.x}%`,
                position: 'absolute',
                y
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 0.6, 
                scale: element.scale,
                rotate: [element.rotation - 10, element.rotation + 10, element.rotation - 10], 
                y: [0, -20, 0] 
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
                opacity: { duration: 0.5, delay: element.delay },
                scale: { duration: 0.5, delay: element.delay, type: "spring" },
                rotate: { duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 md:w-24 md:h-24 mix-blend-multiply flex items-center justify-center pointer-events-none"
        >
            <img 
                src={`/models/${element.src}`} 
                alt="Magic Element" 
                className="w-full h-full object-contain drop-shadow-sm"
            />
        </motion.div>
    );
}
