'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';
import { ALLOCATIONS, Allocation } from '@/src/config/tokenomics';

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;

    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#fff" className="text-2xl font-bold">
                {payload.percentage}%
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#888899" className="text-xs font-mono uppercase tracking-wider">
                {payload.label}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                filter="url(#glow)"
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 4}
                outerRadius={innerRadius}
                fill={fill}
                fillOpacity={0.3}
            />
        </g>
    );
};

export const AllocationDonut = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="w-full h-[350px] glass rounded-3xl p-6 border border-white/5 relative flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-2 w-full text-left flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7000ff]" />
                Genesis Allocation
            </h3>

            {/* SVG Filter for Glow */}
            <svg style={{ height: 0 }}>
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
            </svg>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={ALLOCATIONS}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="percentage"
                        onMouseEnter={onPieEnter}
                        stroke="none"
                    >
                        {ALLOCATIONS.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="rgba(0,0,0,0)"
                                fillOpacity={index === activeIndex ? 1 : 0.3}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-[-20px]">
                {ALLOCATIONS.map((alloc, idx) => (
                    <div key={alloc.id} className={`flex items-center gap-1.5 transition-opacity ${idx === activeIndex ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alloc.color }} />
                        <span className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">{alloc.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
