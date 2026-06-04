"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Target, Zap, Link } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number;
    type: 'WHALE' | 'EXCHANGE' | 'BOT';
}

interface Edge {
    source: string;
    target: string;
}

export default function VisualTopography() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const nodes: Node[] = useMemo(() => [
        { id: '1', label: 'Jump Crypto', x: 200, y: 150, size: 40, type: 'WHALE' },
        { id: '2', label: 'Binance Hot Wallet', x: 500, y: 300, size: 60, type: 'EXCHANGE' },
        { id: '3', label: 'Wintermute', x: 700, y: 200, size: 45, type: 'WHALE' },
        { id: '4', label: 'Arbitrage Bot v4', x: 300, y: 400, size: 20, type: 'BOT' },
        { id: '5', label: 'Alameda Remnant', x: 100, y: 350, size: 35, type: 'WHALE' },
        { id: '6', label: 'Coinbase Custody', x: 600, y: 100, size: 55, type: 'EXCHANGE' },
    ], []);

    const edges: Edge[] = useMemo(() => [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
        { source: '4', target: '2' },
        { source: '5', target: '1' },
        { source: '6', target: '3' },
    ], []);

    return (
        <div className="p-8 h-full w-full min-h-0 flex flex-col bg-transparent select-none">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Visual Topography</h2>
                    <p className="text-[10px] text-black/30 font-bold uppercase tracking-[0.3em] mt-1">System Cluster Analysis // Q4 2026</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white border border-black/5 rounded-xl hover:bg-black hover:text-white transition-all">
                        <Share2 size={16} />
                    </button>
                    <button className="px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} /> Recalibrate
                    </button>
                </div>
            </header>

            <div className="flex-1 border-2 border-dashed border-black/[0.03] rounded-[3rem] relative overflow-hidden bg-white/10 backdrop-blur-sm group">
                {/*  CONNECTION GRID  */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ 
                        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                    }} 
                />

                <svg className="absolute inset-0 w-full h-full">
                    {/*  EDGES  */}
                    {edges.map((edge, i) => {
                        const s = nodes.find(n => n.id === edge.source)!;
                        const t = nodes.find(n => n.id === edge.target)!;
                        return (
                            <motion.line
                                key={i}
                                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                stroke="black"
                                strokeWidth="0.5"
                                strokeDasharray="4 4"
                                initial={{ opacity: 0.05 }}
                                animate={{ opacity: hoveredId === s.id || hoveredId === t.id ? 1 : 0.05 }}
                            />
                        );
                    })}
                </svg>

                {/*  NODES  */}
                {nodes.map((node) => (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        drag
                        dragConstraints={{ top: 0, left: 0, right: 800, bottom: 500 }}
                        onHoverStart={() => setHoveredId(node.id)}
                        onHoverEnd={() => setHoveredId(null)}
                        style={{
                            position: 'absolute',
                            left: node.x - node.size / 2,
                            top: node.y - node.size / 2,
                            width: node.size,
                            height: node.size,
                        }}
                        className={`rounded-full border-2 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl transition-all duration-300 ${
                            hoveredId === node.id 
                                ? 'bg-black text-white border-black scale-110 z-20' 
                                : 'bg-white border-black/5 text-black z-10'
                        }`}
                    >
                        {node.type === 'EXCHANGE' ? <Zap size={node.size * 0.4} /> : 
                         node.type === 'BOT' ? <Link size={node.size * 0.4} /> :
                         <Target size={node.size * 0.4} />}
                        
                        <AnimatePresence>
                            {(hoveredId === node.id) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-4 bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl pointer-events-none"
                                >
                                    {node.label} // {node.type}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black text-black/10 uppercase tracking-[0.3em]">Hokusai Mesh // v1.0</span>
                    <span className="text-[9px] font-black text-black/5 uppercase tracking-[0.3em]">Institutional White Registry</span>
                </div>
            </div>
        </div>
    );
}
