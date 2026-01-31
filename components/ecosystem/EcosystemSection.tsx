'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ScrollLottie } from '@/components/ui/ScrollLottie';
import { ecosystemFeatures, type FeatureContent } from '@/lib/ecosystem-content';

interface ExpandableFeatureProps {
  feature: FeatureContent;
}

function ExpandableFeature({ feature }: ExpandableFeatureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to content when expanded
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }, 100);
    }
  }, [isExpanded]);

  return (
    <div className="bg-zinc-900/80 border border-white/10 rounded-3xl overflow-hidden">
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-8 text-left hover:bg-white/5 transition-all group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-zinc-400 text-sm mb-3">
              {feature.subtitle}
            </p>
            <p className="text-zinc-300">
              {feature.shortDesc}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 border-t border-white/10">
              <div className="grid lg:grid-cols-2 gap-8 pt-8">
                {/* Left: Text Content */}
                <div className="space-y-6">
                  {/* Deep Dive */}
                  <div>
                    <h4 className="text-lg font-bold text-blue-400 mb-4 font-mono">
                      The Deep Dive
                    </h4>
                    <div className="space-y-4">
                      {feature.deepDive.map((paragraph, idx) => (
                        <p key={idx} className="text-zinc-300 leading-relaxed text-sm">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Human Edge */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-blue-400 mb-3 font-mono">
                      Why We Are #1
                    </h4>
                    <p className="text-white leading-relaxed text-sm">
                      {feature.humanEdge}
                    </p>
                  </div>

                  {/* CTA */}
                  {feature.cta && (
                    <a
                      href={feature.cta.link}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
                    >
                      {feature.cta.text}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Right: Lottie Animation */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md aspect-square">
                    <ScrollLottie
                      src={feature.lottieSrc}
                      className="w-full h-full"
                      speed={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EcosystemSection() {
  const [activeCategory, setActiveCategory] = useState<string>('core');

  const categories = [
    { id: 'core', label: 'Core Ecosystem' },
    { id: 'trading', label: 'Trading & Security' },
    { id: 'productos', label: 'Products' },
    { id: 'developer', label: 'Developer Hub' },
    { id: 'about', label: 'About' }
  ];

  const filteredFeatures = ecosystemFeatures.filter(
    f => f.category === activeCategory
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-32">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-xl">
          Human Defi
        </h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Engineering trust. We don't sell hype, we sell verifiable architecture.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-6 py-3 rounded-full font-bold transition-all
              ${activeCategory === cat.id
                ? 'bg-white text-black'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 border border-white/10'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {filteredFeatures.map((feature) => (
          <ExpandableFeature key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}
