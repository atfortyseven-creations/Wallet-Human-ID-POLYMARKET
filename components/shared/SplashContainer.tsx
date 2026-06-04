"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function WaterSplash({ x, y, containerWidth, onComplete }: { x: number; y: number; containerWidth: number; onComplete: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Base scale calculation (assumes the original design was for a ~300px container)
  const scaleFactor = Math.max(0.1, containerWidth / 300);

  return (
    <div className="absolute pointer-events-none z-[100]" style={{ left: x, top: y }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen bg-[#4FC3F7]"
          style={{ width: Math.max(2, 12 * scaleFactor), height: Math.max(2, 12 * scaleFactor) }}
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * (300 * scaleFactor),
            y: (-50 - Math.random() * 300) * scaleFactor,
            scale: 0.5 + Math.random(),
          }}
          transition={{ duration: 0.6 + Math.random() * 0.4, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[#4FC3F7]"
        style={{ borderStyle: 'solid' }}
        initial={{ opacity: 0.8, width: 10 * scaleFactor, height: 10 * scaleFactor, borderWidth: Math.max(1, 8 * scaleFactor) }}
        animate={{ opacity: 0, width: 250 * scaleFactor, height: 250 * scaleFactor, borderWidth: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function SplashContainer({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number; width: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    setSplashes((prev) => [...prev, { id: Date.now(), x, y, width }]);
  };

  const removeSplash = (id: number) => {
    setSplashes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div 
      className={`relative cursor-pointer select-none overflow-visible ${className}`} 
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {splashes.map((splash) => (
          <WaterSplash key={splash.id} x={splash.x} y={splash.y} containerWidth={splash.width} onComplete={() => removeSplash(splash.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
