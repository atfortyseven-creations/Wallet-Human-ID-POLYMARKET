import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { stripe } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    console.log('[CHECKOUT] Starting checkout session creation');
    const session = await getSession();
    
    if (!session || !session.userId) {
      console.error('[CHECKOUT] Unauthorized - No user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const authUserId = session.userId;
    const userEmail = session.email;

    console.log(`[CHECKOUT] User authenticated natively: ${authUserId}`);

    // Create checkout session for one-time payment as per UI "1.50  / cobro único"
    console.log('[CHECKOUT] Creating Stripe checkout session for Lifetime VIP via System Webhook');
    
    const sessionParams: any = {
      mode: 'payment', // One-time payment
      customer_email: userEmail || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Whale Alert ID - VIP Lifetime Access',
              description: 'Acceso de por vida a todas las herramientas PRO (Sin suscripciones).',
            },
            unit_amount: 150, // 1.50 EUR in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vip?canceled=true`,
      metadata: {
        walletAddress: authUserId, // Strictly passing natively authenticated SIWE string
        paymentType: 'lifetime_vip',
      },
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    console.log(`[CHECKOUT] Session created successfully: ${stripeSession.id}`);
    console.log(`[CHECKOUT] Redirect URL: ${stripeSession.url}`);
    
    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error: any) {
    console.error('[CHECKOUT ERROR] Full error:', error);
    console.error('[CHECKOUT ERROR] Error message:', error?.message);
    console.error('[CHECKOUT ERROR] Error stack:', error?.stack);
    
    return NextResponse.json(
      { error: error?.message || 'Internal server error - Check server logs' },
      { status: 500 }
    );
  }
}

