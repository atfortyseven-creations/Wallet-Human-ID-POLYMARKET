export enum PlanTier {
  FREE = "FREE",
  LIGHT_NODE = "LIGHT_NODE",
  FULL_NODE = "FULL_NODE",
  ARCHIVE_PROVER = "ARCHIVE_PROVER"
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
    allowedTokens?: string[];
}

export const NODE_TIERS: Record<PlanTier, PlanConfig> = {
    [PlanTier.FREE]: {
        name: 'Free Node',
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
    [PlanTier.LIGHT_NODE]: {
        name: 'Light Node',
        tier: PlanTier.LIGHT_NODE,
        priceMetrics: { monthly: 4995, annual: 49950 },
        limits: {
            requestsPerDay: 50000,
            maxApiKeys: 3,
            maxTokens: 5,
            dataWindowHours: 720, // 30 days
        },
        features: {
            webSockets: true,
            fixProtocol: false,
            hmacRequired: true,
            ipWhitelist: true,
            heikinAshiSignals: false,
            darkPoolDetection: false,
            csvExport: false,
        },
        allowedTokens: ['BTC', 'ETH']
    },
    [PlanTier.FULL_NODE]: {
        name: 'Full Node',
        tier: PlanTier.FULL_NODE,
        priceMetrics: { monthly: 14995, annual: 149950 },
        limits: {
            requestsPerDay: 500000,
            maxApiKeys: 10,
            maxTokens: 20,
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
        },
        allowedTokens: ['BTC', 'ETH', 'SOL', 'BNB']
    },
    [PlanTier.ARCHIVE_PROVER]: {
        name: 'Archive Prover',
        tier: PlanTier.ARCHIVE_PROVER,
        priceMetrics: { monthly: 24995, annual: 249950 },
        limits: {
            requestsPerDay: -1, // Unlimited
            maxApiKeys: 50,
            maxTokens: -1,
            dataWindowHours: -1, // Unlimited
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

export function isTokenAllowed(tier: PlanTier, symbol: string): boolean {
    const config = NODE_TIERS[tier];
    if (config.limits.maxTokens === -1 || !config.allowedTokens) {
        return true;
    }
    return config.allowedTokens.includes(symbol.toUpperCase());
}
