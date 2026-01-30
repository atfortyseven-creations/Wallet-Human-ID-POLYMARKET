'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';

interface LottieCanvasProps {
  src: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

const LottieCanvas = ({ 
  src, 
  className = "w-full h-full", 
  autoplay = true, 
  loop = true 
}: LottieCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dotLottieInstance, setDotLottieInstance] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicialización de la instancia
    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src: src,
      loop: loop,
      autoplay: autoplay,
      renderConfig: {
        devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      },
    });

    setDotLottieInstance(dotLottie);

    // CLEANUP CRÍTICO: Si el usuario cambia de página, matamos el proceso.
    return () => {
      dotLottie.destroy();
    };
  }, [src, loop, autoplay]);

  // OPTIMIZACIÓN SENIOR: Intersection Observer
  // Si la animación sale de la pantalla, la PAUSAMOS para ahorrar batería y CPU.
  useEffect(() => {
    if (!dotLottieInstance || !canvasRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dotLottieInstance.play();
          } else {
            dotLottieInstance.pause();
          }
        });
      },
      { threshold: 0.1 } // Se activa cuando el 10% es visible
    );

    observer.observe(canvasRef.current);

    return () => observer.disconnect();
  }, [dotLottieInstance]);

  return (
    <canvas 
      ref={canvasRef} 
      id="dotlottie-canvas"
      className={`block ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LottieCanvas;
