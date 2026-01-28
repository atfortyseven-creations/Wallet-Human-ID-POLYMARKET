'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TOKEN_METRICS } from '@/src/config/tokenomics';

const DATA = [
    { month: 'TGE', supply: 10 },
    { month: 'M6', supply: 15 },
    { month: 'M12', supply: 25 },
    { month: 'M18', supply: 40 },
    { month: 'M24', supply: 65 },
    { month: 'M30', supply: 80 },
    { month: 'M36', supply: 90 },
    { month: 'M48', supply: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-white/10 backdrop-blur-xl">
                <p className="text-xs text-gray-400 font-mono mb-1">{label}</p>
                <p className="text-sm font-bold text-white">
                    {payload[0].value}M {TOKEN_METRICS.ticker}
                </p>
            </div>
        );
    }
    return null;
};

export const SupplyChart = () => {
    return (
        <div className="w-full h-[300px] md:h-[400px] glass rounded-3xl p-6 border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f2ea]" />
                Circulating Supply Schedule
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                    <defs>
                        <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00f2ea" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#444"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#444"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}M`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00f2ea', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area
                        type="monotone"
                        dataKey="supply"
                        stroke="#00f2ea"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSupply)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
