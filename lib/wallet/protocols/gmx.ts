import { moralisService } from '@/lib/blockchain/MoralisService';
import { PerpPosition } from '@/types/wallet';

// Known GMX-related tokens
const GMX_TOKENS = {
  ARBITRUM: {
    GMX: '0xfc5A1A572070c061AF940603702175aD36e387b9',
    GLP: '0x4277f8F2c0Fab26D8d413340578817a58D17676e',
  },
  BASE: {
    GMX: '0x166124B27BcE640B4861F292B4500908880D5C3A',
  }
};

/**
 *  GMX DISCOVERY - MORALIS EDITION 
 */
export async function discoverGmxPositions(address: string, chainIds: number[]): Promise<PerpPosition[]> {
  const positions: PerpPosition[] = [];

  try {
    // Arbitrum Check via Moralis
    if (chainIds.includes(42161)) {
      const balances = await moralisService.getWalletBalances(address, 'arbitrum');
      
      const balancesList = balances?.result || [];
      const foundGmx = balancesList.find((b: any) => b && b.token_address?.toLowerCase() === GMX_TOKENS.ARBITRUM.GMX.toLowerCase());
      const foundGlp = balancesList.find((b: any) => b && b.token_address?.toLowerCase() === GMX_TOKENS.ARBITRUM.GLP.toLowerCase());

      if (foundGmx || foundGlp) {
        // Add positions based on balances
        if (foundGmx) {
            positions.push({
                id: `gmx-arb-staked`,
                protocol: 'GMX',
                market: 'GMX Staked',
                side: 'LONG',
                leverage: 1,
                size: parseFloat(foundGmx.balance_formatted) || 0,
                collateral: 0,
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

    return positions;
  } catch (error) {
    console.error('Error discovering GMX positions via Moralis:', error);
    return [];
  }
}

