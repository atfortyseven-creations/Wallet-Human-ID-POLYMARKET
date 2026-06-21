"use client";

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Roadmap Data — Full Demencial Architecture ────────────────────────────────

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

// Column X positions (phases)
const C1 = 80;   // Phase 1 — Completed (Core)
const C2 = 360;  // Phase 2 — Completed (Identity & Auth)
const C3 = 640;  // Phase 3 — Completed (ZK & Studio)
const C4 = 920;  // Phase 4 — Building (Markets & Compliance)
const C5 = 1200; // Phase 5 — Planned (Protocol & DAO)
const C6 = 1480; // Phase 6 — Planned (Jan 2027 Genesis)

const NODES: RoadmapNode[] = [

  // ─── PHASE 1: Core Infrastructure (LIVE) ─────────────────────────────────
  {
    id: 'frontend',
    title: 'Next.js 15 Frontend',
    status: 'live',
    quarter: 'Completed — Q1 2026',
    description: 'Next.js 15 App Router, Tailwind CSS, Framer Motion. Monorepo deployed to Railway with zero-downtime CI/CD from GitHub main branch.',
    x: C1, y: 60,
  },
  {
    id: 'db',
    title: 'PostgreSQL + Prisma ORM',
    status: 'live',
    quarter: 'Completed — Q1 2026',
    description: 'Production database on Railway with Prisma ORM. Handles users, sessions, Product Passports, Whale memberships, VIP tiers, and transaction history.',
    x: C1, y: 190,
  },
  {
    id: 'evm',
    title: 'EVM Wallet Integration',
    status: 'live',
    quarter: 'Completed — Q1 2026',
    description: 'Wagmi + Viem + AppKit (WalletConnect). Full multi-wallet support including MetaMask, Trust Wallet, and mobile deep-link flows for iOS and Android.',
    x: C1, y: 320,
  },
  {
    id: 'siwe',
    title: 'SIWE Auth + Sessions',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Sign-In with Ethereum session management. Fixed mobile SIWE double-signature bug — manual deep-link trigger avoids the MetaMask App-Switch Loop on iOS/Android.',
    x: C1, y: 450,
  },

  // ─── PHASE 2: Identity & Membership (LIVE) ───────────────────────────────
  {
    id: 'humanid',
    title: 'Human ID (DID)',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Decentralized Identity layer. Each wallet generates a cryptographic Human ID linked to a Merkle-proof KYC attestation. Forms the root of the Humanity Ledger.',
    x: C2, y: 60,
  },
  {
    id: 'vip',
    title: 'VIP Whale Membership',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Tiered membership system (Whale, Orca, Shark) with on-chain verification. Unlocks premium terminal modules, Studio Provenance, and priority liquidity routing.',
    x: C2, y: 190,
  },
  {
    id: 'portfolio',
    title: 'VIP Portfolio Dashboard',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Institutional terminal for VIP members. Displays real-time portfolio, Studio Provenance passports, Whale Chat, and transaction forensics in a unified shell.',
    x: C2, y: 320,
  },
  {
    id: 'whalechat',
    title: 'Whale Chat (E2E)',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'End-to-end encrypted P2P chat for verified Whale members. Fully functional on iOS and Android. Real-time messaging with no message-send bugs.',
    x: C2, y: 450,
  },

  // ─── PHASE 3: ZK Circuits & Studio Provenance (LIVE) ─────────────────────
  {
    id: 'zksandbox',
    title: 'ZK Circuit Sandbox',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'In-browser Noir compiler pipeline with real Nargo backend (deployed on Railway). 4-stage pipeline: AST Linter → ACIR Compile → Witness → UltraHonk Prove & Verify.',
    x: C3, y: 60,
  },
  {
    id: 'linter',
    title: 'Quantum Security Linter',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Frontend AST-level security analyser runs before every compilation. Detects Soundness vulnerabilities (unconstrained key hashes, range overflow exploits) and guides devs to safe fixes.',
    x: C3, y: 190,
  },
  {
    id: 'circuits',
    title: 'Abysmal Complexity Circuits',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Production ZK circuit library: Dark Pool Order Matching (Pedersen commitments), AML Travel Rule (Merkle OFAC), Omnichain MPT State Proof (L1→L2), Recursive SNARK Verification (Plonk-in-Plonk).',
    x: C3, y: 320,
  },
  {
    id: 'studio',
    title: 'Studio Provenance',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'Product Passport creation system. Users create up to 3 passports (Owner: unlimited). Each passport generates a QR code that forces wallet connection before revealing provenance data.',
    x: C3, y: 450,
  },
  {
    id: 'passportqr',
    title: 'Passport QR Guard',
    status: 'live',
    quarter: 'Completed — Q2 2026',
    description: 'PassportWalletGuard component intercepts QR scan attempts. Any public visitor scanning a product QR must connect their wallet to decrypt the full provenance chain.',
    x: C3, y: 580,
  },

  // ─── PHASE 4: Markets, Compliance & DeFi (BUILDING) ──────────────────────
  {
    id: 'darkpool',
    title: 'Dark Pool Orderbook',
    status: 'building',
    quarter: 'Building — Q3 2026',
    description: 'Institutional-grade private orderbook using ZK Order Matching circuit. Makers and takers cross without revealing price or volume. Powered by the compiled UltraHonk SNARK pipeline.',
    x: C4, y: 60,
  },
  {
    id: 'aml',
    title: 'AML / Travel Rule Oracle',
    status: 'building',
    quarter: 'Building — Q3 2026',
    description: 'Real-time compliance oracle. Screens every Whale-to-Whale transfer against a Merkle-anchored OFAC sanction tree. Proof generated in <2s via the Travel Rule Noir circuit.',
    x: C4, y: 190,
  },
  {
    id: 'aztecpxe',
    title: 'Aztec Network PXE',
    status: 'building',
    quarter: 'Building — Q3 2026',
    description: 'Private Execution Environment connecting to Aztec Testnet. Manages key material, claims tokens from the faucet, and executes private transfers with full ZK proof generation locally.',
    x: C4, y: 320,
  },
  {
    id: 'polymarket',
    title: 'Polymarket Intelligence',
    status: 'building',
    quarter: 'Building — Q3 2026',
    description: 'Institutional Polymarket panel aggregating whale position intelligence. Tracks large bet entries, shifting probabilities, and generates AI-based signal alerts for VIP members.',
    x: C4, y: 450,
  },
  {
    id: 'hyperliquid',
    title: 'Hyperliquid Execution',
    status: 'building',
    quarter: 'Building — Q3 2026',
    description: 'Direct perpetual DEX execution panel. Place, modify, and cancel orders on Hyperliquid L1 from within the Whale terminal with institutional slippage controls.',
    x: C4, y: 580,
  },

  // ─── PHASE 5: Protocol Expansion (PLANNED Q4 2026) ───────────────────────
  {
    id: 'omnichain',
    title: 'Omnichain MPT Bridge',
    status: 'planned',
    quarter: 'Planned — Q4 2026',
    description: 'Cross-chain state proof bridge using the Omnichain MPT Noir circuit. Allows Ethereum L1 storage slots to be verified inside Aztec L2 without trusting an oracle.',
    x: C5, y: 60,
  },
  {
    id: 'recursion',
    title: 'Recursive Proof Aggregation',
    status: 'planned',
    quarter: 'Planned — Q4 2026',
    description: 'Plonk-in-Plonk recursive accumulation for batch compliance proofs. One UltraHonk proof will aggregate thousands of AML checks for a single on-chain verification call.',
    x: C5, y: 190,
  },
  {
    id: 'audit',
    title: 'Smart Contract Audits',
    status: 'planned',
    quarter: 'Planned — Q4 2026',
    description: 'Third-party security audit of all Aztec.nr (Noir) circuits: CoreLedger, Token, AuthWit, AML Oracle, and Dark Pool Matcher. Required before Mainnet Alpha launch.',
    x: C5, y: 320,
  },
  {
    id: 'reputation',
    title: 'On-Chain Reputation System',
    status: 'planned',
    quarter: 'Planned — Q4 2026',
    description: 'ZK-attested reputation scoring for Whale identities. Score is computed from on-chain activity, compliance history, and staking tenure. Revealed as a range proof, never raw.',
    x: C5, y: 450,
  },
  {
    id: 'mobile',
    title: 'Mobile ZK Signers',
    status: 'planned',
    quarter: 'Planned — Q4 2026',
    description: 'Native iOS and Android apps acting as hardware-level biometric signers for Aztec transactions. Synced to the desktop terminal via QR code pairing and SIWE session bridge.',
    x: C5, y: 580,
  },

  // ─── PHASE 6: Genesis — January 2027 ─────────────────────────────────────
  {
    id: 'mainnet',
    title: 'Aztec Mainnet Alpha',
    status: 'planned',
    quarter: 'Genesis — Jan 2027',
    description: 'Production deployment of the full Whale Network protocol on Aztec Mainnet. CoreLedger contract, Token contract, and the first private institutional liquidity pool go live.',
    x: C6, y: 120,
  },
  {
    id: 'dao',
    title: 'Whale DAO + Governance',
    status: 'planned',
    quarter: 'Genesis — Jan 2027',
    description: 'On-chain governance via ZK-private voting. Token holders vote on treasury allocations, protocol upgrades, and partner integrations — without revealing their identity or stake.',
    x: C6, y: 290,
  },
  {
    id: 'cnmv',
    title: 'CNMV / MiCA Compliance',
    status: 'planned',
    quarter: 'Genesis — Jan 2027',
    description: 'Full regulatory compliance package for EU/Spain (CNMV notification, MiCA readiness). ZK Travel Rule proofs submitted automatically for transfers >€1,000.',
    x: C6, y: 460,
  },
];

const EDGES: RoadmapEdge[] = [
  // Phase 1 → Phase 2
  { from: 'frontend', to: 'humanid' },
  { from: 'db',       to: 'vip' },
  { from: 'evm',      to: 'portfolio' },
  { from: 'siwe',     to: 'whalechat' },
  // Phase 2 → Phase 3
  { from: 'humanid',  to: 'zksandbox' },
  { from: 'vip',      to: 'studio' },
  { from: 'portfolio',to: 'studio' },
  { from: 'whalechat',to: 'linter' },
  // Phase 3 → Phase 4
  { from: 'zksandbox',to: 'darkpool' },
  { from: 'linter',   to: 'darkpool' },
  { from: 'circuits', to: 'aml' },
  { from: 'circuits', to: 'aztecpxe' },
  { from: 'studio',   to: 'polymarket' },
  { from: 'passportqr',to: 'hyperliquid' },
  // Phase 4 → Phase 5
  { from: 'darkpool', to: 'omnichain' },
  { from: 'aml',      to: 'recursion' },
  { from: 'aztecpxe', to: 'audit' },
  { from: 'polymarket',to: 'reputation' },
  { from: 'hyperliquid',to: 'mobile' },
  // Phase 5 → Phase 6
  { from: 'omnichain',to: 'mainnet' },
  { from: 'audit',    to: 'mainnet' },
  { from: 'reputation',to: 'dao' },
  { from: 'mobile',   to: 'cnmv' },
];

const STATUS_CONFIG = {
  live:     { label: 'Completed',  dot: 'bg-black',       text: 'text-black',       border: 'border-black' },
  building: { label: 'Building',   dot: 'bg-black/40',    text: 'text-black/60',    border: 'border-black/40' },
  planned:  { label: 'Planned',    dot: 'bg-black/15',    text: 'text-black/35',    border: 'border-black/15' },
};

const NODE_W = 200;
const NODE_H = 88;

// ─── Canvas Component ─────────────────────────────────────────────────────────

function RoadmapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 30, y: 60, scale: 0.78 });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<RoadmapNode | null>(null);
  const dragStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  const CANVAS_W = 1980;
  const CANVAS_H = 780;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const { mx, my, tx, ty } = dragStart.current;
    setTransform(t => ({ ...t, x: tx + (e.clientX - mx), y: ty + (e.clientY - my) }));
  }, [dragging]);

  const onMouseUp = useCallback(() => { setDragging(false); dragStart.current = null; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform(t => ({ ...t, scale: Math.min(2, Math.max(0.3, t.scale + delta)) }));
  }, []);

  const zoomIn  = () => setTransform(t => ({ ...t, scale: Math.min(2, t.scale + 0.15) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale - 0.15) }));
  const reset   = () => setTransform({ x: 30, y: 60, scale: 0.78 });

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
    setTransform(t => ({ ...t, x: tx + (e.touches[0].clientX - mx), y: ty + (e.touches[0].clientY - my) }));
  }, [dragging]);

  const onTouchEnd = useCallback(() => { setDragging(false); dragStart.current = null; }, []);

  const COLUMNS = [
    { label: 'Phase 1 — Core',          x: C1 },
    { label: 'Phase 2 — Identity',       x: C2 },
    { label: 'Phase 3 — ZK & Studio',    x: C3 },
    { label: 'Phase 4 — Markets',        x: C4 },
    { label: 'Phase 5 — Protocol',       x: C5 },
    { label: 'Phase 6 — Genesis Jan 27', x: C6 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Legend + zoom controls */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-20 flex items-center justify-between sm:justify-center px-4 py-3 border border-black/10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-4 sm:gap-5">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 sm:gap-2">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-black/50">{v.label}</span>
            </div>
          ))}
        </div>
        <div className="w-[1px] h-4 bg-black/10 mx-2 sm:mx-4 hidden sm:block" />
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
        {/* Dot grid */}
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
          {/* Column labels */}
          {COLUMNS.map(q => (
            <div
              key={q.label}
              style={{ position: 'absolute', left: q.x, top: 0, width: NODE_W }}
              className="flex items-center justify-center"
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black/25 whitespace-nowrap">
                {q.label}
              </span>
            </div>
          ))}

          {/* SVG Edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none', overflow: 'visible' }}>
            {EDGES.map(e => {
              const fromNode = NODES.find(n => n.id === e.from);
              const toNode   = NODES.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;
              // Dimmer edges for planned nodes
              const opacity = toNode.status === 'planned' ? 0.08 : toNode.status === 'building' ? 0.2 : 0.14;
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(fromNode, toNode)}
                  stroke={`rgba(0,0,0,${opacity})`}
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
                  <p className={`text-[12px] font-bold tracking-tight leading-snug ${node.status === 'live' ? 'text-black' : node.status === 'building' ? 'text-black/55' : 'text-black/30'}`}>
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
      <div className="absolute top-0 left-0 right-0 px-6 py-6 sm:py-8 z-10 pointer-events-none bg-gradient-to-b from-white via-white/90 to-transparent">
        <div className="max-w-[900px]">
          <h1 className="text-[22px] font-black tracking-tight text-black mb-2 pointer-events-auto">
            Protocol Roadmap
          </h1>
          <p className="text-[12px] sm:text-[13.5px] text-black/50 leading-relaxed pointer-events-auto max-w-xl">
            La arquitectura completa de Whale Network sobre Aztec Network — desde el core hasta el Genesis de Enero 2027.
            Arrastra el canvas para explorar, haz scroll para hacer zoom, y haz clic en cualquier nodo para ver detalles.
          </p>
        </div>
      </div>

      <div className="relative w-full flex-1">
        <RoadmapCanvas />
      </div>
    </div>
  );
}
