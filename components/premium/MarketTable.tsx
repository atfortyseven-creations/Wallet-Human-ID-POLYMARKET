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

    const fetchData = async () => {
        setError(null);
        try {
            const res = await fetch('/api/bubbles');
            const json = await res.json();
            if (json.bubbles) {
                setCoins(json.bubbles);
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
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val < 1 ? 4 : 2,
            maximumFractionDigits: val < 1 ? 6 : 2
        }).format(val);
    };

    const formatCompact = (val: number) => {
        if (val >= 1e12) return (val / 1e12).toFixed(2) + ' B$';
        if (val >= 1e9) return (val / 1e9).toFixed(2) + ' mil M$';
        if (val >= 1e6) return (val / 1e6).toFixed(2) + ' M$';
        return val.toLocaleString() + ' $';
    };

    const PercentBadge = ({ val }: { val: number }) => {
        const isPos = val >= 0;
        return (
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black tabular-nums transition-colors ${
                isPos ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
                {isPos ? '+' : ''}{val.toFixed(1)}%
            </div>
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
                                <td className="px-6 py-4 text-right text-sm font-black text-black tabular-nums">
                                    {formatCurrency(coin.current_price)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-black text-black tabular-nums">
                                    {formatCompact(coin.market_cap)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-black text-black tabular-nums">
                                    {formatCompact(coin.total_volume)}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_1h} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_24h} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_7d} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_30d} />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <PercentBadge val={coin.price_change_1y} />
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
