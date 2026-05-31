/**
 * GetBlock Engine  Multi-Endpoint Failover (vía getblock-registry)
 *
 * Fuente única: getblock-registry.ts
 * No hardcodear URLs aquí. Para añadir endpoints, editar .env + registry.
 */

import { getGbAllRpc, getActiveCount, getCoveredChains, markCuExhausted, GbChain } from './getblock-registry';

//  FALLBACK PÚBLICOS DE EMERGENCIA 
const PUBLIC_FALLBACKS: Record<string, string[]> = {
  eth: [
    'https://eth.llamarpc.com',
    'https://cloudflare-eth.com',
    'https://ethereum-rpc.publicnode.com',
    'https://eth.drpc.org',
  ],
  polygon: [
    'https://polygon.llamarpc.com',
    'https://polygon-rpc.com',
    'https://rpc-mainnet.maticvigil.com'
  ],
  bsc: [
    'https://binance.llamarpc.com',
    'https://bsc-dataseed.binance.org',
  ],
  arb: [
    'https://arbitrum.llamarpc.com',
    'https://arb1.arbitrum.io/rpc',
  ],
  base: [
    'https://base.llamarpc.com',
    'https://mainnet.base.org',
  ],
  op: [
    'https://optimism.llamarpc.com',
    'https://mainnet.optimism.io',
  ]
};

// Cooldown de 24 horas (86400000 ms) para evitar baneos si se agota la cuota diaria (540,000 requests)
const EXHAUSTION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

class RpcRotator {
  private rrIndex = new Map<string, number>();
  private healthMap = new Map<string, { exhausted: boolean; exhaustedAt?: number; errorCount: number }>();

  private getOrCreateHealth(url: string) {
    if (!this.healthMap.has(url)) {
      this.healthMap.set(url, { exhausted: false, errorCount: 0 });
    }
    return this.healthMap.get(url)!;
  }

  private getActiveUrls(urls: string[]): string[] {
    const now = Date.now();
    return urls.filter(url => {
      const h = this.getOrCreateHealth(url);
      if (h.exhausted && h.exhaustedAt && now - h.exhaustedAt > EXHAUSTION_COOLDOWN_MS) {
        h.exhausted = false;
        h.errorCount = 0;
      }
      return !h.exhausted;
    });
  }

  private markExhausted(url: string, reason: string) {
    const h = this.getOrCreateHealth(url);
    h.exhausted = true;
    h.exhaustedAt = Date.now();
    h.errorCount++;
    markCuExhausted(url);
    console.warn(`[GetBlock-Engine] BLACKLISTED (${reason}): ${url.slice(0, 48)}...`);
  }

  public getNext(chain: GbChain): string | null {
    const registryUrls = getGbAllRpc(chain);
    const activeUrls = this.getActiveUrls(registryUrls);
    
    if (activeUrls.length === 0) return null;
    
    const currentIndex = this.rrIndex.get(chain) || 0;
    const nextIndex = (currentIndex + 1) % activeUrls.length;
    this.rrIndex.set(chain, nextIndex);
    
    return activeUrls[nextIndex];
  }

  public async call<T>(chain: GbChain, method: string, params: unknown[], timeoutMs = 8000): Promise<T> {
    const registryUrls = getGbAllRpc(chain);
    const activeUrls = this.getActiveUrls(registryUrls);

    // Etapa 1: Endpoints de GetBlock
    for (let i = 0; i < activeUrls.length; i++) {
      const url = this.getNext(chain);
      if (!url) break;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (res.status === 402 || res.status === 429 || res.status === 401) {
          this.markExhausted(url, `HTTP_${res.status}`);
          await new Promise(r => setTimeout(r, Math.random() * 40 + 10)); // Jitter
          continue;
        }

        if (!res.ok) {
          await new Promise(r => setTimeout(r, Math.random() * 40 + 10)); // Jitter
          continue;
        }

        const json = await res.json() as { result?: T; error?: any };
        if (json.error) {
          const msg = JSON.stringify(json.error);
          if (msg.includes('quota') || msg.includes('limit') || msg.includes('unauthorized') || msg.includes('exceeded')) {
            this.markExhausted(url, 'RPC_LIMIT');
            await new Promise(r => setTimeout(r, Math.random() * 40 + 10)); // Jitter
            continue;
          }
          throw new Error(msg);
        }

        return json.result as T;
      } catch (err: any) {
        if (err.name === 'TimeoutError') {
          this.markExhausted(url, 'TIMEOUT');
        }
        await new Promise(r => setTimeout(r, Math.random() * 40 + 10)); // Jitter
        continue;
      }
    }

    // Etapa 2: Fallbacks públicos
    const fallbacks = PUBLIC_FALLBACKS[chain] || PUBLIC_FALLBACKS['eth'];
    for (const fallbackUrl of fallbacks) {
      try {
        const r = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!r.ok) continue;
        const j = await r.json() as { result?: T; error?: any };
        if (j.error || j.result === undefined) continue;
        return j.result;
      } catch { continue; }
    }

    throw new Error(`All RPC endpoints exhausted for chain ${chain}`);
  }

  public getEndpointStatus() {
    return Array.from(this.healthMap.values()).map(h => ({
      url: h.url.slice(0, 55) + '...',
      exhausted: h.exhausted,
      errorCount: h.errorCount,
      exhaustedAt: h.exhaustedAt ? new Date(h.exhaustedAt).toISOString() : null,
    }));
  }
}

export const rpcRotator = new RpcRotator();

// Compatibilidad hacia atrás
async function rpcWithFailover(method: string, params: unknown[], id = 1): Promise<string> {
  try {
    return await rpcRotator.call<string>('eth', method, params);
  } catch {
    return '0x0';
  }
}

export async function chainRpc(chain: GbChain, method: string, params: unknown[]): Promise<string> {
  try {
    return await rpcRotator.call<string>(chain, method, params);
  } catch {
    return '0x0';
  }
}

//  Pad address to 32-byte ABI encoding 
function padAddr(addr: string) {
  return '000000000000000000000000' + addr.toLowerCase().replace('0x', '');
}

// ERC-20 ABI selectors (4-byte keccak)
const SIG_BALANCE_OF = '0x70a08231'; // balanceOf(address)
const SIG_SLOT0      = '0x3850c7bd'; // slot0() Uniswap V3

// 
// Portfolio: eth_getBalance + batched balanceOf
// 

const KNOWN_ERC20: { symbol: string; address: string; decimals: number }[] = [
  { symbol: 'USDC',  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6  },
  { symbol: 'USDT',  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6  },
  { symbol: 'WETH',  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'DAI',   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC',  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8  },
  { symbol: 'LINK',  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'UNI',   address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  { symbol: 'ARB',   address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18 },
  { symbol: 'OP',    address: '0x4200000000000000000000000000000000000042', decimals: 18 },
  { symbol: 'PEPE',  address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18 },
  { symbol: 'SHIB',  address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18 },
  { symbol: 'MATIC', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18 },
  { symbol: 'LDO',   address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18 },
  { symbol: 'MKR',   address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18 },
  { symbol: 'AAVE',  address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
];

export interface PortfolioToken {
  symbol:   string;
  address:  string;
  contractAddress: string;
  balance:  number;
  decimals: number;
  chain:    string;
}

/** Fetch ETH + top ERC-20 balances con failover automático via registry */
export async function getUserPortfolio(walletAddress: string): Promise<{
  ethBalance: number;
  tokens: PortfolioToken[];
}> {
  const addr = walletAddress.toLowerCase();

  const activeTokens = [...KNOWN_ERC20];
  const qdsContract = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS;
  if (qdsContract && qdsContract.startsWith('0x')) {
    if (!activeTokens.some(t => t.address.toLowerCase() === qdsContract.toLowerCase())) {
      activeTokens.push({
        symbol: 'QDs',
        address: qdsContract,
        decimals: 18
      });
    }
  }

  const [ethHex, ...erc20Results] = await Promise.all([
    rpcWithFailover('eth_getBalance', [addr, 'latest']),
    ...activeTokens.map(t =>
      rpcWithFailover('eth_call', [
        { to: t.address, data: SIG_BALANCE_OF + padAddr(addr) },
        'latest',
      ]).catch(() => '0x0')
    ),
  ]);

  const ethBalance = parseInt(ethHex || '0x0', 16) / 1e18;

  const tokens: PortfolioToken[] = activeTokens.map((t, i) => {
    const raw = erc20Results[i] || '0x0';
    const balance = parseInt(raw, 16) / Math.pow(10, t.decimals);
    return {
      symbol: t.symbol,
      address: t.address,
      contractAddress: t.address,
      balance,
      decimals: t.decimals,
      chain: 'ethereum'
    };
  }).filter(t => t.balance > 0);

  return { ethBalance, tokens };
}

// 
// Market Intel: UniswapV3 slot0() on-chain prices
// 

const TOP_POOLS_V3: { symbol: string; pool: string; token0Decimals: number; token1Decimals: number }[] = [
  { symbol: 'ETH/USDC',  pool: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', token0Decimals: 6,  token1Decimals: 18 },
  { symbol: 'ETH/USDT',  pool: '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36', token0Decimals: 18, token1Decimals: 6  },
  { symbol: 'WBTC/ETH',  pool: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD', token0Decimals: 8,  token1Decimals: 18 },
  { symbol: 'LINK/ETH',  pool: '0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8', token0Decimals: 18, token1Decimals: 18 },
  { symbol: 'UNI/ETH',   pool: '0x1d42064Fc4Beb5F8aaf85F4617AE8b3b5B8Bd801', token0Decimals: 18, token1Decimals: 18 },
];

export interface PoolPrice {
  symbol:       string;
  pool:         string;
  sqrtPriceX96: string;
  tick:         number;
  price:        number;
}

/** Read slot0() para cada pool UniswapV3  precios on-chain reales */
export async function getPoolPrices(): Promise<PoolPrice[]> {
  const results = await Promise.all(
    TOP_POOLS_V3.map(p =>
      rpcWithFailover('eth_call', [{ to: p.pool, data: SIG_SLOT0 }, 'latest'])
        .catch(() => null)
    )
  );

  const prices: PoolPrice[] = [];

  for (let i = 0; i < TOP_POOLS_V3.length; i++) {
    const p = TOP_POOLS_V3[i];
    const raw = results[i];

    if (!raw || raw === '0x' || raw === '0x0' || raw.length < 66) {
      prices.push({ ...p, sqrtPriceX96: '0', tick: 0, price: 0 });
      continue;
    }

    try {
      const sqrtPriceX96 = BigInt('0x' + raw.slice(2, 66));
      if (sqrtPriceX96 === 0n) {
        prices.push({ ...p, sqrtPriceX96: '0', tick: 0, price: 0 });
        continue;
      }
      const tickHex = raw.slice(66, 74);
      const tick = parseInt(tickHex, 16);
      const price = Number(
        (sqrtPriceX96 * sqrtPriceX96 * BigInt(Math.pow(10, p.token0Decimals))) /
        (BigInt(2) ** BigInt(192) * BigInt(Math.pow(10, p.token1Decimals)))
      );
      prices.push({ symbol: p.symbol, pool: p.pool, sqrtPriceX96: sqrtPriceX96.toString(), tick, price });
    } catch {
      prices.push({ ...p, sqrtPriceX96: '0', tick: 0, price: 0 });
    }
  }

  const hasValidPrice = prices.some(p => p.price > 0);
  if (!hasValidPrice) {
    try {
      const cgRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,chainlink,uniswap,wrapped-bitcoin&vs_currencies=usd',
        { signal: AbortSignal.timeout(5000) }
      );
      if (cgRes.ok) {
        const cg = await cgRes.json();
        return prices.map(p => {
          if (p.symbol === 'ETH/USDC' || p.symbol === 'ETH/USDT') {
            const ethUsd = cg?.ethereum?.usd ?? 0;
            return { ...p, price: ethUsd, sqrtPriceX96: '1', tick: 0 };
          }
          if (p.symbol === 'WBTC/ETH') {
            const btcUsd = cg?.bitcoin?.usd ?? 0;
            const ethUsd = cg?.ethereum?.usd ?? 1;
            return { ...p, price: btcUsd / ethUsd, sqrtPriceX96: '1', tick: 0 };
          }
          if (p.symbol === 'LINK/ETH') {
            const linkUsd = cg?.chainlink?.usd ?? 0;
            const ethUsd = cg?.ethereum?.usd ?? 1;
            return { ...p, price: linkUsd / ethUsd, sqrtPriceX96: '1', tick: 0 };
          }
          if (p.symbol === 'UNI/ETH') {
            const uniUsd = cg?.uniswap?.usd ?? 0;
            const ethUsd = cg?.ethereum?.usd ?? 1;
            return { ...p, price: uniUsd / ethUsd, sqrtPriceX96: '1', tick: 0 };
          }
          return p;
        });
      }
    } catch { /* silencio */ }
  }

  return prices;
}

export function getEndpointStatus() {
  return rpcRotator.getEndpointStatus();
}

export function getRegistrySummary() {
  return {
    activeEndpoints: getActiveCount(),
    coveredChains: getCoveredChains(),
    ethEndpointsLoaded: getGbAllRpc('eth').length,
  };
}
