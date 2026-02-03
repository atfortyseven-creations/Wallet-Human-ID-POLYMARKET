"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Maximize2, RefreshCw, X, ShoppingCart, Globe, TrendingUp, Info, Zap } from 'lucide-react';

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

export default function BubblesView() {
    const [data, setData] = useState<BubbleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoin, setSelectedCoin] = useState<BubbleData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bubbles');
            const json = await res.json();
            if (json.bubbles) {
                setData(json.bubbles);
            } else if (json.error) {
                setError(json.error + (json.details ? `: ${json.details}` : ''));
            }
        } catch (err: any) {
            console.error('Failed to fetch bubbles:', err);
            setError('Error de conexión con el motor de mercado');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
        
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredData = data.filter(coin => 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPriceChange = (coin: BubbleData) => {
        switch(timeframe) {
            case '1h': return coin.price_change_1h;
            case '7d': return coin.price_change_7d;
            case '30d': return coin.price_change_30d;
            case '1y': return coin.price_change_1y;
            default: return coin.price_change_24h;
        }
    };

    // --- Expert Force-Directed Layout Engine ---
    const bubbleAnchors = React.useMemo(() => {
        if (dimensions.width === 0 || filteredData.length === 0) return {};

        // 1. Initialize Nodes with deterministic physics properties
        const nodes = filteredData.slice(0, 100).map((coin, i) => {
            const change = timeframe === '1h' ? coin.price_change_1h : 
                          timeframe === '7d' ? coin.price_change_7d :
                          timeframe === '30d' ? coin.price_change_30d :
                          timeframe === '1y' ? coin.price_change_1y : coin.price_change_24h;
            
            const baseSize = 110;
            const sizeScale = Math.min(Math.max(Math.abs(change) * 4, 0), 120);
            const size = baseSize + sizeScale;
            const maxVisualSize = size * 1.15;
            const radius = (maxVisualSize / 2) + 15; // Include padding/glow buffer

            // Initial Spiral placement to reduce initial overlap and keep things centered
            const angle = i * 0.5;
            const distance = i * 15;
            return {
                id: coin.id,
                x: (dimensions.width / 2) + Math.cos(angle) * distance,
                y: (dimensions.height / 2) + Math.sin(angle) * distance,
                radius,
                size,
                vx: 0,
                vy: 0
            };
        });

        // 2. Iterative Solver (Standard Verlet / Force Integration)
        const iterations = 60;
        const damping = 0.82;
        const repulsionStrength = 0.6;
        const centerPull = 0.012;

        for (let step = 0; step < iterations; step++) {
            // A. Repulsion & Collision (avoid "amogollarse")
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = a.radius + b.radius;

                    if (distance < minDistance) {
                        const overlap = minDistance - distance;
                        const nx = dx / (distance || 1);
                        const ny = dy / (distance || 1);
                        const force = overlap * repulsionStrength;
                        
                        a.vx -= nx * force * 0.5;
                        a.vy -= ny * force * 0.5;
                        b.vx += nx * force * 0.5;
                        b.vy += ny * force * 0.5;
                    }
                }

                // B. Centering Force (keep it grouped but spaced)
                a.vx += (dimensions.width / 2 - a.x) * centerPull;
                a.vy += (dimensions.height / 2 - a.y) * centerPull;

                // C. Boundaries (Absolute Vision)
                const margin = a.radius;
                if (a.x < margin) a.vx += (margin - a.x) * 0.25;
                if (a.x > dimensions.width - margin) a.vx += (dimensions.width - margin - a.x) * 0.25;
                if (a.y < margin) a.vy += (margin - a.y) * 0.25;
                if (a.y > dimensions.height - margin) a.vy += (dimensions.height - margin - a.y) * 0.25;
            }

            // D. Apply velocities
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                n.vx *= damping;
                n.vy *= damping;
            });
        }

        // Return lookup map
        return nodes.reduce((acc, n) => ({
            ...acc,
            [n.id]: { x: n.x, y: n.y, size: n.size }
        }), {} as Record<string, { x: number, y: number, size: number }>);
    }, [filteredData, dimensions, timeframe]);

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
                            {tf === '1h' ? 'Hora' : tf === '24h' ? 'Día' : tf === '7d' ? 'Semana' : tf === '30d' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar cripto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white/40 border border-black/5 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10 transition-all w-64"
                        />
                    </div>
                    <button 
                        onClick={fetchData}
                        className="p-3 bg-white/40 hover:bg-white rounded-2xl border border-black/5 transition-all text-black/40 hover:text-black"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Bubbles Area */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden p-8 min-h-[500px]">
                {loading && data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-black/20" size={48} />
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-4 shadow-xl">
                            <X size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Error de Datos</h3>
                        <p className="text-sm text-black/40 font-medium max-w-sm mb-6 uppercase tracking-widest leading-loose">
                            {error}
                        </p>
                        <button 
                            onClick={fetchData}
                            className="px-8 py-4 bg-black text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
                        >
                            Reintentar Conexión
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <AnimatePresence>
                            {filteredData.slice(0, 100).map((coin, index) => (
                                <Bubble 
                                    key={coin.id} 
                                    coin={coin} 
                                    index={index} 
                                    timeframe={timeframe} 
                                    containerRef={containerRef}
                                    dimensions={dimensions}
                                    anchor={bubbleAnchors[coin.id]}
                                    onClick={() => setSelectedCoin(coin)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Detail Modal (Portal) */}
            {selectedCoin && typeof document !== 'undefined' && createPortal(
                <AnimatePresence mode="wait">
                    <BubbleDetailModal 
                        coin={selectedCoin} 
                        onClose={() => setSelectedCoin(null)} 
                    />
                </AnimatePresence>,
                document.body
            )}

            {/* Footer Stats */}
            <div className="p-6 bg-black/5 border-t border-black/5 flex justify-between items-center">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-black/30 tracking-widest">Activos</span>
                        <span className="text-sm font-black text-black">{filteredData.length} Coins</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-black/30 tracking-widest">Update</span>
                        <span className="text-sm font-black text-black">Cada 60s</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 group cursor-help">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-black/40">Real-Time Engine</span>
                </div>
            </div>
        </div>
    );
}

function Bubble({ coin, index, timeframe, containerRef, dimensions, anchor, onClick }: { 
    coin: BubbleData, 
    index: number, 
    timeframe: Timeframe, 
    containerRef: React.RefObject<HTMLDivElement>,
    dimensions: { width: number, height: number },
    anchor?: { x: number, y: number, size: number },
    onClick: () => void
}) {
    const [isDragging, setIsDragging] = useState(false);
    
    // Helper to get change based on timeframe
    const getChange = () => {
        switch(timeframe) {
            case '1h': return coin.price_change_1h;
            case '7d': return coin.price_change_7d;
            case '30d': return coin.price_change_30d;
            case '1y': return coin.price_change_1y;
            default: return coin.price_change_24h;
        }
    };

    const change = getChange();
    const isPositive = change >= 0;
    
    // Bubble size based on performance
    const size = anchor?.size || 110;

    // Micro-fluctuation for "Live" feel
    const [fluctuation, setFluctuation] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setFluctuation((Math.random() - 0.5) * 0.15);
        }, 300 + Math.random() * 400); // Super fast ticker for addictive feel
        return () => clearInterval(interval);
    }, []);

    // Expert Level Containment
    const maxVisualSize = size * 1.15;
    const overflowBuffer = (maxVisualSize - size) / 2 + 20;
    
    const safeMaxX = Math.max(overflowBuffer, dimensions.width - size - overflowBuffer);
    const safeMaxY = Math.max(overflowBuffer, dimensions.height - size - overflowBuffer);

    // Initial position from Anchor or fallback
    const initialX = anchor ? anchor.x - size/2 : dimensions.width / 2;
    const initialY = anchor ? anchor.y - size/2 : dimensions.height / 2;

    // Expert Level Physics: Organic floating curves
    const floatDurationX = 5 + (index % 4);
    const floatDurationY = 7 + (index % 5);
    const floatDistance = 20 + (index % 15);

    return (
        <motion.div
            drag
            dragConstraints={{
                top: overflowBuffer,
                left: overflowBuffer,
                right: safeMaxX,
                bottom: safeMaxY
            }}
            dragElastic={0.4}
            dragTransition={{ 
                bounceStiffness: 800, 
                bounceDamping: 15,
                power: 0.1 // Reduces friction for "expert" throw feel
            }}
            dragMomentum={true}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onClick={() => !isDragging && onClick()}
            whileHover={{ 
                scale: 1.1, 
                zIndex: 100,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.9, rotate: -3 }}
            initial={{ scale: 0, opacity: 0, x: initialX, y: initialY }}
            animate={{ 
                scale: 1, 
                opacity: 1,
                // DECOUPLED X/Y: Creating organic circular/oval paths instead of straight lines
                x: isDragging ? undefined : [
                    initialX,
                    Math.min(safeMaxX, initialX + floatDistance),
                    initialX,
                    Math.max(overflowBuffer, initialX - floatDistance),
                    initialX
                ],
                y: isDragging ? undefined : [
                    Math.max(overflowBuffer, initialY - floatDistance),
                    initialY,
                    Math.min(safeMaxY, initialY + floatDistance),
                    initialY,
                    Math.max(overflowBuffer, initialY - floatDistance),
                ],
            }}
            transition={{ 
                x: { 
                    duration: floatDurationX, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1]
                },
                y: { 
                    duration: floatDurationY, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1]
                },
                scale: { duration: 0.5, delay: index * 0.005 },
                opacity: { duration: 0.5, delay: index * 0.005 }
            }}
            whileDrag={{ scale: 1.15, zIndex: 100 }}
            style={{
                position: 'absolute',
                width: size,
                height: size,
                zIndex: Math.floor(Math.abs(change)) + 5,
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'auto',
                willChange: 'transform, opacity'
            }}
            className="group"
        >
            <div 
                className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-700 relative ${
                    isPositive 
                        ? 'bg-emerald-500/10 border-[5px] border-emerald-500/80 group-hover:bg-emerald-500/30' 
                        : 'bg-rose-500/10 border-[5px] border-rose-500/80 group-hover:bg-rose-500/30'
                } shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-lg group-active:scale-95`}
                style={{
                    boxShadow: isPositive 
                        ? '0 0 50px rgba(16, 185, 129, 0.25), inset 0 0 30px rgba(16, 185, 129, 0.15)' 
                        : '0 0 50px rgba(244, 63, 94, 0.25), inset 0 0 30px rgba(244, 63, 94, 0.15)'
                }}
            >
                {/* Glow effect pulse */}
                <motion.div 
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-3xl -z-10 ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                />
                
                <img 
                    src={coin.image} 
                    alt={coin.symbol} 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full mb-2 group-hover:scale-110 transition-transform shadow-xl pointer-events-none" 
                    draggable={false}
                />
                <div className="font-black text-sm md:text-base leading-none mb-1 tracking-tight">{coin.symbol}</div>
                <div className="font-black text-xs md:text-sm tracking-widest tabular-nums italic">
                    {change > 0 ? '+' : ''}{(change + fluctuation).toFixed(1)}%
                </div>
                
                {/* Real-time Indicator Dot */}
                <div className={`absolute top-4 right-1/2 translate-x-[25px] w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />

                {/* Detail overlay on hover */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 pointer-events-none shadow-2xl z-50 border border-white/10">
                    <span className="text-white/50 mr-2">Price:</span> ${coin.current_price.toLocaleString()}
                    <div className="h-px bg-white/10 my-1" />
                    <span className="text-white/50 mr-2">Market Cap:</span> ${(coin.market_cap / 1e9).toFixed(1)}B
                </div>
            </div>
        </motion.div>
    );
}

function BubbleDetailModal({ coin, onClose }: { coin: BubbleData, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="bg-neutral-900 text-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header - Premium Glossy */}
                <div className="p-8 pb-6 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-white/10 to-transparent shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src={coin.image} alt={coin.name} className="relative w-16 h-16 rounded-full shadow-2xl border-2 border-white/20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                    {coin.name}
                                </h2>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/5">
                                    {coin.symbol}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center mt-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Rank #{coin.market_cap_rank}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Soberanía Digital</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 group active:scale-95"
                    >
                        <X size={24} className="text-white/40 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Content Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Hero Price & Pulse */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Market Live Price</span>
                             </div>
                             <div className="text-6xl font-black tabular-nums tracking-tighter italic text-white flex items-baseline gap-2">
                                {coin.current_price < 1 ? coin.current_price.toFixed(6) : coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                <span className="text-xl font-bold text-emerald-400">USD</span>
                             </div>
                             <div className="text-2xl font-bold text-white/20 tabular-nums lowercase italic">
                                ≈ {coin.current_price_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                             </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 bg-white/5 p-4 rounded-3xl border border-white/10 w-full md:w-auto">
                             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Capítulo de Mercado</div>
                             <div className="text-2xl font-black text-white italic">
                                {coin.market_cap >= 1e9 ? `${(coin.market_cap / 1e9).toFixed(2)}B` : `${(coin.market_cap / 1e6).toFixed(2)}M`} $
                             </div>
                             <div className={`flex items-center gap-1 text-xs font-black ${coin.price_change_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {coin.price_change_24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(coin.price_change_24h).toFixed(2)}% (24h)
                             </div>
                        </div>
                    </div>

                    {/* Chart Visualization - Immersive */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Trayectoria 7 Días</h3>
                            <span className="text-[10px] font-bold text-white/20 px-3 py-1 rounded-lg border border-white/5">Auto-Scaling Engine</span>
                        </div>
                        <div className="h-44 w-full bg-black/40 rounded-[2rem] border border-white/5 p-6 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
                            <SparklineChart data={coin.sparkline} isPositive={coin.price_change_24h >= 0} />
                        </div>
                    </div>

                    {/* Data Grid: Backend Analytics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <DetailItem label="Volumen 24h" value={`${(coin.total_volume / 1e6).toFixed(1)}M $`} icon={<TrendingUp size={12} />} />
                        <DetailItem label="Dominancia" value={`${(coin.market_cap / 2.5e12 * 100).toFixed(2)}%`} icon={<Globe size={12} />} />
                        <DetailItem label="Status" value="Verificado" icon={<Info size={12} />} color="text-emerald-400" />
                        <DetailItem label="Red" value="EVM Compatible" icon={<Zap size={12} />} />
                    </div>

                    {/* Performance History */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 text-center">Rendimiento Histórico</h3>
                        <div className="grid grid-cols-5 gap-3 bg-white/5 p-4 rounded-[2rem] border border-white/10">
                             <PerfItem label="1H" val={coin.price_change_1h} />
                             <PerfItem label="24H" val={coin.price_change_24h} active />
                             <PerfItem label="7D" val={coin.price_change_7d} />
                             <PerfItem label="30D" val={coin.price_change_30d} />
                             <PerfItem label="1Y" val={coin.price_change_1y} />
                        </div>
                    </div>

                    {/* Trade & External Links */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                        <div className="flex gap-4">
                            <TradeActionLink href={`https://coinmarketcap.com/currencies/${coin.id}`} label="MarketCap" />
                            <TradeActionLink href={`https://www.coingecko.com/es/monedas/${coin.id}`} label="Gecko" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-white/20">Acceso Rápido</span>
                            <div className="flex gap-1.5">
                                {['Binance', 'Coinbase', 'Bybit'].map(ex => (
                                    <div key={ex} className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center opacity-40 hover:opacity-100" title={ex}>
                                        <div className="w-2 h-2 rounded-full bg-white/30" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Footer Actions */}
                <div className="p-8 pt-4 shrink-0 bg-neutral-900 border-t border-white/5">
                    <button 
                        onClick={() => window.location.href = `/wallet?asset=${coin.symbol}`}
                        className="w-full py-6 bg-gradient-to-r from-white to-white/90 text-black rounded-[1.8rem] font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group"
                    >
                        <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                        Ejecutar Swap IA
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function DetailItem({ label, value, icon, color = "text-white" }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
    return (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                {icon}
                {label}
            </div>
            <div className={`text-sm font-black italic ${color}`}>{value}</div>
        </div>
    );
}

function TradeActionLink({ href, label }: { href: string, label: string }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
        >
            {label}
        </a>
    );
}

function TradeIconLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <a href={href} target="_blank" className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group relative">
            {icon}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1.5 py-0.5 rounded italic">{label}</span>
        </a>
    );
}

function PerfItem({ label, val, active = false }: { label: string, val: number, active?: boolean }) {
    const isPos = val >= 0;
    return (
        <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
            active ? 'bg-white/10 border-white/10' : 'bg-transparent border-transparent'
        }`}>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</span>
            <span className={`text-xs font-black tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? '+' : ''}{val.toFixed(1)}%
            </span>
        </div>
    );
}

function SparklineChart({ data, isPositive }: { data: number[], isPositive: boolean }) {
    if (!data || data.length === 0) return (
        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase font-black tracking-widest">
            Sin Datos de Gráfica
        </div>
    );
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Normalize data to 0-100
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((d - min) / (range || 1)) * 100
    }));

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const areaData = `${pathData} L 100,100 L 0,100 Z`;

    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={areaData}
                fill={`url(#${gradientId})`}
            />
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={pathData}
                fill="none"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Last Point Indicator */}
            <motion.circle 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                cx={points[points.length - 1].x} 
                cy={points[points.length - 1].y} 
                r="3" 
                fill={isPositive ? '#10b981' : '#f43f5e'} 
                className="animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
        </svg>
    );
}
