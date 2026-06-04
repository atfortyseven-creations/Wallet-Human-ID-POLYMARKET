"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Crosshair, ShieldAlert, Cpu, Network, Zap, Waves } from "lucide-react";

const SUBMARINE_PARTS = [
  {
    id: "propulsion",
    title: "Motor de Rendimiento (Capa de Ejecución)",
    description: "El reactor principal. Procesa miles de movimientos de ballenas por segundo sin pestañear. Velocidad y fuerza extrema sin retrasos.",
    icon: Zap,
    x: "8%",
    y: "45%"
  },
  {
    id: "core",
    title: "El Núcleo Ballena (Whale Node)",
    description: "El cerebro blindado del sistema. Lee los bloques más profundos de la red y extrae información oculta antes de que salga a la superficie.",
    icon: Cpu,
    x: "35%",
    y: "55%"
  },
  {
    id: "sonar",
    title: "Sonar de Cero Conocimiento (Privacidad)",
    description: "Nadie sabe que estás ahí. Escaneamos los rastros gigantes en el radar sin revelar tu identidad ni tu ubicación en el ecosistema.",
    icon: Waves,
    x: "65%",
    y: "35%"
  },
  {
    id: "shield",
    title: "Blindaje Institucional",
    description: "Las mismas defensas criptográficas que usan los bancos de nivel élite. Tus datos están bajo kilómetros de presión pero totalmente intactos.",
    icon: ShieldAlert,
    x: "50%",
    y: "70%"
  },
  {
    id: "comms",
    title: "Antena Relé de Alto Cifrado (Mensajería)",
    description: "Comunícate con otros operadores bajo el agua. Transmisiones instantáneas e indescifrables protegidas por claves únicas.",
    icon: Network,
    x: "85%",
    y: "25%"
  }
];

export default function SubmarineDeconstruction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth out the scroll for a 240hz feel
  const smoothProgress = useSpring(scrollYProgress, { mass: 0.1, stiffness: 100, damping: 20 });

  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1, 0.95]);
  const opacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const yParallax = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[200vh] w-full bg-[var(--aztec-parchment)] py-40 overflow-hidden"
    >
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50" />
      
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pt-20">
        
        {/* Header Title Section */}
        <motion.div 
          style={{ opacity, y: useTransform(smoothProgress, [0, 0.5], [-50, 0]) }}
          className="absolute top-10 left-0 w-full text-center z-20 px-6"
        >
          <div className="font-aztec-h2 text-[12px] text-[var(--aztec-orchid)] uppercase tracking-[0.6em] mb-4">
            Anatomía del Protocolo
          </div>
          <h2 className="font-aztec-h1 text-4xl md:text-6xl text-[var(--aztec-ink)] uppercase tracking-tighter">
            Análisis de <span className="text-[var(--aztec-orchid)] italic">Inmersión Profunda</span>
          </h2>
          <p className="font-aztec-body text-sm text-[var(--aztec-ink)]/50 max-w-xl mx-auto mt-4 font-bold">
            Explora cada componente de la infraestructura Aztek Network. Un ecosistema diseñado como un submarino nuclear: indetectable, masivo y preciso.
          </p>
        </motion.div>

        {/* Blueprint Container */}
        <motion.div 
          style={{ scale, opacity, y: yParallax }}
          className="relative w-[90%] md:w-[85%] max-w-[1400px] aspect-[21/9] z-10"
        >
          {/* Edge Glows for the Blueprint */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--aztec-orchid)]/10 via-transparent to-[var(--aztec-chartreuse)]/10 blur-[80px] rounded-[3rem] pointer-events-none" />
          
          <div className="relative w-full h-full rounded-[2rem] border border-[var(--aztec-ink)]/10 bg-white/50 backdrop-blur-sm overflow-hidden p-4 shadow-2xl">
            
            {/* The Blueprint Image */}
            <Image 
              src="/CHECKPOINT/zh6g4tu4j5qe1.jpeg" 
              alt="Aztek Submarine Schematic"
              fill
              className="object-contain mix-blend-multiply opacity-90 p-4 drop-shadow-sm"
              unoptimized
            />

            {/* Glowing Scanline */}
            <motion.div 
               className="absolute top-0 bottom-0 w-[5px] bg-[var(--aztec-orchid)] blur-sm filter shadow-[0_0_20px_var(--aztec-orchid)] z-20"
               animate={{ left: ["0%", "100%", "0%"] }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Overlays / Callouts */}
            {SUBMARINE_PARTS.map((part, i) => {
              const Icon = part.icon;
              return (
                <motion.div
                  key={part.id}
                  className="absolute z-30 group"
                  style={{ left: part.x, top: part.y }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ root: containerRef, margin: "-10% 0px", once: false }}
                  transition={{ 
                    delay: i * 0.15, 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20 
                  }}
                >
                  <div className="relative">
                    {/* Pulsing Target Dot */}
                    <div className="absolute -inset-2 rounded-full bg-[var(--aztec-orchid)]/20 animate-ping" />
                    <button className="relative w-8 h-8 rounded-full bg-[var(--aztec-ink)] border-2 border-[var(--aztec-orchid)] flex items-center justify-center shadow-[0_0_15px_var(--aztec-orchid)] hover:scale-125 transition-transform duration-300">
                      <Crosshair size={14} className="text-[var(--aztec-orchid)] animate-spin-slow" />
                    </button>
                    
                    {/* Tooltip Card (Hidden by default, shown on hover) */}
                    <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 w-[280px] opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out z-50">
                      <div className="bg-[var(--aztec-ink)] relative rounded-2xl p-5 shadow-2xl overflow-hidden border border-[var(--aztec-orchid)]/30">
                         {/* Card Background Glow */}
                         <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--aztec-orchid)]/20 blur-xl rounded-full" />
                         
                         <div className="relative z-10">
                           <div className="w-8 h-8 rounded-lg bg-[var(--aztec-orchid)]/10 flex items-center justify-center mb-3">
                             <Icon size={16} className="text-[var(--aztec-orchid)]" />
                           </div>
                           <h4 className="font-aztec-h3 text-white text-md uppercase tracking-tight mb-2">
                             {part.title}
                           </h4>
                           <p className="font-aztec-body text-[11px] text-white/60 leading-relaxed font-medium">
                             {part.description}
                           </p>
                         </div>
                      </div>
                      
                      {/* Connection Line */}
                      <div className="absolute top-1/2 right-full w-4 h-[2px] bg-[var(--aztec-orchid)]/50 -translate-y-1/2" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
