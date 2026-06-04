import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { RpcRelayerManager } from '@/lib/blockchain/rpc-relayer';

/**
 * /api/analytics/mass-transfers
 * 
 * System Capital Ledger  Real-time multi-chain mass transfer scanner.
 * Scans ETH, BSC, and BASE chains for native + ERC-20 transfers,
 * normalizes to the WhaleEvent schema, and returns { events, transfers }.
 */

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

//  Token Registry 
const TOKEN_REGISTRY: Record<string, { symbol: string; decimals: number }> = {
  // ETH MAINNET
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT',  decimals: 6 },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC',  decimals: 6 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH',  decimals: 18 },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC',  decimals: 8 },
  '0x514910771af9ca656af840dff83e8264ecf986ca': { symbol: 'LINK',  decimals: 18 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI',   decimals: 18 },
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': { symbol: 'UNI',   decimals: 18 },
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { symbol: 'AAVE',  decimals: 18 },
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { symbol: 'stETH', decimals: 18 },
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB',  decimals: 18 },
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': { symbol: 'PEPE',  decimals: 18 },
  // BASE
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { symbol: 'USDC',  decimals: 6 },
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH',  decimals: 18 },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { symbol: 'DAI',   decimals: 18 },
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': { symbol: 'cbETH', decimals: 18 },
  // BSC
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': { symbol: 'WBNB',  decimals: 18 },
  '0x55d398326f99059ff775485246999027b3197955': { symbol: 'USDT',  decimals: 18 },
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': { symbol: 'BUSD',  decimals: 18 },
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': { symbol: 'USDC',  decimals: 18 },
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': { symbol: 'BTCB',  decimals: 18 },
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': { symbol: 'ETH',   decimals: 18 },
};

const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

//  Tier Classification 
function getTier(usd: number): string {
  if (usd >= 100_000_000) return 'ULTRA_CAPITAL_FLOW';
  if (usd >= 50_000_000)  return 'PRINCIPAL_BLOCK';
  if (usd >= 10_000_000)  return 'ENTERPRISE_TRANSFER';
  if (usd >= 5_000_000)   return 'LIQUIDITY_NODE';
  if (usd >= 1_000_000)   return 'STANDARD_FLOW';
  if (usd >= 500_000)     return 'RETAIL_PRO';
  return 'MICRO_TRANSFER';
}

//  Price Oracle 
const priceCache: Record<string, { price: number; ts: number }> = {};
const PRICE_TTL = 90_000; // 90s

async function getPrice(symbol: string): Promise<number> {
  const stables = ['USDT', 'USDC', 'DAI', 'BUSD', 'FRAX', 'LUSD'];
  if (stables.includes(symbol)) return 1;

  const cached = priceCache[symbol];
  if (cached && Date.now() - cached.ts < PRICE_TTL) return cached.price;

  const idMap: Record<string, string> = {
    ETH: 'ethereum', WETH: 'weth', BNB: 'binancecoin', WBNB: 'binancecoin',
    BTC: 'bitcoin', WBTC: 'wrapped-bitcoin', BTCB: 'bitcoin',
    LINK: 'chainlink', UNI: 'uniswap', AAVE: 'aave',
    SOL: 'solana', MATIC: 'matic-network', POL: 'polygon-ecosystem-token',
    PEPE: 'pepe', SHIB: 'shiba-inu', stETH: 'staked-ether',
    cbETH: 'coinbase-wrapped-staked-eth',
  };
  const coinId = idMap[symbol];
  if (!coinId) return 0;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(3500) }
    );
    const json = await res.json();
    const price = json[coinId]?.usd || 0;
    priceCache[symbol] = { price, ts: Date.now() };
    return price;
  } catch {
    const fallbacks: Record<string, number> = {
      ETH: 3300, WETH: 3300, BNB: 600, WBNB: 600, BTC: 86000,
      WBTC: 86000, BTCB: 86000, SOL: 145, MATIC: 0.7, LINK: 18,
      stETH: 3280, cbETH: 3280,
    };
    return fallbacks[symbol] || 0;
  }
}

//  Chain Definitions 
interface ChainDef {
  code:          string;   // short code used in UI filters: ETH | BSC | BASE
  label:         string;   // full label for logging
  chainId:       number;
  rpcUrls:       string[];
  nativeSymbol:  string;
  priceKey:      string;
}

function getChains(): ChainDef[] {
  return [
    {
      code:         'ETH',
      label:        'Ethereum',
      chainId:      1,
      nativeSymbol: 'ETH',
      priceKey:     'ETH',
      rpcUrls:      [
        RpcRelayerManager.getRpcUrl('ETH', 'RPC'),
        'https://eth.llamarpc.com',
        'https://cloudflare-eth.com',
      ].filter(Boolean),
    },
    {
      code:         'BASE',
      label:        'Base',
      chainId:      8453,
      nativeSymbol: 'ETH',
      priceKey:     'ETH',
      rpcUrls:      [
        process.env.BASE_MAINNET_RPC_URL || '',
        'https://mainnet.base.org',
        'https://base.llamarpc.com',
      ].filter(Boolean),
    },
    {
      code:         'BSC',
      label:        'BNB Chain',
      chainId:      56,
      nativeSymbol: 'BNB',
      priceKey:     'BNB',
      rpcUrls:      [
        RpcRelayerManager.getRpcUrl('BSC', 'RPC'),
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
      ].filter(Boolean),
    },
  ];
}

//  In-Memory Server Cache 
type CacheEntry = { data: any[]; ts: number };
const serverCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30_000; // 30s

//  Chain Scanner 
async function scanChain(chain: ChainDef, bustCache = false): Promise<any[]> {
  const cacheKey = chain.code;
  const cached   = serverCache[cacheKey];
  if (!bustCache && cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  let provider: ethers.JsonRpcProvider | null = null;

  for (const url of chain.rpcUrls) {
    if (!url) continue;
    try {
      provider = new ethers.JsonRpcProvider(url, chain.chainId, { staticNetwork: true });
      await provider.getBlockNumber();
      break;
    } catch {
      provider = null;
    }
  }

  if (!provider) {
    console.warn(`[MassTransfers] No working RPC for ${chain.label}`);
    return cached?.data || [];          // return stale data rather than empty
  }

  const results: any[] = [];

  try {
    const nativePrice  = await getPrice(chain.priceKey);
    const latestBlock  = await provider.getBlockNumber();
    const BLOCKS_BACK  = 5;

    //  Native transfers 
    const blockPromises: Promise<any>[] = [];
    for (let b = latestBlock; b > latestBlock - BLOCKS_BACK && b > 0; b--) {
      blockPromises.push(provider.getBlock(b, true));
    }
    const blockResults = await Promise.allSettled(blockPromises);

    for (const res of blockResults) {
      if (res.status !== 'fulfilled' || !res.value) continue;
      const block = res.value;
      for (const tx of (block.prefetchedTransactions || [])) {
        if (!tx.value || !tx.from) continue;
        const valueNative = parseFloat(ethers.formatEther(tx.value));
        if (valueNative === 0) continue;
        const usdValue = valueNative * nativePrice;
        results.push({
          hash:          tx.hash,
          from:          tx.from,
          to:            tx.to || 'Contract',
          amount:        valueNative,
          usdValue,
          token:         chain.nativeSymbol,
          chain:         chain.code,
          tier:          getTier(usdValue),
          action:        'TRANSFER',
          method:        'Native Transfer',
          gasPriceGwei:  tx.gasPrice ? parseFloat(ethers.formatUnits(tx.gasPrice, 'gwei')).toFixed(2) : '0',
          confirmations: latestBlock - block.number + 1,
          status:        'CONFIRMED',
          timestamp:     (block.timestamp || Date.now() / 1000) * 1000,
        });
      }
    }

    //  ERC-20 transfers 
    try {
      const logs = await provider.getLogs({
        fromBlock: latestBlock - BLOCKS_BACK,
        toBlock:   latestBlock,
        topics:    [TRANSFER_TOPIC],
      });

      for (const log of logs.slice(0, 300)) {
        const tokenAddr = log.address.toLowerCase();
        const tokenCfg  = TOKEN_REGISTRY[tokenAddr];
        if (!tokenCfg) continue;

        try {
          const [rawAmount] = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], log.data);
          const tokenAmount  = parseFloat(ethers.formatUnits(rawAmount, tokenCfg.decimals));
          const tokenPrice   = await getPrice(tokenCfg.symbol);
          const usdValue     = tokenAmount * tokenPrice;

          const from = ethers.AbiCoder.defaultAbiCoder().decode(['address'], log.topics[1])[0] as string;
          const to   = ethers.AbiCoder.defaultAbiCoder().decode(['address'], log.topics[2])[0] as string;

          results.push({
            hash:          log.transactionHash,
            from,
            to,
            amount:        tokenAmount,
            usdValue,
            token:         tokenCfg.symbol,
            chain:         chain.code,
            tier:          getTier(usdValue),
            action:        'ERC20 TRANSFER',
            method:        'ERC20 Transfer',
            gasPriceGwei:  '',
            confirmations: 1,
            status:        'CONFIRMED',
            timestamp:     Date.now(),
          });
        } catch {
          // malformed log  skip
        }
      }
    } catch (e: any) {
      console.log(`[MassTransfers] Log scan failed for ${chain.label}:`, e.message);
    }

    serverCache[cacheKey] = { data: results, ts: Date.now() };
  } catch (e: any) {
    console.error(`[MassTransfers] Chain ${chain.label} scan failed:`, e.message);
  }

  return results;
}

//  GET Handler 
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainFilter = searchParams.get('chain');
    const bust        = searchParams.get('bust') === '1';

    const chains = chainFilter
      ? getChains().filter(c => c.code === chainFilter)
      : getChains();

    const settled = await Promise.allSettled(chains.map(c => scanChain(c, bust)));

    const allTxs = settled
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 80);

    return NextResponse.json(
      { events: allTxs, transfers: allTxs },
      { headers: { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' } }
    );
  } catch (err: any) {
    console.error('[MassTransfers API]', err.message);
    return NextResponse.json({ error: err.message, events: [], transfers: [] }, { status: 500 });
  }
}
