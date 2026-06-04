/**
 * canvas-types.ts
 * 
 * Shared type definitions for the Canvas topology engine.
 *
 * This file exists to BREAK the circular dependency between CanvasEngine.tsx
 * and its child components (CanvasNode, CanvasEdges, ContextMenu,
 * TelemetryTerminal) which all need these types but are themselves imported by
 * CanvasEngine. Circular imports in webpack/turbopack can produce `undefined`
 * values at runtime when module initialisation order is ambiguous.
 *
 * Import from here in ALL canvas sub-components instead of from CanvasEngine.
 * 
 */

export type NodeType = 'wallet' | 'bot' | 'contract' | 'api';

export interface NodeData {
    id: string;
    type: NodeType;
    x: number;
    y: number;
    title: string;
    status: 'active' | 'syncing' | 'error';
    latency: number;
}

export interface EdgeData {
    id: string;
    source: string;
    target: string;
    animated: boolean;
    status: 'active' | 'error' | 'high-latency';
}
