// components/dashboard/EntityGraphVis.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Loader2, WifiOff, XCircle, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(r => r.json());

//  Color palette 
const NODE_COLORS: Record<number, { fill: string; glow: string; label: string }> = {
    0: { fill: '#050505', glow: '#ffffff',  label: 'Genesis Node' },
    1: { fill: '#FF3B30', glow: '#FF3B30',  label: 'High Risk' },
    2: { fill: '#00C076', glow: '#00C076',  label: 'Institutional' },
    3: { fill: '#0052FF', glow: '#0052FF',  label: 'Wallet' },
};
const getNodeColor = (group: number) => NODE_COLORS[group] ?? NODE_COLORS[3];

export function EntityGraphVis() {
    const svgRef        = useRef<SVGSVGElement>(null);
    const containerRef  = useRef<HTMLDivElement>(null);
    const zoomRef       = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [mountKey, setMountKey]         = useState(0);
    const [zoomLevel, setZoomLevel]       = useState(1);

    const { data: gridData, isLoading, mutate } = useSWR(
        `/api/analytics/graph?t=${mountKey}`,
        fetcher,
        { refreshInterval: 0, revalidateOnFocus: false }
    );

    useEffect(() => {
        setMountKey(Date.now());
        mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isOffline = !gridData?.graph?.nodes?.length || gridData?.degraded;

    //  D3 render 
    useEffect(() => {
        let nodes: any[] = [];
        let links: any[] = [];

        if (gridData?.graph?.nodes) {
            nodes = gridData.graph.nodes;
            links = gridData.graph.links;
        }

        if (!svgRef.current || !nodes.length) return;

        const parent = svgRef.current.parentElement;
        if (!parent) return;

        let cleanupFn: (() => void) | null = null;
        let hasRun = false;

        const runD3 = (width: number, height: number) => {
            if (hasRun || !svgRef.current) return;
            hasRun = true;

            const d3Nodes = nodes.map(d => ({ ...d }));
            const d3Links = links.map(d => ({ ...d }));

            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            //  Defs: glows 
            const defs = svg.append('defs');
            Object.entries(NODE_COLORS).forEach(([group, colors]) => {
                const filter = defs.append('filter')
                    .attr('id', `glow-${group}`)
                    .attr('x', '-50%').attr('y', '-50%')
                    .attr('width', '200%').attr('height', '200%');
                filter.append('feGaussianBlur')
                    .attr('stdDeviation', '4')
                    .attr('result', 'blur');
                const feMerge = filter.append('feMerge');
                feMerge.append('feMergeNode').attr('in', 'blur');
                feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
            });

            //  Background & grid 
            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', '#0A0A0A');

            // Dot grid
            const gridSpacing = 32;
            const dotsG = svg.append('g').attr('class', 'grid-dots');
            for (let x = 0; x < width; x += gridSpacing) {
                for (let y = 0; y < height; y += gridSpacing) {
                    dotsG.append('circle')
                        .attr('cx', x).attr('cy', y)
                        .attr('r', 0.8)
                        .attr('fill', 'rgba(255,255,255,0.06)');
                }
            }

            const g = svg.append('g');

            //  Zoom 
            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.08, 5])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                    setZoomLevel(Math.round(event.transform.k * 100) / 100);
                });

            svg.call(zoom);
            zoomRef.current = zoom;

            //  Force simulation 
            const simulation = d3.forceSimulation(d3Nodes as any)
                .force('link',    d3.forceLink(d3Links).id((d: any) => d.id).distance(140))
                .force('charge',  d3.forceManyBody().strength(-500))
                .force('center',  d3.forceCenter(width / 2, height / 2))
                .force('collide', d3.forceCollide().radius((d: any) => (d.size * 6) + 18));

            //  Links 
            const link = g.append('g')
                .selectAll('line')
                .data(d3Links)
                .join('line')
                .attr('stroke', (d: any) => {
                    // color based on source node's group
                    const srcGroup = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source))?.group ?? 3;
                    return getNodeColor(srcGroup).glow + '40';
                })
                .attr('stroke-width', (d: any) => Math.max(0.5, Math.sqrt(d.value ?? 1) * 0.8));

            //  Nodes 
            const node = g.append('g')
                .selectAll('circle')
                .data(d3Nodes)
                .join('circle')
                .attr('r', (d: any) => (d.size ?? 4) * 3 + 4)
                .attr('fill', (d: any) => getNodeColor(d.group).fill)
                .attr('stroke', (d: any) => getNodeColor(d.group).glow)
                .attr('stroke-width', 1.5)
                .attr('filter', (d: any) => `url(#glow-${d.group})`)
                .style('cursor', 'pointer')
                .on('click', (_event, d: any) => {
                    setSelectedNode(d);
                    toast.success(`ENTITY: ${d.label}`, { duration: 2500 });
                })
                .on('mouseover', function(_event, d: any) {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', (d.size ?? 4) * 3 + 8)
                        .attr('stroke-width', 3);
                    linkEl.attr('stroke', (l: any) => {
                        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
                        const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                        if (srcId === d.id || tgtId === d.id) {
                            return getNodeColor(d.group).glow + 'CC';
                        }
                        return getNodeColor(nodes.find(n => n.id === srcId)?.group ?? 3).glow + '20';
                    });
                })
                .on('mouseout', function(_event, d: any) {
                    d3.select(this)
                        .transition().duration(200)
                        .attr('r', (d.size ?? 4) * 3 + 4)
                        .attr('stroke-width', 1.5);
                    linkEl.attr('stroke', (l: any) => {
                        const srcId = typeof l.source === 'object' ? l.source.id : l.source;
                        return getNodeColor(nodes.find(n => n.id === srcId)?.group ?? 3).glow + '40';
                    });
                });

            //  Labels 
            const label = g.append('g')
                .selectAll('text')
                .data(d3Nodes)
                .join('text')
                .text((d: any) => d.label)
                .attr('font-size', '8px')
                .attr('dx', (d: any) => (d.size ?? 4) * 3 + 10)
                .attr('dy', 3)
                .attr('fill', (d: any) => getNodeColor(d.group).glow + 'CC')
                .attr('pointer-events', 'none')
                .style('font-family', 'monospace')
                .style('text-transform', 'uppercase')
                .style('letter-spacing', '0.08em');

            // Keep reference for hover
            const linkEl = link;

            //  Drag 
            node.call(
                d3.drag<SVGCircleElement, any>()
                    .on('start', (event, d: any) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x; d.fy = d.y;
                    })
                    .on('drag', (event, d: any) => { d.fx = event.x; d.fy = event.y; })
                    .on('end', (event, d: any) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null; d.fy = null;
                    }) as any
            );

            //  Tick 
            simulation.on('tick', () => {
                link
                    .attr('x1', (d: any) => d.source.x)
                    .attr('y1', (d: any) => d.source.y)
                    .attr('x2', (d: any) => d.target.x)
                    .attr('y2', (d: any) => d.target.y);
                node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
                label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
            });

            // Pause/resume on page visibility change
            const handleVisibility = () => {
                if (document.hidden) simulation.stop();
                else simulation.alpha(0.3).restart();
            };
            document.addEventListener('visibilitychange', handleVisibility);

            cleanupFn = () => {
                document.removeEventListener('visibilitychange', handleVisibility);
                simulation.stop();
            };
        };

        const immediateW = parent.clientWidth || 0;
        const immediateH = parent.clientHeight || 0;
        if (immediateW > 0 && immediateH > 0) {
            runD3(immediateW, immediateH);
        } else {
            const ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        ro.disconnect();
                        runD3(width, height);
                        break;
                    }
                }
            });
            ro.observe(parent);
            cleanupFn = () => ro.disconnect();
        }

        return () => { if (cleanupFn) cleanupFn(); };
    }, [gridData, isOffline]);

    //  Zoom helpers 
    const handleZoomIn = () => {
        if (!svgRef.current || !zoomRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4);
    };
    const handleZoomOut = () => {
        if (!svgRef.current || !zoomRef.current) return;
        d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    };
    const handleResetZoom = () => {
        if (!svgRef.current || !zoomRef.current) return;
        d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity);
    };

    return (
        <div className="w-full h-full min-h-0 flex flex-col overflow-hidden" style={{ minHeight: 600 }}>

            {/*  HEADER  */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,192,118,0.1)', border: '1px solid rgba(0,192,118,0.25)' }}>
                        <Network size={14} className="text-[#00C076]" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Entity Graph</h2>
                        <span className="text-[8px] text-white/30 uppercase tracking-widest">Multi-Entity Capital Topology</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom controls */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                        <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <ZoomOut size={12} />
                        </button>
                        <span className="text-[9px] font-black font-mono text-white/30 px-2 tabular-nums min-w-[40px] text-center">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <ZoomIn size={12} />
                        </button>
                        <button onClick={handleResetZoom} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <Maximize2 size={12} />
                        </button>
                    </div>

                    <button
                        onClick={() => { setMountKey(Date.now()); mutate(); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors border border-white/5"
                        title="Refresh graph"
                    >
                        <RefreshCw size={13} />
                    </button>

                    {/* Status pill */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                        isOffline
                            ? 'bg-[#FF3B30]/5 border-[#FF3B30]/20 text-[#FF3B30]'
                            : 'bg-[#00C076]/5 border-[#00C076]/20 text-[#00C076]'
                    }`}>
                        {isOffline ? <WifiOff size={9} /> : <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse inline-block" />}
                        {isOffline ? 'Degraded' : 'Active'}
                    </div>
                </div>
            </div>

            {/*  CANVAS  */}
            <div ref={containerRef} className="flex-1 relative" style={{ background: '#0A0A0A', minHeight: 0 }}>

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-50" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(4px)' }}>
                        <Loader2 className="animate-spin text-[#00C076]" size={28} />
                        <span className="text-[9px] font-black tracking-[0.25em] text-[#00C076] uppercase">Indexing Entities...</span>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && isOffline && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-40">
                        <WifiOff size={32} className="text-white/10" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Graph Unavailable</p>
                        <p className="text-[9px] text-white/10">The entity analytics layer is offline</p>
                    </div>
                )}

                <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }} />

                {/*  Legend  */}
                <div className="absolute bottom-5 left-5 flex flex-col gap-2 pointer-events-none">
                    <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
                        <div className="px-4 py-2.5 border-b border-white/5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Node Legend</span>
                        </div>
                        <div className="px-4 py-3 flex flex-col gap-2">
                            {Object.entries(NODE_COLORS).map(([group, colors]) => (
                                <div key={group} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors.fill, boxShadow: `0 0 6px ${colors.glow}` }} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: colors.glow + 'BB' }}>
                                        {colors.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/*  Stats HUD  */}
                <div className="absolute bottom-5 right-5 pointer-events-none">
                    <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
                        <div className="px-4 py-2.5 border-b border-white/5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Graph Metrics</span>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-2">
                            <span className="text-[7px] uppercase tracking-wider text-white/20">Nodes</span>
                            <span className="text-[9px] font-black font-mono text-white">{gridData?.graph?.nodes?.length ?? 0}</span>
                            <span className="text-[7px] uppercase tracking-wider text-white/20">Edges</span>
                            <span className="text-[9px] font-black font-mono text-white">{gridData?.graph?.links?.length ?? 0}</span>
                            <span className="text-[7px] uppercase tracking-wider text-white/20">Zoom</span>
                            <span className="text-[9px] font-black font-mono text-[#00C076]">{Math.round(zoomLevel * 100)}%</span>
                        </div>
                    </div>
                </div>

                {/*  Selected Node Panel  */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute top-5 right-5 w-64 rounded-xl border border-white/10 overflow-hidden pointer-events-auto"
                            style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px)' }}
                        >
                            {/* Panel header */}
                            <div
                                className="flex items-center justify-between px-5 py-3 border-b border-white/5"
                                style={{ background: getNodeColor(selectedNode.group).glow + '08' }}
                            >
                                <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: getNodeColor(selectedNode.group).glow }}>
                                    Entity Analysis
                                </span>
                                <button onClick={() => setSelectedNode(null)} className="p-0.5 hover:opacity-70 transition-opacity">
                                    <XCircle size={13} className="text-white/30" />
                                </button>
                            </div>

                            <div className="px-5 py-4 flex flex-col gap-4">
                                {/* Node name with glow dot */}
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getNodeColor(selectedNode.group).fill, boxShadow: `0 0 8px ${getNodeColor(selectedNode.group).glow}` }} />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-wide truncate">{selectedNode.label}</h3>
                                </div>

                                {[
                                    { label: 'Layer Type', value: selectedNode.group === 0 ? 'Genesis Origin' : selectedNode.group === 1 ? 'Flagged High-Risk' : selectedNode.group === 2 ? 'Institutional Hub' : 'Standard Wallet', color: getNodeColor(selectedNode.group).glow },
                                    { label: 'Wallet Address', value: selectedNode.address || '', color: 'rgba(255,255,255,0.4)' },
                                    { label: 'Network Weight', value: String(selectedNode.weight ?? selectedNode.size ?? ''), color: '#00C076' },
                                    { label: 'Connections', value: String(selectedNode.connections ?? ''), color: 'rgba(255,255,255,0.4)' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex flex-col gap-0.5">
                                        <span className="text-[7px] uppercase tracking-[0.2em] text-white/20 font-black">{label}</span>
                                        <span className="text-[10px] font-bold font-mono break-all" style={{ color }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip */}
                <div className="absolute top-5 left-5 pointer-events-none">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/15">
                        Scroll to zoom · drag nodes · click to inspect
                    </span>
                </div>
            </div>

            {/*  FOOTER  */}
            <div className="px-6 py-3 border-t border-white/5 bg-[#0A0A0A] flex justify-between items-center text-[7px] font-bold uppercase tracking-[0.2em] text-white/20 shrink-0">
                <div className="flex items-center gap-4">
                    <span>Render: D3 Force Graph</span>
                    <span>Database: Neo4j Cluster</span>
                </div>
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
                    Entity Analytics v2.0
                </span>
            </div>
        </div>
    );
}
