"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const ASSETS = [
    "0abb27ce-7550-4521-96d8-9b4006bebae1.png",
    "0d534b07-30d0-4846-b543-4a0729e3a28c.png",
    "35cdf367-8611-4b1b-9918-4c52576dcd94.png",
    "421ed50f-ed5f-45e1-bbdb-575b26e45707.png",
    "484e91a8-f3dd-4e8b-ad2f-85cb2bf5c9d9.png",
    "5157aaff-7c0d-4912-8b43-2e44e11b86fd.png",
    "5da3ca63-774a-4e65-8e0d-d9a5ba734aa6.png",
    "5ec47565-dec1-46e9-ab91-67e1e759705e.png",
    "6eb501c7-cb41-4767-8332-f529030d97f5.png",
    "782150e0-97cd-46bb-90b4-e5cf49aa8752.png",
    "8637521a-7deb-403c-a4e1-18e7bf121f2d.png",
    "a08d285e-c1dc-4992-bd4c-74af412a8570.png",
    "a21edaa9-ef16-4b55-9add-ea5822587ed8.png",
    "a48a0d91-6183-4438-a2a7-58a15fe7d442.png",
    "bf510f48-317f-4bb7-91bb-15dcd0e95cc2.png",
    "c5c34ac7-c8e7-4048-be9a-963c4fe2d84f.png",
    "cb268674-65ca-4829-875f-b70eb125876b.png",
    "cf2f77c8-cbe1-4b2e-af9f-2f3bf51bea09.png",
    "e0b59663-0db8-48b5-a246-f6449c28f4df.png",
    "e21b27e8-7b2c-4faf-b6fd-5f7a0bcef130.png",
    "e7b612ee-bf5e-44b9-8237-68adccd4ee39.png"
];

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

export function FloatingImmersiveBackground() {
    const [elements, setElements] = useState<FloatingElement[]>([]);
    const { scrollY } = useScroll();

    useEffect(() => {
        // Create 25 random elements
        const newElements = Array.from({ length: 25 }).map((_, i) => {
            // Avoid center area (30% - 70% width) to keep text readable
            let x = Math.random() * 100;
            if (x > 30 && x < 70) {
                // Determine layout: either distribute wide to sides or vertical center
                // Here we just push them to the sides mostly
                x = x < 50 ? x * 0.5 : 70 + (x - 70) * (30/30); 
            }

            return {
                id: i,
                src: ASSETS[i % ASSETS.length], // Cycle through all assets
                x: Math.random() * 100,
                y: Math.random() * 100,
                scale: 0.5 + Math.random() * 0.8, // 0.5 to 1.3 scale
                rotation: Math.random() * 360,
                depth: 0.2 + Math.random() * 1.5, // Variable depth for parallax
                delay: Math.random() * 2
            };
        });
        setElements(newElements);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {elements.map((el) => (
                <FloatingItem key={el.id} element={el} scrollY={scrollY} />
            ))}
        </div>
    );
}

function FloatingItem({ element, scrollY }: { element: FloatingElement, scrollY: any }) {
    // Parallax effect: distinct movement based on depth
    const yTransform = useTransform(scrollY, [0, 1000], [0, element.depth * -300]);
    
    // Smooth spring for the parallax to feel fluid
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
                opacity: 0.8, 
                scale: element.scale,
                rotate: [element.rotation - 10, element.rotation + 10, element.rotation - 10], // Gentle wiggle
                y: [0, -20, 0] // Gentle bobbing (additive to scroll)
            }}
            transition={{
                opacity: { duration: 1, delay: element.delay },
                scale: { duration: 0.8, delay: element.delay, type: "spring" },
                rotate: { duration: 5 + Math.random() * 5, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" } // Floating bob animation
            }}
            className="w-16 h-16 md:w-24 md:h-24 opacity-80 mix-blend-multiply flex items-center justify-center"
        >
            <img 
                src={`/models/${element.src}`} 
                alt="Magic Element" 
                className="w-full h-full object-contain drop-shadow-lg"
            />
        </motion.div>
    );
}
