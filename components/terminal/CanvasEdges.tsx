"use client";

import React from 'react';
import { EdgeData, NodeData } from './canvas-types';

interface CanvasEdgesProps {
    edges: EdgeData[];
    nodes: NodeData[];
}

export function CanvasEdges({ edges, nodes }: CanvasEdgesProps) {
    // Generate curved SVG paths between nodes
    const getPath = (source: NodeData, target: NodeData) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        
        // Simple cubic bezier curve for network topology aesthetic
        const controlPointOffsetX = Math.abs(dx) * 0.5;
        
        return `M ${source.x} ${source.y} C ${source.x + controlPointOffsetX} ${source.y}, ${target.x - controlPointOffsetX} ${target.y}, ${target.x} ${target.y}`;
    };

    const getEdgeColor = (status: EdgeData['status']) => {
        switch (status) {
            case 'active': return 'var(--aztec-orchid)'; // Brand purplish-pink
            case 'high-latency': return '#eab308'; // Amber
            case 'error': return '#ef4444'; // Red
        }
    };

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const pathData = getPath(sourceNode, targetNode);
                const color = getEdgeColor(edge.status);

                return (
                    <g key={edge.id}>
                        {/* Base Line */}
                        <path 
                            d={pathData} 
                            fill="none" 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeWidth={3} 
                        />
                        
                        {/* Animated Capital Flow */}
                        {edge.animated && (
                            <path 
                                d={pathData} 
                                fill="none" 
                                stroke={color} 
                                strokeWidth={2}
                                strokeDasharray="10 20"
                                className="animate-[dash_1s_linear_infinite] opacity-70 drop-shadow-[0_0_5px_currentColor]" 
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
