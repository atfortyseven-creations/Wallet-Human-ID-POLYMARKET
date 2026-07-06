import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { planName, priceStr } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Missing STRIPE_SECRET_KEY. Returning mock session.");
      return NextResponse.json({ url: '/mock-checkout-success' });
    }

    // In a real implementation, you would map planName to a specific Stripe Price ID
    // For this prototype, we create an ad-hoc price session
    const unitAmount = parseInt(priceStr.replace(/[^0-9]/g, '')) * 100; // Convert to cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Studio Provenance - ${planName}`,
              description: 'Digital Product Passport Compliance Plan',
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
