import { NextRequest, NextResponse } from 'next/server';
import { getLegendaryStats } from '@/lib/stats-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    const stats = await getLegendaryStats(address);
    if (!stats) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({
        address,
        ...stats
    });

  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

