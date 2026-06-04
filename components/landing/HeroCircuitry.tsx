"use client";

import React, { useEffect, useRef } from 'react';
import { usePerformanceMode, shouldRenderFrame } from '@/hooks/usePerformanceMode';

export function HeroCircuitry() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const perfMode = usePerformanceMode();
    const perfRef = useRef(perfMode);
    perfRef.current = perfMode;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId: number;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * (window.devicePixelRatio || 1);
            canvas.height = height * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        };

        window.addEventListener('resize', resize);
        resize();

        // Circuitry Lines Definition
        const lines: { x: number; y: number; length: number; speed: number; opacity: number; color: string }[] = [];
        for (let i = 0; i < 30; i++) {
            lines.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: 100 + Math.random() * 300,
                speed: 0.5 + Math.random() * 1.5,
                opacity: 0.05 + Math.random() * 0.1,
                color: Math.random() > 0.5 ? '#98002e' : '#ffffff'
            });
        }

        const draw = (time: number) => {
            animationFrameId = requestAnimationFrame(draw);

            if (!perfRef.current.isVisible) return;
            if (!shouldRenderFrame(time, lastRenderRef.current, perfRef.current.targetFps)) return;

            const delta = lastRenderRef.current ? (time - lastRenderRef.current) / 16.6 : 1;
            lastRenderRef.current = time;

            ctx.clearRect(0, 0, width, height);
            
            lines.forEach(line => {
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = line.opacity;
                
                // Manhattan path simulation
                ctx.moveTo(line.x, line.y);
                const nextX = line.x + (line.length / 2);
                ctx.lineTo(nextX, line.y);
                ctx.lineTo(nextX, line.y + (line.length / 4));
                ctx.lineTo(nextX + (line.length / 2), line.y + (line.length / 4));
                
                ctx.stroke();

                // Animation movement scaled by delta
                line.x += line.speed * delta;
                if (line.x > width + line.length) {
                    line.x = -line.length;
                    line.y = Math.random() * height;
                }
            });

            // Grid Overlay for "Stratospheric" Technical Look
            ctx.globalAlpha = 0.02;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.2;
            const gridSize = 100;
            for (let x = 0; x <= width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        };

        const lastRenderRef = { current: 0 };
        animationFrameId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
