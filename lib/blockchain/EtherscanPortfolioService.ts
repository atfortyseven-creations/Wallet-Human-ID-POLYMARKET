/**
 * ETHERSCAN-FIRST PORTFOLIO SERVICE
 * Uses Etherscan API as primary source for Ethereum Mainnet
 * No Alchemy dependency required
 */

import { ChainId } from './BlockchainService';
import { getEtherscanPortfolio } from '../etherscan-api';
import { getBulkPricesWithChange } from '../priceHelper';
import { getSectorForSymbol } from '../wallet/tokens';
import { ethers } from 'ethers';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export class EtherscanPortfolioService {
  private portfolioCache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute

  /**
   * Get full portfolio using ONLY Etherscan API
   */
  async getMainnetPortfolio(address: string) {
    const cacheKey = `eth_${address.toLowerCase()}`;
    const cached = this.portfolioCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      console.log(`[EtherscanPortfolio]  Cache hit for ${address}`);
      return cached.data;
    }

    console.log(`[EtherscanPortfolio]  Fetching from Etherscan: ${address}`);
    
    const portfolio = await getEtherscanPortfolio(address);
    
    if (!portfolio || (portfolio.totalTokens === 0 && parseFloat(portfolio.ethBalance) === 0)) {
      console.warn('[EtherscanPortfolio] Empty portfolio returned');
      return {
        chainId: ChainId.MAINNET,
        address,
        nativeBalance: '0',
        nativeValueUsd: 0,
        totalValueUsd: 0,
        tokens: [{
          address: 'native',
          balance: '0',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          logo: null,
          chainId: ChainId.MAINNET,
          price: 0,
          change24h: 0,
          valueUsd: 0,
          balanceNumeric: 0,
          balanceFormatted: '0.0000',
          sector: 'Layer 1',
        }],
        nfts: [],
      };
    }

    // Get prices for all tokens
    const tokenSymbols = portfolio.tokens.map(t => t.tokenSymbol);
    const prices = await getBulkPricesWithChange([...tokenSymbols, 'ETH']);
    
    const enrichedTokens = portfolio.tokens.map(t => {
      const decimals = parseInt(t.tokenDecimal) || 18;
      const balanceNumeric = parseFloat(ethers.formatUnits(BigInt(t.balance), decimals));
      const price = prices[t.tokenSymbol]?.price || 0;
      const valueUsd = balanceNumeric * price;
      
      return {
        address: t.contractAddress,
        balance: t.balance,
        name: t.tokenName,
        symbol: t.tokenSymbol,
        decimals,
        logo: null,
        chainId: ChainId.MAINNET,
        price,
        change24h: 0,
        valueUsd,
        balanceNumeric,
        balanceFormatted: safeToLocaleString(balanceNumeric, { maximumFractionDigits: 4 }),
        sector: getSectorForSymbol(t.tokenSymbol),
      };
    }).filter(t => {
      // Spam shield: Massive balance + 0 value
      if (t.balanceNumeric > 1000000 && t.valueUsd === 0) return false;
      
      // Fake native token shield: token named ETH with 0 value
      const isFakeNative = (t.symbol === 'ETH' || t.symbol === 'WETH') && t.valueUsd === 0;
      if (isFakeNative) return false;

      return t.balanceNumeric > 0.000001;
    }); // Show real balances even without USD price

    // Add native ETH
    const ethBalance = parseFloat(portfolio.ethBalance);
    const ethPrice = prices['ETH']?.price || 2500;
    const ethValueUsd = ethBalance * ethPrice;
    
    if (ethBalance >= 0) {
      enrichedTokens.unshift({
        address: 'native',
        balance: BigInt(Math.floor(ethBalance * 1e18)).toString(),
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        logo: null,
        chainId: ChainId.MAINNET,
        price: ethPrice,
        change24h: 0,
        valueUsd: ethValueUsd,
        balanceNumeric: ethBalance,
        balanceFormatted: safeToLocaleString(ethBalance, { maximumFractionDigits: 6 }) || '0.0000',
        sector: 'Layer 1',
      });
    }

    const totalValueUsd = enrichedTokens.reduce((acc, t) => acc + t.valueUsd, 0);

    const result = {
      chainId: ChainId.MAINNET,
      address,
      nativeBalance: (ethBalance * 1e18).toString(),
      nativeValueUsd: ethValueUsd,
      totalValueUsd,
      tokens: enrichedTokens.sort((a, b) => b.valueUsd - a.valueUsd),
      nfts: portfolio.nfts || [], // Include NFTs
    };

    // Cache the result
    this.portfolioCache.set(cacheKey, { data: result, timestamp: Date.now() });

    console.log(`[EtherscanPortfolio]  ${address}: ${enrichedTokens.length} tokens, ${portfolio.nfts?.length || 0} NFTs, $${safeToFixed(totalValueUsd, 2)}`);

    return result;
  }
}

export const etherscanPortfolioService = new EtherscanPortfolioService();

