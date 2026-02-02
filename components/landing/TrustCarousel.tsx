"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, Lock, Eye, Zap } from 'lucide-react';

interface TrustSlide {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const TRUST_SLIDES: TrustSlide[] = [
    {
        id: 1,
        title: "Soberanía Total",
        description: "Tú controlas tus claves privadas. Sin custodia externa. Sin riesgo de congelación de fondos. Tu dinero es verdaderamente tuyo.",
        icon: <Shield size={48} />,
        color: "from-purple-600 to-indigo-700"
    },
    {
        id: 2,
        title: "Encriptación Militar",
        description: "AES-256-GCM. Mismo estándar usado por gobiernos y bancos centrales. Tus secretos están blindados contra cualquier amenaza.",
        icon: <Lock size={48} />,
        color: "from-indigo-600 to-blue-700"
    },
    {
        id: 3,
        title: "Transparencia Absoluta",
        description: "Código open-source. Auditorías independientes. Cada línea de seguridad es verificable. Sin puertas traseras.",
        icon: <Eye size={48} />,
        color: "from-blue-600 to-cyan-700"
    },
    {
        id: 4,
        title: "Velocidad Institucional",
        description: "Red optimizada. Transacciones instantáneas. Sin intermediarios. La experiencia profesional que mereces.",
        icon: <Zap size={48} />,
        color: "from-cyan-600 to-teal-700"
    }
];

export function TrustCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % TRUST_SLIDES.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + TRUST_SLIDES.length) % TRUST_SLIDES.length);

    const currentSlide = TRUST_SLIDES[currentIndex];

    return (
        <section className="w-full py-32 relative overflow-hidden">
            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F1F1F]/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Title */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{opacity:1, y:0}}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-[#1F1F1F] dark:text-white tracking-tighter mb-4">
                        ¿Por Qué Confiar en Human DeFi?
                    </h2>
                    <p className="text-lg text-[#1F1F1F]/60 dark:text-white/60 max-w-2xl mx-auto">
                        Seguridad institucional. Control personal. La bóveda digital del futuro.
                    </p>
                </motion.div>

                {/* Carousel Container */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="flex flex-col md:flex-row items-center gap-12 min-h-[400px]"
                        >
                            {/* Icon Side */}
                            <div className="flex-1 flex justify-center">
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${currentSlide.color} flex items-center justify-center text-white shadow-2xl`}
                                >
                                    {currentSlide.icon}
                                </motion.div>
                            </div>

                            {/* Text Side */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-3xl md:text-5xl font-black text-[#1F1F1F] dark:text-white mb-6">
                                    {currentSlide.title}
                                </h3>
                                <p className="text-lg md:text-xl text-[#1F1F1F]/70 dark:text-white/70 leading-relaxed">
                                    {currentSlide.description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white/90 dark:bg-[#1F1F1F]/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} className="text-[#1F1F1F] dark:text-white" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white/90 dark:bg-[#1F1F1F]/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} className="text-[#1F1F1F] dark:text-white" />
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-3 mt-12">
                    {TRUST_SLIDES.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                idx === currentIndex 
                                    ? 'bg-[#1F1F1F] dark:bg-white w-8' 
                                    : 'bg-[#1F1F1F]/30 dark:bg-white/30'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
