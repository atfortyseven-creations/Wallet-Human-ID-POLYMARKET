import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Return URL for Stripe customer portal (self-service billing)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  // Native SIWE: find user by walletAddress (system ID)
  const dbUser = await prisma.user.findUnique({ where: { walletAddress: session.userId } }) as any;
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing profile found' }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/developers`,
  });

  return NextResponse.json({ url: portalSession.url });
}
