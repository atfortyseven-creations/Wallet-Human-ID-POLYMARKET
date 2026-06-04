'use server'

import { headers } from 'next/headers';
import { stripe } from '@/lib/payments/stripe';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

const PLAN_PRICE_IDS: Record<string, string> = {
  STARTER: process.env.STRIPE_PRICE_STARTER || 'price_starter_live_2026',
  PRO:     process.env.STRIPE_PRICE_PRO     || 'price_pro_live_2026',
  ELITE:   process.env.STRIPE_PRICE_ELITE   || process.env.STRIPE_PRICE_INSTITUTIONAL || 'price_elite_live_2026',
};

const PLAN_NAMES: Record<string, string> = {
  STARTER: 'Institutional License Lease  STARTER',
  PRO:     'Institutional License Lease  PRO',
  ELITE:   'Institutional License Lease  ELITE',
};

/**
 * Executes a Zero-Trust Server Action to initialize the Stripe Checkout Session
 * with strict anti-fraud measures and ECDSA dependency.
 */
export async function createCheckoutSession(planId: string) {
  // 1. Zero-Trust ECDSA Auth Check
  const siweSession = await getSession();
  const userId = siweSession?.userId;
  if (!userId) {
    throw new Error('UNAUTHORIZED: ECDSA System Signature Required.');
  }

  const normalizedPlanId = planId.toUpperCase();
  if (!PLAN_PRICE_IDS[normalizedPlanId]) {
    throw new Error(`INVALID_PLAN: Plan ${normalizedPlanId} does not exist.`);
  }

  // 2. Extract Security Fingerprints (Radar)
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'unknown';
  
  // Basic Datacenter/VPN Heuristic for early block
  const isSuspiciousIP = ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.');

  // 3. Database Customer Reconciliation
  let dbUser = await prisma.user.findUnique({ where: { walletAddress: userId } });
  if (!dbUser) throw new Error('UNAUTHORIZED: User does not exist in the System Ledger.');

  let customerId = dbUser.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email || `${userId.slice(0, 8)}@system.node`,
      metadata: {
        system_user_id: userId,
        purchase_ip: ip,
        purchase_country: country,
        purchase_user_agent: userAgent.slice(0, 500),
        suspicious_ip: isSuspiciousIP ? 'true' : 'false',
      },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { walletAddress: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // 4. Create Stripe Checkout Session
  const priceId = PLAN_PRICE_IDS[normalizedPlanId];
  
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        plan_id: normalizedPlanId,
        system_user_id: userId,
        purchase_ip: ip,
        purchase_country: country,
        purchase_timestamp: new Date().toISOString(),
      },
      description: PLAN_NAMES[normalizedPlanId],
    },
    payment_method_options: {
      card: { request_three_d_secure: 'automatic' },
    },
    customer_update: { address: 'auto', name: 'auto' },
    billing_address_collection: 'required',
    consent_collection: { terms_of_service: 'required' },
    custom_text: {
      terms_of_service_acceptance: {
        message: '️ Al proceder aceptas que no hay reembolsos. La licencia institucional se activa inmediatamente. En caso de disputa, proporcionaremos evidencia criptográfica y logs inmutables al emisor.',
      },
      submit: { message: 'Adquirir Licencia Institucional' },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com'}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com'}/pricing?canceled=true`,
    metadata: {
      plan_id: normalizedPlanId,
      system_user_id: userId,
      purchase_ip: ip,
      purchase_country: country,
    },
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 min expiry
  });

  // 5. Immutable Evidence Logging (Anti-Fraud)
  try {
    await prisma.apiPurchaseIntent.create({
      data: {
        userId,
        planId: normalizedPlanId,
        stripeSessionId: checkoutSession.id,
        ip,
        country,
        userAgent: userAgent.slice(0, 500),
        isSuspiciousIp: isSuspiciousIP,
        createdAt: new Date(),
      },
    });
  } catch (e) {
    console.warn("Evidence log failed, but continuing execution", e);
  }

  // 6. Return Checkout URL
  return { url: checkoutSession.url };
}

/**
 * Creates a Stripe Customer Portal session for EU DSA Compliance (Self-Service Cancel/Upgrade)
 */
export async function createCustomerPortalSession() {
  const siweSession = await getSession();
  const userId = siweSession?.userId;
  if (!userId) throw new Error('UNAUTHORIZED: ECDSA Signature Required');

  const dbUser = await prisma.user.findUnique({ where: { walletAddress: userId } });
  if (!dbUser?.stripeCustomerId) throw new Error('NO_SUBSCRIPTION: No billing identity found.');

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://humanidfi.com'}/pricing`,
  });

  return { url: portalSession.url };
}
