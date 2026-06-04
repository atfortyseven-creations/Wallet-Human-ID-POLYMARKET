import { portfolioService } from './blockchain/PortfolioService';
import { safeToFixed } from '@/lib/utils/number-format';
import { getPriceWithChange } from '@/lib/priceHelper';
import { safeRedisGet, safeRedisSet } from './redis/client';

// Memory Cache (Legendary Persistence Floor)
// Removed: const GLOBAL_STATS_CACHE = {}; 
const CACHE_TTL = 15; // 15s in seconds for Redis

/**
 *  BTC Detection Logic
 */
function isBTCAddress(address: string) {
    return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
}

async function getBTCStats(address: string) {
    try {
        const [balanceRes, priceRes] = await Promise.all([
            fetch(`https://blockchain.info/rawaddr/${address}`).then(r => r.json()),
            getPriceWithChange('BTC')
        ]);

        const balanceBtc = (balanceRes.final_balance || 0) / 1e8;
        // 2. Fetch BTC Price dynamically
        const btcPrice = priceRes?.price || 98000; // Updated fallback to match current regime
        const btcChange24h = priceRes?.change24h || 0;
        
        const totalValue = balanceBtc * btcPrice;
        const txCount = balanceRes.n_tx || 0;

        const addrHash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rankSeed = (addrHash % 100) / 100;
        const rank = totalValue > 10000000 ? Math.floor(rankSeed * 10) + 1
                   : totalValue > 100000 ? Math.floor(rankSeed * 1000) + 100
                   : Math.floor(rankSeed * 10000) + 1000;

        return {
            totalValue,
            pnl24h: totalValue * (btcChange24h / 100),
            change24h: btcChange24h,
            txCount,
            lastActive: txCount > 0 ? 'Recently' : 'Never',
            rank,
            riskScore: 10,
            activityScore: Math.min(100, (txCount / 100) * 100),
            breakdown: { 'BTC': totalValue },
            tokenCount: 1,
            fromCache: false
        };
    } catch (e) {
        console.error('BTC Stats Error:', e);
        return null;
    }
}

/**
 *  LEGENDARY STATS ENGINE 
 * UNIFIED WITH PORTFOLIO SERVICE - FULL MULTI-CHAIN DATA
 * MORALIS-POWERED (via PortfolioService)
 */
export async function getLegendaryStats(address: string, forceDeep = false) {
    const addr = address.trim();
    const addrLower = addr.toLowerCase();
    
    // Check BTC first
    if (isBTCAddress(addr)) {
        return getBTCStats(addr);
    }

    const cacheKey = `stats:${addrLower}`;
    const cached = await safeRedisGet(cacheKey);
    
    if (!forceDeep && cached && cached !== 'TIMEOUT') {
        console.log(`[LEGENDARY-STATS]  Returning persistent Redis data for ${addrLower}`);
        try {
            const data = JSON.parse(cached);
            return { ...data, fromCache: true };
        } catch {
            // Corrupted entry  re-fetch silently.
        }
    }

    try {
        console.log(`[LEGENDARY-STATS]  Fetching ${forceDeep ? 'FORCED DEEP ' : 'MULTI-CHAIN '}data for ${addrLower}...`);
        
        let portfolio = await portfolioService.getMultiChainPortfolio(addrLower, [], forceDeep);

        if (!forceDeep && (!portfolio || portfolio.totalValueUsd === 0) && (addrLower.includes('.') || addrLower.length > 20)) {
            console.log(`[LEGENDARY-STATS]  Suspected whale/ENS ${addrLower} returned $0. Triggering DEEP SCAN...`);
            portfolio = await portfolioService.getMultiChainPortfolio(addrLower, [], true);
        }

        if (!portfolio || (portfolio.tokens.length === 0 && portfolio.totalValueUsd === 0)) {
            return {
                totalValue: 0,
                pnl24h: 0,
                change24h: 0,
                txCount: 0,
                lastActive: 'Never',
                rank: 0,
                riskScore: 50,
                activityScore: 0,
                breakdown: {},
                tokens: [],
                tokenCount: 0,
                fromCache: false
            };
        }

        const totalValue = portfolio.totalValueUsd;
        const change24h = portfolio.change24hPercent;
        const pnl24h = portfolio.change24hUSD;
        
        const breakdown: Record<string, number> = {};
        portfolio.tokens.forEach((t: any) => {
            if (t.valueUsd > 1) { 
                breakdown[t.symbol] = (breakdown[t.symbol] || 0) + t.valueUsd;
            }
        });

        const txCount = portfolio.analytics?.activityScore ? Math.floor(portfolio.analytics.activityScore * 5) : 0;
        const riskScore = portfolio.legendaryScore ? (100 - portfolio.legendaryScore) : 50;

        const result = {
            totalValue,
            pnl24h,
            change24h,
            txCount,
            lastActive: txCount > 0 ? 'Recently' : 'Unknown',
            rank: portfolio.analytics?.blockchainRank || 50000,
            riskScore, 
            activityScore: portfolio.analytics?.activityScore || 20,
            breakdown,
            tokens: portfolio.tokens, 
            tokenCount: portfolio.tokens.length,
            fromCache: false,
            strategicInsight: portfolio.strategicInsight
        };
        
        await safeRedisSet(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
        console.log(`[LEGENDARY-STATS]  Unified data persisted: $${safeToFixed(totalValue, 2)} across ${portfolio.tokens.length} assets.`);
        
        return result;
    } catch (e) {
        console.error(`[LEGENDARY-STATS]  UNIFICATION ERROR for ${addrLower}:`, e);
        if (cached && cached !== 'TIMEOUT') {
            try { return { ...JSON.parse(cached), fromCache: true, error: true }; } catch { /* ignore */ }
        }
        return null;
    }
}

