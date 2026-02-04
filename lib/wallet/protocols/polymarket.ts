import { Alchemy, Network } from 'alchemy-sdk';
import { PredictionPosition } from '@/types/wallet';

const POLYGON_ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY;
const CTF_CONTRACT = '0x4D970a14611C8BB70c3024832c3b841BC2F5d873';

export async function discoverPolymarketPositions(address: string): Promise<PredictionPosition[]> {
  try {
    const alchemy = new Alchemy({
      apiKey: POLYGON_ALCHEMY_KEY,
      network: Network.MATIC_MAINNET,
    });

    // Fetch ERC1155 tokens (CTF positions are ERC1155)
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      contractAddresses: [CTF_CONTRACT],
    });

    if (!nfts.ownedNfts || nfts.ownedNfts.length === 0) {
      return [];
    }

    const positions: PredictionPosition[] = await Promise.all(
      nfts.ownedNfts.map(async (nft) => {
        const shares = parseFloat(nft.balance || '0');
        if (shares === 0) return null;

        // In a real production environment, we would fetch market metadata from the Polymarket API 
        // using the token ID (which maps to a question/outcome).
        // For this implementation, we extract what we can from the NFT metadata provided by Alchemy.
        
        const marketTitle = nft.name || nft.description || 'Unknown Prediction Market';
        const outcome = nft.rawMetadata?.attributes?.find((a: any) => a.trait_type === 'Outcome')?.value || 'YES/NO';
        
        // Mocking price/value calculations for now as Polymarket requires a specific orderbook API 
        // to get real-time share prices, but we show the real shares and market title.
        // A common price is 0.50 if unknown.
        const currentPrice = 0.5; 
        
        return {
          id: `poly-${nft.tokenId}`,
          protocol: 'Polymarket',
          marketTitle: marketTitle,
          outcome: outcome,
          shares: shares,
          avgPrice: 0.5, // Heuristic if unknown
          currentPrice: currentPrice,
          value: shares * currentPrice,
          pnl: 0,
          pnlPercent: 0,
          chainId: 137,
        };
      })
    );

    return positions.filter((p): p is PredictionPosition => p !== null);
  } catch (error) {
    console.error('Error discovering Polymarket positions:', error);
    return [];
  }
}
