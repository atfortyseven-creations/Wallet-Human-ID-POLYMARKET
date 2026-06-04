import { NextRequest, NextResponse } from 'next/server';
import { historySyncService } from '@/lib/wallet/history-sync';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/wallet/history/deep
 * 1. Syncs history if needed (first time or stale)
 * 2. Returns persisted transactions from database
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

    // Find the internal user ID associated with this wallet address
    // If none exists, we might need to create a shadow record or use the address as ID
    const user = await prisma.user.findUnique({ where: { walletAddress: address } });
    const authUserId = user?.id || `shadow_${address}`;

    // CHECK SYNC STATUS
    // Logic: If no transactions in DB for this user, trigger full sync
    const txCount = await prisma.transaction.count({ where: { authUserId } });
    
    if (txCount === 0) {
        // First time sync (can be slow, maybe trigger background job in future)
        await historySyncService.syncHistoricalTransactions(authUserId, address);
    } else {
        // Incremental sync - nice to have, but for now let's rely on websocket for new stuff
        // or trigger a lighter sync for recent blocks
        // historySyncService.syncRecentTransactions(...)
    }

    // RETURN PERSISTED DATA
    const historyRaw = await prisma.transaction.findMany({
        where: { authUserId },
        orderBy: { 
            timestamp: 'desc' 
        },
        take: 100 // Limit for performance
    });

    // Serialize BigInt for JSON
    const history = historyRaw.map(tx => ({
        ...tx,
        gasUsed: tx.gasUsed?.toString() || null,
        blockNumber: tx.blockNumber?.toString() || null,
        value: (tx.value || '0').toString(),
    }));

    //  [LEGENDARY AUTOMATIC RECOVERY]: If DB is empty, trigger the blockchain fallback anyway
    if (history.length === 0) {
        console.warn(`[HistoryFallback] DB returned 0 items for ${address}. Triggering automatic blockchain scan...`);
        return await triggerBlockchainFallback(req, address);
    }

    return NextResponse.json({ history });

  } catch (error: any) {
    console.error('History API Error:', error);
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    return await triggerBlockchainFallback(req, address, error);
  }
}

/**
 * [LEGENDARY HELPER]: Fetches live history from multiple chains
 */
async function triggerBlockchainFallback(req: NextRequest, address: string | null, error?: any) {
    try {
        if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

        console.warn(`[HistoryFallback] Recovery initiated for ${address}. Reason: ${error ? (error.code || error.message) : 'Empty DB Results'}`);
        const { portfolioService } = await import('@/lib/blockchain/PortfolioService');
        
        const CHAINS_TO_SCAN = [1, 8453, 137, 42161, 10, 480]; // Mainnet, Base, Polygon, Arb, Op, WorldChain
        
        const historyResults = await Promise.all(
            CHAINS_TO_SCAN.map(async (chainId) => {
                try {
                    const chainHistory = await portfolioService.getAssetHistory(chainId, address);
                    console.log(`[HistoryFallback] Chain ${chainId}: Found ${chainHistory?.length || 0} items`);
                    return chainHistory || [];
                } catch (e) {
                    console.error(`[HistoryFallback] Chain ${chainId} failed:`, e);
                    return [];
                }
            })
        );
        
        //  [Elite MERGE]: Use the new service-level merger
        const history = portfolioService.mergeHistoryStreams(historyResults).slice(0, 100);

        // Normalize for frontend LegendaryActivityFeed.tsx
        const normalizedHistory = history.map((tx: any) => {
            const isOut = tx.direction === 'OUT' || tx.from?.toLowerCase() === address?.toLowerCase();
            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: parseFloat(tx.value || '0'),
                asset: tx.asset || 'ETH',
                type: tx.category === 'erc20' ? (isOut ? 'SEND' : 'RECEIVE') : (isOut ? 'SEND' : 'RECEIVE'), // Simple mapping
                status: 'CONFIRMED',
                chainId: tx.chainId || 1,
                timestamp: tx.timestamp || new Date().toISOString()
            };
        });

        console.log(`[HistoryFallback] Recovery complete. Total normalized items: ${normalizedHistory.length}`);

        return NextResponse.json({ 
            history: normalizedHistory, 
            status: 'FALLBACK_LIVE',
            isFallback: true,
            warning: 'Results fetched directly from blockchain.'
        });
    } catch (fallbackError) {
        console.error('[HistoryFallback] Fatal recovery failure:', fallbackError);
        return NextResponse.json({ error: 'Failed to fetch history', history: [] });
    }
}

