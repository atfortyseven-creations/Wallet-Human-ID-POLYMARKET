"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Maximize2, RefreshCw, X, ShoppingCart } from 'lucide-react';

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
                                    onClick={() => setSelectedCoin(coin)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCoin && (
                    <BubbleDetailModal 
                        coin={selectedCoin} 
                        onClose={() => setSelectedCoin(null)} 
                    />
                )}
            </AnimatePresence>

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

function Bubble({ coin, index, timeframe, containerRef, dimensions, onClick }: { 
    coin: BubbleData, 
    index: number, 
    timeframe: Timeframe, 
    containerRef: React.RefObject<HTMLDivElement>,
    dimensions: { width: number, height: number },
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
    const cols = Math.floor(dimensions.width / 140) || 1;
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
            onClick={() => !isDragging && onClick()}
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

function BubbleDetailModal({ coin, onClose }: { coin: BubbleData, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#1a1a1a] text-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-8 flex justify-between items-start border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <img src={coin.image} alt={coin.name} className="w-16 h-16 rounded-full shadow-2xl border-2 border-white/10" />
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">{coin.name}</h2>
                            <div className="flex gap-2 items-center mt-1">
                                <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-black uppercase tracking-widest text-white/40">Rank #{coin.market_cap_rank}</span>
                                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{coin.symbol}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                    >
                        <X size={20} className="text-white/40" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-8 space-y-8">
                    {/* Trade Links & Platforms */}
                    <div className="grid grid-cols-2 gap-8 text-center bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Enlaces Externos</span>
                            <div className="flex justify-center gap-3">
                                <TradeIconLink href={`https://coinmarketcap.com/currencies/${coin.id}`} icon={<img src="https://cryptologos.cc/logos/coinmarketcap-cmc-logo.png" className="w-5 h-5 grayscale hover:grayscale-0 transition-all" />} label="CMC" />
                                <TradeIconLink href={`https://www.coingecko.com/es/monedas/${coin.id}`} icon={<img src="https://static.coingecko.com/s/coingecko-logo-d13d6bcceddb2450890637f907b226f909569738ef95d3a5cefdcda03264c76d.png" className="w-5 h-5 grayscale hover:grayscale-0 transition-all rounded-full" />} label="Gecko" />
                                <TradeIconLink href={`https://www.tradingview.com/symbols/${coin.symbol}USD`} icon={<img src="https://cdn.worldvectorlogo.com/logos/tradingview-1.svg" className="w-5 h-5 grayscale hover:grayscale-0 transition-all" />} label="TV" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Negociar en</span>
                            <div className="flex justify-center flex-wrap gap-2">
                                {['Binance', 'Kraken', 'Coinbase', 'Kucoin', 'Bybit'].map(ex => (
                                    <div key={ex} className="w-8 h-8 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-alias" title={ex}>
                                        <div className="w-4 h-4 bg-white/20 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Valor en tiempo real</span>
                            <div className="text-4xl font-black tabular-nums tracking-tighter italic text-emerald-400">
                                {coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </div>
                            <div className="text-xl font-bold text-white/40 tabular-nums">
                                {coin.current_price_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Market Cap</div>
                             <div className="text-lg font-black italic">{(coin.market_cap / 1e9).toFixed(2)}B $</div>
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="h-40 w-full relative group">
                        <SparklineChart data={coin.sparkline} isPositive={coin.price_change_24h >= 0} />
                        <div className="absolute top-0 left-0 w-full flex justify-between px-2 text-[8px] font-black text-white/20 uppercase tracking-widest">
                            <span>Histórico 7d</span>
                            <span>Live Precision</span>
                        </div>
                    </div>

                    {/* Performance Grid */}
                    <div className="grid grid-cols-5 gap-2">
                         <PerfItem label="Hora" val={coin.price_change_1h} />
                         <PerfItem label="Día" val={coin.price_change_24h} active />
                         <PerfItem label="Semana" val={coin.price_change_7d} />
                         <PerfItem label="Mes" val={coin.price_change_30d} />
                         <PerfItem label="Año" val={coin.price_change_1y} />
                    </div>
                </div>

                {/* Sell / Action Button */}
                <div className="p-8 pt-0">
                    <button className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3">
                        <ShoppingCart size={18} />
                        Ejecutar Operación Instantánea
                    </button>
                </div>
            </motion.div>
        </motion.div>
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
