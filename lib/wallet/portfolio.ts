import { discoverTokens, type Token } from './tokens';
import { getSupportedChainIds } from './chains';
import { PerpPosition, PredictionPosition, ClaimableAsset } from '@/types/wallet';
import { discoverPolymarketPositions } from './protocols/polymarket';
import { discoverGmxPositions } from './protocols/gmx';
import { discoverClaimables } from './protocols/claims';

export interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  priceUSD: number;
  valueUSD: number;
  chainId: number;
  tokenAddress?: string;
  percentage: number; // Percentage of total portfolio
  change24h?: number; // Price change in last 24h
}

export interface PortfolioSummary {
  totalValueUSD: number;
  change24hUSD: number;
  change24hPercent: number;
  assets: PortfolioAsset[];
  perps: PerpPosition[];
  predictions: PredictionPosition[];
  claimables: ClaimableAsset[];
  chainBreakdown: Record<number, number>; // chainId -> value USD
}

export interface PortfolioHistory {
  timestamp: number;
  totalValueUSD: number;
}

/**
 * Get complete portfolio for a wallet
 */
export async function getPortfolio(
  walletAddress: string,
  chainIds?: number[]
): Promise<PortfolioSummary> {
  // Use a targeted set of chains to avoid massive RPC overhead in one go
  const chains = chainIds || [1, 137, 8453, 42161]; // Mainnet, Polygon, Base, Arbitrum
  
  // 1. Fetch tokens from all chains
  const allTokensPromises = chains.map(chainId =>
    discoverTokens(walletAddress, chainId).catch(e => {
        console.warn(`[Portfolio] Token discovery failed for chain ${chainId}:`, e);
        return [];
    })
  );
  
  const allTokensArrays = await Promise.all(allTokensPromises);
  const allTokens = allTokensArrays.flat();

  // 2. Fetch DeFi Positions (Real Protocol Discovery)
  // Run discovery in parallel for performance
  const [perps, predictions, claimables] = await Promise.all([
    discoverGmxPositions(walletAddress, chains).catch(() => []),
    discoverPolymarketPositions(walletAddress).catch(() => []),
    discoverClaimables(walletAddress, chains).catch(() => [])
  ]);

  // 3. Calculate total value across all categories
  const tokenValue = allTokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0);
  const perpValue = perps.reduce((sum, p) => sum + (p.pnl || 0) + (p.collateral || 0), 0);
  const predictionValue = predictions.reduce((sum, p) => sum + (p.value || 0), 0);
  const claimableValue = claimables.reduce((sum, c) => sum + (c.valueUSD || 0), 0);

  const totalValueUSD = tokenValue + perpValue + predictionValue + claimableValue;

  // 4. Create assets with percentages
  const assets: PortfolioAsset[] = allTokens.map(token => ({
    symbol: token.symbol,
    name: token.name,
    balance: token.balance || '0',
    balanceFormatted: token.balanceFormatted || '0',
    priceUSD: token.priceUSD || 0,
    valueUSD: token.valueUSD || 0,
    chainId: token.chainId,
    tokenAddress: token.address,
    percentage: totalValueUSD > 0 ? ((token.valueUSD || 0) / totalValueUSD) * 100 : 0,
    change24h: (token as any).change24h || 0,
  }));

  // Sort by value (highest first)
  assets.sort((a, b) => b.valueUSD - a.valueUSD);

  // 5. Calculate chain breakdown
  const chainBreakdown: Record<number, number> = {};
  assets.forEach(asset => {
    chainBreakdown[asset.chainId] = (chainBreakdown[asset.chainId] || 0) + asset.valueUSD;
  });
  
  // Add DeFi breakdown
  perps.forEach(p => {
    chainBreakdown[p.chainId] = (chainBreakdown[p.chainId] || 0) + (p.pnl + p.collateral);
  });
  predictions.forEach(p => {
    chainBreakdown[p.chainId] = (chainBreakdown[p.chainId] || 0) + (p.value || 0);
  });

  // Calculate 24h change (weighted average of tokens)
  const change24hUSD = assets.reduce((sum, a) => sum + (a.valueUSD * (a.change24h || 0) / 100), 0);
  const change24hPercent = totalValueUSD > 0 ? (change24hUSD / totalValueUSD) * 100 : 0;

  return {
    totalValueUSD,
    change24hUSD,
    change24hPercent,
    assets,
    perps,
    predictions,
    claimables,
    chainBreakdown,
  };
}

/**
 * Get portfolio history (for charts)
 */
export async function getPortfolioHistory(
  walletAddress: string,
  period: '24h' | '7d' | '30d' | '1y' = '7d'
): Promise<PortfolioHistory[]> {
  try {
    const portfolio = await getPortfolio(walletAddress);
    const baseValue = portfolio.totalValueUSD;
    
    if (baseValue === 0) {
      return Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() - (24 - i) * 3600000,
        totalValueUSD: 0
      }));
    }

    // To get a real history, we fetch history for the top assets (weighted)
    // and apply their performance to the total portfolio value.
    const topAssets = portfolio.assets.slice(0, 5);
    const weightSum = topAssets.reduce((sum, a) => sum + a.valueUSD, 0);
    
    if (weightSum === 0) {
      return generateLinearHistory(baseValue, portfolio.change24hPercent, period);
    }

    // CoinGecko days parameter
    const daysMap = { '24h': '1', '7d': '7', '30d': '30', '1y': '365' };
    const days = daysMap[period];

    const historyPromises = topAssets.map(async (asset) => {
      try {
        if (!asset.tokenAddress) return null;
        
        const platformMap: Record<number, string> = { 1: 'ethereum', 137: 'polygon-pos', 8453: 'base' };
        const platform = platformMap[asset.chainId] || 'ethereum';

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${platform}/contract/${asset.tokenAddress}/market_chart/?vs_currency=usd&days=${days}`,
          { headers: { 'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_KEY || '' } }
        );
        const data = await res.json();
        return { asset, prices: data.prices || [] };
      } catch (e) {
        return null;
      }
    });

    const allHistory = (await Promise.all(historyPromises)).filter(h => h !== null && h.prices.length > 0);

    if (allHistory.length === 0) {
      return generateLinearHistory(baseValue, portfolio.change24hPercent, period);
    }

    // Align timestamps and aggregate
    const baseline = allHistory[0]!.prices;
    const history: PortfolioHistory[] = baseline.map(([ts]: [number, number], i: number) => {
      let weightedChange = 0;
      let totalWeight = 0;

      allHistory.forEach(item => {
        if (!item) return;
        const priceAt = item.prices[i] ? item.prices[i][1] : item.prices[item.prices.length - 1][1];
        const currentPrice = item.asset.priceUSD;
        const weight = item.asset.valueUSD / weightSum;
        const change = currentPrice > 0 ? priceAt / currentPrice : 1;
        weightedChange += change * weight;
        totalWeight += weight;
      });

      const normalizedChange = totalWeight > 0 ? weightedChange / totalWeight : 1;
      return {
        timestamp: ts,
        totalValueUSD: baseValue * normalizedChange
      };
    });

    return history;
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    const portfolio = await getPortfolio(walletAddress);
    return generateLinearHistory(portfolio.totalValueUSD, portfolio.change24hPercent, period);
  }
}

function generateLinearHistory(baseValue: number, change24hPercent: number, period: string): PortfolioHistory[] {
  const now = Date.now();
  const intervals: Record<string, { count: number; interval: number }> = {
    '24h': { count: 24, interval: 60 * 60 * 1000 },
    '7d': { count: 7 * 24, interval: 60 * 60 * 1000 },
    '30d': { count: 30, interval: 24 * 60 * 60 * 1000 },
    '1y': { count: 52, interval: 7 * 24 * 60 * 60 * 1000 },
  };
  const { count, interval } = intervals[period] || intervals['7d'];
  const startValue = baseValue / (1 + (change24hPercent / 100));
  
  return Array.from({ length: count }, (_, i) => {
    const progress = i / (count - 1);
    return {
      timestamp: now - ((count - 1 - i) * interval),
      totalValueUSD: startValue + (baseValue - startValue) * progress
    };
  });
}

/**
 * Get top assets by value
 */
export async function getTopAssets(
  walletAddress: string,
  limit: number = 10
): Promise<PortfolioAsset[]> {
  const portfolio = await getPortfolio(walletAddress);
  return portfolio.assets.slice(0, limit);
}

/**
 * Get portfolio performance metrics
 */
export interface PortfolioMetrics {
  totalValue: number;
  change24h: number;
  change7d: number;
  change30d: number;
  allTimeHigh: number;
  allTimeLow: number;
  averageDailyChange: number;
}

export async function getPortfolioMetrics(
  walletAddress: string
): Promise<PortfolioMetrics> {
  const current = await getPortfolio(walletAddress);
  const history7d = await getPortfolioHistory(walletAddress, '7d');
  const history30d = await getPortfolioHistory(walletAddress, '30d');

  const values7d = history7d.map(h => h.totalValueUSD);
  const values30d = history30d.map(h => h.totalValueUSD);

  const value7dAgo = values7d[0] || current.totalValueUSD;
  const value30dAgo = values30d[0] || current.totalValueUSD;

  return {
    totalValue: current.totalValueUSD,
    change24h: current.change24hPercent,
    change7d: value7dAgo > 0 ? ((current.totalValueUSD - value7dAgo) / value7dAgo) * 100 : 0,
    change30d: value30dAgo > 0 ? ((current.totalValueUSD - value30dAgo) / value30dAgo) * 100 : 0,
    allTimeHigh: Math.max(...values30d, current.totalValueUSD),
    allTimeLow: Math.min(...values30d, current.totalValueUSD),
    averageDailyChange: values30d.length > 1 ? values30d.reduce((sum, val, i) => {
      if (i === 0) return 0;
      const prev = values30d[i - 1];
      const change = prev > 0 ? ((val - prev) / prev) * 100 : 0;
      return sum + change;
    }, 0) / (values30d.length - 1) : 0,
  };
}

/**
 * Export portfolio to CSV
 */
export function exportPortfolioToCSV(portfolio: PortfolioSummary): string {
  const headers = ['Asset', 'Chain', 'Balance', 'Price (USD)', 'Value (USD)', 'Portfolio %', '24h Change %'];
  
  const rows = portfolio.assets.map(asset => [
    asset.symbol,
    asset.chainId.toString(),
    asset.balanceFormatted,
    asset.priceUSD.toFixed(2),
    asset.valueUSD.toFixed(2),
    asset.percentage.toFixed(2),
    (asset.change24h || 0).toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    `Total Value,,,,,${portfolio.totalValueUSD.toFixed(2)}`,
    `24h Change,,,,,${portfolio.change24hUSD.toFixed(2)} (${portfolio.change24hPercent.toFixed(2)}%)`,
  ].join('\n');

  return csvContent;
}
