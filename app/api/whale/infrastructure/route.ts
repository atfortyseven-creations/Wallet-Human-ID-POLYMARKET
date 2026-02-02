import { NextResponse } from 'next/server';

// This endpoint provides real-time infrastructure monitoring data
// for the Whale Tracker Infrastructure tab

export async function GET() {
    try {
        // In a real implementation, these would be fetched from:
        // - Redis metrics store
        // - Worker health checks
        // - RPC node monitoring service
        
        const metrics = {
            rpcHealth: {
                bitcoin: {
                    status: 'online',
                    uptime: '99.94%',
                    latency: '42ms',
requestsPerMin: '14',
                    lastCheck: new Date().toISOString()
                },
                base: {
                    status: 'online',
                    uptime: '100%',
                    latency: '31ms',
                    requestsPerMin: '187',
                    lastCheck: new Date().toISOString()
                }
            },
            errors: {
                utxoErrors: 0,
                rpcErrors: 1,
                failedTxLookups: 0,
                lastError: '2h 14m ago',
                recentErrors: []
            },
            explorers: {
                bitcoin: 'mempool.space',
                base: 'basescan.org',
                autoRoutingSuccess: 100
            },
            blockSync: {
                bitcoin: 874231,
                base: 24891045,
                lastSyncBitcoin: new Date(Date.now() - 60000).toISOString(), // 1 min ago
                lastSyncBase: new Date(Date.now() - 10000).toISOString() // 10 sec ago
            },
            workerStatus: {
                evmWorker: 'running',
                btcWorker: 'running',
                uptime: '7d 14h 22m'
            }
        };

        return NextResponse.json(metrics);

    } catch (error) {
        console.error('Infrastructure metrics error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch infrastructure metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
