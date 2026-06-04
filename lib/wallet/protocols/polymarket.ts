import { moralisService } from '@/lib/blockchain/MoralisService';
import { PredictionPosition } from '@/types/wallet';

const CTF_CONTRACT = '0x4D970a14611C8BB70c3024832c3b841BC2F5d873';

/**
 *  POLYMARKET DISCOVERY - MORALIS EDITION 
 */
export async function discoverPolymarketPositions(address: string): Promise<PredictionPosition[]> {
  try {
    // Fetch ERC1155 tokens on Polygon (CTF positions are ERC1155)
    const nfts = (await moralisService.getWalletNFTs(address, 'polygon')) as unknown as any[];

    // Filter for CTF contract
    const polyNFTs = nfts?.filter((nft: any) => nft.contract.toLowerCase() === CTF_CONTRACT.toLowerCase());

    if (!polyNFTs || polyNFTs.length === 0) {
      return [];
    }

    const positions: PredictionPosition[] = polyNFTs.map((nft: any) => {
      const shares = parseFloat(nft.amount || '0');
      if (shares === 0) return null;

      const marketTitle = nft.name || nft.description || 'Unknown Prediction Market';
      // Moralis metadata parsing
      const outcome = nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Outcome')?.value || 'YES/NO';
      
      const currentPrice = 0.5; 
      
      return {
        id: `poly-${nft.tokenId}`,
        protocol: 'Polymarket',
        marketTitle: marketTitle,
        outcome: outcome,
        shares: shares,
        avgPrice: 0.5, 
        currentPrice: currentPrice,
        value: shares * currentPrice,
        pnl: 0,
        pnlPercent: 0,
        chainId: 137,
      };
    })?.filter((p: any) => p !== null) as PredictionPosition[];

    return positions;
  } catch (error) {
    console.error('Error discovering Polymarket positions via Moralis:', error);
    return [];
  }
}

