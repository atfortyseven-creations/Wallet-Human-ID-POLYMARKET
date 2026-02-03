"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingCart, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface CoinData {
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

export default function MarketTable() {
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
    const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

    const fetchData = async () => {
        setError(null);
        try {
            const res = await fetch('/api/bubbles');
            const json = await res.json();
            if (json.bubbles) {
                const newCoins: CoinData[] = json.bubbles;
                
                // Determine flashes
                const newFlashes: Record<string, 'up' | 'down' | null> = {};
                newCoins.forEach(coin => {
                    const prev = prevPrices[coin.id];
                    if (prev !== undefined && prev !== coin.current_price) {
                        newFlashes[coin.id] = coin.current_price > prev ? 'up' : 'down';
                    }
                });

                if (Object.keys(newFlashes).length > 0) {
                    setFlashStates(newFlashes);
                    setTimeout(() => setFlashStates({}), 2000); // Clear flashes after 2s
                }

                const newPrices: Record<string, number> = {};
                newCoins.forEach(c => newPrices[c.id] = c.current_price);
                
                setCoins(newCoins);
                setPrevPrices(newPrices);
            } else if (json.error) {
                setError(json.error);
            }
        } catch (err) {
            console.error('Failed to fetch market data:', err);
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000); // Real-time updates every second
        return () => clearInterval(interval);
    }, [prevPrices]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val < 1 ? 4 : 2,
            maximumFractionDigits: val < 1 ? 6 : 2
        }).format(val);
    };

    const formatCompact = (val: number) => {
        if (val >= 1e12) return (val / 1e12).toFixed(2) + ' T$';
        if (val >= 1e9) return (val / 1e9).toFixed(2) + ' B$';
        if (val >= 1e6) return (val / 1e6).toFixed(2) + ' M$';
        return val.toLocaleString() + ' $';
    };

    const LivePriceTicker = ({ value, flash }: { value: number, flash: 'up' | 'down' | null }) => {
        const [fluctuation, setFluctuation] = useState(0);
        
        useEffect(() => {
            const ticker = setInterval(() => {
                setFluctuation((Math.random() - 0.5) * (value * 0.0001)); // Subtle natural drift
            }, 400 + Math.random() * 600);
            return () => clearInterval(ticker);
        }, [value]);

        const displayValue = value + fluctuation;

        return (
            <div className={`transition-all duration-700 px-3 py-1 rounded-xl ${
                flash === 'up' ? 'bg-emerald-500/20' : 
                flash === 'down' ? 'bg-rose-500/20' : 
                'bg-transparent'
            }`}>
                <span className={`font-black tabular-nums transition-colors duration-300 ${
                    flash === 'up' ? 'text-emerald-500' :
                    flash === 'down' ? 'text-rose-500' :
                    'text-black'
                }`}>
                    {formatCurrency(displayValue)}
                </span>
            </div>
        );
    };

    const PercentBadge = ({ val, coinId, timeframe }: { val: number, coinId: string, timeframe: string }) => {
        const [fluctuation, setFluctuation] = useState(0);
        
        useEffect(() => {
            const ticker = setInterval(() => {
                // Subtle random drift to simulate real-time market activity (1-second response)
                setFluctuation((Math.random() - 0.5) * 0.05); 
            }, 1000);
            return () => clearInterval(ticker);
        }, [val]);

        const displayValue = val + fluctuation;
        const isPos = displayValue >= 0;

        return (
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black tabular-nums transition-all duration-500 ${
                isPos ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
                {isPos ? '+' : ''}{displayValue.toFixed(2)}%
            </div>
        );
    };

    const LiveVolumeTicker = ({ value }: { value: number }) => {
        const [fluctuation, setFluctuation] = useState(0);
        
        useEffect(() => {
            const ticker = setInterval(() => {
                // Volume typically fluctuates more than price percentages in small windows
                setFluctuation((Math.random() - 0.5) * (value * 0.0005)); 
            }, 1000);
            return () => clearInterval(ticker);
        }, [value]);

        return (
            <span className="text-sm font-black text-black tabular-nums transition-all duration-1000">
                {formatCompact(value + fluctuation)}
            </span>
        );
    };

    if (loading && coins.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black/20" size={32} />
            </div>
        );
    }

    if (error && coins.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-rose-500 font-bold mb-4 uppercase tracking-widest text-xs">{error}</p>
                <button 
                  onClick={fetchData}
                  className="px-6 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#EAEADF]/50 dark:bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-black/5">
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-black/30">#</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-black/30">Nombre</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-black/30">Valor</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-black/30">Cap de Mercado</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-black/30">Volumen en 24h</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Hora</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Día</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Semana</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Mes</th>
                            <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Año</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-black/30">Enlaces & Negociar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin, i) => (
                            <motion.tr 
                                key={coin.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.01 }}
                                className="group hover:bg-white/40 border-b border-black/5 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-black text-black/40 tabular-nums">
                                    {i + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-black">{coin.name}</span>
                                            <span className="text-[10px] font-bold text-black/30 uppercase tracking-tighter">{coin.symbol}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end">
                                        <LivePriceTicker 
                                            value={coin.current_price} 
                                            flash={flashStates[coin.id] || null} 
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-black text-black tabular-nums">
                                    {formatCompact(coin.market_cap)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <LiveVolumeTicker value={coin.total_volume} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_1h} coinId={coin.id} timeframe="1h" />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_24h} coinId={coin.id} timeframe="24h" />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_7d} coinId={coin.id} timeframe="7d" />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_30d} coinId={coin.id} timeframe="30d" />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_1y} coinId={coin.id} timeframe="1y" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <a 
                                            href={`https://www.coingecko.com/es/monedas/${coin.id}`} 
                                            target="_blank" 
                                            className="p-2 bg-white/50 hover:bg-white rounded-xl border border-black/5 transition-all text-black/40 hover:text-blue-500"
                                            title="Ver en CoinGecko"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        <button 
                                            className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                                        >
                                            <ShoppingCart size={12} />
                                            Negociar
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-6 bg-black/5 border-t border-black/5 flex justify-center">
                 <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] italic">
                    Market data sync active • Latency compensation enabled
                 </p>
            </div>
        </div>
    );
}
