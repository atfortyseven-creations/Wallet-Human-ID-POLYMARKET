import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Alchemy, Network } from 'alchemy-sdk';
import { getRealTimePrice } from '@/lib/priceHelper';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
// Configure Alchemy
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};

// HACK: Fix for Alchemy SDK "Referrer 'client' is not a valid URL" in Next.js Server
const originalFetch = global.fetch;
global.fetch = (url, init) => {
    if (init && init.referrer === 'client') {
        delete init.referrer;
    }
    return originalFetch(url, init);
};

const alchemy = new Alchemy(config);

/**
 * GET /api/whale/alerts/check?userId=...
 * Checks active rules against recent chain activity for watched wallets.
 * This simulates a "worker" by running on-demand when the user loads the dashboard.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        // 1. Get User's Alert Rules
        const rules = await prisma.alertRule.findMany({
            where: { userId, isActive: true }
        });

        if (rules.length === 0) {
            return NextResponse.json({ alerts: [] });
        }

        // 2. Get User's Watched Wallets
        const watchedWallets = await prisma.watchedWallet.findMany({
            where: { userId },
            select: { address: true, label: true }
        });

        if (watchedWallets.length === 0) {
            return NextResponse.json({ alerts: [] });
        }

        const generatedAlerts: any[] = [];

        // 3. Check activity for each wallet (Democratized for Demo)
        for (const wallet of watchedWallets) {
            // Get recent transfers (last 10)
            const transfers = await alchemy.core.getAssetTransfers({
                fromAddress: wallet.address,
                category: [
                    'erc20' as any, 
                    'external' as any
                ],
                maxCount: 5,
                withMetadata: true
            });

            const ethPrice = await getRealTimePrice('ETH');
            
            for (const tx of transfers.transfers) {
                // Determine Value
                let valueUsd = 0;
                let symbol = tx.asset || 'ETH';
                
                if (symbol === 'ETH' && tx.value) {
                    valueUsd = tx.value * ethPrice;
                } else if (tx.value) {
                    // Quick check for stables (USDC/DAI) - assumes $1
                    if (['USDC', 'DAI', 'USDT'].includes(symbol)) {
                         valueUsd = tx.value;
                    } 
                    // For others, if value is huge, we flag it. 
                    // (Real implementation would fetch price for every token)
                }

                // Check against rules
                // STARTING SIMPLE: If rule name contains "Whale" and value > $1000, trigger.
                // Or if rule is "All Activity", trigger.
                
                const isBigMove = valueUsd > 1000;
                
                // Demo Logic: Generate alert if any transaction found
                // In production, we would parse `rule.conditions` JSON strictly.
                
                generatedAlerts.push({
                    id: tx.hash,
                    type: isBigMove ? 'whale_move' : 'smart_sell',
                    walletLabel: wallet.label,
                    walletAddress: wallet.address,
                    title: isBigMove ? ' Whale Movement Detected' : ' Wallet Activity',
                    description: `Detected ${safeToFixed(tx.value || 0, 4)} ${symbol} transfer from ${wallet.label}`,
                    action: {
                        type: 'TRANSFER',
                        token: symbol,
                        amount: tx.value || 0,
                        usdValue: valueUsd
                    },
                    timestamp: new Date(tx.metadata.blockTimestamp),
                    priority: isBigMove ? 'critical' : 'medium',
                    read: false,
                    copyable: true
                });
            }
        }

        // Sort by time
        generatedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({ alerts: generatedAlerts });

    } catch (error) {
        console.error("Alert Check Error:", error);
        return NextResponse.json({ error: 'Failed to generate alerts' }, { status: 500 });
    }
}

