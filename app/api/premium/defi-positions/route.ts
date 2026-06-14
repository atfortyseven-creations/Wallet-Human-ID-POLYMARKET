import { NextRequest, NextResponse } from 'next/server';
import { defiPositionsService } from '@/lib/blockchain/DeFiPositionsService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    const address = session.userId;

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

