import { NextRequest, NextResponse } from 'next/server';
import { getInstitutionalTokens } from '@/lib/wallet/tokens';

/**
 * GET /api/wallet/tokens/institutional?chainId=1
 * Get curated institutional-grade tokens for a chain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId');

    if (!chainId) {
      return NextResponse.json(
        { error: 'Missing required parameter: chainId' },
        { status: 400 }
      );
    }

    const tokens = await getInstitutionalTokens(parseInt(chainId));

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching institutional tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutional tokens' },
      { status: 500 }
    );
  }
}
