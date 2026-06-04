import axios from 'axios';

const LIFI_API = 'https://li.quest/v1';

export interface LiFiQuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress?: string;
  slippage?: number;
}

export class LiFiService {
  /**
   * Get best route for swap/bridge
   */
  async getQuote(req: LiFiQuoteRequest) {
    try {
      const response = await axios.get(`${LIFI_API}/quote`, {
        params: {
          fromChain: req.fromChain,
          toChain: req.toChain,
          fromToken: req.fromToken,
          toToken: req.toToken,
          fromAmount: req.fromAmount,
          fromAddress: req.fromAddress,
          toAddress: req.toAddress || req.fromAddress,
          slippage: req.slippage || 0.005,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('[LiFi] Quote Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get route from Li.Fi');
    }
  }

  /**
   * Get transaction status
   */
  async getStatus(bridge: string, fromChain: number, toChain: number, txHash: string) {
    try {
      const response = await axios.get(`${LIFI_API}/status`, {
        params: { bridge, fromChain, toChain, txHash }
      });
      return response.data;
    } catch (error: any) {
      console.error('[LiFi] Status Error:', error.message);
      return null;
    }
  }

  /**
   * Monitor a cross-chain transaction until completion
   */
  async monitorTransaction(txHash: string, fromChain: number, toChain: number, bridge: string) {
    console.log(`[LiFi] Monitoring ${txHash} on ${fromChain} -> ${toChain}...`);
    
    // Polling logic
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const status = await this.getStatus(bridge, fromChain, toChain, txHash);
        if (status && (status.status === 'DONE' || status.status === 'FAILED')) {
          clearInterval(interval);
          resolve(status);
        }
      }, 10000); // Poll every 10s
    });
  }
}

export const lifiService = new LiFiService();

