import { headers } from 'next/headers';
import { stripeQueue } from '@/lib/queues/bullmq';
import { stripe } from '@/lib/payments/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text(); // Raw body validation
  const signatureList = await headers();
  const signature = signatureList.get('stripe-signature') as string;

  try {
    // 1. Verify Stripe Signature deterministically
    const event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // 2. Enqueue event to BullMQ immediately (Zero data loss)
    await stripeQueue.add('process-webhook', event, {
      jobId: event.id, // Idempotency key natively supported by BullMQ
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    });

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
