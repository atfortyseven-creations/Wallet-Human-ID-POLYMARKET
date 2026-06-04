"use client";

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import type { ProcessedBlock, ProcessedTransaction } from '@/lib/network/blockProcessor';

interface BlockTreemapProps {
    blocks: ProcessedBlock[];
    onBlockClick: (transaction: ProcessedTransaction) => void;
    width: number;
    height: number;
}

export function BlockTreemap({ blocks, onBlockClick, width, height }: BlockTreemapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Create treemap layout
    const treemapNodes = useMemo(() => {
        if (!blocks.length) return [];

        // Flatten all transactions from all blocks
        const allTransactions = blocks.flatMap(block => 
            block.transactions.map(tx => ({
                ...tx,
                blockHeight: block.height,
                blockId: block.id,
            }))
        );

        // Create hierarchy
        const root = d3.hierarchy<any>({
            name: 'root',
            children: allTransactions.map(tx => ({
                name: tx.hash,
                value: tx.virtualSize || 100, // Size based on virtual size
                data: tx,
            }))
        })
        .sum((d: any) => d.value || 0)
        .sort((a: d3.HierarchyNode<any>, b: d3.HierarchyNode<any>) => (b.value || 0) - (a.value || 0));

        // Create treemap layout
        const treemap = d3.treemap<any>()
            .size([width, height])
            .padding(2)
            .round(true);

        const nodes = treemap(root).leaves();
        
        return nodes.map((node: d3.HierarchyRectangularNode<any>) => ({
            x: node.x0,
            y: node.y0,
            width: node.x1 - node.x0,
            height: node.y1 - node.y0,
            transaction: node.data.data as ProcessedTransaction & { blockHeight: number; blockId: string },
        }));
    }, [blocks, width, height]);

    // Render to canvas for performance
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw each node
        treemapNodes.forEach((node: any) => {
            const { x, y, width: w, height: h, transaction } = node;

            // Color based on type (Mempool.space matching)
            let color;
            switch (transaction.type) {
                case 'consolidation':
                    color = '#2d5e39'; // Deeper green
                    break;
                case 'coinjoin':
                    color = '#2d5e5e'; // Tealish
                    break;
                case 'data':
                    color = '#b38f00'; // Gold/Orange
                    break;
                default:
                    color = '#388e3c'; // Classic Bitcoin Green
            }

            // Fee-rate based tint (Higher fee = brighter/more orange)
            if (transaction.feeRate > 50) {
                ctx.fillStyle = '#f57c00'; // High fee orange
            } else if (transaction.feeRate > 20) {
                ctx.fillStyle = '#8bc34a'; // Medium fee light green
            } else {
                ctx.fillStyle = color;
            }

            ctx.fillRect(x, y, w, h);

            // Tight dark border for grid effect
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, w, h);

            // Text (only if block is large enough)
            if (w > 60 && h > 30) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const shortHash = transaction.hash.slice(0, 8);
                ctx.fillText(shortHash, x + w / 2, y + h / 2 - 6);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = '8px sans-serif';
                ctx.fillText(`${transaction.virtualSize} vB`, x + w / 2, y + h / 2 + 6);
            }
        });
    }, [treemapNodes, width, height]);

    // Handle clicks
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked node
        const clickedNode = treemapNodes.find(node =>
            x >= node.x && x <= node.x + node.width &&
            y >= node.y && y <= node.y + node.height
        );

        if (clickedNode) {
            onBlockClick(clickedNode.transaction);
        }
    };

    return (
        <motion.canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            className="cursor-pointer rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: `${width}px`, height: `${height}px` }}
        />
    );
}

