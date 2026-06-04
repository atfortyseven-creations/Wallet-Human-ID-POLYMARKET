import { NextRequest, NextResponse } from 'next/server';
import * as ethers from 'ethers';

import { RpcRelayerManager } from '@/lib/blockchain/rpc-relayer';

export const dynamic = 'force-dynamic';

//  In-memory cache (10s TTL) 
let _cachedMarkets: any[] | null = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 3_000;

//  Uniswap V3 Pool addresses for on-chain price validation 
// Format: symbol  [poolAddress, token0IsBase, token0Decimals, token1Decimals]
const UNISWAP_V3_POOLS: Record<string, [string, boolean, number, number]> = {
    'ETHUSDT':  ['0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', false, 18, 6], // ETH/USDT 0.3%
    'BTCUSDT':  ['0x99ac8ca7087fa4a2a1fb6357269965a2014abc35', true,  8,  6], // WBTC/USDC 0.3%
    'LINKUSDT': ['0xa6cc3c2531fdaa6ae1a3ca84c2855806728693e8', false, 18, 6], // LINK/USDC
};

//  Uniswap V3 slot0 ABI (returns sqrtPriceX96) 
const SLOT0_ABI = ['function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)'];

async function fetchOnChainPrices(): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    for (let attempts = 0; attempts < 3; attempts++) {
        const ep = RpcRelayerManager.getRpcUrl('ETH', 'RPC');
        if (!ep) break;
        try {
            const results = await Promise.allSettled(
                Object.entries(UNISWAP_V3_POOLS).map(async ([symbol, [poolAddr, token0IsBase, d0, d1]]) => {
                    const res = await fetch(ep, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            id: 1,
                            method: "eth_call",
                            params: [{
                                to: poolAddr,
                                data: "0x3850c7bd" // slot0()
                            }, "latest"]
                        }),
                        cache: 'no-store'
                    });
                    
                    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
                    const nodeData = await res.json();
                    if (nodeData.error) throw new Error(nodeData.error.message);
                    if (!nodeData.result) throw new Error("No result in RPC response");
                    
                    // sqrtPriceX96 is the first 32 bytes (64 hex chars + 2 for '0x')
                    const sqrtPriceX96Hex = "0x" + nodeData.result.substring(2, 66);
                    const sqrtPriceX96 = BigInt(sqrtPriceX96Hex);
                    
                    const sqrtPrice = Number(sqrtPriceX96) / (2 ** 96);
                    const rawPrice = sqrtPrice * sqrtPrice * (10 ** d0) / (10 ** d1);
                    const price = token0IsBase ? rawPrice : (rawPrice > 0 ? 1 / rawPrice : 0);
                    prices[symbol] = price;
                })
            );
            // If we got at least one price, the endpoint is healthy
            if (Object.keys(prices).length > 0) break;
            // slot0 returned empty  RPC degraded, CEX fallback covers this

        } catch (e) {
            console.log('[API] RPC provider exception  degrading to CEX data:', (e as Error).message);

            RpcRelayerManager.reportFailure('ETH', 'RPC', ep);
            continue;
        }
    }
    return prices;
}

//  Centralized Exchanges REST (Primary Price Feeds) 
async function fetchCexMarkets(): Promise<any[] | null> {
    // 1. Try KuCoin API (Highly reliable, no US IP geoblocks for Railway/Vercel)
    try {
        const controllerKu = new AbortController();
        const idKu = setTimeout(() => controllerKu.abort(), 6000);
        
        const resKu = await fetch('https://api.kucoin.com/api/v1/market/allTickers', {
            cache: 'no-store',
            signal: controllerKu.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        }).finally(() => clearTimeout(idKu));
        
        if (resKu.ok) {
            const parsedKu = await resKu.json();
            if (parsedKu?.data?.ticker && Array.isArray(parsedKu.data.ticker) && parsedKu.data.ticker.length > 0) {
                return parsedKu.data.ticker.map((t: any) => ({
                    symbol: t.symbol.replace('-', ''),
                    lastPrice: t.last,
                    priceChangePercent: t.changeRate ? (parseFloat(t.changeRate) * 100).toFixed(3) : "0.000",
                    quoteVolume: t.volValue || "0.00"
                }));
            }
        }
    } catch (e) {
        console.log('[API] KuCoin unavailable  falling back to MEXC');

    }

    // 2. Try MEXC API (Globally accessible, no strict geographic blocks)
    try {
        const controllerMexc = new AbortController();
        const idMexc = setTimeout(() => controllerMexc.abort(), 6000);
        
        const res = await fetch('https://api.mexc.com/api/v3/ticker/24hr', {
            cache: 'no-store',
            signal: controllerMexc.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        }).finally(() => clearTimeout(idMexc));
        
        if (res.ok) {
            const raw = await res.json();
            if (Array.isArray(raw) && raw.length > 0) {
                // MEXC returns priceChangePercent as a decimal (e.g. "0.0056" = 0.56%), so we must multiply by 100
                return raw.map((t: any) => ({
                    ...t,
                    priceChangePercent: t.priceChangePercent ? (parseFloat(t.priceChangePercent) * 100).toFixed(3) : "0.000"
                }));
            }
        }
    } catch (e) {
        console.log('[API] MEXC unavailable  falling back to Binance');

    }

    // 2. Fallback to Binance
    try {
        const controllerBin = new AbortController();
        const idBin = setTimeout(() => controllerBin.abort(), 6000); // 6s timeout for Binance
        
        const resBinance = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
            cache: 'no-store',
            signal: controllerBin.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        }).finally(() => clearTimeout(idBin));
        
        if (resBinance.ok) {
            const rawBinance = await resBinance.json();
            if (Array.isArray(rawBinance) && rawBinance.length > 0) return rawBinance;
        }
    } catch (e) {
        console.log('[API] Binance unavailable  trying CoinGecko');

    }
    
    // 4. Final fallback: CoinGecko (free tier, globally accessible, no IP blocks)
    try {
        const cgIds = 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,shiba-inu,polkadot,avalanche-2,chainlink,matic-network,uniswap,arbitrum,optimism,aptos,injective-protocol,pepe,dogwifcoin,bonk,floki,fetch-ai,near,lido-dao,identity-wld,starknet,jupiter,pyth-network,celestia,blur,gmx,sui,sei-network,toncoin';
        const controllerCg = new AbortController();
        const idCg = setTimeout(() => controllerCg.abort(), 8000);
        const resCg = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cgIds}&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h`,
            { cache: 'no-store', signal: controllerCg.signal, headers: { 'Accept': 'application/json' } }
        ).finally(() => clearTimeout(idCg));
        if (resCg.ok) {
            const cgData = await resCg.json();
            if (Array.isArray(cgData) && cgData.length > 0) {
                const CG_SYMBOL_MAP: Record<string, string> = {
                    'bitcoin':'BTCUSDT','ethereum':'ETHUSDT','binancecoin':'BNBUSDT','solana':'SOLUSDT',
                    'ripple':'XRPUSDT','cardano':'ADAUSDT','dogecoin':'DOGEUSDT','shiba-inu':'SHIBUSDT',
                    'polkadot':'DOTUSDT','avalanche-2':'AVAXUSDT','chainlink':'LINKUSDT','matic-network':'MATICUSDT',
                    'uniswap':'UNIUSDT','arbitrum':'ARBUSDT','optimism':'OPUSDT','aptos':'APTUSDT',
                    'injective-protocol':'INJUSDT','pepe':'PEPEUSDT','dogwifcoin':'WIFUSDT','bonk':'BONKUSDT',
                    'floki':'FLOKIUSDT','fetch-ai':'FETUSDT','near':'NEARUSDT','lido-dao':'LDOUSDT',
                    'identity-wld':'AUTHUSDT','starknet':'STRKUSDT','jupiter':'JUPUSDT','pyth-network':'PYTHUSDT',
                    'celestia':'TIAUSDT','blur':'BLURUSDT','gmx':'GMXUSDT','sui':'SUIUSDT',
                    'sei-network':'SEIUSDT','toncoin':'TONUSDT',
                };
                console.log('[API] Using CoinGecko fallback, got', cgData.length, 'assets');
                return cgData.map((c: any) => ({
                    symbol: CG_SYMBOL_MAP[c.id] || (c.symbol.toUpperCase() + 'USDT'),
                    lastPrice: c.current_price?.toString() || '0',
                    priceChangePercent: c.price_change_percentage_24h?.toFixed(3) || '0.000',
                    quoteVolume: c.total_volume?.toString() || '0',
                    source: 'coingecko',
                }));
            }
        }
    } catch (e) {
        console.log('[API] CoinGecko unavailable  returning null (all sources exhausted)');

    }

    return null;
}

const PRIORITY_SYMBOLS = new Set([
    'BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT',
    'DOGEUSDT','SHIBUSDT','DOTUSDT','AVAXUSDT','LINKUSDT','MATICUSDT',
    'UNIUSDT','ARBUSDT','OPUSDT','APTUSDT','INJUSDT','PEPEUSDT',
    'WIFUSDT','BONKUSDT','FLOKIUSDT','FETUSDT','NEARUSDT','LDOUSDT',
    'AUTHUSDT','STRKUSDT','JUPUSDT','PYTHUSDT','TIAUSDT','BLURUSDT',
    'GMXUSDT','SUIUSDT','SEIUSDT','TONUSDT',
]);

const ASSET_META: Record<string, { name: string; network: string; mcapRankHint: number }> = {
    BTCUSDT:  { name: 'Bitcoin',         network: 'bitcoin',   mcapRankHint: 1  },
    ETHUSDT:  { name: 'Ethereum',        network: 'ethereum',  mcapRankHint: 2  },
    BNBUSDT:  { name: 'BNB',             network: 'bsc',       mcapRankHint: 3  },
    SOLUSDT:  { name: 'Solana',          network: 'solana',    mcapRankHint: 4  },
    XRPUSDT:  { name: 'XRP',             network: 'xrp',       mcapRankHint: 5  },
    ADAUSDT:  { name: 'Cardano',         network: 'cardano',   mcapRankHint: 6  },
    DOGEUSDT: { name: 'Dogecoin',        network: 'ethereum',  mcapRankHint: 7  },
    SHIBUSDT: { name: 'Shiba Inu',       network: 'ethereum',  mcapRankHint: 8  },
    DOTUSDT:  { name: 'Polkadot',        network: 'polkadot',  mcapRankHint: 9  },
    AVAXUSDT: { name: 'Avalanche',       network: 'avalanche', mcapRankHint: 10 },
    LINKUSDT: { name: 'Chainlink',       network: 'ethereum',  mcapRankHint: 11 },
    MATICUSDT:{ name: 'Polygon',         network: 'polygon',   mcapRankHint: 12 },
    UNIUSDT:  { name: 'Uniswap',         network: 'ethereum',  mcapRankHint: 13 },
    ARBUSDT:  { name: 'Arbitrum',        network: 'arbitrum',  mcapRankHint: 14 },
    OPUSDT:   { name: 'Optimism',        network: 'optimism',  mcapRankHint: 15 },
    APTUSDT:  { name: 'Aptos',           network: 'aptos',     mcapRankHint: 16 },
    INJUSDT:  { name: 'Injective',       network: 'injective', mcapRankHint: 17 },
    PEPEUSDT: { name: 'Pepe',            network: 'ethereum',  mcapRankHint: 18 },
    WIFUSDT:  { name: 'dogwifhat',       network: 'solana',    mcapRankHint: 19 },
    BONKUSDT: { name: 'Bonk',            network: 'solana',    mcapRankHint: 20 },
    FLOKIUSDT:{ name: 'Floki Inu',       network: 'bsc',       mcapRankHint: 21 },
    FETUSDT:  { name: 'Fetch.ai',        network: 'ethereum',  mcapRankHint: 22 },
    NEARUSDT: { name: 'NEAR Protocol',   network: 'near',      mcapRankHint: 23 },
    LDOUSDT:  { name: 'Lido DAO',        network: 'ethereum',  mcapRankHint: 24 },
    AUTHUSDT:  { name: 'Identity',       network: 'ethereum',  mcapRankHint: 25 },
    STRKUSDT: { name: 'StarkNet',        network: 'starknet',  mcapRankHint: 26 },
    JUPUSDT:  { name: 'Jupiter',         network: 'solana',    mcapRankHint: 27 },
    PYTHUSDT: { name: 'Pyth Network',    network: 'solana',    mcapRankHint: 28 },
    TIAUSDT:  { name: 'Celestia',        network: 'celestia',  mcapRankHint: 29 },
    BLURUSDT: { name: 'Blur',            network: 'ethereum',  mcapRankHint: 30 },
    GMXUSDT:  { name: 'GMX',             network: 'arbitrum',  mcapRankHint: 31 },
    SUIUSDT:  { name: 'Sui',             network: 'sui',       mcapRankHint: 32 },
    SEIUSDT:  { name: 'Sei',             network: 'sei',       mcapRankHint: 33 },
    TONUSDT:  { name: 'Toncoin',         network: 'ton',       mcapRankHint: 34 },
};

// ... synthetic fallback purged ...

export async function GET(_req: NextRequest) {
    //  Cache hit 
    if (_cachedMarkets && Date.now() - _cacheTs < CACHE_TTL_MS) {
        return NextResponse.json(
            { success: true, timestamp: _cacheTs, data: _cachedMarkets, source: 'cache' },
            { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
        );
    }

    //  Step 1: Fetch CEX Data (Primary) 
    let marketData = await fetchCexMarkets();
    if (marketData && marketData.length === 0) {
        marketData = null; // Treat empty array as failure
    }
    let source = marketData ? 'live-exchange' : 'degraded-exchange';

    //  Step 2: Fallback or Enrich with GetBlock on-chain prices 
    const onChainPrices = await fetchOnChainPrices();

    if (marketData) {
        // ENRICH EXISTING DATA
        if (Object.keys(onChainPrices).length > 0) {
            marketData = marketData.map((t: any) => {
                const onChain = onChainPrices[t.symbol];
                if (onChain && onChain > 0) {
                    const binancePrice = parseFloat(t.lastPrice);
                    const deviation = Math.abs(onChain - binancePrice) / binancePrice;
                    return {
                        ...t,
                        onChainPrice: onChain.toFixed(2),
                        onChainValidated: deviation < 0.05,
                        getblockVerified: true,
                    };
                }
                return t;
            });
            source = 'live-exchange+getblock';
        }
    } else {
        // TRUE ON-CHAIN FALLBACK (Zero-Mock strictness)
        if (Object.keys(onChainPrices).length > 0) {
            marketData = [];
            for (const [symbol, price] of Object.entries(onChainPrices)) {
                marketData.push({
                    symbol,
                    lastPrice: price.toFixed(6),
                    priceChangePercent: "0.00",
                    quoteVolume: "0.00",
                    source: 'getblock-onchain',
                    getblockVerified: true,
                    onChainPrice: price.toFixed(6),
                    onChainValidated: true,
                });
            }
            source = 'getblock-onchain';
            
            // Add other priority symbols with 0 data to prevent UI breakage
            for (const pSym of Array.from(PRIORITY_SYMBOLS)) {
                 if (!marketData.find(m => m.symbol === pSym)) {
                     marketData.push({
                         symbol: pSym,
                         lastPrice: "0.00",
                         priceChangePercent: "0.00",
                         quoteVolume: "0.00",
                         source: 'getblock-degraded'
                     });
                 }
            }
        }
    }

    //  Step 3: If ALL sources failed, enforce fail-fast 503 error 
    if (!marketData) {
        return NextResponse.json({ error: 'Data sources unreachable' }, { status: 503 });
    }

    //  Filter to priority USDT pairs + sort by volume for top display 
    const filtered = (marketData as any[]).filter(t => PRIORITY_SYMBOLS.has(t.symbol));
    const finalData = (filtered.length > 0 ? filtered : marketData).map((t: any) => ({
        ...t,
        meta: ASSET_META[t.symbol] || { name: t.symbol, network: 'ethereum', mcapRankHint: 999 }
    }));

    _cachedMarkets = finalData;
    _cacheTs = Date.now();

    return NextResponse.json(
        { success: true, timestamp: _cacheTs, data: finalData, source },
        { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
}
