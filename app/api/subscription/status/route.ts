import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe with dummy key for build time if missing
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_123456789';
const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has active subscription in Stripe
    const customerId = user.publicMetadata.stripeCustomerId as string | undefined;
    
    if (!customerId) {
      return NextResponse.json({
        isPremium: false,
        tier: 'FREE',
        message: 'No subscription found'
      });
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        isPremium: false,
        tier: 'FREE',
        message: 'No active subscription'
      });
    }

    const subscription = subscriptions.data[0];
    
    return NextResponse.json({
      isPremium: true,
      tier: 'PREMIUM',
      subscriptionId: subscription.id,
      currentPeriodEnd: (subscription as any).current_period_end || 0,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('[API ERROR] Subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
