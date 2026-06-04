"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface CanvasParticlesProps {
  isMobile: boolean;
}

export const CanvasParticles = ({ isMobile }: CanvasParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const createParticle = (): Particle => {
      // For desktop (building on the right): spawn particles predominantly on the right 20% to 100% width
      // For mobile: spawn uniformly or across the whole top depending on the narrower viewport
      const startX = isMobile 
        ? Math.random() * canvas.width 
        : Math.random() * (canvas.width * 0.8) + (canvas.width * 0.2);
      
      const startY = Math.random() * (canvas.height * 0.4) - 150; // Start higher

      return {
        x: startX,
        y: startY,
        size: Math.random() * 2 + 1, // Small pixel-like sizes (1-3px)
        speedY: Math.random() * 0.5 + 0.1, // Slower falling for dreamy effect
        speedX: (Math.random() - 0.5) * 0.2, // Slight horizontal drift
        opacity: Math.random() * 0.6 + 0.1,
        life: 0,
        maxLife: Math.random() * 600 + 300,
      };
    };

    const particleCount = isMobile ? 80 : 200; // Less particles on mobile for performance and composition

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.life++;

        let currentOpacity = p.opacity;
        if (p.life > p.maxLife * 0.8) {
          currentOpacity = p.opacity * (1 - (p.life - p.maxLife * 0.8) / (p.maxLife * 0.2));
        }

        ctx.fillStyle = `rgba(200, 220, 255, ${currentOpacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.life >= p.maxLife || p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
          particles[i] = createParticle();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen"
      style={{ opacity: 0.8 }}
    />
  );
};
