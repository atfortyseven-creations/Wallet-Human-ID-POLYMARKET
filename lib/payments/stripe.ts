import Stripe from 'stripe';

// NOTE: STRIPE_SECRET_KEY is validated at runtime when stripe is first used.
// No module-level console.warn  it would pollute Railway [err] logs.
// Fallback to a dummy key because the SDK throws 'Neither apiKey nor config.authenticator provided' during static generation without it
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build_validation', {
  apiVersion: '2025-03-31.basil' as any,
  typescript: true,
});


/**
 * Mapping of internal PlanTier to Stripe Price IDs.
 * Note: These should ideally be moved to environment variables or fetched from Stripe API.
 */
export const PRICE_IDS: Record<string, Record<string, string>> = {
  MONTHLY: {
    LIGHT_NODE: 'prod_Ui1lTChYcr2ZPD',
    FREE:     'prod_UVQPgIwLPGfUiY', // Basic Free
    FULL_NODE:  'prod_Ui1niXKGGBjJap',
    ARCHIVE_PROVER: 'prod_Ui1paRrFjq4Cig',
  },
  ANNUAL: {
    LIGHT_NODE: 'prod_Ui1lTChYcr2ZPD',
    FREE:     'prod_UVQPgIwLPGfUiY',
    FULL_NODE:  'prod_Ui1niXKGGBjJap',
    ARCHIVE_PROVER: 'prod_Ui1paRrFjq4Cig',
  }
};

