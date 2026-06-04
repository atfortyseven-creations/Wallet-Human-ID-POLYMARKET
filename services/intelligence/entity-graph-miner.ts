import { prisma } from '@/lib/prisma';
import neo4j from 'neo4j-driver';

/**
 * Entity Graph Miner
 *
 * Maps real WhaleActivity traces into an Entity connection graph for the D3 visualizer.
 * Uses Prisma (PostgreSQL) as the primary source of truth for wallet nodes.
 * Syncs with Neo4j when available for real relationship data.
 *
 * ZERO-SIMULATION MANDATE: This module NEVER fabricates graph links.
 * If no real relationship data is available (Neo4j offline, no on-chain data yet),
 * the graph is returned with an empty links array and a status flag.
 * The UI layer is responsible for displaying an appropriate empty state.
 */

export type GraphStatus = 'LIVE_NEO4J' | 'MEMORY_MATRIX_ACTIVE' | 'NO_DATA';

export interface GraphResult {
  nodes: GraphNode[];
  links: GraphLink[];
  status: GraphStatus;
  nodeCount: number;
  linkCount: number;
}

export interface GraphNode {
  id: string;
  group: number;
  label: string;
  size: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export class EntityGraphMiner {
    private driver: any | null = null;
    
    constructor() {
        console.log('[GRAPH-MINER] Initializing Blockchain Subnet Crawler...');
        if (process.env.NEO4J_URI && process.env.NEO4J_USER) {
            this.driver = neo4j.driver(
                process.env.NEO4J_URI,
                neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD || ''),
                {
                    connectionTimeout: 5000,
                    maxConnectionPoolSize: 50,
                    maxConnectionLifetime: 3600000 // 1 hour
                }
            );
            console.log('[GRAPH-MINER] Connected to Neo4j Multi-Dimensional Index.');
        } else {
            console.log('[GRAPH-MINER] Initializing deterministic Memory Grid Mode (Local)');
        }
    }

    /**
     * Memory Grid Mode (PostgreSQL-only fallback).
     * Returns REAL wallet nodes from the database.
     * Links are EMPTY  we never fabricate topology.
     * The frontend renders nodes as isolated points until Neo4j provides real edges.
     */
    public async mineLocalNetworkGraph(): Promise<GraphResult> {
        const entities = await prisma.onChainEntity.findMany({
            take: 30,
            orderBy: { updatedAt: 'desc' }
        });

        const nodes: GraphNode[] = entities.map(e => ({
            id: e.address,
            group: e.category === 'MEV Bot' ? 1 : e.category === 'Institutional' ? 2 : 3,
            label: e.label || '',
            size: Math.max(1, (e.totalVolumeUSD || 0) / 1_000_000)
        }));

        if (nodes.length === 0) {
            nodes.push({
                id: '0xGENESIS_000000000000000000000000000000',
                group: 0,
                label: 'GENESIS NODE (AWAITING DATA)',
                size: 5
            });
        }

        const links: GraphLink[] = [];

        return {
            nodes,
            links,
            status: 'MEMORY_MATRIX_ACTIVE' as GraphStatus,
            nodeCount: nodes.length,
            linkCount: links.length,
        };
    }

    public async mineRealNetworkGraph(): Promise<GraphResult> {
        if (!this.driver) throw new Error('Neo4j driver not initialized.');
        const session = this.driver.session();
        try {
            const query = `
                MATCH (e:Entity)
                OPTIONAL MATCH (e)-[r:TRANSFERRED]->(t:Entity)
                WITH e, r, t
                ORDER BY e.volumeUSD DESC
                LIMIT 50
                WITH collect(DISTINCT e) + collect(DISTINCT t) AS all_nodes, collect(DISTINCT {source: e.address, target: t.address, value: r.amountUSD}) AS links
                UNWIND all_nodes AS n
                WITH DISTINCT n AS node, links
                WHERE node IS NOT NULL
                RETURN collect(node) AS nodes, links
            `;
            const result = await session.run(query);
            if (!result.records.length) {
                return { nodes: [], links: [], status: 'NO_DATA', nodeCount: 0, linkCount: 0 };
            }
            const record = result.records[0];
            const rawNodes: any[] = record.get('nodes') ?? [];
            const rawLinks: any[] = record.get('links') ?? [];

            const nodes: GraphNode[] = rawNodes.map((n: any) => ({
                id: n.properties.address,
                group: n.properties.category === 'MEV Bot' ? 1 : n.properties.category === 'Institutional' ? 2 : 3,
                label: n.properties.label ?? n.properties.address.slice(0, 8),
                size: Math.max(1, (n.properties.volumeUSD || 0) / 1_000_000)
            }));

            // Only include links where both source and target are non-null real addresses
            const links: GraphLink[] = rawLinks
                .filter((l: any) => l.source && l.target)
                .map((l: any) => ({
                    source: l.source,
                    target: l.target,
                    value: Math.max(1, (l.value || 0) / 100_000)
                }));

            // Double-check to prevent D3 "missing id" crashes
            const nodeIds = new Set(nodes.map(n => n.id));
            const safeLinks = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

            if (nodes.length === 0) {
                nodes.push({
                    id: '0xGENESIS_000000000000000000000000000000',
                    group: 0,
                    label: 'GENESIS NODE (AWAITING DATA)',
                    size: 5
                });
            }

            return {
                nodes,
                links: safeLinks,
                status: 'LIVE_NEO4J' as GraphStatus,
                nodeCount: nodes.length,
                linkCount: safeLinks.length,
            };
        } finally {
            await session.close();
        }
    }

    public async execute(): Promise<GraphResult> {
        console.log('[GRAPH-MINER] Extrapolating wallet network vertices...');

        if (this.driver) {
            try {
                console.log('[GRAPH-MINER] Querying Neo4j Multi-Dimensional Index...');
                const graph = await this.mineRealNetworkGraph();
                console.log(`[GRAPH-MINER] LIVE Neo4j: ${graph.nodeCount} nodes, ${graph.linkCount} real relationships.`);
                return graph;
            } catch (err: any) {
                console.warn(`[GRAPH-MINER] Neo4j unavailable (${err.message}). Activating Memory Grid Mode (nodes only, zero fabrication).`);
                const graph = await this.mineLocalNetworkGraph();
                console.log(`[GRAPH-MINER] MEMORY_MATRIX: ${graph.nodeCount} nodes, 0 links (Zero-Simulation Mandate enforced).`);
                return graph;
            }
        } else {
            console.log('[GRAPH-MINER] No Neo4j driver. Memory Grid Mode (nodes only).');
            const graph = await this.mineLocalNetworkGraph();
            console.log(`[GRAPH-MINER] MEMORY_MATRIX: ${graph.nodeCount} nodes, 0 links (Zero-Simulation Mandate enforced).`);
            return graph;
        }
    }
}

export const graphMiner = new EntityGraphMiner();

// ESM-compatible entry point guard
const isMain = typeof process !== 'undefined' &&
    (process.argv[1]?.includes('entity-graph-miner') ?? false);

if (isMain) {
    graphMiner.execute().then(async (result) => {
        console.log(`[GRAPH-MINER] Final status: ${result.status} | Nodes: ${result.nodeCount} | Links: ${result.linkCount}`);
        await prisma.$disconnect();
        process.exit(0);
    });
}
