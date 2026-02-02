export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface NewsItem {
    id: string;
    title: string;
    topic: string; // e.g., "US Politics", "Crypto"
    sentiment: Sentiment;
    timestamp: string;
}

export interface Position {
    id: string;
    marketTitle: string;
    outcome: 'YES' | 'NO';
    shares: number;
    avgPrice?: number;
    currentPrice?: number;
    value?: number;
    pnl: number;
    pnlPercent: number;
    relatedNewsId?: string;
    newsContext?: string;
}

export interface PerpPosition {
    id: string;
    protocol: string; // e.g., "GMX", "dYdX"
    market: string; // e.g., "ETH/USD"
    side: 'LONG' | 'SHORT';
    leverage: number;
    size: number;
    collateral: number;
    entryPrice: number;
    currentPrice: number;
    liquidationPrice: number;
    pnl: number;
    pnlPercent: number;
    chainId: number;
}

export interface PredictionPosition extends Position {
    protocol: string; // e.g., "Polymarket"
    category?: string;
    chainId: number;
}

export interface ClaimableAsset {
    id: string;
    protocol: string;
    name: string;
    amount: string;
    valueUSD: number;
    type: 'AIRDROP' | 'REWARDS' | 'STAKING';
    chainId: number;
}

export interface Asset {
    symbol: string;
    name: string;
    balance: string;
    balanceFormatted: string;
    priceUSD: number;
    valueUSD: number;
    chainId: number;
    logoURI?: string;
}

export interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'BUY' | 'SELL' | 'WINNINGS' | 'TRANSFER' | 'SWAP' | 'BRIDGE';
    amount: string | number;
    asset: string;
    date: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    hash?: string;
    chainId?: number;
    from?: string;
    to?: string;
    newsContext?: {
        newsId: string;
        headline: string;
        impactLabel: string;
    };
}

export interface WalletState {
    balance: number;
    idleCash: number;
    activeValue: number;
    yieldEnabled: boolean; // For the "Earn 4%" toggle
    isGasless: boolean;
}

export interface EnrichedPortfolio extends WalletState {
    address: string;
    totalValueUSD: number;
    assets: Asset[];
    perps: PerpPosition[];
    predictions: PredictionPosition[];
    claimables: ClaimableAsset[];
    nfts: any[]; // Or specific NFT type
}
