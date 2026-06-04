"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LiqData {
  price: number;
  longs: number;
  shorts: number;
}

const BUCKET_SIZE = 50;

function computeLayout(data: LiqData[], currentEth: number, w: number, h: number) {
  if (data.length === 0) return { items: [], maxV: 0, currentX: 0 };
  const maxV = Math.max(...data.map(d => Math.max(d.longs, d.shorts)));
  
  const minP = Math.min(...data.map(d => d.price));
  const maxP = Math.max(...data.map(d => d.price));
  
  const items = data.map(d => {
    const x = ((d.price - minP) / (maxP - minP)) * (w - 40) + 20;
    const lH = (d.longs / maxV) * (h * 0.4);
    const sH = (d.shorts / maxV) * (h * 0.4);
    return { ...d, x, lH, sH };
  });

  const currentX = ((currentEth - minP) / (maxP - minP)) * (w - 40) + 20;
  return { items, maxV, currentX };
}

export function LiquidationRadar() {
  const [data, setData] = useState<LiqData[]>([]);
  const [ethPrice, setEthPrice] = useState(3200);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fake data for demo
  useEffect(() => {
    fetch("/api/network/whale/liquidations")
      .then(r => {
        if (!r.ok) throw new Error("API not ok");
        return r.json();
      })
      .then(d => {
        if (!d.data || d.data.length === 0) throw new Error("Empty Data");
        setData(d.data);
        if (d.currentPrice) setEthPrice(d.currentPrice);
      })
      .catch((e) => {
        console.error("Failed to fetch liquidations data:", e);
      });
  }, []);

  // Draw to canvas
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || data.length === 0) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const w = cvs.clientWidth;
    const h = cvs.clientHeight;
    cvs.width = w * window.devicePixelRatio;
    cvs.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { items, currentX } = computeLayout(data, ethPrice, w, h);
    
    // Clear
    ctx.clearRect(0, 0, w, h);
    
    // Baseline
    const midY = h * 0.55;
    ctx.beginPath();
    ctx.moveTo(10, midY);
    ctx.lineTo(w - 10, midY);
    ctx.strokeStyle = "#e7e5e4"; // stone-200
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bars
    const barW = Math.max(2, (w - 40) / items.length - 2);

    items.forEach(it => {
      // Longs (abajo) - Gris oscuro en modo claro
      if (it.lH > 0) {
        ctx.fillStyle = "#a8a29e"; // stone-400
        ctx.fillRect(it.x - barW/2, midY, barW, it.lH);
        
        ctx.fillStyle = "#57534e"; // text value
        if (it.lH > h * 0.15) {
          ctx.font = "9px 'Courier New', monospace";
          ctx.textAlign = "center";
          ctx.fillText(`$${(it.longs/1e6).toFixed(1)}M`, it.x, midY + it.lH + 12);
        }
      }

      // Shorts (arriba) - Gris oscuro
      if (it.sH > 0) {
        ctx.fillStyle = "#d6d3d1"; // stone-300
        ctx.fillRect(it.x - barW/2, midY - it.sH, barW, it.sH);

        if (it.sH > h * 0.15) {
          ctx.fillStyle = "#57534e";
          ctx.font = "9px 'Courier New', monospace";
          ctx.textAlign = "center";
          ctx.fillText(`$${(it.shorts/1e6).toFixed(1)}M`, it.x, midY - it.sH - 6);
        }
      }

      // Price labels
      if (it.price % 200 === 0) {
        ctx.fillStyle = "#a8a29e";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`$${it.price}`, it.x, h - 10);
      }
    });

    // Current Price Line
    if (currentX > 20 && currentX < w - 20) {
      ctx.beginPath();
      ctx.moveTo(currentX, 20);
      ctx.lineTo(currentX, h - 30);
      ctx.strokeStyle = "#1c1917"; // stone-900
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.roundRect(currentX - 25, 5, 50, 18, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`ETH $${ethPrice}`, currentX, 14);
    }
    else {
        // Si el currentX se va del rango visual, pintamos un banner
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.roundRect(10, 5, 50, 18, 4);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`$${ethPrice}`, 35, 14);
    }

  }, [data, ethPrice]);

  const totalLongs = data.reduce((s,d) => s + d.longs, 0);
  const totalShorts = data.reduce((s,d) => s + d.shorts, 0);

  return (
    <div className="w-full h-full min-h-[440px] flex flex-col bg-[#080808] border border-white/10 shadow-xl relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-stone-200/50 to-transparent" />

      <div className="px-8 py-8 border-b border-stone-200/60">
        <h2 className="text-2xl text-stone-900 font-medium mb-3 tracking-tight">DeFi Liquidations Map</h2>
        <p className="text-[13px] text-stone-500 max-w-lg leading-relaxed mb-6">
          Displays the volume of leveraged positions at risk of liquidation (forced selling) based on the current Ethereum price. High volume at a nearby level indicates a possible imminent cascade effect.
        </p>

        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Riesgo Cascadas</div>
            <div className={`px-2 py-0.5 text-[11px] font-bold border rounded-sm inline-block ${totalLongs > 30_000_000 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-stone-100 text-stone-700 border-stone-200"}`}>
              {totalLongs > 30_000_000 ? "ELEVADO" : "MODERADO"}
            </div>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Total Largo (Abajo)</div>
              <div className="text-sm font-mono text-stone-800">${(totalLongs / 1_000_000).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Total Corto (Arriba)</div>
              <div className="text-sm font-mono text-stone-800">${(totalShorts / 1_000_000).toFixed(1)}M</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative p-4">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}

