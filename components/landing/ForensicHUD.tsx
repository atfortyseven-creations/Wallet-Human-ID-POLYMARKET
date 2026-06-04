"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ForensicHUD() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.8, 0.8, 0.3]);
  const scanlineY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div 
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {/* Corner Brackets */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-[var(--aztec-orchid)]/20" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-[var(--aztec-orchid)]/20" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-[var(--aztec-orchid)]/20" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-[var(--aztec-orchid)]/20" />



      {/* Minimalist Arctic Perimeter */}
      <div className="absolute inset-0 border-[20px] border-[var(--aztec-ink)]/5 pointer-events-none" />

      {/* Vignette Overlay - Aztec Parchment */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--aztec-parchment)_100%)] opacity-30" />
    </motion.div>
  );
}
