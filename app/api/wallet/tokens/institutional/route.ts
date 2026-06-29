import { NextRequest, NextResponse } from 'next/server';
import { getInstitutionalTokens } from '@/lib/wallet/tokens';

/**
 * GET /api/wallet/tokens/sovereign?chainId=1
 * Get curated sovereign-grade tokens for a chain
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
    console.error('Error fetching sovereign tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sovereign tokens' },
      { status: 500 }
    );
  }
}
