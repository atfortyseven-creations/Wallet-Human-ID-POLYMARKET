import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNFTsForOwner, getNFTCollections, getNFTMetadata } from '@/lib/wallet/nfts';

/**
 * GET /api/wallet/nfts?address=xxx&chainId=1
 * Get NFTs for wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const chainId = searchParams.get('chainId');
    const type = searchParams.get('type'); // 'nfts' or 'collections'

    if (!walletAddress || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, chainId' },
        { status: 400 }
      );
    }

    if (type === 'collections') {
      const collections = await getNFTCollections(walletAddress, parseInt(chainId));
      return NextResponse.json({ collections });
    }

    const nfts = await getNFTsForOwner(walletAddress, parseInt(chainId));
    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/nfts/metadata
 * Get metadata for specific NFT
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contractAddress, tokenId, chainId } = body;

    if (!contractAddress || !tokenId || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const metadata = await getNFTMetadata(contractAddress, tokenId, chainId);

    return NextResponse.json({ metadata });
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT metadata' },
      { status: 500 }
    );
  }
}
