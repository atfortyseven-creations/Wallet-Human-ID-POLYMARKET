import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalClaimed = await prisma.goldenTicket.count({
      where: {
        isActive: true
      }
    });

    return NextResponse.json({ count: totalClaimed }, { status: 200 });
  } catch (error) {
    console.error('[GoldenTicket Count Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket count' }, { status: 500 });
  }
}
