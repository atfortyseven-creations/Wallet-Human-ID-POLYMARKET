import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const passportId = resolvedParams.slug;

  try {
    const passport = await prisma.productPassport.findUnique({
      where: { id: passportId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!passport) {
      return NextResponse.json({ error: 'Passport not found' }, { status: 404 });
    }

    // Determine status from the latest event or txHash presence
    let status = 'PENDING';
    
    // Check if it's already confirmed
    if (passport.txHash) {
      status = 'CONFIRMED';
    } else if (passport.events && passport.events.length > 0) {
      const latestEvent = passport.events[0];
      if (latestEvent.eventType === 'AZTEC_SEQUENCER_UPDATE') {
        const payloadStatus = (latestEvent.payload as any)?.status;
        if (payloadStatus) {
          status = payloadStatus;
        }
      }
    }

    return NextResponse.json({
      id: passport.id,
      slug: passport.publicSlug,
      txHash: passport.txHash,
      status: status
    });
  } catch (error) {
    console.error('[API] Error fetching passport status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
