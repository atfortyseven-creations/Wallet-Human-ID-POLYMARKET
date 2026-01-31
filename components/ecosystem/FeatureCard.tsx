'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { FeatureContent } from '@/lib/ecosystem-content';

interface FeatureCardProps {
  feature: FeatureContent;
  onClick: () => void;
  index: number;
}

export function FeatureCard({ feature, onClick, index }: FeatureCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative p-8 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0a0a0a]/80 backdrop-blur-sm border border-white/5 hover:border-cyan-500/30 rounded-2xl transition-all duration-300 text-left overflow-hidden"
    >
      {/* Gradient Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
      
      {/* Border Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
          {feature.title}
        </h3>

        {/* Short Description */}
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
          {feature.shortDesc}
        </p>

        {/* Hover Indicator */}
        <div className="flex items-center gap-2 text-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
          <span className="text-sm font-mono uppercase tracking-wider">Explorar</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 group-hover:bg-cyan-500/10 blur-2xl transition-all duration-500" />
    </motion.button>
  );
}
