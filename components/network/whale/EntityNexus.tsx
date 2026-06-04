"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useKnowledgeGraph, EntityAnalytics } from '@/hooks/useKnowledgeGraph';

interface NexusNode {
  id: string;
  label: string;
  type: 'whale' | 'exchange' | 'unknown' | 'miner';
  btcFlow: number;
  isCenter: boolean;
  x?: number;
  y?: number;
}

interface NexusLink {
  source: string;
  target: string;
  value: number;
  txid: string;
  time: number;
}

const NODE_COLORS = {
  whale: '#f59e0b',
  exchange: '#3b82f6',
  miner: '#8b5cf6',
  unknown: '#6b7280',
};

const CENTER_COLOR = '#10b981';

interface Props {
  address?: string;
}

export function EntityNexus({ address }: Props) {
  const [nodes, setNodes] = useState<NexusNode[]>([]);
  const [links, setLinks] = useState<NexusLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NexusNode | null>(null);
  
  // Knowledge Graph Oracle Integration
  const { getEntityInfo, loading: oracleLoading } = useKnowledgeGraph();
  const [oracleData, setOracleData] = useState<EntityAnalytics | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const W = 500, H = 380;

  useEffect(() => {
    if (selectedNode) {
        setOracleData(null);
        // Address fallback to ID for demo
        getEntityInfo(selectedNode.id).then(data => setOracleData(data));
    } else {
        setOracleData(null);
    }
  }, [selectedNode, getEntityInfo]);

  const layoutNodes = useCallback((rawNodes: NexusNode[], rawLinks: NexusLink[]) => {
    if (!rawNodes.length) return rawNodes;
    
    const cx = W / 2, cy = H / 2;
    const centerNode = rawNodes.find(n => n.isCenter);
    const others = rawNodes.filter(n => !n.isCenter);
    
    return rawNodes.map(node => {
      if (node.isCenter) return { ...node, x: cx, y: cy };
      
      const idx = others.indexOf(node);
      const total = others.length;
      const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
      const radius = node.type === 'exchange' ? 100 + (node.btcFlow > 10 ? 30 : 0) : 140;
      
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, []);

  const fetchData = useCallback(async (addr: string) => {
    setLoading(true);
    setSelectedNode(null);
    try {
      const res = await fetch(`/api/network/whale/entity-nexus?address=${addr}`);
      if (res.ok) {
        const data = await res.json();
        const layouted = layoutNodes(data.nodes || [], data.links || []);
        setNodes(layouted);
        setLinks(data.links || []);
      }
    } catch (e) {}
    setLoading(false);
  }, [layoutNodes]);

  useEffect(() => {
    if (address) fetchData(address);
  }, [address, fetchData]);

  const getNode = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="w-full rounded-3xl bg-[#030712] border border-purple-900/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Network className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">Entity Nexus</h3>
            <p className="text-white/30 text-xs font-mono">On-chain clustering map</p>
          </div>
        </div>
        {/* Legend */}
        <div className="hidden md:flex gap-3">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-white/30 text-[10px] capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        {!address ? (
          <div className="flex flex-col items-center justify-center h-72 gap-3">
            <Network className="w-12 h-12 text-white/10" />
            <p className="text-white/20 text-sm">Click on a whale to view its entity nexus</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-white/30 text-sm font-mono">Building entity graph...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-white/20 text-sm">No clustering data available</p>
          </div>
        ) : (
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '320px' }}>
            {/* Links */}
            {links.map((link, i) => {
              const src = getNode(link.source);
              const tgt = getNode(link.target);
              if (src?.x === undefined || src?.y === undefined || tgt?.x === undefined || tgt?.y === undefined) return null;
              return (
                <line
                  key={i}
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={Math.min(3, link.value / 5)}
                  strokeDasharray={link.value > 10 ? "none" : "4,4"}
                />
              );
            })}

            {/* Animated flow particles */}
            {links.slice(0, 8).map((link, i) => {
              const src = getNode(link.source);
              const tgt = getNode(link.target);
              if (src?.x === undefined || src?.y === undefined || tgt?.x === undefined || tgt?.y === undefined) return null;
              return (
                <circle key={`p-${i}`} r="2" fill="#10b981" opacity="0.6">
                  <animateMotion
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                    path={`M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`}
                  />
                </circle>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const color = node.isCenter ? CENTER_COLOR : NODE_COLORS[node.type];
              const radius = node.isCenter ? 16 : Math.min(12, 6 + node.btcFlow / 50);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                  {/* Glow */}
                  {(node.isCenter || isSelected) && (
                    <circle cx={node.x} cy={node.y} r={radius + 8} fill={color} opacity="0.15" />
                  )}
                  <circle
                    cx={node.x} cy={node.y} r={radius}
                    fill={color}
                    opacity={isSelected ? 1 : 0.8}
                    stroke={isSelected ? 'white' : 'transparent'}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x} y={node.y + radius + 12}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={9}
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Selected node info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-white/30 text-[10px] font-mono uppercase">{selectedNode.type} · {selectedNode.isCenter ? 'TARGET ADDRESS' : 'CONNECTED'}</p>
                <p className="text-white font-mono text-sm">{selectedNode.label}</p>
                </div>
                <div className="text-right">
                <p className="text-yellow-400 font-black">{selectedNode.btcFlow.toFixed(2)} BTC</p>
                <p className="text-white/20 text-xs">Recorded flow</p>
                </div>
            </div>

            {/* ORACLE HOLOGRAPHIC BADGE */}
            <div className="border-t border-white/5 pt-3">
                {oracleLoading ? (
                    <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-mono tracking-widest">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Querying Knowledge Graph Oracle...
                    </div>
                ) : oracleData ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`flex items-start gap-4 p-3 rounded-xl border ${oracleData.riskScore > 70 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}
                    >
                        {oracleData.riskScore > 70 ? <AlertTriangle className="text-red-400 w-5 h-5 shrink-0" /> : <ShieldCheck className="text-emerald-400 w-5 h-5 shrink-0" />}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold uppercase tracking-widest ${oracleData.riskScore > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    L2 ORACLE VERIFIED
                                </span>
                                <span className="text-[9px] text-white/40 font-mono tracking-widest">CONFIDENCE: {oracleData.confidence}%</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                <div>
                                    <span className="text-white/30 block mb-0.5">CATEGORY</span>
                                    <span className="text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">{oracleData.category}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-white/30 block mb-0.5">RISK SCORE</span>
                                    <span className={`font-black text-xs ${oracleData.riskScore > 70 ? 'text-red-400' : 'text-emerald-400'}`}>{oracleData.riskScore}/100</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest text-center">
                        No intel found in Oracle for this entity.
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

