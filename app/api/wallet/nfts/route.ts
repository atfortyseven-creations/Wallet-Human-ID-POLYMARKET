import { NextRequest, NextResponse } from 'next/server';
import { portfolioService } from '@/lib/blockchain/PortfolioService';
import { ChainId } from '@/lib/blockchain/BlockchainService';

/**
 * GET /api/wallet/nfts
 * Fetches NFTs for an address across specified chains.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });
    
    // Default to ETH Mainnet, Polygon, Base only for NFTs to save RPC
    const chainIds = searchParams.get('chainIds')
        ? searchParams.get('chainIds')!.split(',').map(id => parseInt(id))
        : [ChainId.MAINNET, ChainId.POLYGON, ChainId.BASE];

    const promises = chainIds.map(chainId => 
        portfolioService.getNFTs(chainId, address).then(nfts => ({ chainId, nfts }))
    );

    const results = await Promise.all(promises);
    
    // Flatten
    const allNfts = results.flatMap(r => r.nfts.map((nft: any) => ({ ...nft, chainId: r.chainId })));

    return NextResponse.json({ nfts: allNfts });
  } catch (error: any) {
    console.error('NFT API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs', nfts: [] });
  }
}

