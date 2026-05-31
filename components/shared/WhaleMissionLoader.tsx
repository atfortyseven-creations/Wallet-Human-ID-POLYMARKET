"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

interface WhaleMissionLoaderProps {
  children: React.ReactNode;
  duration?: number;
  label?: string;
}

export function WhaleMissionLoader({ children, duration = 4000, label = "Loading..." }: WhaleMissionLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false);

  useEffect(() => {
    // Defer heavy child rendering to keep main thread free for Lottie animation on mobile
    const renderTimer = setTimeout(() => {
      setShouldRenderChildren(true);
    }, Math.max(0, duration - 100));

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => {
      clearTimeout(renderTimer);
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          >
            <div className="relative w-28 h-28 flex flex-col items-center justify-center">
              <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              {/* Removed dots and loading text as per user request */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-full flex flex-col flex-1"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        {shouldRenderChildren && children}
      </motion.div>
    </>
  );
}
