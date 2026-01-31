import axios from 'axios';

const ONE_INCH_BASE_URL = 'https://api.1inch.dev/swap/v6.0/1';

const headers = {
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`
};

export interface QuoteParams {
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage: number;
}

export async function getSwapQuote(params: QuoteParams) {
  try {
    const response = await axios.get(`${ONE_INCH_BASE_URL}/quote`, {
      params,
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching swap quote:', error);
    throw error;
  }
}

export async function buildSwapTransaction(params: QuoteParams) {
  try {
    const response = await axios.get(`${ONE_INCH_BASE_URL}/swap`, {
      params: { ...params, disableEstimate: true }, // Disable estimate for faster response in quote phase
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error building swap tx:', error);
    throw error;
  }
}

export async function getAllowance(tokenAddress: string, walletAddress: string) {
  try {
    const response = await axios.get(`${ONE_INCH_BASE_URL}/approve/allowance`, {
      params: { tokenAddress, walletAddress },
      headers
    });
    return response.data.allowance;
  } catch (error) {
    console.error('Error fetching allowance:', error);
    return '0';
  }
}

export async function getApproveTransaction(tokenAddress: string, amount: string) {
  try {
    const response = await axios.get(`${ONE_INCH_BASE_URL}/approve/transaction`, {
      params: { tokenAddress, amount },
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching approve tx:', error);
    throw error;
  }
}
