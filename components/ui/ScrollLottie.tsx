'use client';
import React, { useRef, useEffect, useState } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

interface ScrollLottieProps {
  src: string;
  className?: string;
  speed?: number; // Multiplicador de velocidad
}

export const ScrollLottie = ({ src, className, speed = 1 }: ScrollLottieProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lottieInstance, setLottieInstance] = useState<DotLottie | null>(null);

  // 1. Initialization (Canvas Mode for GPU)
  useEffect(() => {
    if (!canvasRef.current) return;

    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src: src,
      autoplay: false, // ¡IMPORTANTE! No se reproduce solo
      loop: false,
      mode: "bounce", // Opcional: rebote suave
      renderConfig: {
        devicePixelRatio: 1, // Force 1x for performance
      }
    });

    // Esperar a que cargue para poder manipular frames
    dotLottie.addEventListener('load', () => {
        setLottieInstance(dotLottie);
    });

    return () => dotLottie.destroy();
  }, [src]);

  // 2. Scroll Logic (Pure Mathematics for 120 FPS)
  useEffect(() => {
    if (!lottieInstance || !containerRef.current) return;

    const handleScroll = () => {
        if (!containerRef.current) return;

        // Calculate relative position to viewport
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Rango: 0 (entra por abajo) a 1 (sale por arriba)
        // Adjust margins so animation occurs in the center
        const start = viewportHeight; // Empieza cuando entra
        const end = -rect.height;     // Termina cuando sale
        
        // Normalizamos el progreso entre 0 y 1
        // Usamos math max/min para evitar valores negativos o > 1
        let progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        
        // Clamp (limitamos entre 0 y 1)
        progress = Math.max(0, Math.min(1, progress));

        // Mapeamos el progreso al total de frames del Lottie
        // Map progress to the total frames of the Lottie
        // requestAnimationFrame ensures this is synchronized with screen refresh
        requestAnimationFrame(() => {
            if (!lottieInstance.totalFrames) return;
            const totalFrames = lottieInstance.totalFrames;
            const targetFrame = totalFrames * progress * speed;
            
            // "seek" is the key function: jumps to exact frame
            lottieInstance.setFrame(targetFrame);
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // passive: true is vital for FPS
    handleScroll(); // Execute once at the beginning

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lottieInstance, speed]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};

