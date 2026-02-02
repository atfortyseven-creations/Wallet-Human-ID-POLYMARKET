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
