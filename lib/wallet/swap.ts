/**
 * 1inch Fusion SDK Integration
 * DEX Aggregator for best swap prices with MEV protection
 */

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  protocols: string[];
  estimatedGas: string;
  price: string;
  priceImpact: number;
  route: RouteSegment[];
}

export interface RouteSegment {
  name: string;
  part: number; // percentage of total amount
  fromTokenAmount: string;
  toTokenAmount: string;
}

export interface SwapParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  slippage: number; // 0.5 = 0.5%
  disableEstimate?: boolean;
  allowPartialFill?: boolean;
}

const INCH_API_URL = 'https://api.1inch.dev/swap/v6.0';
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';

/**
 * Get swap quote from 1inch
 */
export async function getSwapQuote(
  chainId: number,
  params: SwapParams
): Promise<SwapQuote> {
  const queryParams = new URLSearchParams({
    src: params.fromTokenAddress,
    dst: params.toTokenAddress,
    amount: params.amount,
    from: params.fromAddress,
    slippage: params.slippage.toString(),
    disableEstimate: params.disableEstimate ? 'true' : 'false',
    allowPartialFill: params.allowPartialFill ? 'true' : 'false',
  });

  const response = await fetch(
    `${INCH_API_URL}/${chainId}/quote?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get swap quote');
  }

  const data = await response.json();
  
  return {
    fromToken: params.fromTokenAddress,
    toToken: params.toTokenAddress,
    fromAmount: params.amount,
    toAmount: data.dstAmount || data.toAmount,
    protocols: data.protocols?.map((p: any) => p[0]?.name).filter(Boolean) || [],
    estimatedGas: data.estimatedGas || '0',
    price: data.dstAmount && params.amount 
      ? (BigInt(data.dstAmount) / BigInt(params.amount)).toString()
      : '0',
    priceImpact: parseFloat(data.priceImpact || '0'),
    route: parseRoute(data.protocols || []),
  };
}

/**
 * Build swap transaction
 */
export async function buildSwapTransaction(
  chainId: number,
  params: SwapParams
): Promise<{
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
}> {
  const queryParams = new URLSearchParams({
    src: params.fromTokenAddress,
    dst: params.toTokenAddress,
    amount: params.amount,
    from: params.fromAddress,
    slippage: params.slippage.toString(),
    disableEstimate: params.disableEstimate ? 'true' : 'false',
    allowPartialFill: params.allowPartialFill ? 'true' : 'false',
  });

  const response = await fetch(
    `${INCH_API_URL}/${chainId}/swap?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to build swap transaction');
  }

  const data = await response.json();
  
  return {
    to: data.tx.to,
    data: data.tx.data,
    value: data.tx.value || '0',
    gas: data.tx.gas || data.tx.gasLimit || '0',
    gasPrice: data.tx.gasPrice || '0',
  };
}

/**
 * Get supported tokens for a chain
 */
export async function getSupportedTokens(chainId: number) {
  const response = await fetch(
    `${INCH_API_URL}/${chainId}/tokens`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch supported tokens');
  }

  const data = await response.json();
  return data.tokens || {};
}

/**
 * Get token price in USD
 */
export async function getTokenPrice(
  chainId: number,
  tokenAddress: string
): Promise<number> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_KEY || '',
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data[tokenAddress.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}

/**
 * Parse route from 1inch protocols response
 */
function parseRoute(protocols: any[]): RouteSegment[] {
  if (!protocols || protocols.length === 0) return [];

  return protocols.flatMap((protocolArray: any[]) =>
    protocolArray.map(protocol => ({
      name: protocol.name || 'Unknown DEX',
      part: protocol.part || 100,
      fromTokenAmount: protocol.fromTokenAmount || '0',
      toTokenAmount: protocol.toTokenAmount || '0',
    }))
  );
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(
  expectedPrice: string,
  actualPrice: string
): number {
  const expected = parseFloat(expectedPrice);
  const actual = parseFloat(actualPrice);
  
  if (expected === 0) return 0;
  
  return ((actual - expected) / expected) * 100;
}

/**
 * Format swap route for display
 */
export function formatSwapRoute(route: RouteSegment[]): string {
  if (route.length === 0) return 'Direct';
  
  const uniqueDexes = [...new Set(route.map(r => r.name))];
  
  if (uniqueDexes.length === 1) {
    return uniqueDexes[0];
  }
  
  return uniqueDexes.join(' → ');
}
