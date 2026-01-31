'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { ScrollLottie } from '@/components/ui/ScrollLottie';
import type { FeatureContent } from '@/lib/ecosystem-content';

interface ExpandableSectionProps {
  feature: FeatureContent;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpandableSection({ feature, isOpen, onClose }: ExpandableSectionProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[101] overflow-hidden"
          >
            <div className="relative h-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Scrollable Content */}
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
                <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-16">
                  {/* Header */}
                  <div className="mb-12 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                    >
                      <span className="text-cyan-400 text-sm font-mono uppercase tracking-wider">
                        {feature.subtitle}
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400"
                    >
                      {feature.title}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl text-gray-400 font-light max-w-3xl"
                    >
                      {feature.shortDesc}
                    </motion.p>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Text Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-8"
                    >
                      {/* Deep Dive */}
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white font-mono border-l-4 border-cyan-500 pl-4">
                          The Deep Dive
                        </h2>
                        {feature.deepDive.map((paragraph, idx) => (
                          <p
                            key={idx}
                            className="text-gray-300 leading-relaxed text-lg"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Human Edge */}
                      <div className="relative p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-3xl" />
                        <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">
                          Why We Are #1 (The Truth)
                        </h3>
                        <p className="text-white leading-relaxed text-lg relative z-10">
                          {feature.humanEdge}
                        </p>
                      </div>

                      {/* CTA */}
                      {feature.cta && (
                        <a
                          href={feature.cta.link}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                        >
                          {feature.cta.text}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </motion.div>

                    {/* Right: Lottie Animation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="sticky top-8 space-y-6"
                    >
                      <div className="relative aspect-square w-full max-w-lg mx-auto">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
                        
                        {/* Lottie Container */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          <ScrollLottie
                            src={feature.lottieSrc}
                            className="w-full h-full"
                            speed={1}
                          />
                        </div>
                      </div>

                      {/* Animation Description */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 italic">
                          {feature.lottieDescription}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
