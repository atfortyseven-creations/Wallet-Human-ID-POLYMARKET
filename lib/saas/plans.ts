export enum PlanTier {
  FREE = "FREE",
  STANDARD = "STANDARD",
  STARTER = "STARTER",
  PRO = "PRO",
  ELITE = "ELITE"
}

export interface PlanConfig {
    name: string;
    tier: PlanTier;
    priceMetrics: {
        monthly: number;
        annual: number;
    };
    limits: {
        requestsPerDay: number; // -1 means unlimited
        maxApiKeys: number;
        maxTokens: number;      // -1 means unlimited
        dataWindowHours: number; // historic visibility
    };
    features: {
        webSockets: boolean;
        fixProtocol: boolean;
        hmacRequired: boolean;
        ipWhitelist: boolean;
        heikinAshiSignals: boolean;
        darkPoolDetection: boolean;
        csvExport: boolean;
    };
    // The exact token list if limited
    allowedTokens?: string[];
}

export const SAAS_PLANS: Record<PlanTier, PlanConfig> = {
    [PlanTier.FREE]: {
        name: 'Free',
        tier: PlanTier.FREE,
        priceMetrics: { monthly: 0, annual: 0 },
        limits: {
            requestsPerDay: 100,
            maxApiKeys: 1,
            maxTokens: 1,
            dataWindowHours: 1,
        },
        features: {
            webSockets: false,
            fixProtocol: false,
            hmacRequired: false,
            ipWhitelist: false,
            heikinAshiSignals: false,
            darkPoolDetection: false,
            csvExport: false,
        },
        allowedTokens: ['BTC']
    },
    [PlanTier.STANDARD]: {
        name: 'Standard',
        tier: PlanTier.STANDARD,
        priceMetrics: { monthly: 15, annual: 144 },
        limits: {
            requestsPerDay: 5000,
            maxApiKeys: 1,
            maxTokens: 3,
            dataWindowHours: 12,
        },
        features: {
            webSockets: false,
            fixProtocol: false,
            hmacRequired: false,
            ipWhitelist: false,
            heikinAshiSignals: false,
            darkPoolDetection: false,
            csvExport: false,
        },
        allowedTokens: ['BTC', 'ETH', 'BNB']
    },
    [PlanTier.STARTER]: {
        name: 'Starter',
        tier: PlanTier.STARTER,
        priceMetrics: { monthly: 130, annual: 1300 },
        limits: {
            requestsPerDay: 10000,
            maxApiKeys: 1,
            maxTokens: 5,
            dataWindowHours: 24,
        },
        features: {
            webSockets: false,
            fixProtocol: false,
            hmacRequired: false,
            ipWhitelist: false,
            heikinAshiSignals: false,
            darkPoolDetection: false,
            csvExport: false,
        },
        allowedTokens: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP']
    },
    [PlanTier.PRO]: {
        name: 'Pro',
        tier: PlanTier.PRO,
        priceMetrics: { monthly: 350, annual: 3500 },
        limits: {
            requestsPerDay: 500000,
            maxApiKeys: 3,
            maxTokens: 24,
            dataWindowHours: 720, // 30 days
        },
        features: {
            webSockets: true,
            fixProtocol: false,
            hmacRequired: true,
            ipWhitelist: true,
            heikinAshiSignals: true,
            darkPoolDetection: true,
            csvExport: false,
        }
    },
    [PlanTier.ELITE]: {
        name: 'Elite',
        tier: PlanTier.ELITE,
        priceMetrics: { monthly: 950, annual: 9500 },
        limits: {
            requestsPerDay: -1, // Unlimited
            maxApiKeys: 10,
            maxTokens: -1,
            dataWindowHours: 8760, // 1 year
        },
        features: {
            webSockets: true,
            fixProtocol: true,
            hmacRequired: true,
            ipWhitelist: true,
            heikinAshiSignals: true,
            darkPoolDetection: true,
            csvExport: true,
        }
    }
};

/**
 * Validates if a token is accessible under the given plan tier
 */
export function isTokenAllowed(tier: PlanTier, symbol: string): boolean {
    const config = SAAS_PLANS[tier];
    if (config.limits.maxTokens === -1 || !config.allowedTokens) {
        return true;
    }
    return config.allowedTokens.includes(symbol.toUpperCase());
}

