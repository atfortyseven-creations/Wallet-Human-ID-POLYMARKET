"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

//  CONSTANTS 
const CW = 360, CH = 260;
const GROUND = CH - 55;
const WHALE_X = 65, WHALE_W = 46, WHALE_H = 34;
const GRAVITY = 0.72, JUMP_FORCE = -14.5, BASE_SPEED = 5;

type ObsType = 'rock_s' | 'rock_l' | 'ship' | 'crab';
interface Obs { x: number; y: number; w: number; h: number; type: ObsType; }
interface GS {
  wy: number; wvy: number; onGround: boolean;
  obstacles: Obs[]; score: number; speed: number;
  frame: number; nextIn: number; started: boolean; dead: boolean;
  gOffset: number;
}

function mkState(): GS {
  return { wy: GROUND - WHALE_H, wvy: 0, onGround: true, obstacles: [],
    score: 0, speed: BASE_SPEED, frame: 0, nextIn: 100,
    started: false, dead: false, gOffset: 0 };
}

function spawn(s: GS): Obs {
  const types: ObsType[] = ['rock_s','rock_s','rock_l','ship','crab'];
  const t = types[Math.floor(Math.random() * types.length)];
  const cfg: Record<ObsType,{w:number;h:number}> = {
    rock_s:{w:22,h:30}, rock_l:{w:34,h:46}, ship:{w:52,h:38}, crab:{w:30,h:24}
  };
  const c = cfg[t];
  return { x: CW + 20, y: GROUND - c.h, w: c.w, h: c.h, type: t };
}

//  DRAW HELPERS 
function drawBg(ctx: CanvasRenderingContext2D, frame: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#7EC8E3'); sky.addColorStop(1, '#C8EAF8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, GROUND);
  // clouds
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  [[60,28,20],[190,42,14],[300,22,18]].forEach(([cx,cy,r]) => {
    const x = ((cx - frame * 0.4 % CW + CW * 2) % (CW + 120)) - 60;
    ctx.beginPath();
    ctx.arc(x,cy,r,0,Math.PI*2); ctx.arc(x+r*.8,cy-r*.3,r*.65,0,Math.PI*2);
    ctx.arc(x+r*1.5,cy,r*.55,0,Math.PI*2); ctx.fill();
  });
}

function drawOcean(ctx: CanvasRenderingContext2D, frame: number) {
  const g = ctx.createLinearGradient(0, GROUND, 0, CH);
  g.addColorStop(0,'#1A8FA0'); g.addColorStop(1,'#0A5A6E');
  ctx.fillStyle = g; ctx.fillRect(0, GROUND, CW, CH - GROUND);
  // animated wave
  ctx.save(); ctx.beginPath();
  const wo = frame * 2.8 % 80;
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= CW; x += 4) {
    ctx.lineTo(x, GROUND - 5 + Math.sin(((x + wo) / 40) * Math.PI) * 4);
  }
  ctx.lineTo(CW, CH); ctx.lineTo(0, CH); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,GROUND); ctx.lineTo(CW,GROUND); ctx.stroke(); ctx.restore();
}

function drawObs(ctx: CanvasRenderingContext2D, o: Obs) {
  ctx.save();
  if (o.type === 'rock_s' || o.type === 'rock_l') {
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.ellipse(o.x+o.w/2, o.y+o.h*.65, o.w*.5, o.h*.52, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.ellipse(o.x+o.w*.32, o.y+o.h*.38, o.w*.17, o.h*.14, -.3, 0, Math.PI*2);
    ctx.fill();
  } else if (o.type === 'ship') {
    ctx.fillStyle = '#92400E';
    ctx.beginPath(); ctx.moveTo(o.x+8, o.y); ctx.lineTo(o.x+o.w-8, o.y);
    ctx.lineTo(o.x+o.w, o.y+o.h*.55); ctx.lineTo(o.x+o.w+6,GROUND);
    ctx.lineTo(o.x-6,GROUND); ctx.lineTo(o.x, o.y+o.h*.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#78350F'; ctx.fillRect(o.x+4, o.y, o.w-8, o.h*.22);
    ctx.strokeStyle='#3D1F08'; ctx.lineWidth=2.5; ctx.beginPath();
    ctx.moveTo(o.x+o.w/2, o.y); ctx.lineTo(o.x+o.w/2, o.y-26); ctx.stroke();
    ctx.fillStyle='rgba(255,250,245,0.95)'; ctx.beginPath();
    ctx.moveTo(o.x+o.w/2, o.y-26); ctx.lineTo(o.x+o.w/2+16, o.y-9);
    ctx.lineTo(o.x+o.w/2, o.y-2); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle='#DC4A18';
    ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h*.55,o.w*.42,o.h*.42,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#DC4A18'; ctx.lineWidth=2.5; ctx.lineCap='round';
    for (let i=0;i<3;i++) {
      const lx=o.x+o.w*.2+i*o.w*.25;
      ctx.beginPath(); ctx.moveTo(lx,o.y+o.h*.7); ctx.lineTo(lx-2,GROUND); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(o.x+2,o.y+o.h*.5); ctx.lineTo(o.x-9,o.y+o.h*.22); ctx.stroke();
    ctx.beginPath(); ctx.arc(o.x-11,o.y+o.h*.14,5,0,Math.PI*2); ctx.fillStyle='#DC4A18'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(o.x+o.w-2,o.y+o.h*.5); ctx.lineTo(o.x+o.w+9,o.y+o.h*.22); ctx.stroke();
    ctx.beginPath(); ctx.arc(o.x+o.w+11,o.y+o.h*.14,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath();
    ctx.arc(o.x+o.w*.34,o.y+o.h*.27,3.5,0,Math.PI*2);
    ctx.arc(o.x+o.w*.66,o.y+o.h*.27,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath();
    ctx.arc(o.x+o.w*.34,o.y+o.h*.27,1.5,0,Math.PI*2);
    ctx.arc(o.x+o.w*.66,o.y+o.h*.27,1.5,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawWhale(ctx: CanvasRenderingContext2D, s: GS, img: HTMLImageElement|null) {
  ctx.save();
  const cx = WHALE_X + WHALE_W/2, cy = s.wy + WHALE_H/2;
  const rot = Math.max(-.28, Math.min(.28, s.wvy * .018));
  ctx.translate(cx, cy); ctx.rotate(rot);
  if (s.dead) { ctx.globalAlpha=.6; ctx.rotate(Math.PI*.18); }
  if (img) ctx.drawImage(img, -WHALE_W/2, -WHALE_H/2, WHALE_W, WHALE_H);
  else {
    ctx.fillStyle='#1A1A2E';
    ctx.beginPath(); ctx.ellipse(0,0,WHALE_W/2,WHALE_H/2,0,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, score: number, hi: number, started: boolean) {
  ctx.save();
  ctx.font='bold 12px "Courier New",monospace'; ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.textAlign='right';
  ctx.fillText(`HI ${String(hi).padStart(5,'0')}  ${String(score).padStart(5,'0')}`, CW-12, 20);
  if (!started) {
    ctx.textAlign='center'; ctx.fillStyle='rgba(0,0,0,0.38)';
    ctx.font='bold 12px "Courier New",monospace';
    ctx.fillText(' TAP TO START ', CW/2, CH/2-8);
  }
  ctx.restore();
}

//  COMPONENT 
export function WhaleOfflineGame({ visible, onBack }: { visible: boolean; onBack?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const gsRef     = useRef<GS>(mkState());
  const hsRef     = useRef(0);
  const imgRef    = useRef<HTMLImageElement|null>(null);
  const [uiScore,   setUiScore]   = useState(0);
  const [uiDead,    setUiDead]    = useState(false);
  const [uiStarted, setUiStarted] = useState(false);
  const [uiHi,      setUiHi]      = useState(0);
  const [backOnline,setBackOnline]= useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image(); img.src = '/official-whale-monochrome.png';
    img.onload = () => { imgRef.current = img; };
    try { const v=parseInt(localStorage.getItem('whale_hs')||'0'); hsRef.current=v; setUiHi(v); } catch{}
  }, []);

  useEffect(() => {
    if (!visible) return;
    const on = () => setBackOnline(true);
    window.addEventListener('online', on);
    return () => window.removeEventListener('online', on);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      gsRef.current = mkState(); setUiScore(0); setUiDead(false);
      setUiStarted(false); setBackOnline(false);
    }
  }, [visible]);

  const jump = useCallback(() => {
    const s = gsRef.current;
    if (s.dead) {
      gsRef.current = { ...mkState(), started: true };
      setUiScore(0); setUiDead(false); setUiStarted(true); return;
    }
    if (!s.started) { s.started = true; setUiStarted(true); }
    if (s.onGround) { s.wvy = JUMP_FORCE; s.onGround = false; }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) return;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.667, 3); last = now;
      const s = gsRef.current;

      if (s.started && !s.dead) {
        s.wvy += GRAVITY * dt; s.wy += s.wvy * dt;
        if (s.wy >= GROUND - WHALE_H) { s.wy = GROUND - WHALE_H; s.wvy = 0; s.onGround = true; }
        s.speed = BASE_SPEED + s.score * .0022;
        s.nextIn -= dt;
        if (s.nextIn <= 0) {
          s.obstacles.push(spawn(s));
          s.nextIn = Math.max(45, 110 - s.score * .04) + Math.random() * 55;
        }
        for (const o of s.obstacles) o.x -= s.speed * dt;
        s.obstacles = s.obstacles.filter(o => o.x + o.w > -20);
        const wx1=WHALE_X+10, wx2=WHALE_X+WHALE_W-10, wy1=s.wy+8, wy2=s.wy+WHALE_H-6;
        for (const o of s.obstacles) {
          if (wx2>o.x+5 && wx1<o.x+o.w-5 && wy2>o.y+5 && wy1<o.y+o.h) {
            s.dead = true; setUiDead(true);
            const fs = Math.floor(s.score);
            if (fs > hsRef.current) { hsRef.current=fs; setUiHi(fs); try{localStorage.setItem('whale_hs',String(fs));}catch{} }
            break;
          }
        }
        s.score += .14 * dt; setUiScore(Math.floor(s.score));
      }
      s.frame += dt; s.gOffset = (s.gOffset + s.speed * .5 * dt) % 60;

      drawBg(ctx, s.frame); drawOcean(ctx, s.frame);
      s.obstacles.forEach(o => drawObs(ctx, o));
      drawWhale(ctx, s, imgRef.current);
      drawHUD(ctx, Math.floor(s.score), hsRef.current, s.started);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col bg-gradient-to-b from-[#7EC8E3] to-[#C8EAF8]"
      onClick={jump}
      onTouchStart={e => { e.preventDefault(); jump(); }}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div />
        <button
          className="px-4 py-1.5 bg-transparent rounded-full text-[9px] font-black uppercase tracking-widest text-black/40 pointer-events-auto active:scale-90 transition-all"
          onClick={e => { e.stopPropagation(); onBack?.(); }}
        >Esc</button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center px-4">
        <canvas
          ref={canvasRef} width={CW} height={CH}
          className="w-full max-w-sm rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-[6px] border-white/50"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Footer */}
      <div className="pb-10 flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence mode="wait">
          {uiDead ? (
            <motion.div key="dead" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-center">
              <p className="text-[13px] font-black uppercase tracking-[0.25em] text-black/55">GAME OVER</p>
              <p className="text-[9px] font-bold text-black/30 mt-1 tracking-widest">TAP TO RESTART</p>
            </motion.div>
          ) : !uiStarted ? (
            <motion.div key="start" animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.4,repeat:Infinity}} className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/45">TAP TO PLAY</p>
            </motion.div>
          ) : (
            <motion.div key="play" initial={{opacity:0}} animate={{opacity:1}} className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30">TAP TO JUMP</p>
            </motion.div>
          )}
        </AnimatePresence>

        {backOnline && (
          <motion.button
            initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="mt-2 px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl pointer-events-auto active:scale-95 transition-transform"
            onClick={e => { e.stopPropagation(); onBack?.(); }}
          > Conexión Restaurada  Volver</motion.button>
        )}
      </div>
    </motion.div>
  );
}
