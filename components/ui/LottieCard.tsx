'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Lazy load LottieCanvas for performance
const LottieCanvas = dynamic(() => import('./LottieCanvas'), { 
  ssr: false,
  loading: () => <div className="w-24 h-24 bg-neutral-200/20 rounded-full animate-pulse" />
});

interface LottieCardProps {
  lottieSrc: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  lottieSize?: 'sm' | 'md' | 'lg';
}

export default function LottieCard({ 
  lottieSrc, 
  title, 
  subtitle, 
  children, 
  className = "",
  lottieSize = 'md'
}: LottieCardProps) {
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div 
      className={`
        group relative p-6 rounded-3xl 
        bg-gradient-to-br from-white/5 to-white/[0.02]
        border border-white/10
        backdrop-blur-md
        hover:scale-[1.02] hover:border-white/20
        transition-all duration-300 ease-out
        cursor-pointer
        ${className}
      `}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Lottie Animation */}
        <div className={`${sizeClasses[lottieSize]} mb-4 flex items-center justify-center`}>
          <LottieCanvas 
            src={lottieSrc}
            className="w-full h-full"
            autoplay={true}
            loop={true}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-white mb-2 group-hover:text-indigo-200 transition-colors">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-white/60 mb-4 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Additional content */}
        {children && (
          <div className="mt-4 w-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
