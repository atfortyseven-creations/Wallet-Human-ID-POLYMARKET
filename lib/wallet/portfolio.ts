/**
 * Portfolio Service
 * Track wallet value across chains and tokens
 */

import { discoverTokens, type Token } from './tokens';
import { getSupportedChainIds } from './chains';

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
  const chains = chainIds || getSupportedChainIds();
  
  // Fetch tokens from all chains
  const allTokensPromises = chains.map(chainId =>
    discoverTokens(walletAddress, chainId)
  );
  
  const allTokensArrays = await Promise.all(allTokensPromises);
  const allTokens = allTokensArrays.flat();

  // Calculate total value
  const totalValueUSD = allTokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0);

  // Create assets with percentages
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
    change24h: Math.random() * 20 - 10, // Mock - would fetch from price API
  }));

  // Sort by value (highest first)
  assets.sort((a, b) => b.valueUSD - a.valueUSD);

  // Calculate chain breakdown
  const chainBreakdown: Record<number, number> = {};
  assets.forEach(asset => {
    chainBreakdown[asset.chainId] = (chainBreakdown[asset.chainId] || 0) + asset.valueUSD;
  });

  // Calculate 24h change (mock for now)
  const change24hPercent = Math.random() * 10 - 5;
  const change24hUSD = (totalValueUSD * change24hPercent) / 100;

  return {
    totalValueUSD,
    change24hUSD,
    change24hPercent,
    assets,
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
  // In production, this would fetch historical balance snapshots
  // For now, generate mock data
  
  const now = Date.now();
  const intervals: Record<string, { count: number; interval: number }> = {
    '24h': { count: 24, interval: 60 * 60 * 1000 }, // hourly
    '7d': { count: 7 * 24, interval: 60 * 60 * 1000 }, // hourly
    '30d': { count: 30, interval: 24 * 60 * 60 * 1000 }, // daily
    '1y': { count: 52, interval: 7 * 24 * 60 * 60 * 1000 }, // weekly
  };

  const { count, interval } = intervals[period];
  
  // Get current portfolio value
  const currentPortfolio = await getPortfolio(walletAddress);
  const baseValue = currentPortfolio.totalValueUSD;

  // Generate historical data with some variance
  const history: PortfolioHistory[] = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const value = baseValue * (1 + variance);
    
    history.push({
      timestamp,
      totalValueUSD: value,
    });
  }

  return history;
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

  // Calculate metrics
  const values7d = history7d.map(h => h.totalValueUSD);
  const values30d = history30d.map(h => h.totalValueUSD);

  const value7dAgo = values7d[0] || current.totalValueUSD;
  const value30dAgo = values30d[0] || current.totalValueUSD;

  return {
    totalValue: current.totalValueUSD,
    change24h: current.change24hPercent,
    change7d: ((current.totalValueUSD - value7dAgo) / value7dAgo) * 100,
    change30d: ((current.totalValueUSD - value30dAgo) / value30dAgo) * 100,
    allTimeHigh: Math.max(...values30d, current.totalValueUSD),
    allTimeLow: Math.min(...values30d, current.totalValueUSD),
    averageDailyChange: values30d.reduce((sum, val, i) => {
      if (i === 0) return 0;
      const change = ((val - values30d[i - 1]) / values30d[i - 1]) * 100;
      return sum + change;
    }, 0) / (values30d.length - 1),
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
