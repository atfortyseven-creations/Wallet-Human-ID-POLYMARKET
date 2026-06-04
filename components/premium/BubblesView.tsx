"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw, X, Globe, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePerformanceMode, shouldRenderFrame } from '@/hooks/usePerformanceMode';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
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
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
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
    ref: React.RefObject<HTMLDivElement | null>;
    coin: BubbleData;
    settled: boolean; // Track if bubble has settled
    dragOffsetX: number; // Offset for smooth dragging
    dragOffsetY: number;
}

export default function BubblesView({ limit }: { limit?: number }) {
    const { t } = useLanguage();
    const [data, setData] = useState<BubbleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoin, setSelectedCoin] = useState<BubbleData | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef<PhysicsNode[]>([]);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const animationStartRef = useRef<number>(0);
    const [isSettled, setIsSettled] = useState(false);
    const lastRenderRef = useRef(0);
    
    const perfMode = usePerformanceMode();
    const perfRef = useRef(perfMode);
    perfRef.current = perfMode;

    const mouseRef = useRef({ x: 0, y: 0, active: false, targetNode: null as string | null });

    const fetchData = async (signal?: AbortSignal) => {
        try {
            const res = await fetch('/api/bubbles', { signal });
            if (!res.ok) {
                if (res.status === 429) {
                    console.warn('Rate limit exceeded for bubbles API');
                    return;
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const json = await res.json();
            if (json.bubbles) {
                setData(json.bubbles);
                setError(null);
            } else if (json.error) {
                console.warn('API Error:', json.error);
                if (data.length === 0) setError(json.error);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('Fetch error:', err);
            if (data.length === 0) setError('Connection Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        const interval = setInterval(() => fetchData(controller.signal), 30000); // Relaxed to 30s
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(coin => 
            coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coin.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, limit || 100); // Expanded to match Market Table perfectly or adhere to limit
    }, [data, searchQuery, limit]);

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
            
            const seed1 = (coin.market_cap_rank * 13.57) % 1;
            const seed2 = (coin.market_cap_rank * 27.13) % 1;
            const seed3 = (coin.market_cap_rank * 7.91) % 1;
            const seed4 = (coin.market_cap_rank * 3.14) % 1;
            
            return {
                id: coin.id,
                x: seed1 * width,
                y: seed2 * height,
                vx: (seed3 - 0.5) * 0.5,
                vy: (seed4 - 0.5) * 0.5,
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
        requestRef.current = requestAnimationFrame(animate);

        if (!perfRef.current.isVisible) return;
        if (!shouldRenderFrame(time, lastRenderRef.current, perfRef.current.targetFps)) return;
        lastRenderRef.current = time;

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

        // SKIP PHYSICS IF MINIMAL and SETTLED
        // When in MINIMAL power mode, we don't need interactive bubbling after it rests.
        let allSettled = true;
        const skipInteraction = perfRef.current.mode === "MINIMAL" && progress > 0.99;

        if (skipInteraction) {
           for (let i = 0; i < nodes.length; i++) {
               const a = nodes[i];
               a.settled = true; 
               a.vx = 0; a.vy = 0;
           }
           setIsSettled(true);
           return;
        }

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
                const springStrength = 0.08 * deltaTime; // Adjusted delta
                const damping = Math.pow(0.85, deltaTime); // Smooth deceleration
                
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
                const damping = Math.pow(0.92, deltaTime);
                const repulsion = 0.3 * animationStrength * deltaTime;
                const edgeForce = 0.08 * animationStrength * deltaTime;
                const pullToCenter = 0.002 * animationStrength * deltaTime;

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
        <div className="flex flex-col h-full bg-[#FFFFFF] rounded-[2.5rem] border border-[#E5E5E5] overflow-hidden shadow-sm">
            {/* Header / Controls */}
            <div className="p-6 border-b border-[#E5E5E5] flex flex-col md:flex-row gap-4 justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-[#F0F0F0] p-1.5 rounded-2xl border border-[#E5E5E5]">
                    {(['1h', '24h', '7d', '30d', '1y'] as Timeframe[]).map((tf) => {
                         const labels: Record<string, string> = {
                             '1h': t('market.hour'),
                             '24h': t('market.day'),
                             '7d': t('market.week'),
                             '30d': t('market.month'),
                             '1y': t('market.year')
                         };
                         return (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                timeframe === tf 
                                    ? 'bg-white text-black shadow-lg' 
                                    : 'text-white/40 hover:bg-white/5'
                            }`}
                        >
                            {labels[tf]}
                        </button>
                    )})}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                        <input 
                            type="text"
                            placeholder={t('common.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white border border-[#E5E5E5] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-64 text-[#050505]"
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
                                        ? 'bg-emerald-500/20 border-[3px]' 
                                        : 'bg-rose-500/20 border-[3px]'
                                } backdrop-blur-md overflow-hidden hover:scale-110 active:scale-90 transition-all duration-500`}
                                style={{
                                    borderColor: node.coin.riskLevel === 'CRITICAL' ? '#f43f5e' :
                                                 node.coin.riskLevel === 'HIGH' ? '#f97316' :
                                                 node.coin.riskLevel === 'MEDIUM' ? '#eab308' :
                                                 node.coin.riskLevel === 'LOW' ? '#10b981' :
                                                 (node.coin[`price_change_${timeframe}` as keyof BubbleData] as number >= 0 ? '#10b981' : '#f43f5e'),
                                    boxShadow: node.coin.riskLevel ? `0 0 25px ${
                                        node.coin.riskLevel === 'CRITICAL' ? 'rgba(244,63,94,0.5)' :
                                        node.coin.riskLevel === 'HIGH' ? 'rgba(249,115,22,0.5)' :
                                        node.coin.riskLevel === 'MEDIUM' ? 'rgba(234,179,8,0.5)' :
                                        'rgba(16,185,129,0.5)'
                                    }` : `0 0 20px rgba(${node.coin[`price_change_${timeframe}` as keyof BubbleData] as number >= 0 ? '16,185,129' : '244,63,94'}, 0.3)`
                                }}>
                                    {/* Risk Badge */}
                                    {node.coin.riskLevel && (
                                        <div className="absolute top-2 right-2 z-20">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                                                node.coin.riskLevel === 'CRITICAL' ? 'bg-rose-500' :
                                                node.coin.riskLevel === 'HIGH' ? 'bg-orange-500' :
                                                node.coin.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                                                'bg-emerald-500'
                                            }`} />
                                        </div>
                                    )}
                                    <BubbleIcon src={node.coin.image} alt={node.coin.symbol} />
                                    <div className="font-black text-[10px] leading-none mb-1 text-white uppercase">{node.coin.symbol}</div>
                                    <div className="font-black text-[9px] tabular-nums text-white">
                                        <ActiveBubblePercentTicker 
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
            <div className="p-6 bg-[#FFFFFF] border-t border-[#E5E5E5] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isSettled ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">
                        {isSettled ? t('market.drag_move') : t('market.settling')}
                    </span>
                </div>
            </div>
        </div>
    );
}

function BubbleIcon({ src, alt }: { src: string, alt: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="w-8 h-8 rounded-full mb-1 flex items-center justify-center bg-white/10 text-[8px] font-bold text-white/50">
                {alt.slice(0, 2)}
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className="w-8 h-8 rounded-full mb-1 pointer-events-none" 
            onError={() => setError(true)}
        />
    );
}

function ActiveBubblePercentTicker({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const isPos = displayValue >= 0;

    return (
        <span className="transition-all duration-1000 tabular-nums">
            {isPos ? '+' : ''}{safeToFixed(displayValue, 3)}%
        </span>
    );
}

// Modal component remains mostly same but optimized
function BubbleDetailModal({ coin, onClose }: { coin: BubbleData, onClose: () => void }) {
    const router = useRouter();
    const { t } = useLanguage();
    const [livePrice, setActivePrice] = useState(coin.current_price);

    useEffect(() => {
        setActivePrice(coin.current_price);
    }, [coin.current_price]);

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
                            <BubbleIcon src={coin.image} alt={coin.name} />
                            <div>
                                <h2 className="text-3xl font-black">{coin.name}</h2>
                                <span className="text-sm font-black text-purple-400 uppercase tracking-widest">{coin.symbol}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black tabular-nums">
                                ${safeToLocaleString(livePrice, { minimumFractionDigits: livePrice < 1 ? 4 : 2, maximumFractionDigits: livePrice < 1 ? 6 : 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                           <MetricBlock label={t('market.hour')} value={coin.price_change_1h} />
                           <MetricBlock label={t('market.day')} value={coin.price_change_24h} />
                           <MetricBlock label={t('market.week')} value={coin.price_change_7d} />
                           <MetricBlock label={t('market.month')} value={coin.price_change_30d} />
                           <MetricBlock label={t('market.year')} value={coin.price_change_1y} />
                           <div className="col-span-2 bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
                                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{t('market.volume_24h')}</span>
                                <ActiveModalVolumeTicker value={coin.total_volume} />
                           </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => router.push(`/wallet?asset=${coin.symbol}`)} className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                                {t('common.trade')} {coin.symbol}
                            </button>
                            <button onClick={onClose} className="px-8 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10">
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function MetricBlock({ label, value }: { label: string, value: number }) {
    const displayValue = value;
    const isPos = displayValue >= 0;

    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 ${isPos ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <span className="text-[10px] font-black text-white/30 tracking-widest mb-1">{label}</span>
            <div className={`text-xs font-black flex items-center gap-1 tabular-nums ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {safeToFixed(Math.abs(displayValue), 2)}%
            </div>
        </div>
    );
}

function ActiveModalVolumeTicker({ value }: { value: number }) {
    const displayValue = value;

    return (
        <span className="text-lg font-black tabular-nums transition-all duration-1000">
            ${safeToFixed(displayValue / 1e9, 3)}B
        </span>
    );
}

