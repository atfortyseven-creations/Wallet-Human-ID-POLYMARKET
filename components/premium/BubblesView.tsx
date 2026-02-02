"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Maximize2, RefreshCw, X } from 'lucide-react';

interface BubbleData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_1h: number;
    price_change_24h: number;
    price_change_7d: number;
    price_change_30d: number;
    price_change_1y: number;
}

type Timeframe = '1h' | '24h' | '7d' | '30d' | '1y';

export default function BubblesView() {
    const [data, setData] = useState<BubbleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const [searchQuery, setSearchQuery] = useState('');
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
                            {filteredData.slice(0, 50).map((coin, index) => (
                                <Bubble 
                                    key={coin.id} 
                                    coin={coin} 
                                    index={index} 
                                    timeframe={timeframe} 
                                    containerRef={containerRef}
                                    dimensions={dimensions}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

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

function Bubble({ coin, index, timeframe, containerRef, dimensions }: { 
    coin: BubbleData, 
    index: number, 
    timeframe: Timeframe, 
    containerRef: React.RefObject<HTMLDivElement>,
    dimensions: { width: number, height: number }
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
    const baseSize = 110;
    const sizeScale = Math.min(Math.max(Math.abs(change) * 4, 0), 120);
    const size = baseSize + sizeScale;

    // Micro-fluctuation for "Live" feel
    const [fluctuation, setFluctuation] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setFluctuation((Math.random() - 0.5) * 0.2);
        }, 1500 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    // Initial random-ish positions with a bit of grid logic
    const cols = Math.floor(dimensions.width / 200) || 1;
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Seeded randomness for initial offsets
    const seed = index * 123.456;
    const offsetX = (Math.sin(seed) * (dimensions.width / cols / 3));
    const offsetY = (Math.cos(seed) * 40);

    const initialX = col * (dimensions.width / cols) + (dimensions.width / cols / 3) + offsetX;
    const initialY = row * 200 + 80 + offsetY;

    // Autonomous floating animation
    const floatDuration = 4 + (index % 3);
    const floatDistance = 15 + (index % 10);

    return (
        <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
            dragMomentum={true}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            initial={{ scale: 0, opacity: 0, x: initialX, y: initialY }}
            animate={{ 
                scale: 1, 
                opacity: 1,
                // Only animate floating if NOT dragging
                x: isDragging ? undefined : [initialX - floatDistance, initialX + floatDistance, initialX - floatDistance],
                y: isDragging ? undefined : [initialY - floatDistance, initialY + floatDistance, initialY - floatDistance],
            }}
            transition={{ 
                x: { duration: floatDuration, repeat: Infinity, ease: "easeInOut" },
                y: { duration: floatDuration * 1.2, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.5, delay: index * 0.01 },
                opacity: { duration: 0.5, delay: index * 0.01 }
            }}
            whileDrag={{ scale: 1.15, zIndex: 100 }}
            style={{
                position: 'absolute',
                width: size,
                height: size,
                zIndex: Math.floor(Math.abs(change)) + 5,
                cursor: isDragging ? 'grabbing' : 'grab',
                pointerEvents: 'auto'
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
