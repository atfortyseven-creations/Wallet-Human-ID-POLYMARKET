import Stripe from 'stripe';

// NOTE: STRIPE_SECRET_KEY is validated at runtime when stripe is first used.
// Fallback to a dummy key only during build-time static generation.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build_validation', {
  apiVersion: '2025-03-31.basil' as any,
  typescript: true,
});

/**
 * Mapping of internal PlanTier to Stripe Price IDs.
 * Price IDs come from environment variables (set in Railway / Vercel).
 *
 * PRICE MAPPING:
 *   LIGHT_NODE   → Basic / Starter plan
 *   FULL_NODE    → Professional / Pro plan
 *   ARCHIVE_PROVER → Cryptographic / Institutional plan
 *
 * For ANNUAL plans we use the same price IDs since the checkout UI
 * shows them as annual via a toggled billing period, OR creates a new
 * price dynamically in the checkout handler if needed.
 */
export const PRICE_IDS: Record<string, Record<string, string>> = {
  MONTHLY: {
    FREE:           process.env.STRIPE_PRICE_STANDARD    || '',
    LIGHT_NODE:     process.env.STRIPE_PRICE_STARTER     || '',
    FULL_NODE:      process.env.STRIPE_PRICE_PRO         || '',
    ARCHIVE_PROVER: process.env.STRIPE_PRICE_INSTITUTIONAL || '',
  },
  ANNUAL: {
    FREE:           process.env.STRIPE_PRICE_ANNUAL_STANDARD     || process.env.STRIPE_PRICE_STANDARD    || '',
    LIGHT_NODE:     process.env.STRIPE_PRICE_ANNUAL_STARTER      || process.env.STRIPE_PRICE_STARTER     || '',
    FULL_NODE:      process.env.STRIPE_PRICE_ANNUAL_PRO          || process.env.STRIPE_PRICE_PRO         || '',
    ARCHIVE_PROVER: process.env.STRIPE_PRICE_ANNUAL_INSTITUTIONAL || process.env.STRIPE_PRICE_INSTITUTIONAL || '',
  }
};
