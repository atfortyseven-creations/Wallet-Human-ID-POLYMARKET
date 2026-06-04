import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/golden-ticket/stats
// Admin-only stats endpoint for the golden ticket program
export async function GET(req: NextRequest) {
  try {
    const [totalClaimed, recent, latest] = await Promise.all([
      prisma.goldenTicket.count(),
      prisma.goldenTicket.findMany({
        orderBy: { claimedAt: 'desc' },
        take: 10,
        select: {
          ticketNumber: true,
          serialCode: true,
          userAddress: true,
          twitterHandle: true,
          claimedAt: true,
        }
      }),
      prisma.goldenTicket.findFirst({
        orderBy: { claimedAt: 'desc' },
        select: { claimedAt: true, ticketNumber: true }
      })
    ]);

    return NextResponse.json({
      totalClaimed,
      latestTicket: latest?.ticketNumber || 0,
      latestClaimAt: latest?.claimedAt || null,
      recent: recent.map(t => ({
        ...t,
        userAddress: t.userAddress.slice(0, 8) + '...' + t.userAddress.slice(-6), // Anonymize
      }))
    });
  } catch (error) {
    console.error('[Golden Ticket Stats Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
