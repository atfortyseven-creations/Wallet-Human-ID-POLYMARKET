import axios from 'axios';

const getBaseUrl = (chainId: number) => `https://api.1inch.dev/swap/v6.0/${chainId}`;

const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.ONEINCH_API_KEY || process.env.NEXT_PUBLIC_1INCH_API_KEY}`
});

export interface SwapParams {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
}

export async function getSwapQuote(chainId: number, params: SwapParams) {
  try {
    const response = await axios.get(`${getBaseUrl(chainId)}/quote`, {
      params,
      headers: getHeaders()
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching swap quote for chain ${chainId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.description || 'Failed to fetch swap quote');
  }
}

export async function buildSwapTransaction(chainId: number, params: SwapParams) {
  try {
    const response = await axios.get(`${getBaseUrl(chainId)}/swap`, {
      params: { ...params, disableEstimate: true },
      headers: getHeaders()
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error building swap tx for chain ${chainId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.description || 'Failed to build swap transaction');
  }
}

export async function getAllowance(chainId: number, tokenAddress: string, walletAddress: string) {
  try {
    const response = await axios.get(`${getBaseUrl(chainId)}/approve/allowance`, {
      params: { tokenAddress, walletAddress },
      headers: getHeaders()
    });
    return response.data.allowance;
  } catch (error: any) {
    console.error(`Error fetching allowance for chain ${chainId}:`, error.response?.data || error.message);
    return '0';
  }
}

export async function getApproveTransaction(chainId: number, tokenAddress: string, amount: string) {
  try {
    const response = await axios.get(`${getBaseUrl(chainId)}/approve/transaction`, {
      params: { tokenAddress, amount },
      headers: getHeaders()
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching approve tx for chain ${chainId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.description || 'Failed to fetch approve transaction');
  }
}
