import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';

// Helper to handle BigInt serialization from Prisma
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}
export async function GET(request: NextRequest) {
  try {
    //  Priority 1: System JWT session (human_session cookie) 
    const humanSession = request.cookies.get('human_session')?.value;
    if (humanSession) {
      try {
        const payload = await verifyJWT(humanSession);
        const walletAddress = (payload.address || payload.sub) as string | undefined;
        if (walletAddress) {
          const user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
          });
          const subscription = await prisma.subscription.findUnique({
            where: { userId: walletAddress.toLowerCase() }
          });
          const userTransactions = await prisma.transaction.findMany({
            where: { fromAddress: walletAddress.toLowerCase(), type: 'SUBSCRIPTION_PAYMENT' },
            orderBy: { timestamp: 'desc' }
          });
          return NextResponse.json(serializeData({
            authenticated: true,
            user: {
              id: walletAddress,
              email: user?.email || '',
              tier: user?.tier || (payload.tier as string) || 'FREE',
              isZkVerified: user?.isZkVerified || false,
              humanityScore: user?.humanityScore || 0,
              walletAddress: walletAddress.toLowerCase(),
              subscription: subscription || null,
              transactions: userTransactions || [],
            },
          }));
        }
      } catch {
        // JWT expired or invalid  fall through
      }
    }

    //  Priority 2: system_handshake cookie (raw wallet address) 
    const handshake = request.cookies.get('system_handshake')?.value;
    if (handshake && /^0x[a-fA-F0-9]{40}$/.test(handshake)) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: handshake.toLowerCase() },
      });
      const subscription = await prisma.subscription.findUnique({
        where: { userId: handshake.toLowerCase() }
      });
      const userTransactions = await prisma.transaction.findMany({
        where: { fromAddress: handshake.toLowerCase(), type: 'SUBSCRIPTION_PAYMENT' },
        orderBy: { timestamp: 'desc' }
      });
      return NextResponse.json(serializeData({
        authenticated: !!user,
        user: user
          ? { 
              id: handshake, 
              email: user.email || '', 
              tier: user.tier, 
              isZkVerified: user.isZkVerified,
              humanityScore: user.humanityScore, 
              walletAddress: user.walletAddress, 
              subscription: subscription, 
              transactions: userTransactions 
            }
          : null,
      }));
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

