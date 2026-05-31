import { safeRedisGet, safeRedisSet } from '../redis/client';
import { safeJsonParse } from '../utils/json';
import { PriceService } from './PriceService';

export const MORALIS_CHAINS = {
  1: 'eth',
  137: 'polygon',
  56: 'bsc',
  43114: 'avalanche',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
} as const;

export type MoralisChain = typeof MORALIS_CHAINS[keyof typeof MORALIS_CHAINS];

const MORALIS_KEYS = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImZkYTA0Y2UyLTc1N2ItNDAyMy1iNTVjLWU3NDU2NmJhNWQ5MyIsIm9yZ0lkIjoiNTE4MjgwIiwidXNlcklkIjoiNTMzMzYyIiwidHlwZUlkIjoiZjBiZmRjNzUtMzI0Ny00NWVkLWFmMzgtMzk5M2UyN2ZlN2M4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3ODAyNTc5OTMsImV4cCI6NDkzNjAxNzk5M30.x_0-wOydSZBBMEswnL9tZKws3uMQ644KopcLcTvssys',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImE1ZjQzNzJkLTRhZDctNDY5ZS05OTQ4LTRjZDdmZjVkM2M4YyIsIm9yZ0lkIjoiNTE4Mjc5IiwidXNlcklkIjoiNTMzMzYxIiwidHlwZUlkIjoiZjcwZjllYmItMzY2NC00YWQxLTg0M2QtNzUzNTQ2MDVjZjcxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3ODAyNTc4NDcsImV4cCI6NDkzNjAxNzg0N30.7iwFLl5M_0VNw7xyInEYQF40Ae7QpDb2puTrvmKwIGA',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImNmNmUyZjc2LTljOTktNDc3YS04YzYyLTJmNDVmZmIwM2QyZSIsIm9yZ0lkIjoiNTE4MjgxIiwidXNlcklkIjoiNTMzMzYzIiwidHlwZUlkIjoiN2NmNzJiYjgtODQwYi00NGE3LWFjNWUtMDIyZWU1OTZhMjdjIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3ODAyNTgxMTUsImV4cCI6NDkzNjAxODExNX0.qSwQ1RkiqouUtXOhLBlQ98xQDHIki9GkpQRkf4Dl9pg',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFlYjgyZGFmLWNlOGYtNDkzZS1hYzY2LTI3MzZmY2MyYTYwMyIsIm9yZ0lkIjoiNTE4MjgzIiwidXNlcklkIjoiNTMzMzY1IiwidHlwZUlkIjoiNDBkNWUwZmUtMjA4Ni00NmNkLWE1NDMtYWIyMjcwYWFkYjJhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3ODAyNTgzOTAsImV4cCI6NDkzNjAxODM5MH0.Vm67_LuG_kiOySrT1VCHOqUEF8wIcDSAazFeT9HFW3o'
];

export class MoralisService {
  private currentKeyIndex = 0;

  constructor() {
    console.log('[MoralisService] Initialized with 4-key load balancing matrix. True Deep Index restored.');
  }

  private async fetchWithRotation(endpoint: string, options: any = {}): Promise<any> {
    const maxRetries = MORALIS_KEYS.length;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      const apiKey = MORALIS_KEYS[this.currentKeyIndex];
      try {
        const url = endpoint.startsWith('http') ? endpoint : `https://deep-index.moralis.io/api/v2.2${endpoint}`;
        
        const res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'X-API-Key': apiKey,
          },
          signal: AbortSignal.timeout(8000), // Strict 8s internal timeout
        });

        if (res.status === 429 || res.status === 402 || res.status === 401) {
            console.warn(`[MoralisService] Quota/Auth error on key index ${this.currentKeyIndex} (status ${res.status}). Rotating...`);
            this.currentKeyIndex = (this.currentKeyIndex + 1) % MORALIS_KEYS.length;
            attempt++;
            continue;
        }

        if (!res.ok) {
            throw new Error(`Moralis API Error: ${res.status} ${res.statusText}`);
        }

        return await res.json();
      } catch (err: any) {
        if (err.name === 'TimeoutError' || err.message.includes('fetch') || err.message.includes('network')) {
            console.warn(`[MoralisService] Network/Timeout error on key index ${this.currentKeyIndex}. Rotating...`);
            this.currentKeyIndex = (this.currentKeyIndex + 1) % MORALIS_KEYS.length;
            attempt++;
            continue;
        }
        throw err;
      }
    }
    
    throw new Error('MORALIS_QUOTA_EXHAUSTED: All keys failed or timed out.');
  }

  async getWalletBalances(address: string, chain: MoralisChain, cursor?: string) {
    let url = `/${address}/erc20?chain=${chain}`;
    if (cursor) url += `&cursor=${cursor}`;
    return await this.fetchWithRotation(url);
  }

  async getNativeBalance(address: string, chain: MoralisChain) {
    return await this.fetchWithRotation(`/${address}/balance?chain=${chain}`);
  }

  async getWalletNetWorth(address: string, excludeSpam: boolean = true, excludeUnverifiedContracts: boolean = true) {
    return await this.fetchWithRotation(`/wallets/${address}/net-worth?exclude_spam=${excludeSpam}&exclude_unverified_contracts=${excludeUnverifiedContracts}`);
  }

  async getWalletStats(address: string, chain?: MoralisChain) {
    let url = `/wallets/${address}/stats`;
    if (chain) url += `?chain=${chain}`;
    return await this.fetchWithRotation(url);
  }

  async getWalletActiveChains(address: string) {
    return await this.fetchWithRotation(`/wallets/${address}/chains`);
  }

  async getWalletHistory(address: string, chain: MoralisChain, limit: number = 100) {
    return await this.fetchWithRotation(`/wallets/${address}/history?chain=${chain}&limit=${limit}`);
  }

  async getDefiPositions(address: string) {
    return await this.fetchWithRotation(`/wallets/${address}/defi/positions`);
  }

  async getDefiSummary(address: string) {
    return await this.fetchWithRotation(`/wallets/${address}/defi/summary`);
  }

  // --- Stubs for compatibility with original interface ---
  async getWalletProfitability(address: string, days?: number) { return { total_profit_usd: '0', result: [] }; }
  async getTokenTransfers(address: string, chain: MoralisChain, limit: number = 100) { return { result: [] }; }
  async getWalletNFTs(address: string, chain: MoralisChain, limit: number = 100) { return { result: [] }; }
  async getNFTFloorPrice(address: string, chain: MoralisChain) { return { floor_price_usd: '0' }; }
  async resolveENSDomain(domain: string) { return { address: '' }; }
  async resolveAddress(address: string) { return { name: '' }; }
  async resolveUnstoppableDomain(domain: string) { return { address: '' }; }
  async getOHLCV(address: string, chain: MoralisChain, timeframe: string = '1h', limit: number = 100) { return []; }
  async getTransaction(transactionHash: string, chain: MoralisChain = 'eth') { return null; }

  async getTokenPrice(address: string, chain: MoralisChain) {
    try {
      const prices = await PriceService.getBulkPrices([{ symbol: 'UNK', address, chainId: 1 }]);
      return { usdPrice: prices['UNK']?.price || 0 };
    } catch { return { usdPrice: 0 }; }
  }

  async getMultipleTokenPrices(tokens: Array<{ address: string; chain: MoralisChain }>) {
    return tokens.map(t => ({ tokenAddress: t.address, usdPrice: 0 }));
  }

  getChainName(chainId: number): MoralisChain {
    return MORALIS_CHAINS[chainId as keyof typeof MORALIS_CHAINS] || 'eth';
  }
}

export const moralisService = new MoralisService();
