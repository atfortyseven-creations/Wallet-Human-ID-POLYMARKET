'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import { useSystemAccount } from '@/hooks/useSystemAccount';

export const PerformanceChart: React.FC = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const { address } = useSystemAccount();
    const [mode, setMode] = useState<'wallet' | 'market_index' | 'loading' | 'error'>('loading');

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#a3a3a3',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: { borderVisible: false },
            rightPriceScale: { borderVisible: false },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#6366f1',
            topColor: 'rgba(99, 102, 241, 0.4)',
            bottomColor: 'rgba(99, 102, 241, 0.0)',
            lineWidth: 2,
        });

        chartRef.current = chart;

        // Fetch REAL price history:
        // Try wallet history first. If it returns 0 data or fails, fallback to ETH market index.
        const url = address
            ? `/api/wallet/portfolio/history-real?address=${address}&days=30`
            : `/api/wallet/portfolio/history-real?days=30`;

        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (data.chart && data.chart.length > 0 && data.chart.some((p: any) => p.value > 0)) {
                    areaSeries.setData(
                        data.chart.map((p: any) => ({ time: p.time, value: p.value }))
                    );
                    chart.timeScale().fitContent();
                    setMode(data.mode === 'wallet' ? 'wallet' : 'market_index');
                } else {
                    // Force fallback to generic ETH Market Index if wallet history is flat $0
                    fetch(`/api/wallet/portfolio/history-real?days=30`)
                        .then(r => r.json())
                        .then(fallbackData => {
                            if (fallbackData.chart) {
                                areaSeries.setData(fallbackData.chart.map((p: any) => ({ time: p.time, value: p.value })));
                                chart.timeScale().fitContent();
                                setMode('market_index');
                            } else {
                                setMode('error');
                            }
                        }).catch(() => setMode('error'));
                }
            })
            .catch(() => setMode('error'));

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [address]);

    return (
        <div className="relative w-full h-full">
            <div ref={chartContainerRef} className="w-full h-full" />
            {mode !== 'loading' && mode !== 'error' && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-lg border border-white/10 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                    {mode === 'wallet' ? ' Active Wallet' : ' ETH Index'} · CoinGecko
                </div>
            )}
        </div>
    );
};

