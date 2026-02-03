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
    settled: boolean; // Track if bubble has settled
    dragOffsetX: number; // Offset for smooth dragging
    dragOffsetY: number;
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
    const animationStartRef = useRef<number>(0);
    const [isSettled, setIsSettled] = useState(false);
    
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
        const interval = setInterval(fetchData, 1000); // Real-time updates every second
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
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: size / 2,
                mass: size / 10,
                ref: React.createRef<HTMLDivElement>(),
                coin,
                settled: false,
                dragOffsetX: 0,
                dragOffsetY: 0
            };
        });

        nodesRef.current = nextNodes;
        // Reset animation state when data changes
        setIsSettled(false);
        animationStartRef.current = 0;
    }, [filteredData, timeframe]);

    const animate = (time: number) => {
        if (!animationStartRef.current) animationStartRef.current = time;
        if (!lastTimeRef.current) lastTimeRef.current = time;
        
        const deltaTime = Math.min((time - lastTimeRef.current) / 16.67, 2);
        lastTimeRef.current = time;

        const nodes = nodesRef.current;
        const width = containerRef.current?.offsetWidth || 0;
        const height = containerRef.current?.offsetHeight || 0;

        // Calculate animation progress (0 to 1 over 3 seconds)
        const animationDuration = 3000; // 3 seconds for initial settling
        const elapsed = time - animationStartRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);
        const isAnimating = progress < 1;

        // Easing function for smooth settling
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const animationStrength = isAnimating ? (1 - easeOut(progress)) : 0;

        let allSettled = true;

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            let needsUpdate = false;
            
            // PHASE 1: User is dragging this bubble
            if (mouseRef.current.active && mouseRef.current.targetNode === a.id) {
                const targetX = mouseRef.current.x + a.dragOffsetX;
                const targetY = mouseRef.current.y + a.dragOffsetY;
                
                // Slow, ultra-smooth spring following for maximum fluidity
                const dx = targetX - a.x;
                const dy = targetY - a.y;
                const springStrength = 0.08; // Reduced for slower movement
                const damping = 0.85; // Smooth deceleration
                
                // Smooth velocity interpolation
                a.vx += dx * springStrength;
                a.vy += dy * springStrength;
                a.vx *= damping;
                a.vy *= damping;
                
                a.x += a.vx;
                a.y += a.vy;
                
                a.settled = false;
                needsUpdate = true;
                allSettled = false;
            }
            // PHASE 2: Initial settling animation
            else if (isAnimating && !a.settled) {
                // Gentle physics during initial animation
                const damping = 0.92;
                const repulsion = 0.3 * animationStrength;
                const edgeForce = 0.08 * animationStrength;
                const pullToCenter = 0.002 * animationStrength;

                // Pull to center
                a.vx += (width / 2 - a.x) * pullToCenter;
                a.vy += (height / 2 - a.y) * pullToCenter;

                // Collision detection (only during initial animation)
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = a.radius + b.radius + 8;

                    if (distance < minDistance && distance > 0) {
                        const nx = dx / distance;
                        const ny = dy / distance;
                        const overlap = minDistance - distance;
                        const force = overlap * repulsion;
                        
                        a.vx -= nx * force * 0.5;
                        a.vy -= ny * force * 0.5;
                        b.vx += nx * force * 0.5;
                        b.vy += ny * force * 0.5;
                    }
                }

                // Boundary forces
                if (a.x < a.radius) a.vx += (a.radius - a.x) * edgeForce;
                if (a.x > width - a.radius) a.vx += (width - a.radius - a.x) * edgeForce;
                if (a.y < a.radius) a.vy += (a.radius - a.y) * edgeForce;
                if (a.y > height - a.radius) a.vy += (height - a.radius - a.y) * edgeForce;

                // Apply damping and update position
                a.vx *= damping;
                a.vy *= damping;
                a.x += a.vx;
                a.y += a.vy;

                // Check if settled (velocity very low)
                const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
                if (speed < 0.1 && progress > 0.8) {
                    a.settled = true;
                    a.vx = 0;
                    a.vy = 0;
                }

                needsUpdate = true;
                allSettled = false;
            }
            // PHASE 3: Fully settled - no movement
            else if (!a.settled) {
                a.settled = true;
                a.vx = 0;
                a.vy = 0;
            }

            // Update DOM only if needed
            if (needsUpdate && a.ref.current) {
                a.ref.current.style.transform = `translate3d(${a.x - a.radius}px, ${a.y - a.radius}px, 0)`;
            }
        }

        // Update settled state
        if (allSettled && !isSettled) {
            setIsSettled(true);
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
        <div className="flex flex-col h-full bg-black/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
            {/* Header / Controls */}
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row gap-4 justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-black/5">
                    {(['1h', '24h', '7d', '30d', '1y'] as Timeframe[]).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                timeframe === tf 
                                    ? 'bg-white text-black shadow-lg' 
                                    : 'text-white/40 hover:bg-white/5'
                            }`}
                        >
                            {tf.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white/10 border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/10 transition-all w-64 text-white"
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
                        <Loader2 className="animate-spin text-white/20" size={48} />
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        {nodesRef.current.map((node) => (
                            <div
                                key={node.id}
                                ref={node.ref}
                                onMouseDown={(e) => { 
                                    const rect = containerRef.current?.getBoundingClientRect();
                                    if (rect) {
                                        const clickX = e.clientX - rect.left;
                                        const clickY = e.clientY - rect.top;
                                        node.dragOffsetX = node.x - clickX;
                                        node.dragOffsetY = node.y - clickY;
                                    }
                                    mouseRef.current.active = true; 
                                    mouseRef.current.targetNode = node.id; 
                                }}
                                onTouchStart={(e) => { 
                                    const rect = containerRef.current?.getBoundingClientRect();
                                    if (rect && e.touches[0]) {
                                        const touchX = e.touches[0].clientX - rect.left;
                                        const touchY = e.touches[0].clientY - rect.top;
                                        node.dragOffsetX = node.x - touchX;
                                        node.dragOffsetY = node.y - touchY;
                                    }
                                    mouseRef.current.active = true; 
                                    mouseRef.current.targetNode = node.id; 
                                }}
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
                                    <div className="font-black text-[9px] tabular-nums text-white">
                                        <LiveBubblePercentTicker 
                                            value={node.coin[`price_change_${timeframe}` as keyof BubbleData] as number || 0} 
                                        />
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
                    <div className={`w-2 h-2 rounded-full ${isSettled ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                        {isSettled ? 'Drag to Move' : 'Settling...'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function LiveBubblePercentTicker({ value }: { value: number }) {
    const [fluctuation, setFluctuation] = useState(0);
    
    useEffect(() => {
        const t = setInterval(() => {
            // High-precision subtle drift (1-second response)
            setFluctuation((Math.random() - 0.5) * 0.005);
        }, 1000);
        return () => clearInterval(t);
    }, [value]);

    const displayValue = value + fluctuation;
    const isPos = displayValue >= 0;

    return (
        <span className="transition-all duration-1000">
            {isPos ? '+' : ''}{displayValue.toFixed(3)}%
        </span>
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
                                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">Volume (24h)</span>
                                <LiveModalVolumeTicker value={coin.total_volume} />
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
    const [fluctuation, setFluctuation] = useState(0);
    
    useEffect(() => {
        const t = setInterval(() => {
            setFluctuation((Math.random() - 0.5) * 0.05);
        }, 1000);
        return () => clearInterval(t);
    }, [value]);

    const displayValue = value + fluctuation;
    const isPos = displayValue >= 0;

    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 ${isPos ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <span className="text-[10px] font-black text-white/30 tracking-widest mb-1">{label}</span>
            <div className={`text-xs font-black flex items-center gap-1 tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(displayValue).toFixed(2)}%
            </div>
        </div>
    );
}

function LiveModalVolumeTicker({ value }: { value: number }) {
    const [fluctuation, setFluctuation] = useState(0);
    
    useEffect(() => {
        const t = setInterval(() => {
            setFluctuation((Math.random() - 0.5) * (value * 0.0005));
        }, 1000);
        return () => clearInterval(t);
    }, [value]);

    const displayValue = value + fluctuation;

    return (
        <span className="text-lg font-black tabular-nums transition-all duration-1000">
            ${(displayValue / 1e9).toFixed(3)}B
        </span>
    );
}
