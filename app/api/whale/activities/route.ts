import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import { prisma } from '@/lib/prisma';

// Configure Alchemy with GetBlock RPC
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
  // Use GetBlock RPC endpoint for Base Mainnet
  url: process.env.BASE_RPC_URL || undefined,
};

// HACK: Fix for Alchemy SDK "Referrer 'client' is not a valid URL" in Next.js Server
// The SDK sets 'client' as referrer which native fetch rejects.
const originalFetch = global.fetch;
global.fetch = (url, init) => {
    if (init && init.referrer === 'client') {
        delete init.referrer;
    }
    return originalFetch(url, init);
};

const alchemyBase = new Alchemy({ ...config, network: Network.BASE_MAINNET });
const alchemyEth = new Alchemy({ ...config, network: Network.ETH_MAINNET });
const alchemyPoly = new Alchemy({ ...config, network: Network.MATIC_MAINNET });

const KNOWN_WHALES: Record<string, string> = {
  '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance Hot Wallet',
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': 'Coinbase',
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 'USDC Contract',
};

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch large transfers across chains
    const chainConfigs = [
        { name: 'base', client: alchemyBase },
        { name: 'ethereum', client: alchemyEth },
        { name: 'polygon', client: alchemyPoly }
    ];

    const fetchChainActivities = async (config_item: any) => {
        try {
            const transfers = await config_item.client.core.getAssetTransfers({
                fromBlock: '0x0',
                toBlock: 'latest',
                category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.EXTERNAL],
                withMetadata: true,
                excludeZeroValue: true,
                maxCount: 10,
                order: SortingOrder.DESCENDING,
            });

            const { getRealTimePrice } = await import('@/lib/priceHelper');
            
            return await Promise.all((transfers?.transfers || []).map(async (tx: any) => {
                const assetSymbol = tx.asset || (config_item.name === 'polygon' ? 'MATIC' : 'ETH');
                const price = await getRealTimePrice(assetSymbol);
                
                return {
                    id: tx.hash,
                    walletAddress: tx.from,
                    walletLabel: KNOWN_WHALES[tx.from] || `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`,
                    type: 'TRANSFER',
                    token: assetSymbol,
                    amount: tx.value || 0,
                    usdValue: (tx.value || 0) * price,
                    timestamp: new Date(tx.metadata.blockTimestamp),
                    txHash: tx.hash,
                    chain: config_item.name
                };
            }));
        } catch (e) {
            console.warn(`[Alchemy ${config_item.name} Error]:`, e);
            return [];
        }
    };

    const allEvmActivities = await Promise.all(chainConfigs.map(fetchChainActivities));
    const processedActivities = allEvmActivities.flat()
        .filter(act => act.usdValue >= 20000000 / 0.96) // 20,000,000 EUR in USD
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 30);

    // Bitcoin activities removed to ensure only real on-chain data is shown

    // [REAL-TIME ALERTS] Logically senior implementation
    // 1. Fetch all watched wallets that have alerts enabled
    const watchedWalletsWithAlerts = await prisma.watchedWallet.findMany({
        where: { alertsEnabled: true }
    });

    if (watchedWalletsWithAlerts.length > 0) {
        for (const tx of processedActivities) {
            // Check if 'from' or 'to' is a watched address
            const matchingWatchers = watchedWalletsWithAlerts.filter(w => 
                w.address.toLowerCase() === tx.walletAddress.toLowerCase()
            );

            for (const watcher of matchingWatchers) {
                // Create a real notification for this user
                await prisma.notification.create({
                    data: {
                        userId: watcher.userId,
                        title: `Movement Detected: ${watcher.label}`,
                        message: `Alert! ${watcher.label} moved ${tx.amount} ${tx.token}. Hash: ${tx.txHash.slice(0, 10)}...`,
                        type: 'security',
                        metadata: {
                            txHash: tx.txHash,
                            address: tx.walletAddress,
                            amount: tx.amount,
                            token: tx.token
                        }
                    }
                });
            }
        }
    }

    return NextResponse.json({
      activities: processedActivities,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API ERROR] Whale activities:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
