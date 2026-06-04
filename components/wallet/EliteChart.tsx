"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries, CrosshairMode } from 'lightweight-charts';
import { safeToLocaleString } from '@/lib/utils/number-format';

interface PortfolioDataPoint {
    time: string | number;
    value: number;
}

interface EliteChartProps {
    data: PortfolioDataPoint[];
    height?: number;
    isPositive?: boolean;
}

export default function EliteChart({ data, height = 300, isPositive = true }: EliteChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

    const [hoverData, setHoverData] = React.useState<{ price: number, time: string } | null>(null);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup previous chart if exists
        if (chartRef.current) {
            chartRef.current.remove();
        }

        const activeColor = isPositive ? '#10b981' : '#ef4444';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#1F1F1F60',
                fontFamily: 'Inter, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(31, 31, 31, 0.03)' },
                horzLines: { color: 'rgba(31, 31, 31, 0.03)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: 'rgba(31, 31, 31, 0.1)',
                    style: 2,
                },
                horzLine: {
                    width: 1,
                    color: 'rgba(31, 31, 31, 0.1)',
                    style: 2,
                },
            },
            handleScroll: false,
            handleScale: false,
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: activeColor,
            topColor: `${activeColor}20`,
            bottomColor: `${activeColor}00`,
            lineWidth: 2,
            priceLineVisible: false,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            lastValueVisible: false,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        // Crosshair move handler
        chart.subscribeCrosshairMove((param) => {
            if (param.time && param.point) {
                const dataPoint = param.seriesData.get(series) as any;
                if (dataPoint) {
                    const date = new Date((param.time as number) * 1000);
                    setHoverData({
                        price: dataPoint.value,
                        time: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    });
                }
            } else {
                setHoverData(null);
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
        };
    }, [height, isPositive]); // Only recreate if height/color theme changes

    // Update Data
    useEffect(() => {
        if (!seriesRef.current || !data) return;

         const chartData = data
            .map(d => {
                let timestamp: number;
                if (typeof d.time === 'string') {
                    timestamp = Math.floor(new Date(d.time).getTime() / 1000);
                } else {
                    timestamp = d.time > 1000000000000 ? Math.floor(d.time / 1000) : d.time;
                }
                
                if (isNaN(timestamp) || !isFinite(timestamp)) {
                    return null;
                }

                return {
                    time: timestamp as any,
                    value: d.value,
                };
            })
            .filter((d): d is { time: any; value: number } => d !== null)
            .sort((a, b) => (a.time as any) - (b.time as any));

        const uniqueData = chartData.filter((item, index, self) => 
            index === self.findIndex((t) => (t.time === item.time))
        );

        if (uniqueData.length > 0) {
            seriesRef.current.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
        }
    }, [data]);

    return (
        <div className="w-full relative group">
            <div ref={chartContainerRef} className="w-full" />
            
            {/* Legend / Overlay */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-[#1F1F1F]/5 rounded-xl shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1F1F1F]/60">Elite Terminal</span>
                </div>
                
                {hoverData && (
                    <div className="flex flex-col gap-0.5 px-3 py-2 bg-[#1F1F1F] rounded-xl shadow-xl border border-[#1F1F1F]">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{hoverData.time}</span>
                        <span className="text-sm font-black text-white italic tracking-tight">
                            ${safeToLocaleString(hoverData.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Dekor Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-[#1F1F1F]/5 rounded-[2rem] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] bg-[radial-gradient(#1F1F1F_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
        </div>
    );
}

