import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// GET /api/auth/me  Returns the system authenticated user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.email;

    if (!email) {
      return NextResponse.json({ error: 'Session email not found' }, { status: 400 });
    }

    // Sync SIWE session with AuthUser record
    let authUser: any = null;
    try {
      authUser = await prisma.authUser.findUnique({ where: { email } });

      if (!authUser) {
        // Create a new AuthUser entry on first SIWE login
        authUser = await prisma.authUser.create({
          data: {
            email,
            walletAddress: session.userId, // SIWE userId IS the wallet address
          }
        });
      }

      const hasPasskey = (await (prisma as any).authenticator.count({ where: { userId: authUser.id } })) > 0;

      return NextResponse.json({
        id: authUser.id,
        email: authUser.email,
        walletAddress: authUser.walletAddress,
        hasPasskey,
      });

    } catch (dbError: any) {
      console.warn('[AUTH_ME_SYNC] DB Sync Failed, returning basic session data.', dbError.message);
      return NextResponse.json({
        id: session.userId,
        email,
        walletAddress: session.userId,
        hasPasskey: false,
        isFallback: true,
        warning: 'Temporary session. Database unreachable.'
      });
    }

  } catch (error: any) {
    console.error('Fatal auth error:', error);
    return NextResponse.json({ error: 'Auth service down' }, { status: 503 });
  }
}
