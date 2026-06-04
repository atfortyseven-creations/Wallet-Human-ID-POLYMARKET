import axios from 'axios';
import { ChainId, blockchainService } from './BlockchainService';

/**
 * SwapService
 * Integration with 1inch/0x Aggregators.
 * Provides real quotes and constructs calldata for decentralized swaps.
 */
export class SwapService {
  private readonly ONEINCH_API_URL = 'https://api.1inch.dev/swap/v6.0';
  private readonly ZER0X_API_URL = 'https://api.0x.org/swap/v1';
  private readonly apiKey: string;
  private readonly zeroXApiKey: string;

  constructor(apiKey: string, zeroXApiKey: string = '') {
    this.apiKey = apiKey;
    this.zeroXApiKey = zeroXApiKey;
  }

  /**
   * Gets a quote for a swap.
   */
  public async getQuote(
    chainId: ChainId,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string
  ): Promise<any> {
    const url = `${this.ONEINCH_API_URL}/${chainId}/quote`;
    try {
      const response = await axios.get(url, {
        params: {
          src: fromTokenAddress,
          dst: toTokenAddress,
          amount: amount,
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('1inch Quote Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch swap quote.');
    }
  }

  /**
   * Constructs the swap transaction calldata.
   */
  public async getSwapTransaction(
    chainId: ChainId,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string,
    slippage: number = 1
  ): Promise<any> {
    try {
      // Primary: 1inch
      const txData = await this.get1inchSwap(chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage);
      
      // Elite Safety: Pre-execution Prediction
      await blockchainService.predictTransaction(chainId, {
        from: fromAddress,
        to: txData.tx.to,
        data: txData.tx.data,
        value: txData.tx.value,
      });

      return txData;
    } catch (e) {
      console.warn('[SwapService] Primary execution path failed or unsafe, falling back to secondary...');
      // Secondary: 0x Fallback
      const txData = await this.get0xSwap(chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage);
      
      // Mandatory validation for fallback too
      await blockchainService.predictTransaction(chainId, {
        from: fromAddress,
        to: txData.tx.to,
        data: txData.tx.data,
        value: txData.tx.value,
      });

      return txData;
    }
  }

  private async get1inchSwap(chainId: ChainId, src: string, dst: string, amount: string, from: string, slippage: number) {
    const url = `${this.ONEINCH_API_URL}/${chainId}/swap`;
    const response = await axios.get(url, {
      params: { src, dst, amount, from, slippage, disableEstimate: true },
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    return response.data;
  }

  private async get0xSwap(chainId: ChainId, src: string, dst: string, amount: string, from: string, slippage: number) {
    const url = `${this.ZER0X_API_URL}/quote`;
    const response = await axios.get(url, {
      params: { buyToken: dst, sellToken: src, sellAmount: amount, takerAddress: from, slippagePercentage: slippage / 100 },
      headers: { '0x-api-key': this.zeroXApiKey }
    });
    return {
      tx: {
        to: response.data.to,
        data: response.data.data,
        value: response.data.value,
        gasPrice: response.data.gasPrice,
      },
      toAmount: response.data.buyAmount
    };
  }
}

export const swapService = new SwapService(
  process.env.ONEINCH_API_KEY || '',
  process.env.ZEROX_API_KEY || ''
);

