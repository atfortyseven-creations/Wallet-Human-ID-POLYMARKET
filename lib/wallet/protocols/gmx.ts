import { Alchemy, Network } from 'alchemy-sdk';
import { PerpPosition } from '@/types/wallet';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY;

// Known GMX-related tokens
const GMX_TOKENS = {
  ARBITRUM: {
    GMX: '0xfc5A1A572070c061AF940603702175aD36e387b9',
    GLP: '0x4277f8F2c0Fab26D8d413340578817a58D17676e',
  },
  BASE: {
    GMX: '0x166124B27BcE640B4861F292B4500908880D5C3A', // Approx
  }
};

export async function discoverGmxPositions(address: string, chainIds: number[]): Promise<PerpPosition[]> {
  const positions: PerpPosition[] = [];

  try {
    // Arbitrum Check
    if (chainIds.includes(42161)) {
      const alchemyArb = new Alchemy({ 
        apiKey: ALCHEMY_KEY, 
        network: Network.ARB_MAINNET,
        maxRetries: 3,
        requestTimeout: 10000 
      });
      const balances = await alchemyArb.core.getTokenBalances(address, [GMX_TOKENS.ARBITRUM.GMX, GMX_TOKENS.ARBITRUM.GLP]);
      
      for (const b of balances.tokenBalances) {
        const balance = BigInt(b.tokenBalance || '0');
        if (balance > 0n) {
          const isGmx = b.contractAddress.toLowerCase() === GMX_TOKENS.ARBITRUM.GMX.toLowerCase();
          const amount = Number(balance) / 1e18;
          
          positions.push({
            id: `gmx-arb-${isGmx ? 'gmx' : 'glp'}`,
            protocol: 'GMX',
            market: isGmx ? 'GMX Staked' : 'GLP Portfolio',
            side: 'LONG', // GLP is effectively a long basket
            leverage: 1,
            size: amount,
            collateral: 0, // Simplified for now
            entryPrice: 0,
            currentPrice: 0,
            liquidationPrice: 0,
            pnl: 0,
            pnlPercent: 0,
            chainId: 42161
          });
        }
      }
    }

    // Base Check
    if (chainIds.includes(8453)) {
      // Similar logic for Base if applicable
    }

    return positions;
  } catch (error) {
    console.error('Error discovering GMX positions:', error);
    return [];
  }
}
