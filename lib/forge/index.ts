export * from './types';

// The Data Studio is activated via an environment variable.
// Zero-mock mandate: if false, the Forge UI and core processors degrade gracefully.
export const FORGE_ENABLED = process.env.ENABLE_COSMIC_FORGE === 'true';

// Evolution constants based on real whale market caps (defaults)
export const HIVE_HIBERNATION_THRESHOLD_USD = 500_000_000; 

// Base tiers mapping
export const TIER_THRESHOLDS = {
    NARWHAL: 1_000_000,
    KRAKEN: 10_000_000,
    LEVIATHAN: 50_000_000,
    MEGALODON: 100_000_000
};
