import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CHAINS, getChainById } from '@/lib/chains';
import { getRealTimePrice } from '@/lib/priceHelper';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
/**
 * Multi-Chain Whale Data Aggregator
 * Fetches wallet data across multiple chains simultaneously
 * ALL PRICES ARE REAL-TIME FROM COINGECKO
 */

interface WalletBalance {
  chainId: number;
  chainName: string;
  nativeBalance: string;
  nativeBalanceUSD: number;
  tokenCount: number;
  totalValueUSD: number;
  lastUpdate: string;
}

interface MultiChainResponse {
  address: string;
  chains: WalletBalance[];
  totalValueUSD: number;
  dominantChain: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainIds = searchParams.get('chains')?.split(',') || [];

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate address format (Supports 0x for EVM and typical BTC formats)
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(address);
    const isBtc = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);

    if (!isEvm && !isBtc) {
      return NextResponse.json(
        { error: 'Invalid address format. Supported: EVM (0x) and Bitcoin (1, 3, bc1)' },
        { status: 400 }
      );
    }

    // Default to all chains if none specified
    const targetChains = chainIds.length > 0 
      ? chainIds.map(id => parseInt(id))
      : Object.values(SUPPORTED_CHAINS).map(c => c.id);

    // Fetch balance data from all chains in parallel
    const balancePromises = targetChains.map(chainId => 
      fetchChainBalance(address, chainId)
    );

    const balances = await Promise.allSettled(balancePromises);
    
    const chainBalances: WalletBalance[] = balances
      .filter((result): result is PromiseFulfilledResult<WalletBalance> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    // Calculate totals
    const totalValueUSD = chainBalances.reduce(
      (sum, balance) => sum + balance.totalValueUSD, 
      0
    );

    // Find dominant chain
    const dominantChain = chainBalances.reduce((prev, current) => 
      current.totalValueUSD > prev.totalValueUSD ? current : prev
    , chainBalances[0] || { chainName: 'Unknown', totalValueUSD: 0 });

    const response: MultiChainResponse = {
      address,
      chains: chainBalances,
      totalValueUSD,
      dominantChain: dominantChain.chainName,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Multi-chain fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch multi-chain data' },
      { status: 500 }
    );
  }
}

async function fetchChainBalance(
  address: string, 
  chainId: number
): Promise<WalletBalance> {
  const chain = getChainById(chainId);
  
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  try {
    if (chainId === 0) { // BITCOIN
        // Fetch BTC balance from mempool.space (Reliable & Free API)
        const btcRes = await fetch(`https://mempool.space/api/address/${address}`);
        if (!btcRes.ok) throw new Error('Bitcoin API error');
        
        const btcData = await btcRes.json();
        // sum of funded minus sum of spent = balance in satoshis
        const satoshis = (btcData.chain_stats.funded_txo_sum - btcData.chain_stats.spent_txo_sum) || 0;
        const btcBalance = satoshis / 1e8;
        
        const btcPrice = await getRealTimePrice('BTC');
        const btcBalanceUSD = btcBalance * btcPrice;

        return {
            chainId,
            chainName: 'Bitcoin',
            nativeBalance: safeToFixed(btcBalance, 8),
            nativeBalanceUSD: btcBalanceUSD,
            tokenCount: 0,
            totalValueUSD: btcBalanceUSD,
            lastUpdate: new Date().toISOString(),
        };
    }

    const rpcUrl = getRpcUrl(chainId);
    
    // Fetch native balance (EVM)
    const balanceRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });

    const balanceData = await balanceRes.json();
    if (balanceData.error) throw new Error(balanceData.error.message);

    const nativeBalanceWei = balanceData.result || '0x0';
    const nativeBalance = parseInt(nativeBalanceWei, 16) / 1e18;

    // Get REAL-TIME price from CoinGecko
    const nativePrice = await getRealTimePrice(chain.nativeCurrency.symbol);
    const nativeBalanceUSD = nativeBalance * nativePrice;

    // For now, we'll use a simplified approach
    // In production, you'd fetch token balances via Alchemy Token API
    const tokenCount = 0;
    const totalValueUSD = nativeBalanceUSD;

    return {
      chainId,
      chainName: chain.name,
      nativeBalance: safeToFixed(nativeBalance, 6),
      nativeBalanceUSD,
      tokenCount,
      totalValueUSD,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching balance for chain ${chainId}:`, error);
    return {
      chainId,
      chainName: chain.name,
      nativeBalance: '0',
      nativeBalanceUSD: 0,
      tokenCount: 0,
      totalValueUSD: 0,
      lastUpdate: new Date().toISOString(),
    };
  }
}

function getRpcUrl(chainId: number): string {
  const chain = getChainById(chainId);
  if (!chain) throw new Error(`Chain ${chainId} not found`);

  // Use public RPCs (in production, use Alchemy with API key from env)
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  
  if (alchemyKey && chain.rpcUrls[0].includes('alchemy')) {
    return `${chain.rpcUrls[0]}${alchemyKey}`;
  }

  // Fallback to public RPC
  return chain.rpcUrls[chain.rpcUrls.length - 1];
}

