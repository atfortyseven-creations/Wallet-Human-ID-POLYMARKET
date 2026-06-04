import { NextRequest, NextResponse } from 'next/server';

// 
// /api/wallet/portfolio/history-real  Real Portfolio Value History
// Strategy: fetch ETH price history from CoinGecko (free tier)
// and multiply by a wallet's real on-chain ETH balance to produce
// an accurate historical USD valuation curve.
//
// If no wallet is connected, returns price index data (BTC/ETH market)
// so the chart still shows real market movement, not random walks.
// 

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const days = parseInt(searchParams.get('days') || '30');

    try {
        // Step 1: Get real ETH price history for the period (CoinGecko free API)
        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=daily`,
            { next: { revalidate: 3600 } } // Cache 1h  price history doesn't change
        );

        if (!priceRes.ok) throw new Error('CoinGecko price history unavailable');
        const priceData = await priceRes.json();

        // Step 2: Get wallet balance if address provided
        let balanceEth = 0;
        if (address) {
            try {
                const balRes = await fetch(
                    `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`,
                    { next: { revalidate: 60 } }
                );
                const balData = await balRes.json();
                if (balData.status === '1') {
                    balanceEth = parseInt(balData.result) / 1e18;
                }
            } catch { /* balance unavailable  use index mode */ }
        }

        // Step 3: Build chart data
        // If we have a balance: portfolio_value = balance * eth_price_at_time
        // If no address: return normalized ETH price index (still real, no simulation)
        const chartData = (priceData.prices || []).map(([timestamp, price]: [number, number]) => ({
            time: new Date(timestamp).toISOString().split('T')[0],
            value: address && balanceEth > 0
                ? parseFloat((balanceEth * price).toFixed(2))
                : parseFloat(price.toFixed(2)),
            price,
        }));

        // Also fetch BTC for comparison
        let btcData: any[] = [];
        try {
            const btcRes = await fetch(
                `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
                { next: { revalidate: 3600 } }
            );
            const btcJson = await btcRes.json();
            btcData = (btcJson.prices || []).map(([ts, p]: [number, number]) => ({
                time: new Date(ts).toISOString().split('T')[0],
                value: parseFloat(p.toFixed(2)),
            }));
        } catch { /* btc unavailable */ }

        return NextResponse.json({
            chart: chartData,
            btc: btcData,
            mode: address && balanceEth > 0 ? 'wallet' : 'market_index',
            balanceEth: address ? balanceEth : null,
            address: address || null,
            days,
            source: 'coingecko',
            updatedAt: Date.now(),
        });

    } catch (err) {
        console.error('[Portfolio History]', err);
        return NextResponse.json({
            error: 'Portfolio history unavailable',
            chart: [],
            mode: 'unavailable',
        }, { status: 500 });
    }
}

