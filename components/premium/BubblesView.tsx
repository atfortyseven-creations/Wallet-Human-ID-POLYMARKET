"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw, X, Globe, TrendingUp, Zap } from 'lucide-react';

interface BubbleData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    current_price_eur: number;
    market_cap: number;
    total_volume: number;
    price_change_1h: number;
    price_change_24h: number;
    price_change_7d: number;
    price_change_30d: number;
    price_change_1y: number;
    sparkline: number[];
    market_cap_rank: number;
}

type Timeframe = '1h' | '24h' | '7d' | '30d' | '1y';

interface PhysicsNode {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
    ref: React.RefObject<HTMLDivElement>;
    coin: BubbleData;
}

export default function BubblesView() {
    const [data, setData] = useState<BubbleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoin, setSelectedCoin] = useState<BubbleData | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<PhysicsNode[]>([]);
    const requestRef = useRef<number>();
    const lastTimeRef = useRef<number>();
    
    const mouseRef = useRef({ x: 0, y: 0, active: false, targetNode: null as string | null });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/bubbles');
            const json = await res.json();
            if (json.bubbles) {
                setData(json.bubbles);
            } else if (json.error) {
                setError(json.error);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(coin => 
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 70); // Limit for mobile performance
    }, [data, searchQuery]);

    // Initialize/Update nodes
    useEffect(() => {
        if (!containerRef.current || filteredData.length === 0) return;

        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;

        // Create or update nodes
        const currentNodes = nodesRef.current;
        const nextNodes: PhysicsNode[] = filteredData.map(coin => {
            const existingNode = currentNodes.find(n => n.id === coin.id);
            if (existingNode) {
                existingNode.coin = coin; // Keep data fresh
                return existingNode;
            }

            const change = coin[`price_change_${timeframe}` as keyof BubbleData] as number || 0;
            const size = 80 + Math.min(Math.max(Math.abs(change) * 4, 0), 100);
            
            return {
                id: coin.id,
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: size / 2,
                mass: size / 10,
                ref: React.createRef<HTMLDivElement>(),
                coin
            };
        });

        nodesRef.current = nextNodes;
    }, [filteredData, timeframe]);

    const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = Math.min((time - lastTimeRef.current) / 33.33, 2); // Slower, smoother animation
        lastTimeRef.current = time;

        const nodes = nodesRef.current;
        const width = containerRef.current?.offsetWidth || 0;
        const height = containerRef.current?.offsetHeight || 0;

        const damping = 0.985;
        const repulsion = 0.4;
        const edgeForce = 0.05;
        const pullToCenter = 0.005;

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            
            // 1. Dragging Interaction (High-Precision Spring Force)
            if (mouseRef.current.active && mouseRef.current.targetNode === a.id) {
                const dx = mouseRef.current.x - a.x;
                const dy = mouseRef.current.y - a.y;
                // Gentle pull for slow, smooth following
                a.vx += dx * 0.08 * deltaTime;
                a.vy += dy * 0.08 * deltaTime;
                a.vx *= 0.88; 
                a.vy *= 0.88;
            } else {
                // Gentle pull to center to keep them clustered
                a.vx += (width / 2 - a.x) * pullToCenter * deltaTime;
                a.vy += (height / 2 - a.y) * pullToCenter * deltaTime;
            }

            // 2. Collisions
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = a.radius + b.radius + 10; // Extra padding

                if (distance < minDistance) {
                    const nx = dx / distance;
                    const ny = dy / distance;
                    const overlap = minDistance - distance;
                    const force = overlap * repulsion;
                    
                    const massRatioA = b.mass / (a.mass + b.mass);
                    const massRatioB = a.mass / (a.mass + b.mass);

                    a.vx -= nx * force * massRatioA * deltaTime;
                    a.vy -= ny * force * massRatioA * deltaTime;
                    b.vx += nx * force * massRatioB * deltaTime;
                    b.vy += ny * force * massRatioB * deltaTime;
                }
            }

            // 3. Walls
            if (a.x < a.radius) { a.vx += (a.radius - a.x) * edgeForce; a.vx *= 0.9; }
            if (a.x > width - a.radius) { a.vx += (width - a.radius - a.x) * edgeForce; a.vx *= 0.9; }
            if (a.y < a.radius) { a.vy += (a.radius - a.y) * edgeForce; a.vy *= 0.9; }
            if (a.y > height - a.radius) { a.vy += (height - a.radius - a.y) * edgeForce; a.vy *= 0.9; }

            // 4. Integration
            a.vx *= damping;
            a.vy *= damping;
            a.x += a.vx * deltaTime;
            a.y += a.vy * deltaTime;

            // 5. Direct Dom Update
            if (a.ref.current) {
                a.ref.current.style.transform = `translate3d(${a.x - a.radius}px, ${a.y - a.radius}px, 0)`;
            }
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let clientX, clientY;
        
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        mouseRef.current.x = clientX - rect.left;
        mouseRef.current.y = clientY - rect.top;
    };

    return (
        <div className="flex flex-col h-full bg-[#EAEADF]/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
            {/* Header / Controls */}
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row gap-4 justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-black/5">
                    {(['1h', '24h', '7d', '30d', '1y'] as Timeframe[]).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                timeframe === tf 
                                    ? 'bg-[#1F1F1F] text-white shadow-lg' 
                                    : 'text-[#1F1F1F]/40 hover:bg-black/5'
                            }`}
                        >
                            {tf.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white/40 border border-black/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Bubbles Area */}
            <div 
                ref={containerRef} 
                className="flex-1 relative overflow-hidden p-8 min-h-[500px] cursor-default select-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseLeave={() => { mouseRef.current.active = false; mouseRef.current.targetNode = null; }}
            >
                {loading && data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-black/20" size={48} />
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        {nodesRef.current.map((node) => (
                            <div
                                key={node.id}
                                ref={node.ref}
                                onMouseDown={() => { mouseRef.current.active = true; mouseRef.current.targetNode = node.id; }}
                                onTouchStart={() => { mouseRef.current.active = true; mouseRef.current.targetNode = node.id; }}
                                onMouseUp={() => { if (mouseRef.current.targetNode === node.id) setSelectedCoin(node.coin); mouseRef.current.active = false; mouseRef.current.targetNode = null; }}
                                onTouchEnd={() => { if (mouseRef.current.targetNode === node.id) setSelectedCoin(node.coin); mouseRef.current.active = false; mouseRef.current.targetNode = null; }}
                                style={{
                                    position: 'absolute',
                                    width: node.radius * 2,
                                    height: node.radius * 2,
                                    willChange: 'transform',
                                    zIndex: Math.floor(node.radius),
                                    transition: 'opacity 0.3s ease-out' // Avoid transform transitions here
                                }}
                                className="group cursor-grab active:cursor-grabbing"
                            >
                                <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4 relative ${
                                    node.coin[`price_change_${timeframe}` as keyof BubbleData] as number >= 0 
                                        ? 'bg-emerald-500/20 border-[3px] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                        : 'bg-rose-500/20 border-[3px] border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                } backdrop-blur-md overflow-hidden hover:scale-110 active:scale-90 transition-transform`}>
                                    <img src={node.coin.image} alt={node.coin.symbol} className="w-8 h-8 rounded-full mb-1 pointer-events-none" />
                                    <div className="font-black text-[10px] leading-none mb-1 text-white uppercase">{node.coin.symbol}</div>
                                    <div className="font-black text-[10px] tabular-nums text-white">
                                        {(node.coin[`price_change_${timeframe}` as keyof BubbleData] as number || 0).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedCoin && createPortal(
                <BubbleDetailModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />,
                document.body
            )}

            {/* Footer Stats */}
            <div className="p-6 bg-black/5 border-t border-black/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">Smooth Physics Engine</span>
                </div>
            </div>
        </div>
    );
}

// Modal component remains mostly same but optimized
function BubbleDetailModal({ coin, onClose }: { coin: BubbleData, onClose: () => void }) {
    const router = useRouter();
    const [livePrice, setLivePrice] = useState(coin.current_price);

    useEffect(() => {
        const interval = setInterval(() => {
            setLivePrice(prev => prev * (1 + (Math.random() * 0.0004 - 0.0002)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#1a1a1a] text-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-white/10 to-transparent">
                        <div className="flex items-center gap-6">
                            <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h2 className="text-3xl font-black">{coin.name}</h2>
                                <span className="text-sm font-black text-purple-400 uppercase tracking-widest">{coin.symbol}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black tabular-nums">
                                ${livePrice.toLocaleString(undefined, { minimumFractionDigits: livePrice < 1 ? 4 : 2, maximumFractionDigits: livePrice < 1 ? 6 : 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                           <MetricBlock label="1H" value={coin.price_change_1h} />
                           <MetricBlock label="24H" value={coin.price_change_24h} />
                           <MetricBlock label="7D" value={coin.price_change_7d} />
                           <MetricBlock label="30D" value={coin.price_change_30d} />
                           <MetricBlock label="1Y" value={coin.price_change_1y} />
                           <div className="col-span-2 bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
                                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">Market Cap</span>
                                <span className="text-lg font-black">${(coin.market_cap / 1e9).toFixed(2)}B</span>
                           </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => router.push(`/wallet?asset=${coin.symbol}`)} className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                                Trade {coin.symbol}
                            </button>
                            <button onClick={onClose} className="px-8 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10">
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function MetricBlock({ label, value }: { label: string, value: number }) {
    const isPos = value >= 0;
    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${isPos ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <span className="text-[10px] font-black text-white/30 tracking-widest mb-1">{label}</span>
            <div className={`text-xs font-black flex items-center gap-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(value).toFixed(1)}%
            </div>
        </div>
    );
}
