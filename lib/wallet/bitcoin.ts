/**
 * Bitcoin Utility
 * Fetches balances and validates Bitcoin addresses
 */

export async function getBitcoinBalance(address: string): Promise<{ balance: number; valueUSD: number }> {
  try {
    // Using mempool.space API (High reliability, no key required for basic usage)
    const response = await fetch(`https://mempool.space/api/address/${address}`);
    if (!response.ok) throw new Error('Bitcoin API error');
    
    const data = await response.json();
    
    // Balance = chain_balance + mempool_balance
    const chainBalance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) || 0;
    const mempoolBalance = (data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum) || 0;
    
    // Convert Satoshis to BTC
    const satoshis = chainBalance + mempoolBalance;
    const btcAmount = satoshis / 100_000_000;

    // Fetch BTC price
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const priceData = await priceRes.json();
    const priceUSD = priceData.bitcoin.usd || 0;

    return {
      balance: btcAmount,
      valueUSD: btcAmount * priceUSD
    };
  } catch (error) {
    console.error('Error fetching BTC balance:', error);
    return { balance: 0, valueUSD: 0 };
  }
}

/**
 * Validates if a string is a valid Bitcoin address
 */
export function isBitcoinAddress(address: string): boolean {
  // Basic regex for legacy (1...), SegWit (3...), and Bech32 (bc1...)
  const btcRegex = /^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-z02-9]{11,71})$/;
  return btcRegex.test(address);
}

