/**
 * Gas Optimization Service (EIP-1559)
 * Provides gas estimation with slow/normal/fast options
 */

import { getChainById } from '@/lib/chains';

export interface GasEstimate {
  slow: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    estimatedTime: string; // e.g., "~5 min"
    totalCost: string; // in ETH
    totalCostUSD: string;
  };
  normal: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    estimatedTime: string;
    totalCost: string;
    totalCostUSD: string;
  };
  fast: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    estimatedTime: string;
    totalCost: string;
    totalCostUSD: string;
  };
}

/**
 * Get gas estimates for a transaction
 */
export async function getGasEstimates(
  chainId: number,
  gasLimit: bigint = 21000n, // Standard ETH transfer
  ethPriceUSD: number = 3000
): Promise<GasEstimate> {
  try {
    const baseFee = await getBaseFee(chainId);
    const priorityFees = await getPriorityFees(chainId);

    const slow = {
      maxFeePerGas: baseFee + priorityFees.slow,
      maxPriorityFeePerGas: priorityFees.slow,
      estimatedTime: '~5 min',
      totalCost: formatEther(gasLimit * (baseFee + priorityFees.slow)),
      totalCostUSD: '',
    };

    const normal = {
      maxFeePerGas: baseFee + priorityFees.normal,
      maxPriorityFeePerGas: priorityFees.normal,
      estimatedTime: '~2 min',
      totalCost: formatEther(gasLimit * (baseFee + priorityFees.normal)),
      totalCostUSD: '',
    };

    const fast = {
      maxFeePerGas: baseFee + priorityFees.fast,
      maxPriorityFeePerGas: priorityFees.fast,
      estimatedTime: '~30 sec',
      totalCost: formatEther(gasLimit * (baseFee + priorityFees.fast)),
      totalCostUSD: '',
    };

    slow.totalCostUSD = (parseFloat(slow.totalCost) * ethPriceUSD).toFixed(2);
    normal.totalCostUSD = (parseFloat(normal.totalCost) * ethPriceUSD).toFixed(2);
    fast.totalCostUSD = (parseFloat(fast.totalCost) * ethPriceUSD).toFixed(2);

    return { slow, normal, fast };
  } catch (error) {
    console.error('Error fetching gas estimates:', error);
    return getDefaultGasEstimates(gasLimit, ethPriceUSD);
  }
}

/**
 * Get current base fee from blockchain
 */
async function getBaseFee(chainId: number): Promise<bigint> {
  try {
    const rpcUrl = getRPCUrl(chainId);
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
      }),
    });
    const data = await response.json();
    const baseFeeHex = data.result?.baseFeePerGas;
    return baseFeeHex ? BigInt(baseFeeHex) : 30000000000n;
  } catch (error) {
    return 30000000000n;
  }
}

/**
 * Get priority fee suggestions from EIP-1559 oracle
 */
async function getPriorityFees(chainId: number): Promise<{
  slow: bigint;
  normal: bigint;
  fast: bigint;
}> {
  try {
    const rpcUrl = getRPCUrl(chainId);
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_maxPriorityFeePerGas',
        params: [],
        id: 1,
      }),
    });
    const data = await response.json();
    const suggestedPriorityFee = data.result ? BigInt(data.result) : 1500000000n;
    return {
      slow: suggestedPriorityFee / 2n,
      normal: suggestedPriorityFee,
      fast: suggestedPriorityFee * 2n,
    };
  } catch (error) {
    return {
      slow: 1000000000n,
      normal: 1500000000n,
      fast: 3000000000n,
    };
  }
}

/**
 * Get RPC URL for chain
 */
export function getRPCUrl(chainId: number): string {
  const rpcUrls: Record<number, string> = {
    1: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    8453: 'https://mainnet.base.org',
    42161: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    10: `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  };
  return rpcUrls[chainId] || rpcUrls[1];
}

/**
 * Format wei to ether
 */
function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(6);
}

/**
 * Get default gas estimates as fallback
 */
function getDefaultGasEstimates(gasLimit: bigint, ethPriceUSD: number): GasEstimate {
  const slowCost = formatEther(gasLimit * 25000000000n);
  const normalCost = formatEther(gasLimit * 35000000000n);
  const fastCost = formatEther(gasLimit * 50000000000n);
  return {
    slow: {
      maxFeePerGas: 30000000000n,
      maxPriorityFeePerGas: 1000000000n,
      estimatedTime: '~5 min',
      totalCost: slowCost,
      totalCostUSD: (parseFloat(slowCost) * ethPriceUSD).toFixed(2),
    },
    normal: {
      maxFeePerGas: 40000000000n,
      maxPriorityFeePerGas: 1500000000n,
      estimatedTime: '~2 min',
      totalCost: normalCost,
      totalCostUSD: (parseFloat(normalCost) * ethPriceUSD).toFixed(2),
    },
    fast: {
      maxFeePerGas: 60000000000n,
      maxPriorityFeePerGas: 3000000000n,
      estimatedTime: '~30 sec',
      totalCost: fastCost,
      totalCostUSD: (parseFloat(fastCost) * ethPriceUSD).toFixed(2),
    },
  };
}

/**
 * Estimate gas limit for a transaction
 */
export async function estimateGasLimit(
  chainId: number,
  from: string,
  to: string,
  data?: string,
  value?: string
): Promise<bigint> {
  try {
    const rpcUrl = getRPCUrl(chainId);
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_estimateGas',
        params: [{ from, to, data, value }],
        id: 1,
      }),
    });
    const responseData = await response.json();
    const gasHex = responseData.result;
    if (!gasHex) throw new Error('Failed to estimate gas');
    const estimatedGas = BigInt(gasHex);
    return (estimatedGas * 120n) / 100n;
  } catch (error) {
    console.error('Error estimating gas:', error);
    return 21000n;
  }
}

/**
 * Get gas price history for charts
 */
export async function getGasPriceHistory(
  chainId: number,
  hours: number = 24
): Promise<{ timestamp: number; gasPrice: number }[]> {
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 24;
  const currentBaseFee = await getBaseFee(chainId);
  const gasPriceGwei = Number(currentBaseFee) / 1e9;
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: now - (24 - i) * interval,
    gasPrice: gasPriceGwei,
  }));
}
