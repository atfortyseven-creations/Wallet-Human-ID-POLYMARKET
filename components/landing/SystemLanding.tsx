"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from '@/lib/store/ui-store';
import { useRouter } from "next/navigation";
import { ReactLenis } from '@studio-freight/react-lenis';
import { 
  TrendingUp, Activity, Globe, Zap, Hexagon,
  Database, LayoutDashboard, Code2, Wallet, Fingerprint
} from "lucide-react";
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { usePerformanceMode, shouldRenderFrame } from '@/hooks/usePerformanceMode';

//  Particle Canvas Background 
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const perfMode = usePerformanceMode();
  const perfRef = useRef(perfMode);
  perfRef.current = perfMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isActive = true;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const particles: { x: number, y: number, vx: number, vy: number, s: number, alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            s: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.1
        });
    }

    let lastRenderDiff = 0;

    const render = (time: number) => {
        if (!isActive) return;
        animationFrameId = requestAnimationFrame(render);

        if (!perfRef.current.isVisible) return;
        if (!shouldRenderFrame(time, lastRenderDiff, perfRef.current.targetFps)) return;
        
        const delta = lastRenderDiff ? (time - lastRenderDiff) / 16.66 : 1;
        lastRenderDiff = time;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx * delta;
          p.y += p.vy * delta;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 245, 255, ${p.alpha})`; // Cyan neon
          ctx.fill();

          if (!perfRef.current.skipEdges) {
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = dx * dx + dy * dy;
                if (dist < 15000) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(159, 0, 255, ${(1 - dist / 15000) * 0.15})`; // Purple link
                    ctx.stroke();
                }
            }
          }
        }
    };

    const observer = new IntersectionObserver(([entry]) => {
       isActive = entry.isIntersecting;
       if (isActive && !animationFrameId) {
          lastRenderDiff = 0;
          animationFrameId = requestAnimationFrame(render); // Restart the loop 
       } else if (!isActive && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null; // Completely wipe loop from memory stack
       }
    }, { threshold: 0 });
    observer.observe(canvas);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
}

//  System Landing Component 
export function SystemLanding() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isConnected, connector, address } = useSystemAccount();
  
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <ReactLenis root options={{ smoothWheel: true, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      <div className="w-full bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#00f5ff]/30 selection:text-white"
           style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
        
        {/* HERO DASHBOARD (Exactly 100vh) */}
        <div className="relative w-full h-screen flex flex-col shrink-0 overflow-hidden">
          <ParticleBackground />

      {/* HEADER (10% roughly bounded to ~64px) */}
      <header className="relative z-20 h-[64px] shrink-0 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-[#00f5ff] blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="w-8 h-8 rounded-lg bg-black border border-[#00f5ff]/30 flex items-center justify-center relative">
               <Hexagon className="text-[#00f5ff]" size={18} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-black tracking-tighter text-white">WHALE ALERT NET</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00f5ff] flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00f5ff] animate-pulse" />
              KYC
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => router.push('/portfolio')} className="text-[12px] font-bold text-white/50 hover:text-white transition-colors">TERMINAL</button>
          <button onClick={() => router.push('/developer')} className="text-[12px] font-bold text-[#9f00ff] hover:text-[#b233ff] transition-colors flex items-center gap-1.5">
            <Code2 size={14} /> LEGACY VIEW
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {isConnected ? (
             <div className="flex items-center gap-3">
               <button onClick={() => router.push('/portfolio')} className="h-9 px-5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-[#00f5ff] transition-all duration-300">
                 Enter Terminal
               </button>
             </div>
          ) : (
            <button onClick={() => router.push('/connect')} className="relative group overflow-hidden rounded-lg">
               <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#9f00ff] opacity-80 group-hover:opacity-100 transition-opacity" />
               <div className="relative h-9 px-6 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-white border border-white/10 rounded-lg group-hover:border-transparent transition-colors">
                  <Fingerprint size={14} /> Connect Identity
               </div>
            </button>
          )}
        </div>
      </header>

      {/* THREE-PANE LAYOUT */}
      <div className="flex-1 flex min-h-0 relative z-10 w-full max-w-[1920px] mx-auto">
        
        {/* LEFT SIDEBAR (280px) */}
        <aside className="w-[280px] shrink-0 border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex flex-col pt-6 pb-4 px-4 h-full">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 px-2">Navigation Grid</div>
          <div className="flex flex-col gap-1 flex-1">
            <NavItem icon={<LayoutDashboard size={16} />} label="Command Center" active />

            <NavItem icon={<Globe size={16} />} label="Global Consensus" />
            <NavItem icon={<Zap size={16} />} label="System Intel" />
            <NavItem icon={<Database size={16} />} label="Event Ledger" />
            <NavItem icon={<Wallet size={16} />} label="Cold Storage" />
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="px-2 flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/30">WAN NODE: v7.0-alpha</span>
                <span className="text-[#00f5ff] text-[9px] font-mono animate-pulse">SYNCED</span>
             </div>
          </div>
        </aside>

        {/* MAIN HERO (flex-1) */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative p-6 md:p-10" style={{ scrollBehavior: 'smooth' }}>
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="max-w-4xl mx-auto flex flex-col gap-8"
           >
              {/* Header Title */}
              <div className="flex flex-col gap-2">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white font-sans">
                   VERIFY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#9f00ff]">EVERYTHING.</span>
                 </h1>
                 <p className="text-sm md:text-lg text-white/50 font-medium max-w-xl">
                   System analytics protocol tracking on-chain thermodynamic signatures. No simulation. No intermediaries. 240Hz reality.
                 </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <GodMetric title="NETWORK TVL" value="$14.2B" change="+2.4%" />
                 <GodMetric title="24H VOLUME" value="$3.1B" change="+12.1%" />
                 <GodMetric title="WHALES ACTIVE" value="1,240" change="-4%" negative />
                 <GodMetric title="AI CONFIDENCE" value="99.9%" change="MAX" />
              </div>

              {/* Chart Pane Placeholder */}
              <div className="w-full h-64 md:h-80 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00f5ff]/5 to-transparent pointer-events-none" />
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                     <span className="text-[11px] font-black uppercase tracking-widest text-white/60">Global Whale Topography</span>
                     <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-[#00f5ff]/10 text-[#00f5ff] text-[9px] font-bold">LIVE</span>
                     </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                     <div className="flex text-white/20 items-center justify-center h-full w-full">
                        <motion.div 
                          animate={{ scaleY: [1, 1.5, 0.8, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
                          className="w-1 h-32 bg-[#00f5ff]/20 rounded-full mx-1" style={{ transformOrigin: "bottom" }} />
                        <motion.div 
                          animate={{ scaleY: [1, 2, 1.1, 1.5, 1] }} 
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} 
                          className="w-1 h-24 bg-[#00f5ff]/40 rounded-full mx-1" style={{ transformOrigin: "bottom" }} />
                        <motion.div 
                          animate={{ scaleY: [1, 1.2, 2.5, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} 
                          className="w-1 h-40 bg-[#9f00ff]/60 rounded-full mx-1" style={{ transformOrigin: "bottom" }} />
                        <motion.div 
                          animate={{ scaleY: [1, 0.8, 1.5, 2, 1] }} 
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                          className="w-1 h-20 bg-[#00f5ff]/30 rounded-full mx-1" style={{ transformOrigin: "bottom" }} />
                     </div>
                  </div>
              </div>

              {/* Feed Preview */}
              <div className="flex flex-col gap-3">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Recent Anomalies</h2>
                 <div className="flex flex-col gap-2">
                    <MockAlertRow action="TRANSFER" amount="1,400 BTC" to="Unknown" time="2s ago" />
                    <MockAlertRow action="SWAP" amount="50,000 ETH" to="Binance" time="14s ago" />
                    <MockAlertRow action="MINT" amount="120M USDT" to="Treasury" time="45s ago" />
                 </div>
              </div>
           </motion.div>
        </main>

        {/* RIGHT SIDEBAR (320px) fixed */}
        <aside className="w-[320px] shrink-0 border-l border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md hidden xl:flex flex-col h-full sticky top-0 overflow-hidden">
            <div className="h-full w-full overflow-y-auto no-scrollbar p-6 flex flex-col gap-6">
                
                {/* KYC Panel */}
                <div className="p-5 rounded-2xl border border-white/10 bg-black/50 flex flex-col gap-4 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-50" />
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                         <Fingerprint size={20} className="text-[#ffd700]" />
                      </div>
                      <div>
                         <div className="text-[11px] font-black uppercase tracking-widest text-[#ffd700]">KYC</div>
                         <div className="text-[9px] font-mono text-white/40">Zk-Proof Generation Ready</div>
                      </div>
                   </div>
                   {isConnected ? (
                     <div className="text-[10px] font-mono bg-white/5 p-2 rounded border border-white/10 text-white/70 break-all text-center">
                       {connector?.id || 'Connected'} / {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'wallet linked'}
                     </div>
                   ) : (
                     <button onClick={() => router.push('/connect')} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                       Initialize Identity
                     </button>
                   )}
                </div>



            </div>
        </aside>
      </div>
      </div>
      </div>
    </ReactLenis>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group
      ${active ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5 border border-transparent'}
    `}>
      <span className={`${active ? 'text-[#00f5ff]' : 'text-white/40 group-hover:text-white'} transition-colors`}>{icon}</span>
      <span className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors`}>{label}</span>
    </button>
  )
}

function GodMetric({ title, value, change, negative = false }: { title: string, value: string, change: string, negative?: boolean }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
       <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-[20px] -mr-10 -mt-10" />
       <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{title}</span>
       <span className="text-2xl font-black text-white font-mono">{value}</span>
       <span className={`text-[10px] font-bold ${negative ? 'text-[#ff3366]' : 'text-[#00FF55]'}`}>{change} (24h)</span>
    </div>
  )
}

function MockAlertRow({ action, amount, to, time }: { action: string, amount: string, to: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group">
       <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10">
             <TrendingUp size={14} className={action === 'MINT' ? 'text-[#00FF55]' : 'text-[#00f5ff]'} />
          </div>
          <div className="flex flex-col">
             <span className="text-[12px] font-black text-white">{amount}</span>
             <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{action}  {to}</span>
          </div>
       </div>
       <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors">{time}</span>
    </div>
  )
}

function StreamItem({ text, highlight = false }: { text: string, highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-[10px] font-mono">
       <span className="text-white/20 mt-0.5"></span>
       <span className={highlight ? 'text-[#00f5ff]' : 'text-white/40'}>{text}</span>
    </div>
  )
}
