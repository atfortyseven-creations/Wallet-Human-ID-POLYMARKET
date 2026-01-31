'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from './FeatureCard';
import { ExpandableSection } from './ExpandableSection';
import { ecosystemFeatures, type FeatureContent } from '@/lib/ecosystem-content';

const categories = [
  { id: 'core', label: 'Ecosistema Core', color: 'cyan' },
  { id: 'trading', label: 'Trading & Seguridad', color: 'blue' },
  { id: 'productos', label: 'Productos', color: 'purple' },
  { id: 'developer', label: 'Developer Hub', color: 'green' },
  { id: 'about', label: 'Acerca de', color: 'orange' }
] as const;

export function EcosystemSection() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureContent | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('core');

  const filteredFeatures = ecosystemFeatures.filter(
    f => f.category === activeCategory
  );

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-6"
        >
          <div className="inline-block px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4">
            <span className="text-cyan-400 text-sm font-mono uppercase tracking-wider">
              Arquitectura de la Sinceridad
            </span>
          </div>

          <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
            Human Defi
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light">
            Ingeniería de confianza. No vendemos humo, vendemos arquitectura verificable.
          </p>

          <div className="pt-4 text-sm text-gray-500 font-mono">
            <p>Como Senior Developer con 30 años de experiencia:</p>
            <p className="text-cyan-400">La honestidad radical es nuestra única ventaja competitiva.</p>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all duration-300
                ${activeCategory === cat.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => setSelectedFeature(feature)}
              index={index}
            />
          ))}
        </div>

        {/* Senior Dev Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-8 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-mono">
                Nota del Arquitecto Senior
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Cada sección que ves aquí no es marketing. Es documentación técnica real de cómo 
                resolvemos problemas que otros proyectos ocultan. Haz clic en cualquier tarjeta 
                para ver el "Deep Dive" completo con fórmulas matemáticas, decisiones de arquitectura, 
                y la honestidad brutal sobre por qué somos mejores que la competencia.
              </p>
              <p className="text-cyan-400 text-sm font-mono">
                — El equipo de ingeniería de Human Defi
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expandable Modal */}
      {selectedFeature && (
        <ExpandableSection
          feature={selectedFeature}
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </section>
  );
}
