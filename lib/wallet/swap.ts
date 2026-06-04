import axios from 'axios';
// @ts-ignore
import qs from 'qs';

// 0x API configuration
const getBaseUrl = (chainId: number) => {
  switch (chainId) {
    case 1: return 'https://api.0x.org/swap/v1'; // Ethereum
    case 137: return 'https://polygon.api.0x.org/swap/v1'; // Polygon
    case 8453: return 'https://base.api.0x.org/swap/v1'; // Base
    case 10: return 'https://optimism.api.0x.org/swap/v1'; // Optimism
    case 42161: return 'https://arbitrum.api.0x.org/swap/v1'; // Arbitrum
    default: return 'https://api.0x.org/swap/v1';
  }
};

const getHeaders = () => ({
  '0x-api-key': process.env.NEXT_PUBLIC_ZEROEX_API_KEY || process.env.ZEROEX_API_KEY
});

export interface SwapParams {
  src: string; // Token Address (0x implementation expects addresses usually)
  dst: string; // Token Address
  amount: string; // Atomic units
  from: string; // Taker Address
  slippage: number; // Percentage (e.g. 0.5 for 0.5%)
}

export interface SwapQuote {
  price: string;
  toAmount: string;
  priceImpact: number;
  route: any[]; // Flexible for now
  data: string; // Tx data
  value: string; // Tx value
  gas: string; // Estimated gas
  estimatedGas: string; 
  buyAmount: string; // 0x specific
  sellAmount: string;
}

export function formatSwapRoute(route: any[]) {
    if (!route || route.length === 0) return 'Direct Swap';
    return route.map(r => r.name || 'Pool').join(' > ');
}

export async function getSwapQuote(chainId: number, params: SwapParams) {
  try {
    const url = `${getBaseUrl(chainId)}/quote`;
    // 0x expects sellToken, buyToken, sellAmount
    const queryParams: any = {
      sellToken: params.src,
      buyToken: params.dst,
      sellAmount: params.amount,
      takerAddress: params.from,
      slippagePercentage: (params.slippage / 100).toString(), // 0x uses fractional
    };

    // Monetization: Add affiliate fee if configured
    // Enforcing dynamic multi-chain fee routing as requested
    const FEE_RECIPIENTS: Record<number, string> = {
        1: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Ethereum
        137: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Polygon
        8453: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Base
        10: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Optimism
        42161: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Arbitrum
        56: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // BNB Chain
        43114: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Avalanche
        214: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // World Chain
        59144: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Linea
        80002: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Amoy
        84532: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Base Sepolia
        421614: '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a', // Arbitrum Sepolia
    };
    
    // Default to the provided EVM wallet if chain not explicitly listed but it's EVM
    const feeRecipient = FEE_RECIPIENTS[chainId] || '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a';
    const feePercentage = process.env.NEXT_PUBLIC_AFFILIATE_FEE_PERCENTAGE || '0.01'; // Default to 1% if undefined

    if (feeRecipient && feePercentage && feeRecipient !== '0x0000000000000000000000000000000000000000') {
        queryParams.buyTokenPercentageFee = feePercentage;
        queryParams.feeRecipient = feeRecipient;
    }

    const response = await axios.get(`${url}?${qs.stringify(queryParams)}`, {
      headers: getHeaders()
    });
    
    // Normalize response to generic structure if needed, or return as is and handle in frontend
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching 0x swap quote for chain ${chainId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.reason || 'Failed to fetch swap quote');
  }
}

// 0x "quote" endpoint returns the transaction data directly suitable for signing
// So getSwapQuote essentially returns what we need for execution too.
// But we keep this wrapper for compatibility with existing architecture.
export async function buildSwapTransaction(chainId: number, params: SwapParams) {
  // For 0x, the quote endpoint with takerAddress provides the tx data.
  // We can just reuse getSwapQuote logic but maybe with specific flags if 0x has them?
  // 0x /quote IS the build transaction endpoint effectively when takerAddress is provided.
  return getSwapQuote(chainId, params);
}

// 0x doesn't have a direct "allowance" endpoint in the swap API v1 usually?
// Typically we use standard ERC20 contract calls for allowance.
// But 0x response includes `allowanceTarget` to approve.
// We'll keep these helpers but might need to implement them via web3/ethers if API doesn't provide them standalone.
// For now, removing them or mocking them as 0x typically handles this check client side or returns error.
// Actually, let's leave them returning safe defaults or TODOs as 0x focuses on the swap payload.
// Updated strategy: The frontend usually checks allowance via wagmi/viem. 
// If we MUST have server-side allowance check, we need an RPC provider here.
// For the sake of this migration, we will remove these specific 1inch-centric helper functions 
// and rely on the main `getSwapQuote` returning the `allowanceTarget`.

export async function getAllowance(chainId: number, tokenAddress: string, walletAddress: string) {
    // Zero-Mock: Throw explicitly instead of returning fake '0'
    throw new Error('AWAITING_GETBLOCK_RPC: Server-side on-chain allowance checks require fully integrated RPC nodes. Perform this check strictly client-side via viem/wagmi for now.');
}

export async function getApproveTransaction(chainId: number, tokenAddress: string, amount: string) {
    // Zero-Mock: Throw explicitly instead of returning dummy '0x' data
    throw new Error('AWAITING_GETBLOCK_RPC: Server-side TX construction requires integrated RPC. 0x quote provides allowanceTarget directly.');
}


