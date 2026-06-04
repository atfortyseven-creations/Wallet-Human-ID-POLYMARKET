"use client";

import React, { useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleEvent {
  x: number;
  y: number;
  id: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<RippleEvent[]>([]);

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const trigger = event.currentTarget.getBoundingClientRect();
    const size = Math.max(trigger.width, trigger.height);
    const x = event.clientX - trigger.left - size / 2;
    const y = event.clientY - trigger.top - size / 2;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);
  };

  useLayoutEffect(() => {
    let bounce: NodeJS.Timeout;
    if (ripples.length > 0) {
      bounce = setTimeout(() => {
        setRipples([]);
      }, 1000); // clear after animation
    }
    return () => clearTimeout(bounce);
  }, [ripples.length]);

  return { ripples, addRipple };
}

export const Ripple = ({ ripples, color = "rgba(0,0,0,0.1)" }: { ripples: RippleEvent[], color?: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
      <AnimatePresence>
        {ripples.map((ripple) => {
          const size = 150;
          return (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                top: ripple.y,
                left: ripple.x,
                width: size,
                height: size,
                backgroundColor: color,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
