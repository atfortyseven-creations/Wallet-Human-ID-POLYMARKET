"use client";

import React, { useEffect, useState } from 'react';
import { LottiePlayer } from './LottiePlayer';

interface RemoteLottieProps {
    path: string;
    className?: string;
    style?: React.CSSProperties;
    width?: string | number;
    height?: string | number;
    loop?: boolean;
    speed?: number;
}

/**
 * Loads a Lottie JSON from a public URL and renders it using LottiePlayer.
 * This keeps the bundle size small as animations are loaded on demand.
 */
export const RemoteLottie = ({
    path,
    className,
    style,
    width,
    height,
    loop = true,
    speed
}: RemoteLottieProps) => {
    const [animationData, setAnimationData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const rawPath = path.startsWith('/') ? path : `/lotties/${path}`;
        const fullPath = encodeURI(rawPath);
        
        fetch(fullPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load Lottie: ${res.statusText}`);
                return res.json();
            })
            .then(data => setAnimationData(data))
            .catch(err => {
                console.error("Lottie Load Error:", err);
                setError(true);
            });
    }, [path]);

    if (error) return null;
    if (!animationData) return <div className={className} style={{ width, height, ...style }} />;

    return (
        <LottiePlayer
            animationData={animationData}
            className={className}
            style={style}
            width={width}
            height={height}
            loop={loop}
            speed={speed}
        />
    );
};
