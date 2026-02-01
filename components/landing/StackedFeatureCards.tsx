"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { GPULottie } from "@/components/creative/GPULottie";

interface CardData {
  id: number;
  title: string;
  description: string;
  lottieSrc: string;
  color: string;
}

const CARDS: CardData[] = [
  {
    id: 1,
    title: "Mercados de Predicción",
    description: "Opera sobre resultados futuros con privacidad de conocimiento cero.",
    lottieSrc: "https://lottie.host/8d48bb95-7124-4224-bcae-2144799011af/lHDi1Xo9qO.lottie",
    color: "#1a1a1a" // Dark card
  },
  {
    id: 2,
    title: "Human Wallet",
    description: "Bóveda no custodial asegurada con biometría para tus activos digitales.",
    lottieSrc: "https://lottie.host/8d48bb95-7124-4224-bcae-2144799011af/lHDi1Xo9qO.lottie", // Placeholder
    color: "#2a2a2a"
  },
  {
    id: 3,
    title: "Gobernanza de Rendimiento",
    description: "Gana recompensas participando en las decisiones del protocolo.",
    lottieSrc: "https://lottie.host/8d48bb95-7124-4224-bcae-2144799011af/lHDi1Xo9qO.lottie",
    color: "#3a3a3a"
  },
  {
    id: 4,
    title: "Liquidaciones Globales",
    description: "Transferencias transfronterizas instantáneas con liquidez en stablecoins.",
    lottieSrc: "https://lottie.host/8d48bb95-7124-4224-bcae-2144799011af/lHDi1Xo9qO.lottie",
    color: "#4a4a4a"
  }
];

export function StackedFeatureCards() {
  const [cards, setCards] = useState(CARDS);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-rotate effect (optional, or just reliable stacking)
  useEffect(() => {
    const interval = setInterval(() => {
        // Automatically move bottom card to top every 5 seconds to keep it alive?
        // Or actually, user asked for "united in one and stacked all on the first one".
        // Let's rely on interaction but maybe a subtle pulse.
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const moveToEnd = (fromIndex: number) => {
    setCards((currentCards) => {
      const newCards = [...currentCards];
      const [movedCard] = newCards.splice(fromIndex, 1);
      newCards.unshift(movedCard); // Move to bottom (back of stack)
      return newCards;
    });
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1000px] overflow-visible">
       {/* Cards Stack */}
       <div className="relative w-[90vw] max-w-[400px] h-[500px]">
          <AnimatePresence>
            {cards.map((card, index) => {
               // Index 0 is bottom, Index length-1 is top (visible)
               // Wait, map order... usually last rendered is on top.
               // So specific index logic needed.
               // Let's render in order but control z-index.
               
               // Actually for a stack, we want the LAST item in array to be on TOP.
               const isTop = index === cards.length - 1;
               const offset = cards.length - 1 - index; // 0 for top, 1 for next, etc.
               
               return (
                 <Card 
                    key={card.id} 
                    data={card} 
                    index={index} 
                    isTop={isTop}
                    offset={offset}
                    onSwipe={() => moveToEnd(index)}
                 />
               );
            })}
          </AnimatePresence>
       </div>
    </div>
  );
}

function Card({ data, index, isTop, offset, onSwipe }: { 
    data: CardData; 
    index: number; 
    isTop: boolean; 
    offset: number;
    onSwipe: () => void;
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_: any, info: any) => {
        if (Math.abs(info.offset.x) > 100) {
            onSwipe();
        }
    };

    // Visual stacking logic
    // Top card (offset 0): scale 1, y 0
    // Next (offset 1): scale 0.95, y -10
    // Next (offset 2): scale 0.9, y -20
    const scale = 1 - offset * 0.05;
    const yOffset = offset * -15; 
    const zIndex = 100 - offset;
    const brightness = 1 - offset * 0.1;

    return (
        <motion.div
            style={{ 
                x: isTop ? x : 0, 
                rotate: isTop ? rotate : 0,
                zIndex,
                scale,
                y: yOffset,
                filter: `brightness(${brightness})`
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale, opacity: 1, y: yOffset }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-0 left-0 w-full h-full bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing backdrop-blur-md bg-opacity-90"
        >
            {/* Header */}
            <div>
                <h3 className="text-3xl font-black text-white mb-2 leading-tight">{data.title}</h3>
                <p className="text-neutral-400 text-sm">{data.description}</p>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full flex items-center justify-center relative my-4 rounded-xl overflow-hidden bg-black/20">
                 <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent z-10" />
                 <GPULottie src={data.lottieSrc} width={200} height={200} />
            </div>

            {/* Footer / Call to Action Indicator */}
            <div className="w-full flex justify-between items-center text-xs text-neutral-500 font-mono uppercase tracking-widest">
                <span>0{data.id}</span>
                <span>{isTop ? "DESLIZA >" : "EN COLA"}</span>
            </div>
        </motion.div>
    );
}
