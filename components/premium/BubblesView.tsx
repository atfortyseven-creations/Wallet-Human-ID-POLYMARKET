"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Maximize2, RefreshCw } from 'lucide-react';

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
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bubbles');
            const json = await res.json();
            if (json.bubbles) {
                setData(json.bubbles);
            }
        } catch (error) {
            console.error('Failed to fetch bubbles:', error);
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
                ) : (
                    <div className="w-full h-full relative">
                        <AnimatePresence>
                            {filteredData.slice(0, 50).map((coin, index) => {
                                const change = getPriceChange(coin);
                                const isPositive = change >= 0;
                                // Bubble size based on performance (min 80px, max 200px)
                                const baseSize = 100;
                                const sizeScale = Math.min(Math.max(Math.abs(change) * 5, 0), 100);
                                const size = baseSize + sizeScale;

                                // Rough initial positions
                                const cols = Math.floor(dimensions.width / 180) || 1;
                                const row = Math.floor(index / cols);
                                const col = index % cols;
                                
                                const initialX = col * (dimensions.width / cols) + (dimensions.width / cols / 4);
                                const initialY = row * 180 + 50;

                                return (
                                    <motion.div
                                        key={coin.id}
                                        drag
                                        dragConstraints={containerRef}
                                        dragElastic={0.1}
                                        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                                        initial={{ scale: 0, opacity: 0, x: initialX, y: initialY }}
                                        animate={{ 
                                            scale: 1, 
                                            opacity: 1,
                                            x: initialX,
                                            y: initialY
                                        }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ 
                                            delay: index * 0.01,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20
                                        }}
                                        style={{
                                            position: 'absolute',
                                            width: size,
                                            height: size,
                                            zIndex: Math.floor(Math.abs(change)) + 1,
                                            cursor: 'grab'
                                        }}
                                        className="group"
                                    >
                                        <div 
                                            className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-500 relative ${
                                                isPositive 
                                                    ? 'bg-emerald-500/10 border-4 border-emerald-500 group-hover:bg-emerald-500/20' 
                                                    : 'bg-rose-500/10 border-4 border-rose-500 group-hover:bg-rose-500/20'
                                            } shadow-2xl backdrop-blur-md`}
                                            style={{
                                                boxShadow: isPositive 
                                                    ? '0 0 30px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)' 
                                                    : '0 0 30px rgba(244, 63, 94, 0.2), inset 0 0 20px rgba(244, 63, 94, 0.1)'
                                            }}
                                        >
                                            {/* Glow effect */}
                                            <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 -z-10 animate-pulse ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                            
                                            <img src={coin.image} alt={coin.symbol} className="w-10 h-10 md:w-12 md:h-12 rounded-full mb-1 group-hover:scale-110 transition-transform shadow-lg" />
                                            <div className="font-black text-sm md:text-base leading-none mb-0.5">{coin.symbol}</div>
                                            <div className="font-black text-xs md:text-sm tracking-tight">
                                                {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                            </div>
                                            
                                            {/* Detail overlay on hover */}
                                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                                                ${coin.current_price.toLocaleString()} | MC: ${(coin.market_cap / 1e9).toFixed(1)}B
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
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
