import { NextResponse } from 'next/server';

export async function GET() {
    // Simulated Backend: High Frequency Trading Data Source
    
    // 1. Generate Candle Data
    const generateCandles = () => {
        let time = Math.floor(Date.now() / 1000) - 86400; // 24h ago
        let value = 64000;
        const data = [];
        for (let i = 0; i < 1440; i++) { // 1 min candles for 24h
            time += 60;
            value += (Math.random() - 0.5) * 50; 
            const open = value + (Math.random() - 0.5) * 20;
            const high = Math.max(open, value) + Math.random() * 10;
            const low = Math.min(open, value) - Math.random() * 10;
            data.push({ time, open, high, low, close: value });
        }
        return data;
    };

    // 2. Generate Whale Alerts
    const whaleAlerts = [
        { amount: "500 BTC", action: "Move", time: "2s ago", tx: "0x3f...a2b" },
        { amount: "12,000 ETH", action: "Buy", time: "5s ago", tx: "0x8c...9d1" },
        { amount: "2M USDC", action: "Mint", time: "12s ago", tx: "0xa1...f44" },
        { amount: "450 BTC", action: "Sell", time: "45s ago", tx: "0xb2...c33" },
        { amount: "100,000 SOL", action: "Stake", time: "1m ago", tx: "0xd4...e55" }
    ];

    // 3. Current Prices
    const prices = {
        btc: 64230.50 + Math.random() * 10,
        eth: 3450.20 + Math.random() * 5,
        sol: 145.80 + Math.random()
    };

    return NextResponse.json({
        success: true,
        timestamp: Date.now(),
        data: {
            candles: generateCandles(),
            whale_alerts: whaleAlerts,
            tickers: prices,
            liquidations: {
                total_24h: 12450000,
                recent_shorts: 1200000
            }
        },
        meta: {
            source: "Human Oracle Network",
            latency: "12ms",
            node: "sg-1"
        }
    });
}
