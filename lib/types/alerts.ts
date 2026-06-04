// Universal Omnichannel Alert Event Data Model
// Designed to be flexible enough for ANY scale of alert (Whale, Gas, Price, Minting)
// and agnostic enough to hit any channel (Telegram, Discord, SMS, Webhook, Next.js UI).

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'ASTRONOMICAL';
export type AlertChain = 'ETH' | 'BTC' | 'SOL' | 'BASE' | 'BNB' | 'POLYGON' | 'AVAX' | 'MULTICHAIN' | 'TRADFI';
export type AlertChannel = 'UI_INAPP' | 'DISCORD' | 'TELEGRAM' | 'PUSH_IOS' | 'SMS' | 'WEBHOOK';

export interface AlertPayload {
    asset?: string;               // e.g., "WBTC", "ETH", "AAPL"
    amountUsd?: number;           // Standardized USD value for filtering/ranking
    fromAddress?: string;         // Sender wallet
    toAddress?: string;           // Receiver wallet / Contract
    hash?: string;                // Transaction Hash
    metrics?: Record<string, any>;// Flexible data: { oldGas: 50, newGas: 12 }, { changePct: 15.5 }
    imageUrl?: string;            // Chart snapshot or NFT image
}

export interface OmnichannelAlertEvent {
    eventId: string;              // UUIDv4
    timestamp: number;            // Unix epoch ms
    type: string;                 // 'WHALE_TX', 'GAS_DROP', 'LIQUIDATION', 'DEX_PUMP', 'PRICE_BREAKOUT'
    chain: AlertChain;
    
    // Impact and Filtering
    severity: AlertSeverity;
    
    // The core data
    payload: AlertPayload;
    
    // Routing Meta (The Megalodon Dispatcher reads this)
    targetAudience: 'GLOBAL' | 'VIP_ONLY' | 'SPECIFIC_USERS';
    userIds?: string[];           // Required if targetAudience is SPECIFIC_USERS
    channels: AlertChannel[];     // Where to send this specific event
}

