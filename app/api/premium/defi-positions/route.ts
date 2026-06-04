import { NextRequest, NextResponse } from 'next/server';
import { defiPositionsService } from '@/lib/blockchain/DeFiPositionsService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching DeFi positions for ${address.slice(0, 10)}...`);

    const positions = await defiPositionsService.getPositions(address);

    return NextResponse.json(positions);
  } catch (error: any) {
    console.error('[API] DeFi positions fetch failed:', error);
    return NextResponse.json(
      { 
        error: 'FETCH_FAILED',
        message: error?.message || 'Failed to fetch DeFi positions',
        totalValueUsd: 0,
        protocols: [],
        positions: []
      },
      { status: 500 }
    );
  }
}

