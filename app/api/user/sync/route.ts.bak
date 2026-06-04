import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { airdropWelcomeQDs } from '@/lib/blockchain/AirdropService';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { walletAddress, settings } = body;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // [LEGENDARY PERSISTENCE] Unify AuthUser, User, and Wallet
    const authUser = await prisma.authUser.update({
      where: { email: session.user.email },
      data: {
        walletAddress: walletAddress || undefined,
      },
    });

    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress || authUser.walletAddress || '' },
    });

    let newlyCreated = false;
    if (!user && (walletAddress || authUser.walletAddress)) {
      try {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress || authUser.walletAddress || '',
            email: authUser.email,
            tier: 'HUMAN',
          },
        });
        newlyCreated = true;
      } catch (e) {
        // Race condition fallback
        user = await prisma.user.findUnique({
          where: { walletAddress: walletAddress || authUser.walletAddress || '' },
        });
      }
    }

    if (newlyCreated && user?.walletAddress) {
        // Asynchronous non-blocking call to prevent API freezes
        airdropWelcomeQDs(user.walletAddress).catch(console.error);
    }

    if (user && settings) {
      await prisma.userSettings.upsert({
        where: { userId: user.walletAddress },
        update: {
          theme: settings.theme,
          language: settings.language,
          currency: settings.currency,
        },
        create: {
          userId: user.walletAddress,
          theme: settings.theme || 'dark',
          language: settings.language || 'es',
          currency: settings.currency || 'USD',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
      authUser: {
          email: authUser.email,
          name: authUser.name,
          walletAddress: authUser.walletAddress
      }
    });

  } catch (error: any) {
    console.error('User Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

