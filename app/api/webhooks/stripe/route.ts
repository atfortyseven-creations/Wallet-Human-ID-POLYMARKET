import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerkUserId;
  const customerId = session.customer as string;

  if (!clerkUserId) {
    console.error('No Clerk user ID in session metadata');
    return;
  }

  try {
    // Update Clerk user metadata with Stripe customer ID
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        stripeCustomerId: customerId,
      },
    });

    console.log(`✅ Updated Clerk user ${clerkUserId} with Stripe customer ${customerId}`);
  } catch (error) {
    console.error('Failed to update Clerk user metadata:', error);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find Clerk user by Stripe customer ID
    const client = await clerkClient();
    const users = await client.users.getUserList({
      limit: 1,
    });

    // Find user with matching Stripe customer ID
    const user = users.data.find(
      (u) => u.publicMetadata.stripeCustomerId === customerId
    );

    if (!user) {
      console.error(`No Clerk user found for Stripe customer ${customerId}`);
      return;
    }

    // Update user metadata with subscription info
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        stripeCustomerId: customerId,
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        currentPeriodEnd: (subscription as any).current_period_end || 0,
      },
    });

    console.log(`✅ Updated subscription for user ${user.id}`);
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      limit: 1,
    });

    const user = users.data.find(
      (u) => u.publicMetadata.stripeCustomerId === customerId
    );

    if (!user) {
      console.error(`No Clerk user found for Stripe customer ${customerId}`);
      return;
    }

    // Remove subscription info from metadata
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        subscriptionStatus: 'canceled',
        subscriptionId: null,
      },
    });

    console.log(`✅ Canceled subscription for user ${user.id}`);
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`✅ Payment succeeded for invoice ${invoice.id}`);
  // You can add additional logic here, like sending a receipt email
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ Payment failed for invoice ${invoice.id}`);
  // You can add logic to notify the user about the failed payment
}
