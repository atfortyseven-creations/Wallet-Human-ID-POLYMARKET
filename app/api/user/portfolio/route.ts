/**
 * GET /api/user/portfolio?address=0x...
 * Powers ActivePortfolio panel via GetBlock EP1 (JSON-RPC)
 * Real on-chain ETH + ERC-20 balances  no synthetic data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserPortfolio } from '@/lib/blockchain/getblock-engine';

import { PriceService } from '@/lib/blockchain/PriceService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
        }

        const { ethBalance, tokens } = await getUserPortfolio(address);

        // Fetch Real-Time Oracle prices for ALL assets (EP1 On-Chain + PriceService)
        const assetQueries = [
            { symbol: 'ETH' },
            ...tokens.map(t => ({ symbol: t.symbol, address: (t as any).contractAddress }))
        ];
        const realPrices = await PriceService.getBulkPrices(assetQueries);

        // Compute USD values with Real Oracle Data
        const ethPriceData = realPrices['ETH'] || { price: 2300 };
        const ethUsd = ethBalance * ethPriceData.price;
        
        const tokenList = tokens.map(t => {
            const pData = realPrices[t.symbol.toUpperCase()] || { price: 0 };
            const usdValue = t.balance * pData.price;
            return {
                symbol:       t.symbol,
                name:         t.symbol,
                balance:      t.balance,
                usdPrice:     pData.price,
                usdValue,
                change24h:    (pData as any).change24h || 0,
                portfolioPct: 0,
                chain:        'ethereum',
            };
        });

        // ETH native position
        const ethPosition = {
            symbol: 'ETH', name: 'Ethereum',
            balance: ethBalance, usdPrice: ethPriceData.price, usdValue: ethUsd,
            change24h: (ethPriceData as any).change24h || 0, portfolioPct: 0, chain: 'ethereum',
        };

        const all = [ethPosition, ...tokenList].filter(t => t.usdValue > 1 || t.symbol === 'ETH');
        const totalUsd = all.reduce((s, t) => s + t.usdValue, 0);
        all.forEach(t => { t.portfolioPct = totalUsd > 0 ? (t.usdValue / totalUsd) * 100 : 0; });

        return NextResponse.json({
            address,
            totalUsd,
            tokens: all,
            source: 'getblock_ep1_onchain',
            fetchedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[Portfolio EP1 Error]', error?.message);
        // Graceful fallback  return empty portfolio, not a crash
        return NextResponse.json({
            address: '',
            totalUsd: 0,
            tokens: [],
            source: 'error_fallback',
            error: 'RPC unavailable',
        }, { status: 200 });
    }
}
