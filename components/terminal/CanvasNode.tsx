"use client";

import React, { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Wallet, Bot, Cpu, Link as LinkIcon, Activity } from 'lucide-react';
import { NodeData } from './canvas-types';

interface CanvasNodeProps {
    data: NodeData;
    onDrag: (x: number, y: number) => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

export function CanvasNode({ data, onDrag, onContextMenu }: CanvasNodeProps) {
    const dragControls = useRef(null);

    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Frame-rate uncoupled state update (lag-free visually because Framer Motion handles DOM directly, 
        // we only update state to redraw SVG edge paths)
        onDrag(data.x + info.delta.x, data.y + info.delta.y);
    };

    const getIcon = () => {
        switch (data.type) {
            case 'wallet': return <Wallet size={16} />;
            case 'bot': return <Bot size={16} />;
            case 'contract': return <Cpu size={16} />;
            case 'api': return <LinkIcon size={16} />;
        }
    };

    const getStatusColor = () => {
        switch (data.status) {
            case 'active': return 'bg-[var(--aztec-chartreuse)] shadow-[0_0_15px_var(--aztec-chartreuse)]';
            case 'syncing': return 'bg-[var(--aztec-aqua)] shadow-[0_0_15px_var(--aztec-aqua)] animate-pulse';
            case 'error': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        }
    };

    return (
        <motion.div
            className="canvas-node absolute w-64 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col cursor-grab active:cursor-grabbing will-change-transform"
            style={{ 
                x: data.x, 
                y: data.y,
                // Center origin for edges
                marginLeft: -128,
                marginTop: -48
            }}
            drag
            dragMomentum={false}
            onDrag={handleDrag}
            onContextMenu={onContextMenu}
            onPointerDown={(e) => e.stopPropagation()} // Prevent canvas from panning when dragging node
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--aztec-parchment)]">
                        {getIcon()}
                    </div>
                    <div>
                        <h4 className="text-sm font-aztec-serif font-black tracking-tight text-white">{data.title}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{data.type}</p>
                    </div>
                </div>
                {/* Status indicator */}
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
            </div>

            {/* Telemetry Metrics */}
            <div className="p-4 grid grid-cols-2 gap-4 bg-[#0a0a0a]/50 rounded-b-2xl">
                <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1">Status</div>
                    <div className="text-xs font-bold text-white capitalize">{data.status}</div>
                </div>
                <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1 flex items-center gap-1">
                        <Activity size={10} /> Ping
                    </div>
                    <div className="text-xs font-bold text-white font-mono">{data.latency}ms</div>
                </div>
            </div>
            
            {/* Connection Ports */}
            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full border-2 border-white/20 bg-[#111] transform -translate-y-1/2 hover:scale-125 transition-transform" />
            <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full border-2 border-white/20 bg-[#111] transform -translate-y-1/2 hover:scale-125 transition-transform" />
        </motion.div>
    );
}
