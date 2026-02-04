import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { discoverTokens, searchTokens, getTokenMetadata, getTokenBalance } from '@/lib/wallet/tokens';

/**
 * GET /api/wallet/tokens?address=xxx&chainId=1
 * Discover all tokens for a wallet address
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
    const query = searchParams.get('query'); // For search

    if (!walletAddress || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, chainId' },
        { status: 400 }
      );
    }

    // Search mode
    if (query) {
      const tokens = await searchTokens(query, parseInt(chainId));
      return NextResponse.json({ tokens });
    }

    // Discovery mode
    const tokens = await discoverTokens(walletAddress, parseInt(chainId));

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallet/tokens/metadata
 * Get metadata for a specific token
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tokenAddress, chainId } = body;

    if (!tokenAddress || !chainId) {
      return NextResponse.json(
        { error: 'Missing required parameters: tokenAddress, chainId' },
        { status: 400 }
      );
    }

    const metadata = await getTokenMetadata(tokenAddress, chainId);

    return NextResponse.json({ metadata });
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token metadata' },
      { status: 500 }
    );
  }
}
