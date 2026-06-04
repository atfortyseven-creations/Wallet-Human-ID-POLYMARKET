"use client";

import React from 'react';

/**
 * AuroraBackground - Architectural Base Layer
 * Pure hardware acceleration via translateZ(0)
 * Animates only opacity and transform to maintain 60 FPS
 */
export function AuroraBackground() {
  return (
    <div 
      className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-[#0a0f0a]"
      style={{ transform: 'translateZ(0)' }}
    >
      {/*  MASTER AURORA LAYER 1  */}
      <div 
        className="absolute inset-[-50%] opacity-40 bg-gradient-to-tr from-[#1a2e1a] via-[#4ade80] to-transparent animate-aurora-shift-1"
        style={{ transform: 'translateZ(0)' }}
      />

      {/*  MASTER AURORA LAYER 2  */}
      <div 
        className="absolute inset-[-50%] opacity-30 bg-gradient-to-bl from-[#05291a] via-[#22c55e] to-transparent animate-aurora-shift-2"
        style={{ transform: 'translateZ(0)' }}
      />

      {/*  NOISE GRAIN SUBSTRATE  */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay noise-bg" />
      
      <style jsx global>{`
        @keyframes aurora-1 {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          50% { transform: translate(5%, 2%) rotate(2deg); opacity: 0.5; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
        }
        @keyframes aurora-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-3%, -5%) scale(1.1); opacity: 0.4; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
        }
        .animate-aurora-shift-1 {
          animation: aurora-1 25s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .animate-aurora-shift-2 {
          animation: aurora-2 35s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
