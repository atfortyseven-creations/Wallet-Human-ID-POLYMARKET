import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * Stripe Customer Portal
 * Allows existing subscribers to manage their billing, update payment
 * methods, download invoices and cancel subscriptions.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.userId.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { walletAddress: userId },
            select: { stripeCustomerId: true, email: true }
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json({
                error: 'No billing account found. Please purchase a plan first to access the billing portal.'
            }, { status: 404 });
        }

        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/terminal?tab=dashboard`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error: any) {
        console.error('[CUSTOMER_PORTAL_ERROR]', error);
        return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 });
    }
}
