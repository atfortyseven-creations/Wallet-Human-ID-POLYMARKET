"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, onClick, hoverEffect = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, y: -2 } : {}}
      whileTap={hoverEffect ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        hoverEffect && "cursor-pointer",
        className
      )}
    >
      {/* Zero-Latency Local Noise Texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none noise-bg" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}

