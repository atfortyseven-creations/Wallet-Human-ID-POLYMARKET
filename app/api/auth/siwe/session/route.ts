import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('humanity_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let sessionId;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('[SIWE Session] JWT_SECRET is not set — rejecting request.');
        return NextResponse.json({ authenticated: false }, { status: 500 });
      }
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      sessionId = (payload.sessionId ?? payload.sid) as string;
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await prisma.humanitySession.findUnique({
      where: { sessionId },
      include: { identity: true }
    });

    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Update lastSeenAt asynchronously
    prisma.humanitySession.update({
      where: { sessionId },
      data: { lastSeenAt: new Date() }
    }).catch(() => {});

    return NextResponse.json({
      authenticated: true,
      identity: {
        id: session.identity.id,
        address: session.identity.walletAddress,
        permissions: session.identity.permissions,
        type: session.identity.walletType,
        verified: session.identity.verificationStatus
      },
      session: {
        id: session.sessionId,
        method: session.authenticationMethod,
        expiresAt: session.expiresAt
      }
    });

  } catch (error: any) {
    console.error('[SIWE-SESSION] Error:', error.message);
    return NextResponse.json({ authenticated: false, error: 'Internal server error' }, { status: 500 });
  }
}
