import Stripe from 'stripe';

// NOTE: STRIPE_SECRET_KEY is validated at runtime when stripe is first used.
// No module-level console.warn — it would pollute Railway [err] logs.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder_build_only', {
  apiVersion: '2026-01-28.clover' as any,
  typescript: true,
});


/**
 * Mapping of internal PlanTier to Stripe Price IDs.
 * Note: These should ideally be moved to environment variables or fetched from Stripe API.
 */
// Monthly price IDs — maps STRIPE_PRICE_* env vars (existing) + STRIPE_*_PRICE_ID_MO (canonical)
export const PRICE_IDS: Record<string, Record<string, string>> = {
  MONTHLY: {
    STANDARD: process.env.STRIPE_STANDARD_PRICE_ID_MO || process.env.STRIPE_PRICE_STANDARD || '',
    STARTER:  process.env.STRIPE_STARTER_PRICE_ID_MO  || process.env.STRIPE_PRICE_STARTER  || '',
    PRO:      process.env.STRIPE_PRO_PRICE_ID_MO      || process.env.STRIPE_PRICE_PRO       || '',
    ELITE:    process.env.STRIPE_ELITE_PRICE_ID_MO    || process.env.STRIPE_PRICE_INSTITUTIONAL || '',
  },
  ANNUAL: {
    STANDARD: process.env.STRIPE_STANDARD_PRICE_ID_YR || process.env.STRIPE_PRICE_STANDARD || '',
    STARTER:  process.env.STRIPE_STARTER_PRICE_ID_YR  || process.env.STRIPE_PRICE_STARTER  || '',
    PRO:      process.env.STRIPE_PRO_PRICE_ID_YR      || process.env.STRIPE_PRICE_PRO       || '',
    ELITE:    process.env.STRIPE_ELITE_PRICE_ID_YR    || process.env.STRIPE_PRICE_INSTITUTIONAL || '',
  }
};

