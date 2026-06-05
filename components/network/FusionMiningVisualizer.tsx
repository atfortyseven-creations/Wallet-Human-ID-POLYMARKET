"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Box, Activity } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetX?: number;
  targetY?: number;
  fusing: boolean;
}

export function FusionMiningVisualizer({ theme = 'default' }: { theme?: 'default' | 'arctic' }) {
    const isArctic = theme === 'arctic';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFusionTriggered, setIsFusionTriggered] = useState(false);
  const [lastBlockHeight, setLastBlockHeight] = useState<number | null>(null);
  
  // Fetch real mempool data
  const { data: mempoolBlocks } = useQuery({
    queryKey: ["network", "mempool-blocks"],
    queryFn: async () => {
      const res = await fetch("/api/network/v1/fees/mempool-blocks");
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch latest blocks to detect mining
  const { data: blocks } = useQuery({
    queryKey: ["network", "blocks"],
    queryFn: async () => {
      const res = await fetch("/api/network/v1/blocks");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Detect new block
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      const currentHeight = blocks[0].height;
      if (lastBlockHeight !== null && currentHeight > lastBlockHeight) {
        // TRIGGER FUSION!
        setIsFusionTriggered(true);
        setTimeout(() => setIsFusionTriggered(false), 3000);
      }
      setLastBlockHeight(currentHeight);
    }
  }, [blocks, lastBlockHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initial particles based on mempool tx count (simplified)
    const txCount = mempoolBlocks?.[0]?.nTx || 2500;
    const maxParticles = Math.min(txCount / 10, 300); // UI performance limit

    const createParticle = (isForFusion = false): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        fusing: false
      };
    };

    const initParticles = () => {
      particles = Array.from({ length: maxParticles }, () => createParticle());
    };
    initParticles();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particles.forEach((p, i) => {
        if (isFusionTriggered && !p.fusing) {
          p.fusing = true;
          // Target is a rectangular block area in the center
          p.targetX = centerX + (Math.random() - 0.5) * 120;
          p.targetY = centerY + (Math.random() - 0.5) * 120;
        }

        if (p.fusing) {
          // Accelerate to center
          const dx = p.targetX! - p.x;
          const dy = p.targetY! - p.y;
          p.vx += dx * 0.01;
          p.vy += dy * 0.01;
          p.vx *= 0.9; // Friction
          p.vy *= 0.9;
          p.alpha = Math.min(p.alpha + 0.02, 1);
          p.size = Math.min(p.size + 0.1, 4);
        } else {
          // Drifting motion
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isArctic ? `rgba(79, 70, 229, ${p.alpha})` : `rgba(0, 255, 157, ${p.alpha})`;
        ctx.shadowBlur = p.fusing ? 15 : 0;
        ctx.shadowColor = isArctic ? "#4f46e5" : "#00ff9d";
        ctx.fill();
      });

      // Draw faint connections between nearby points (Legendary look)
      if (!isFusionTriggered) {
          ctx.beginPath();
          ctx.strokeStyle = isArctic ? "rgba(79, 70, 229, 0.1)" : "rgba(255, 255, 255, 0.03)";
          ctx.lineWidth = 0.5;
          for(let i=0; i < particles.length; i+=10) {
              for(let j=i+1; j < particles.length; j+=10) {
                  const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                  if (dist < 100) {
                      ctx.moveTo(particles[i].x, particles[i].y);
                      ctx.lineTo(particles[j].x, particles[j].y);
                  }
              }
          }
          ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isFusionTriggered, mempoolBlocks]);

  return (
    <div className={`relative w-full h-[500px] rounded-[2rem] border overflow-hidden group ${isArctic ? 'bg-indigo-50/30 border-slate-200' : 'bg-[#121212] border-white/5'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* HUD Layer */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between pointer-events-none">
        {/* Top row: stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
           <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                 <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isArctic ? 'bg-indigo-600' : 'bg-[#00ff9d]'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-[0.3em] truncate ${isArctic ? 'text-indigo-600' : 'text-[#00ff9d]'}`}>Mempool Active Stream</span>
              </div>
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${isArctic ? 'text-slate-900' : 'text-white'}`}>
                Fusion <span className={isArctic ? 'text-slate-300' : 'text-white/20'}>Visualizer</span>
              </h2>
           </div>
           
           <div className={`${isArctic ? 'bg-white/80 border-slate-200' : 'bg-black/60 border-white/10'} backdrop-blur-xl border px-4 py-2 rounded-xl flex items-center gap-4 shrink-0 transition-colors`}>
              <div className="text-right">
                 <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isArctic ? 'text-slate-400' : 'text-white/30'}`}>Mempool TXs</div>
                 <div className={`text-base md:text-xl font-black font-mono ${isArctic ? 'text-slate-900' : 'text-white'}`}>
                    {mempoolBlocks?.[0]?.nTx.toLocaleString() || "---"}
                 </div>
              </div>
              <div className={`w-px h-7 ${isArctic ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className="text-right">
                 <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isArctic ? 'text-slate-400' : 'text-white/30'}`}>Next Block Est.</div>
                 <div className={`text-base md:text-xl font-black font-mono ${isArctic ? 'text-indigo-600' : 'text-[#00ff9d]'}`}>
                    ~{mempoolBlocks?.[0]?.medianFee.toFixed(1) || "---"} <span className="text-[10px]">sat/vB</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom row: stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
            <div className="max-w-xs sm:max-w-[45%]">
               <p className={`text-[9px] md:text-[10px] font-medium leading-relaxed uppercase tracking-wider ${isArctic ? 'text-slate-500' : 'text-white/40'}`}>
                 Each point represents a pending institutional transaction. Upon detection of a new block, data atoms fuse into a unified assertion.
               </p>
            </div>
           
           <AnimatePresence>
              {isFusionTriggered && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.2 }}
                   className={`flex items-center gap-2 md:gap-4 px-4 py-2 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest shrink-0 ${isArctic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-[#00ff9d] text-black shadow-[0_0_50px_rgba(0,255,157,0.4)]'}`}
                >
                   <Zap size={14} fill={isArctic ? "white" : "black"} />
                   Block Mined - Fusion Successful!
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Grid Lines (Web3 Style) */}
      <div className={`absolute inset-0 pointer-events-none opacity-20`}>
         <div className="absolute inset-0" style={{ backgroundImage: isArctic ? 'linear-gradient(rgba(79,70,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.05) 1px, transparent 1px)' : 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}

