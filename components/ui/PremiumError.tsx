"use client";

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

interface PremiumErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function PremiumError({ 
  title = "Something went wrong", 
  message = "We encountered an error. Please try again.",
  onRetry,
  fullScreen = false 
}: PremiumErrorProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center max-w-md mx-auto"
    >
      {/* Error Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
      </div>

      {/* Error Text */}
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/60 mb-6">{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <PremiumButton
          variant="secondary"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
        >
          Try Again
        </PremiumButton>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-2xl">
      {content}
    </div>
  );
}

