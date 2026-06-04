import axios from 'axios';
import { ChainId } from './BlockchainService';

/**
 * BridgeService
 * Integration with Li.Fi for cross-chain liquidity.
 * Supports bridging assets between Ethereum, Polygon, and Base.
 */
export class BridgeService {
  private readonly LIFI_API_URL = 'https://li.quest/v1';

  /**
   * Gets a bridge quote.
   */
  public async getQuote(
    fromChain: number,
    toChain: number,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    fromAddress: string,
    slippage: number = 0.5
  ): Promise<any> {
    try {
      const response = await axios.get(`${this.LIFI_API_URL}/quote`, {
        params: {
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount,
          fromAddress,
          slippage: slippage / 100, // Li.Fi expects decimal (0.005 for 0.5%)
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Li.Fi Quote Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch bridge quote from Li.Fi');
    }
  }

  /**
   * Constructs the bridge transaction.
   */
  public async getBridgeTransaction(
    fromChain: number,
    toChain: number,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    fromAddress: string,
    slippage: number = 0.5
  ): Promise<any> {
    const quote = await this.getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, slippage);
    
    return {
      tx: {
        to: quote.transactionRequest.to,
        data: quote.transactionRequest.data,
        value: quote.transactionRequest.value,
        gasLimit: quote.transactionRequest.gasLimit,
      },
      estimate: {
        tool: quote.tool,
        toAmount: quote.estimate.toAmount,
        toAmountMin: quote.estimate.toAmountMin,
        feeCostUSD: quote.estimate.feeCosts?.reduce((acc: number, f: any) => acc + parseFloat(f.amountUSD || '0'), 0) || 0,
        executionDuration: quote.estimate.executionDuration,
      }
    };
  }
}

export const bridgeService = new BridgeService();

