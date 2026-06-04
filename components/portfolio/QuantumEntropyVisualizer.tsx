"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function QuantumEntropyVisualizer({ active }: { active: boolean }) {
  const [nodes, setNodes] = useState<{ x: number, y: number, size: number, opacity: number, delay: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    const newNodes = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 2
    }));
    setNodes(newNodes);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 " />
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, node.opacity, 0],
            scale: [0, 1, 0],
            x: [`${node.x}%`, `${node.x + (Math.random() * 10 - 5)}%`],
            y: [`${node.y}%`, `${node.y - 20}%`]
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut"
          }}
          className="absolute rounded-full bg-black/10  backdrop-blur-3xl"
          style={{
            width: node.size,
            height: node.size,
            left: `${node.x}%`,
            top: `${node.y}%`
          }}
        />
      ))}
      <svg className="absolute w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
