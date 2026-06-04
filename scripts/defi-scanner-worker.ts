import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet, base, arbitrum } from 'viem/chains';
import { createRedisClient } from '../lib/redis/client';

const redis = createRedisClient({ name: 'DeFi-Scanner' });

// Common Uniswap V2 / V3 ABI for PairCreated / PoolCreated
const V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const V3_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const eventAbiV2 = parseAbiItem('event PairCreated(address indexed token0, address indexed token1, address pair, uint)');
const eventAbiV3 = parseAbiItem('event PoolCreated(address indexed token0, address indexed token1, uint24 fee, int24 tickSpacing, address pool)');

const clients = [
    { name: 'ethereum', client: createPublicClient({ chain: mainnet, transport: http() }) },
    { name: 'base',     client: createPublicClient({ chain: base, transport: http() }) },
    { name: 'arbitrum', client: createPublicClient({ chain: arbitrum, transport: http() }) }
];

async function startScanner() {
    console.log(" [DeFi Scanner Worker] Starting Web3 native pair indexing...");

    for (const { name, client } of clients) {
        // V2 Watcher
        client.watchEvent({
            address: V2_FACTORY,
            event: eventAbiV2,
            onLogs: async logs => {
                for (const log of logs) {
                    const { token0, token1, pair } = log.args;
                    await cacheNewPair(name, 'UniswapV2', token0, token1, pair);
                }
            }
        });

        // V3 Watcher
        client.watchEvent({
            address: V3_FACTORY,
            event: eventAbiV3,
            onLogs: async logs => {
                for (const log of logs) {
                    const { token0, token1, pool } = log.args;
                    await cacheNewPair(name, 'UniswapV3', token0, token1, pool);
                }
            }
        });
        
        console.log(` [DeFi Scanner Worker] Listening on ${name.toUpperCase()} for PairCreated/PoolCreated events.`);
    }
}

async function cacheNewPair(chain, dex, t0, t1, poolAddress) {
    // In a full implementation, we'd do an eth_call to get symbol/name for t0 and t1.
    // For extreme low latency caching, we store raw and decorate on the API layer.
    const pairData = {
        id: poolAddress,
        chain: chain,
        dex: dex,
        baseToken: { symbol: t0.substring(0, 6), name: "Unknown Web3 Token" }, // Fallback logic
        quoteToken: { symbol: 'ETH/USDC' },
        priceUsd: '0.00',
        pairCreatedAt: Date.now(),
        liquidity: { usd: 0 },
        mcap: 0,
        fdv: 0,
        txns: { m5: { buys: 0, sells: 0 } },
        priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
        traders: { makers: 1, snipers: 0 },
        security: { score: 50, honeypotRisk: true, lpBurned: false, mintRevoked: false },
        taxes: { buy: 0, sell: 0 }
    };

    const key = 'latest_defi_pairs';
    try {
        const raw = await redis.get(key);
        let pairs = raw ? JSON.parse(raw) : [];
        pairs.unshift(pairData); // Add to front
        if (pairs.length > 50) pairs = pairs.slice(0, 50); // Keep latest 50
        await redis.set(key, JSON.stringify(pairs), 'EX', 3600);
        console.log(` [Web3] Indexed new ${dex} pair on ${chain}: ${poolAddress}`);
    } catch (e) {
        console.error("Redis sync failed for new pair", e);
    }
}

startScanner().catch(console.error);
