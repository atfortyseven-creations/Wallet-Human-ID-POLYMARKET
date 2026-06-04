import { SUPPORTED_CHAINS, getChainById } from '@/lib/chains';
import { getRealTimePrice } from '@/lib/priceHelper';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export async function fetchChainBalance(
  address: string, 
  chainId: number
) {
  const chain = getChainById(chainId);
  if (!chain) return null;

  try {
    if (chainId === 0) { // BITCOIN
        const btcRes = await fetch(`https://mempool.space/api/address/${address}`);
        if (!btcRes.ok) return null;
        
        const btcData = await btcRes.json();
        const satoshis = (btcData.chain_stats.funded_txo_sum - btcData.chain_stats.spent_txo_sum) || 0;
        const btcBalance = satoshis / 1e8;
        
        const btcPrice = await getRealTimePrice('BTC');
        const btcBalanceUSD = btcBalance * btcPrice;

        return {
            chainId,
            chainName: 'Bitcoin',
            nativeBalance: safeToFixed(btcBalance, 8),
            nativeBalanceUSD: btcBalanceUSD,
            totalValueUSD: btcBalanceUSD,
        };
    }

    // EVM
    const rpcUrl = chain.rpcUrls[chain.rpcUrls.length - 1]; // Use public fallback for now
    
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
    if (balanceData.error) return null;

    const nativeBalanceWei = balanceData.result || '0x0';
    const nativeBalance = parseInt(nativeBalanceWei, 16) / 1e18;
    const nativePrice = await getRealTimePrice(chain.nativeCurrency.symbol);
    const nativeBalanceUSD = nativeBalance * nativePrice;

    return {
      chainId,
      chainName: chain.name,
      nativeBalance: safeToFixed(nativeBalance, 6),
      nativeBalanceUSD,
      totalValueUSD: nativeBalanceUSD,
    };
  } catch (error) {
    return null;
  }
}

export async function getTotalWalletBalance(address: string) {
    const isBtc = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(address);

    if (isBtc) {
        const balance = await fetchChainBalance(address, 0);
        return balance?.totalValueUSD || 0;
    }

    if (isEvm) {
        // For EVM, we check common chains (Mainnet, Polygon, Base)
        const commonChains = [1, 137, 8453];
        const balances = await Promise.all(commonChains.map(id => fetchChainBalance(address, id)));
        return balances.reduce((sum, b) => sum + (b?.totalValueUSD || 0), 0);
    }

    return 0;
}

