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
    balanceNumeric?: number;
    balanceFormatted: string;
    price?: number;
    priceUSD: number;
    valueUSD: number;
    chainId: number;
    network?: string;
    logoURI?: string;
    address?: string;
    decimals?: number;
    change24h?: number;
    usdPrice?: number;
    value?: number;
}

export interface Transaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'BUY' | 'SELL' | 'WINNINGS' | 'TRANSFER' | 'SWAP' | 'BRIDGE';
    amount: string | number;
    value?: string | number;
    asset: string;
    date: string;
    timestamp?: string | number;
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
    platform?: string;
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
    totalValueUSD?: number;
    totalBalance?: string;
    usdcBalance?: string;
    portfolioValue?: string;
    isConnected?: boolean;
    assets: Asset[];
    perps: PerpPosition[];
    predictions: PredictionPosition[];
    claimables: ClaimableAsset[];
    nfts: any[]; // Or specific NFT type
    positions?: Position[];
    transactions?: Transaction[];
    stats?: any;
    isAssetsLoading?: boolean;
    isHistoryLoading?: boolean;
    isLoading?: boolean;
    change24hUSD?: number;
    change24hPercent?: number;
    legendaryScore?: number;
    strategicInsight?: string;
    backendAccounts?: any[];
}
