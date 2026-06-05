"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pause, Play, Download, Copy, AlertTriangle, RefreshCw, Server, Wallet, Code, Bot } from 'lucide-react';
import { NodeType } from './canvas-types';

interface ContextMenuProps {
    x: number;
    y: number;
    nodeId?: string;
    onClose: () => void;
    onAddNode: (type: NodeType) => void;
}

export function ContextMenu({ x, y, nodeId, onClose, onAddNode }: ContextMenuProps) {
    // Close context menu if clicked outside
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    // Handle viewport edge collisions
    const safeX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 220 : x);
    const safeY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 300 : y);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute w-56 bg-[#111111]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden will-change-transform z-50 text-white"
            style={{ left: safeX, top: safeY }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            {nodeId ? (
                // Node Action Menu
                <div className="flex flex-col">
                    <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-white/40">Node Action</span>
                    </div>
                    <MenuButton icon={<Pause size={14} />} label="Pause Automation" onClick={onClose} />
                    <MenuButton icon={<RefreshCw size={14} />} label="Force Sync" onClick={onClose} />
                    <MenuButton icon={<Download size={14} />} label="Extract Liquidity" onClick={onClose} className="text-[var(--aztec-chartreuse)]" />
                    <MenuButton icon={<Copy size={14} />} label="Duplicate Strategy" onClick={onClose} />
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <MenuButton icon={<AlertTriangle size={14} />} label="View Error Logs" onClick={onClose} className="text-red-400 hover:bg-red-500/10 hover:text-red-300" />
                </div>
            ) : (
                // Canvas Add Menu
                <div className="flex flex-col">
                    <div className="px-4 py-2 border-b border-white/10 bg-white/5">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-white/40">Deploy Node</span>
                    </div>
                    <MenuButton icon={<Wallet size={14} />} label="Wallet Network" onClick={() => { onAddNode('wallet'); }} />
                    <MenuButton icon={<Bot size={14} />} label="Trading Bot" onClick={() => { onAddNode('bot'); }} />
                    <MenuButton icon={<Code size={14} />} label="Smart Contract" onClick={() => { onAddNode('contract'); }} />
                    <MenuButton icon={<Server size={14} />} label="API Webhook" onClick={() => { onAddNode('api'); }} />
                </div>
            )}
        </motion.div>
    );
}

function MenuButton({ icon, label, onClick, className = '' }: { icon: React.ReactNode, label: string, onClick: () => void, className?: string }) {
    return (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left ${className}`}
        >
            {icon}
            {label}
        </button>
    );
}
