import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId } = await req.json();

    // Get or create Stripe customer
    let customerId = user.publicMetadata.stripeCustomerId as string | undefined;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        metadata: {
          clerkUserId: user.id,
        },
      });
      customerId = customer.id;
      
      // Update Clerk user metadata
      // Note: You'll need to update this via Clerk API or webhook
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?canceled=true`,
      metadata: {
        clerkUserId: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[API ERROR] Create checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
