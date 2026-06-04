import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Fetch the last 30 days of snapshots
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const history = await prisma.portfolioSnapshot.findMany({
      where: {
        userId: address.toLowerCase(),
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('[API] Portfolio history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio history', details: error.message }, 
      { status: 500 }
    );
  }
}

