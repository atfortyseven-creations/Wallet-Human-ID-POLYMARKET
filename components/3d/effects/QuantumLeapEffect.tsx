'use client';

import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';

/**
 * Quantum Leap Effect (DOM Version)
 * 
 * Sapphire radial flash that activates at 85%+ scroll.
 * This component lives INSIDE the Scroll html context to access useScroll.
 */
export function QuantumLeapEffectInternal() {
  const scroll = useScroll();
  const [opacity, setOpacity] = useState(0);

  useFrame(() => {
    if (!scroll) return;
    
    const offset = scroll.offset;
    
    // Activate flash at 85%+ scroll
    if (offset >= 0.85) {
        // 0.85 -> 0.93 (Fade In)
        // 0.93 -> 1.0 (Fade Out)
        
        if (offset < 0.93) {
            const fadeIn = (offset - 0.85) / 0.08;
            setOpacity(fadeIn);
        } else {
            const fadeOut = 1 - (offset - 0.93) / 0.07;
            setOpacity(Math.max(0, fadeOut));
        }
    } else {
      setOpacity(0);
    }
  });

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-150"
      style={{
        opacity,
        background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.8) 0%, rgba(6, 182, 212, 0.4) 40%, transparent 70%)',
        mixBlendMode: 'plus-lighter',
      }}
    />
  );
}
