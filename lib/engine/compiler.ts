export type NodeType = 'wallet' | 'bot' | 'contract' | 'api';

export interface NodeData {
    id: string;
    type: NodeType;
    title: string;
    data?: any;
    x?: number;
    y?: number;
    status?: string;
    latency?: number;
}

export interface EdgeData {
    id: string;
    source: string;
    target: string;
}

export interface CompiledGraph {
    executionLayers: NodeData[][];
    errors: string[];
}

/**
 * Topologically sorts the nodes based on edges into execution layers.
 * Layer 0: Nodes with no incoming edges (e.g., API sources).
 * Layer 1: Nodes that depend only on Layer 0.
 * etc.
 */
export function compileGraph(nodes: NodeData[], edges: EdgeData[]): CompiledGraph {
    const errors: string[] = [];
    const executionLayers: NodeData[][] = [];
    
    // Quick validation
    if (!nodes || nodes.length === 0) {
        return { executionLayers, errors: ["Empty topology."] };
    }

    // Build adjacency list & in-degree map
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    for (const node of nodes) {
        adjList.set(node.id, []);
        inDegree.set(node.id, 0);
    }
    
    for (const edge of edges) {
        if (!adjList.has(edge.source) || !adjList.has(edge.target)) {
            // Edge points to non-existent node (orphan edge)
            continue;
        }
        adjList.get(edge.source)!.push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
    }
    
    // Find all nodes with 0 in-degree (starts)
    let currentLayer = nodes.filter(n => inDegree.get(n.id) === 0);
    
    if (currentLayer.length === 0 && nodes.length > 0) {
        errors.push("Circular dependency detected. No starting nodes found.");
        return { executionLayers, errors };
    }

    let processedCount = 0;
    
    while (currentLayer.length > 0) {
        executionLayers.push(currentLayer);
        processedCount += currentLayer.length;
        
        const nextLayer: NodeData[] = [];
        
        for (const node of currentLayer) {
            const neighbors = adjList.get(node.id) || [];
            for (const neighborId of neighbors) {
                const newDegree = inDegree.get(neighborId)! - 1;
                inDegree.set(neighborId, newDegree);
                
                if (newDegree === 0) {
                    nextLayer.push(nodes.find(n => n.id === neighborId)!);
                }
            }
        }
        
        currentLayer = nextLayer;
    }
    
    if (processedCount < nodes.length) {
        errors.push("Circular dependency detected within the graph.");
    }
    
    return { executionLayers, errors };
}
