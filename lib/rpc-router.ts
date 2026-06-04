import { z } from 'zod';
import { redisClient } from './redis/client';
import { getGbAllRpc } from '@/lib/blockchain/getblock-registry';

//  Tipos 

type SupportedChain = 'SOLANA' | 'ETHEREUM' | 'BSC' | 'POLYGON' | 'BASE' | 'ARB' | 'OP';

interface RPCEndpoint {
    url: string;
    chain: SupportedChain;
    latencyMs: number;
    health: 'HEALTHY' | 'DEGRADED' | 'DEAD';
    errorCount: number;
}

//  Validación 

const RpcSchema = z.string().url();

function safeParseRPC(envValue: string | undefined, fallback: string): string {
    const res = RpcSchema.safeParse(envValue);
    return res.success ? res.data : fallback;
}

//  Pool  GetBlock primary + public fallbacks 
/**
 * Para ETH y chains cubiertas por el registry:
 *   - Prioridad 1: endpoints activos del GetBlock Registry
 *   - Prioridad 2: fallbacks públicos
 *
 * Para SOL: no hay registry EVM, usamos directamente las GB vars + públicos.
 */
const RPC_POOL: Record<string, RPCEndpoint[]> = {
    SOLANA: [
        { url: safeParseRPC(process.env.GB_SOL_RPC_1, 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: safeParseRPC(process.env.GB_SOL_RPC_2 ?? process.env.SOLANA_RPC_2, 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: safeParseRPC(process.env.GB_SOL_RPC_3 ?? '', 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: safeParseRPC(process.env.GB_SOL_RPC_B1 ?? '', 'https://api.mainnet-beta.solana.com'), chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://api.mainnet-beta.solana.com', chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://ssc-dao.genesysgo.net',       chain: 'SOLANA' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ].filter((ep, idx, arr) => arr.findIndex(e => e.url === ep.url) === idx && ep.url.startsWith('http')), // deduplica + limpia URLs vacías

    ETHEREUM: [
        // GetBlock Archive slots 1 + 2 desde el registry
        ...getGbAllRpc('eth').map(url => ({
            url, chain: 'ETHEREUM' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        // Públicos de emergencia
        { url: 'https://cloudflare-eth.com', chain: 'ETHEREUM' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://ethereum-rpc.publicnode.com', chain: 'ETHEREUM' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://eth.llamarpc.com',   chain: 'ETHEREUM' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],

    BSC: [
        //  Todos los slots activos de GetBlock (primarios + backup) via registry
        ...getGbAllRpc('bsc').map(url => ({
            url, chain: 'BSC' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        // Fallbacks públicos de emergencia
        { url: 'https://bsc-dataseed1.binance.org', chain: 'BSC' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://bsc-dataseed2.binance.org', chain: 'BSC' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://bsc.publicnode.com',          chain: 'BSC' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],

    POLYGON: [
        //  Todos los slots activos de GetBlock (primarios + backup) via registry
        ...getGbAllRpc('polygon').map(url => ({
            url, chain: 'POLYGON' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        // Fallbacks públicos de emergencia
        { url: 'https://polygon-rpc.com',           chain: 'POLYGON' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://polygon.publicnode.com',      chain: 'POLYGON' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://polygon.llamarpc.com',       chain: 'POLYGON' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],

    BASE: [
        //  Todos los slots activos de GetBlock (primarios + backup) via registry
        ...getGbAllRpc('base').map(url => ({
            url, chain: 'BASE' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        // Fallbacks públicos de emergencia
        { url: 'https://mainnet.base.org',          chain: 'BASE' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://base.publicnode.com',         chain: 'BASE' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://base.llamarpc.com',          chain: 'BASE' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],

    ARB: [
        ...getGbAllRpc('arb').map(url => ({
            url, chain: 'ARB' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        { url: 'https://arb1.arbitrum.io/rpc',      chain: 'ARB' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://arbitrum.publicnode.com',     chain: 'ARB' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],

    OP: [
        //  Slot GetBlock Optimism (cuenta única)
        ...getGbAllRpc('op').map(url => ({
            url, chain: 'OP' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0,
        })),
        { url: 'https://mainnet.optimism.io',        chain: 'OP' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
        { url: 'https://optimism.publicnode.com',      chain: 'OP' as SupportedChain, latencyMs: 0, health: 'HEALTHY' as const, errorCount: 0 },
    ],
};

const REDIS_HEALTH_KEY = 'rpc:cluster:health:grid';

export class GlobalRPCRouter {
    /**
     * Sincroniza estado local con el Redis Health Grid global.
     */
    private static async syncHealth(chain: SupportedChain) {
        try {
            if (!redisClient || (redisClient as any).__isMock) return;
            const globalHealth = await redisClient.hgetall(`${REDIS_HEALTH_KEY}:${chain}`);
            if (!globalHealth) return;

            const pool = RPC_POOL[chain];
            pool.forEach(node => {
                const state = globalHealth[node.url];
                if (state) {
                    const parsed = JSON.parse(state);
                    node.health = parsed.health;
                    node.errorCount = parsed.errorCount;
                }
            });
        } catch {
            // fail-open: usa estado local si Redis está caído
        }
    }

    /**
     * Devuelve el mejor RPC saludable para la chain dada.
     * Ordena por latencia si hay múltiples sanos.
     */
    static getBestRPC(chain: SupportedChain): string {
        // Trigger async sync (fire-and-forget)
        this.syncHealth(chain).catch(() => {});

        const pool = RPC_POOL[chain];
        if (!pool || pool.length === 0) {
            console.warn(`[GlobalRPCRouter] No pool for ${chain}`);
            return '';
        }

        const healthyNodes = pool.filter(n => n.health === 'HEALTHY');

        if (healthyNodes.length === 0) {
            // Emergencia: todos degradados  devolver el primero
            return pool[0].url;
        }

        // Prioridad: menor latencia (0 = sin datos = va al final)
        healthyNodes.sort((a, b) => {
            if (a.latencyMs === 0 && b.latencyMs === 0) return 0;
            if (a.latencyMs === 0) return 1;
            if (b.latencyMs === 0) return -1;
            return a.latencyMs - b.latencyMs;
        });

        return healthyNodes[0].url;
    }

    /**
     * Reporta un fallo, incrementando errorCount y propagando al cluster Redis.
     */
    static async reportFailure(url: string, chain: SupportedChain): Promise<void> {
        const pool = RPC_POOL[chain];
        if (!pool) return;

        const node = pool.find(n => n.url === url);
        if (node) {
            node.errorCount += 1;
            if (node.errorCount > 3)  node.health = 'DEGRADED';
            if (node.errorCount > 10) node.health = 'DEAD';

            console.warn(`[GlobalRPCRouter] Endpoint ${url.slice(0, 48)}  ${node.health} (errors: ${node.errorCount})`);

            // Persistir al cluster Redis
            try {
                if (redisClient && !(redisClient as any).__isMock) {
                    await redisClient.hset(
                        `${REDIS_HEALTH_KEY}:${chain}`,
                        url,
                        JSON.stringify({ health: node.health, errorCount: node.errorCount })
                    );
                    await redisClient.expire(`${REDIS_HEALTH_KEY}:${chain}`, 3600);
                }
            } catch { /* fail-open */ }
        }
    }

    /** Lista completa del pool para debugging */
    static getPoolStatus(): Record<string, { url: string; health: string; errors: number; latencyMs: number }[]> {
        return Object.fromEntries(
            Object.entries(RPC_POOL).map(([chain, pool]) => [
                chain,
                pool.map(n => ({
                    url: n.url.replace(/\/([a-f0-9]{20,})/, '/****'),
                    health: n.health,
                    errors: n.errorCount,
                    latencyMs: n.latencyMs,
                })),
            ])
        );
    }
}
