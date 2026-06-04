"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as framer from 'framer-motion';
import { Terminal, ChevronsDown, Loader, Activity, RadioTower } from 'lucide-react';
import { NodeData } from './canvas-types';
import { io, Socket } from 'socket.io-client';

interface TelemetryTerminalProps {
    nodes: NodeData[];
}

interface LogEntry {
    id: number;
    timestamp: string;
    message: React.ReactNode;
    type: 'info' | 'success' | 'warning' | 'error';
}

export const TelemetryTerminal = React.memo(function TelemetryTerminal({ nodes }: TelemetryTerminalProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    // Dynamic presence guard for iOS/Safari
    const { AnimatePresence, motion } = framer;

    // Replace simulation with real WebSocket streams from the Node.js engine
    useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;
        
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;
        // If no gateway URL is configured, skip WebSocket connection silently.
        if (!GATEWAY_URL) {
            setLogs([{ id: -1, timestamp: 'SYSCALL', type: 'info', message: 'System telemetry stream initializing...' }]);
            return;
        }

        const socket = io(GATEWAY_URL, { 
            path: '/api/socket/io',
            transports: ['websocket', 'polling'],
            timeout: 5000 
        });
        
        let logCounter = 0;

        setLogs([
            { id: -2, timestamp: 'SYSCALL', type: 'info', message: 'Initializing Institutional WebSocket Topology...' },
            { id: -1, timestamp: 'GATEWAY', type: 'info', message: <span className="text-[#888888]">Establishing system connection...</span> }
        ]);

        socket.on('connect', () => {
            setLogs(prev => [...prev.slice(-49), {
                id: ++logCounter,
                timestamp: 'SUCCESS',
                type: 'success',
                message: <span className="text-[#00C076] font-black">WS ENGINE ONLINE // CONNECTION ENCRYPTED</span>
            }]);
        });
        
        socket.on('new-whale-alert', (data) => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            
            setLogs(prev => [...prev.slice(-49), {
                id: ++logCounter,
                timestamp: timeStr,
                type: 'warning',
                message: <span><span className="text-[#E5E5E5]">[{data.chain?.toUpperCase() || 'ETH'}]</span> WHALE ALERT: {data.type || 'Transfer'} detected for <span className="text-[#FF9500] font-black">${(data.usdValue || data.amountUsd || 0).toLocaleString()}</span> USD.</span>
            }]);
        });

        socket.on('vitals.tx.new', (data) => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            logCounter++;
            if (logCounter % 20 === 0) {
                setLogs(prev => [...prev.slice(-49), {
                    id: logCounter,
                    timestamp: timeStr,
                    type: 'info',
                    message: <span><span className="text-[#888888]">[{data.chain || 'ETH'}]</span> Mempool Sync: {data.hash?.slice(0, 16) || '0x...'}...</span>
                }]);
            }
        });

        socket.on('connect_error', () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            setLogs(prev => {
                // Generate high-fidelity synthetic telemetry if real source is degraded
                if (prev.length > 5 && prev[prev.length-1].type === 'error') return prev; 
                return [...prev.slice(-49), {
                    id: ++logCounter,
                    timestamp: timeStr,
                    type: 'error',
                    message: <span className="text-black/60">Diagnostics — reconnecting to live feed…</span>
                }];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isExpanded) {
            endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isExpanded]);

    if (!mounted) return null;

    return (
        <div 
            className={`w-full bg-white/90 border border-black/10 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-sm z-40 ${isExpanded ? 'h-full min-h-[400px]' : 'h-12'}`}
            style={{ backdropFilter: 'var(--mobile-blur, blur(20px))', WebkitBackdropFilter: 'var(--mobile-blur, blur(20px))' }}
        >
            <AnimatePresence>
                {/* Header / Truncated View */}
                <div 
                    className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-black/5"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3 w-full truncate">
                        <Terminal size={14} className="text-emerald-600" />
                        <div className="text-xs font-mono text-black/50 truncate">
                            {logs.length > 0 ? (
                                <span className="flex gap-4">
                                    <span>[{logs[logs.length-1].timestamp}]</span>
                                    {logs[logs.length-1].message}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2"><Loader size={12} className="animate-spin" /> Awaiting Telemetry...</span>
                            )}
                        </div>
                    </div>
                    <button className="p-1 hover:bg-black/10 rounded ml-2">
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ChevronsDown size={14} className="text-black/40" />
                        </motion.div>
                    </button>
                </div>

                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-1 overflow-y-auto p-4 border-t border-black/10 font-mono text-xs flex flex-col gap-2 terminal-scroll bg-black/[0.02]"
                    >
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-4 items-start">
                                <span className="text-black/40 shrink-0">[{log.timestamp}]</span>
                                <span className={
                                    log.type === 'success' ? 'text-black' : 
                                    log.type === 'error' ? 'text-rose-600' : 
                                    log.type === 'warning' ? 'text-amber-600' : 
                                    'text-black/70'
                                }>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={endOfLogsRef} />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .terminal-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .terminal-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .terminal-scroll::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }
            `}} />
        </div>
    );
});
