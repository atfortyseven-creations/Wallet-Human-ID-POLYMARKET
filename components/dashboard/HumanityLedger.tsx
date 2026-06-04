"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MermaidDiagram } from '@/components/privacy/MermaidDiagram';
import { AZTEC_ROADMAP, AztecRoadmapItem } from '@/lib/content/aztecRoadmapData';

// ─── Roadmap Data ─────────────────────────────────────────────────────────────

interface RoadmapNode {
  id: string;
  title: string;
  status: 'live' | 'building' | 'planned';
  quarter: string;
  description: string;
  x: number;
  y: number;
}

interface RoadmapEdge {
  from: string;
  to: string;
}

const NODES: RoadmapNode[] = [
  // Phase 1 (Milestone 1) - Live: Lo que se mandó al foro y está aceptado/implementado
  { id: 'm1-connect', title: 'Wallet RFGP Proposal', status: 'live', quarter: 'Currently Live', description: 'Accepted Aztec Wallet RFGP proposal. Whale Network acting as a unified Web3 Command Center and privacy-preserving wallet for the Aztec ecosystem.', x: 100, y: 140 },
  { id: 'm1-ui', title: 'PXE & Circuit Foundation', status: 'live', quarter: 'Currently Live', description: 'Dynamic PXE local integration via Next.js and 18 pure Noir contracts (Aztec.nr) deployed locally, fulfilling the core wallet logic requirements.', x: 100, y: 300 },
  
  // Phase 2 (Milestone 2) - Building: Lo que falta por completar y qué se hará
  { id: 'm2-portfolio', title: 'Security Audits', status: 'building', quarter: 'In Progress', description: 'Pending formal security audits of our Aztec.nr account contracts, authwits, and ZK session syncing mechanisms to ensure absolute user safety.', x: 450, y: 140 },
  { id: 'm2-registry', title: 'Testnet Integration', status: 'building', quarter: 'In Progress', description: 'Future deployment of the wallet to the decentralized Aztec testnet, integrating Fee Juice, Paymasters, and seamless onboarding flows.', x: 450, y: 300 },

  // Phase 3 (Milestone 3) - Live: Lo que está completo y qué se hará (Sincronización)
  { id: 'm3-mobile', title: 'Cross-Device Orchestration', status: 'live', quarter: 'Upcoming', description: 'ZK Session Sync architecture finalized. Desktop clients securely poll PXE state updates triggered by mobile device signatures.', x: 800, y: 140 },
  { id: 'm3-mainnet', title: 'Mobile Finalization', status: 'live', quarter: 'Upcoming', description: 'Next steps include finalizing the native iOS/Android applications to act as biometric signers and QR-code synchronizers for the desktop wallet.', x: 800, y: 300 },
];

const EDGES: RoadmapEdge[] = [
  { from: 'm1-connect', to: 'm2-portfolio' },
  { from: 'm1-ui', to: 'm2-registry' },
  { from: 'm2-portfolio', to: 'm3-mobile' },
  { from: 'm2-registry', to: 'm3-mainnet' },
];

const STATUS_CONFIG = {
  live:     { label: 'Active',     dot: 'bg-black',       text: 'text-black',       border: 'border-black' },
  building: { label: 'Building', dot: 'bg-black/40',    text: 'text-black/60',    border: 'border-black/40' },
  planned:  { label: 'Planned',  dot: 'bg-black/15',    text: 'text-black/35',    border: 'border-black/15' },
};

const NODE_W = 200;
const NODE_H = 88;

// ─── Canvas Component ─────────────────────────────────────────────────────────

function RoadmapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 40, y: 60, scale: 0.9 });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<RoadmapNode | null>(null);
  const dragStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  const CANVAS_W = 1740;
  const CANVAS_H = 620;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const { mx, my, tx, ty } = dragStart.current;
    const dx = e.clientX - mx;
    const dy = e.clientY - my;
    setTransform(t => ({ ...t, x: tx + dx, y: ty + dy }));
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform(t => {
      const next = Math.min(2, Math.max(0.3, t.scale + delta));
      return { ...t, scale: next };
    });
  }, []);

  const zoomIn  = () => setTransform(t => ({ ...t, scale: Math.min(2, t.scale + 0.15) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale - 0.15) }));
  const reset   = () => setTransform({ x: 40, y: 60, scale: 0.9 });

  // Build edge path between node centers
  function edgePath(from: RoadmapNode, to: RoadmapNode) {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setDragging(true);
    dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !dragStart.current) return;
    const { mx, my, tx, ty } = dragStart.current;
    const dx = e.touches[0].clientX - mx;
    const dy = e.touches[0].clientY - my;
    setTransform(t => ({ ...t, x: tx + dx, y: ty + dy }));
  }, [dragging]);

  const onTouchEnd = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Toolbar - floating absolute so it doesn't block dragging in the main area */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-20 flex items-center justify-between sm:justify-center px-4 py-3 border border-black/10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-4 sm:gap-5">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 sm:gap-2">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-black/50">{v.label}</span>
            </div>
          ))}
        </div>
        <div className="w-[1px] h-4 bg-black/10 mx-2 sm:mx-4 hidden sm:block"></div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-black/60 font-bold text-lg leading-none">−</button>
          <button onClick={zoomIn}  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-black/60 font-bold text-lg leading-none">+</button>
          <button onClick={reset}   className="px-2 sm:px-3 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-black/50">Reset</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden bg-white"
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onWheel={onWheel}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
            backgroundSize: `${32 * transform.scale}px ${32 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        />

        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: CANVAS_W,
            height: CANVAS_H,
            position: 'absolute',
          }}
        >
          {/* Quarter labels */}
          {[
            { label: 'Currently Live', x: 100 },
            { label: 'In Progress', x: 450 },
            { label: 'Upcoming', x: 800 },
          ].map(q => (

            <div
              key={q.label}
              style={{ position: 'absolute', left: q.x, top: 0, width: NODE_W }}
              className="flex items-center justify-center"
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-black/25">
                {q.label}
              </span>
            </div>
          ))}

          {/* SVG Edges */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none', overflow: 'visible' }}
          >
            {EDGES.map(e => {
              const fromNode = NODES.find(n => n.id === e.from);
              const toNode   = NODES.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(fromNode, toNode)}
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray={toNode.status === 'planned' ? '5 4' : undefined}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map(node => {
            const cfg = STATUS_CONFIG[node.status];
            const isSelected = selected?.id === node.id;
            return (
              <div
                key={node.id}
                data-node="true"
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y + 24,
                  width: NODE_W,
                  minHeight: NODE_H,
                }}
                className={`bg-white border transition-all duration-150 cursor-pointer select-none ${
                  isSelected ? 'border-black shadow-md' : `${cfg.border} hover:border-black/40 hover:shadow-sm`
                }`}
                onClick={() => setSelected(isSelected ? null : node)}
              >
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`font-mono text-[9px] font-black uppercase tracking-wider ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold tracking-tight text-black leading-snug">
                    {node.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="border-t border-black/8 bg-white px-6 py-5 flex items-start gap-6"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/40">
                {selected.quarter} · {STATUS_CONFIG[selected.status].label}
              </span>
            </div>
            <h3 className="text-[15px] font-black tracking-tight text-black mb-1.5">{selected.title}</h3>
            <p className="text-[13px] text-black/55 leading-relaxed max-w-[640px]">{selected.description}</p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 w-8 h-8 flex items-center justify-center border border-black/12 hover:bg-black/[0.03] transition-colors text-black/40 font-bold text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HumanityLedger() {
  return (
    <div className="relative w-full h-full min-h-0 bg-white overflow-y-auto flex flex-col">
      {/* Header overlaid with pointer-events-none to let drag pass through */}
      <div className="absolute top-0 left-0 right-0 px-6 py-6 sm:py-8 z-10 pointer-events-none bg-gradient-to-b from-white via-white/90 to-transparent">
        <div className="max-w-[900px]">
          <h1 className="text-[22px] font-black tracking-tight text-black mb-2 pointer-events-auto">
            Protocol Roadmap
          </h1>
          <p className="text-[12px] sm:text-[13.5px] text-black/50 leading-relaxed pointer-events-auto max-w-xl">
            The development timeline for Whale Network on Aztec Network. Drag the canvas to explore,
            scroll to zoom, and click any node for details.
          </p>
        </div>
      </div>

      {/* Fullscreen Roadmap Canvas Container - Real Time Panel */}
      <div className="relative w-full flex-1">
        <RoadmapCanvas />
      </div>
    </div>
  );
}
