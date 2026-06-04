import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Stripe Webhook Handler (The "Switchboard")
 * Strictly handles the confirmation of Elite payments and triggers database updates.
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error(`[WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle high-priority payment events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as any;
            const userId = session.metadata?.userId || session.metadata?.system_user_id;
            const tier = (session.metadata?.tier || session.metadata?.plan_id) as string;
            const billingCycle = session.metadata?.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';

            if (session.payment_status !== 'paid') {
                console.log(`[CHECKOUT_UNPAID] Session ${session.id} is unpaid. Waiting for invoice.payment_succeeded.`);
                break;
            }

            if (userId && tier) {
                console.log(`[PAYMENT_SUCCESS] Activating ${tier} for User Identity: ${userId} (${billingCycle})`);
                
                // SIWE-native: userId is always a walletAddress
                const userRecord = await prisma.user.findUnique({
                    where: { walletAddress: userId }
                });

                const finalUserId = userRecord?.walletAddress || userId;

                // Calculate correct expiration date based on billing cycle
                const daysToAdd = billingCycle === 'ANNUAL' ? 365 : 30;
                const newExpiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

                // Atomically update subscription status in database
                await prisma.subscription.upsert({
                    where: { userId: finalUserId },
                    update: {
                        tier: tier,
                        status: 'ACTIVE',
                        expiresAt: newExpiresAt,
                        updatedAt: new Date()
                    },
                    create: {
                        userId: finalUserId,
                        tier: tier,
                        status: 'ACTIVE',
                        expiresAt: newExpiresAt
                    }
                });

                const stripeCustomerId = session.customer as string;
                const stripeSubscriptionId = session.subscription as string;

                // [CRITICAL BUGFIX] - Update User Entity
                // The JWT minter (wallet/sync) reads from User.tier, NOT Subscription.tier
                // If we don't update User.tier, the user remains FREE after paying.
                // We also save the Stripe Customer ID so the Customer Portal works.
                await prisma.user.update({
                    where: { walletAddress: finalUserId },
                    data: { 
                        tier: tier,
                        stripeCustomerId: stripeCustomerId || undefined
                    }
                });

                // Clear Redis cache so middleware immediately recognizes the premium tier
                try {
                    const { safeRedisSet } = await import('@/lib/redis/client');
                    await safeRedisSet(`tier:${finalUserId}`, JSON.stringify({
                        tier: tier,
                        kycStatus: 'UNVERIFIED',
                        humanityScore: 0
                    }), 'EX', 600);
                } catch(e) {
                    console.error('[WEBHOOK] Failed to update Redis cache for tier:', e);
                }
            }
            break;

        case 'customer.subscription.deleted':
            const subscription = event.data.object as any;
            let subUserId = subscription.metadata?.userId || subscription.metadata?.system_user_id;

            // Fallback: Automated cancellations might strip metadata. Lookup by Customer ID.
            if (!subUserId && subscription.customer) {
                const userBySub = await prisma.user.findFirst({
                    where: { stripeCustomerId: subscription.customer as string },
                    select: { walletAddress: true }
                });
                subUserId = userBySub?.walletAddress;
            }

            if (subUserId) {
                console.log(`[SUBSCRIPTION_CANCELLED] Revoking access for User: ${subUserId}`);
                await prisma.subscription.update({
                    where: { userId: subUserId },
                    data: { tier: 'FREE', status: 'CANCELLED' }
                });
                
                await prisma.user.update({
                    where: { walletAddress: subUserId },
                    data: { tier: 'FREE' }
                });
                
                // Clear Redis cache on downgrade
                try {
                    const { redisClient } = await import('@/lib/redis/client');
                    await redisClient.del(`tier:${subUserId}`);
                } catch(e) {}
            }
            break;

        case 'customer.subscription.updated':
            const updatedSub = event.data.object as any;
            let updatedUserId = updatedSub.metadata?.userId || updatedSub.metadata?.system_user_id;
            const updatedTier = updatedSub.metadata?.tier || updatedSub.metadata?.plan_id;

            // Fallback: Automated updates might strip metadata. Lookup by Customer ID.
            if (!updatedUserId && updatedSub.customer) {
                const userBySub = await prisma.user.findFirst({
                    where: { stripeCustomerId: updatedSub.customer as string },
                    select: { walletAddress: true }
                });
                updatedUserId = userBySub?.walletAddress;
            }

            // Only process if we have a user and we know the tier (if tier is missing, it's just a billing update)
            if (updatedUserId && updatedTier) {
                const newExpiresAt = new Date(updatedSub.current_period_end * 1000);
                const status = (updatedSub.status === 'active' || updatedSub.status === 'trialing') ? 'ACTIVE' : 'PAST_DUE';

                console.log(`[SUBSCRIPTION_UPDATED] User ${updatedUserId} updated to ${updatedTier} (Status: ${status})`);

                await prisma.subscription.updateMany({
                    where: { userId: { equals: updatedUserId, mode: 'insensitive' } },
                    data: {
                        tier: updatedTier,
                        status: status,
                        expiresAt: newExpiresAt,
                        updatedAt: new Date()
                    }
                });

                if (status === 'ACTIVE') {
                    await prisma.user.updateMany({
                        where: { walletAddress: { equals: updatedUserId, mode: 'insensitive' } },
                        data: { tier: updatedTier }
                    });
                }
            }
            break;

        case 'invoice.payment_succeeded':
            const invoice = event.data.object as any;
            if (invoice.subscription) {
                try {
                    // Fetch the subscription to get the reliable end date and metadata
                    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
                    const subUserId = subscription.metadata?.userId || subscription.metadata?.system_user_id;
                    const tier = subscription.metadata?.tier || subscription.metadata?.plan_id;

                    if (subUserId && tier) {
                        const newExpiresAt = new Date((subscription as any).current_period_end * 1000);
                        
                        console.log(`[INVOICE_SUCCESS] Extending ${tier} for User: ${subUserId} until ${newExpiresAt}`);
                        
                        await prisma.subscription.updateMany({
                            where: { userId: { equals: subUserId, mode: 'insensitive' } },
                            data: {
                                status: 'ACTIVE',
                                expiresAt: newExpiresAt,
                                updatedAt: new Date()
                            }
                        });
                        
                        await prisma.user.updateMany({
                            where: { walletAddress: { equals: subUserId, mode: 'insensitive' } },
                            data: { tier: tier }
                        });
                    }
                } catch (e) {
                    console.error('[INVOICE_SUCCESS_ERROR] Failed to process recurring payment', e);
                }
            }
            break;

        default:
            console.log(`[WEBHOOK_INFO] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}


