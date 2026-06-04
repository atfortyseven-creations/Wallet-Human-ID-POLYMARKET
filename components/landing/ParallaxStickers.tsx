"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Sticker images from public/models
const STICKERS = [
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 60 },
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 50 },
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 40 },
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 70 },
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 55 },
    { src: '/official-whale-legendary.png', alt: 'Whale', size: 45 },
];

export function ParallaxStickers() {
    const { scrollY } = useScroll();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Create parallax positions for multiple stickers
    const stickersData = [
        // Row 1
        { x: '10%', baseY: 200, speed: 0.3, rotate: -15, src: STICKERS[0].src, size: STICKERS[0].size },
        { x: '85%', baseY: 300, speed: 0.5, rotate: 20, src: STICKERS[1].src, size: STICKERS[1].size },
        { x: '25%', baseY: 500, speed: 0.4, rotate: 10, src: STICKERS[0].src, size: STICKERS[0].size },
        
        // Row 2
        { x: '70%', baseY: 700, speed: 0.35, rotate: -10, src: STICKERS[1].src, size: STICKERS[1].size },
        { x: '15%', baseY: 900, speed: 0.6, rotate: 25, src: STICKERS[0].src, size: STICKERS[0].size },
        { x: '90%', baseY: 1100, speed: 0.45, rotate: -20, src: STICKERS[1].src, size: STICKERS[1].size },
        
        // Row 3
        { x: '40%', baseY: 1300, speed: 0.25, rotate: 5, src: STICKERS[0].src, size: STICKERS[0].size },
        { x: '80%', baseY: 1500, speed: 0.55, rotate: -25, src: STICKERS[1].src, size: STICKERS[1].size },
        { x: '20%', baseY: 1700, speed: 0.4, rotate: 15, src: STICKERS[0].src, size: STICKERS[0].size },
        
        // Row 4
        { x: '60%', baseY: 1900, speed: 0.35, rotate: -5, src: STICKERS[1].src, size: STICKERS[1].size },
        { x: '30%', baseY: 2100, speed: 0.5, rotate: 20, src: STICKERS[0].src, size: STICKERS[0].size },
        { x: '75%', baseY: 2300, speed: 0.3, rotate: -15, src: STICKERS[1].src, size: STICKERS[1].size },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {stickersData.map((sticker, index) => (
                <StickerItem key={index} sticker={sticker} scrollY={scrollY} />
            ))}
        </div>
    );
}

function StickerItem({ sticker, scrollY }: { sticker: any, scrollY: any }) {
    const y = useTransform(
        scrollY,
        [0, 3000],
        [sticker.baseY, sticker.baseY - (sticker.speed * 1000)]
    );
    const rotate = useTransform(
        scrollY,
        [0, 3000],
        [sticker.rotate, sticker.rotate + (sticker.speed * 90)]
    );
    const opacity = useTransform(
        scrollY,
        [sticker.baseY - 600, sticker.baseY - 100, sticker.baseY + 800],
        [0, 1, 0]
    );

    return (
        <motion.div
            style={{
                x: sticker.x,
                y,
                rotate,
                opacity,
            }}
            className="absolute"
        >
            <motion.img
                src={sticker.src}
                alt={sticker.src.includes('rocket') ? 'Rocket' : sticker.src.includes('star') ? 'Star' : 'Cat'}
                style={{
                    width: sticker.size,
                    height: sticker.size,
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                    transform: `perspective(1000px) translateZ(${sticker.speed * 100}px)`,
                }}
                className="object-contain"
            />
        </motion.div>
    );
}


