/**
 * Gas Optimization Service (EIP-1559)
 * Provides gas estimation with slow/normal/fast options
 */

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
    // Get base fee from latest block
    const baseFee = await getBaseFee(chainId);
    
    // Get priority fee suggestions
    const priorityFees = await getPriorityFees(chainId);

    // Calculate total fees for each speed
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

    // Calculate USD costs
    slow.totalCostUSD = (parseFloat(slow.totalCost) * ethPriceUSD).toFixed(2);
    normal.totalCostUSD = (parseFloat(normal.totalCost) * ethPriceUSD).toFixed(2);
    fast.totalCostUSD = (parseFloat(fast.totalCost) * ethPriceUSD).toFixed(2);

    return { slow, normal, fast };
  } catch (error) {
    console.error('Error fetching gas estimates:', error);
    
    // Fallback to default values
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
    
    return baseFeeHex ? BigInt(baseFeeHex) : 30000000000n; // 30 gwei default
  } catch (error) {
    return 30000000000n; // 30 gwei default
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

    // Create three tiers based on suggested fee
    return {
      slow: suggestedPriorityFee / 2n,       // 50% of suggested
      normal: suggestedPriorityFee,           // 100% of suggested
      fast: suggestedPriorityFee * 2n,        // 200% of suggested
    };
  } catch (error) {
    // Fallback values (in wei)
    return {
      slow: 1000000000n,   // 1 gwei
      normal: 1500000000n, // 1.5 gwei
      fast: 3000000000n,   // 3 gwei
    };
  }
}

/**
 * Get RPC URL for chain
 */
function getRPCUrl(chainId: number): string {
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
  const slowCost = formatEther(gasLimit * 25000000000n); // 25 gwei
  const normalCost = formatEther(gasLimit * 35000000000n); // 35 gwei
  const fastCost = formatEther(gasLimit * 50000000000n); // 50 gwei

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
        params: [{
          from,
          to,
          data,
          value,
        }],
        id: 1,
      }),
    });

    const responseData = await response.json();
    const gasHex = responseData.result;
    
    if (!gasHex) {
      throw new Error('Failed to estimate gas');
    }

    // Add 20% buffer for safety
    const estimatedGas = BigInt(gasHex);
    return (estimatedGas * 120n) / 100n;
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Return default gas limit for standard transfer
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
  // This would typically call a gas tracker API
  // For now, return mock data
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 24; // Hourly intervals
  
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: now - (24 - i) * interval,
    gasPrice: 20 + Math.random() * 30, // Mock data: 20-50 gwei
  }));
}
