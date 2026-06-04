/**
 * GET /api/whales/sse
 * Server-Sent Events endpoint  streams whale transfer events from EP2 WebSocket in real time.
 * Connects GetBlock EP2 (wss://go.getblock.io/95cb42a5aa444537a068031ce279d343) directly to browser.
 *
 * Architecture:
 *   GetBlock WS EP2  whaleEngine singleton  SSE push  AlertsPanel / WhalePortfolio
 *
 * Format per event:
 *   data: {"txHash":"0x...","symbol":"USDC","from":"0x...","to":"0x...","amount":1234567,"usdValue":1234567,"timestamp":1234567890}
 */

import { whaleEngine } from '@/lib/blockchain/whale-ws-engine';

export const dynamic = 'force-dynamic';

let activeSSE = 0;
const MAX_SSE_PER_INSTANCE = 500;

export async function GET(req: Request) {
    if (activeSSE >= MAX_SSE_PER_INSTANCE) {
        return new Response('Service at capacity', { status: 503 });
    }
    
    activeSSE++;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection ACK
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', source: 'getblock_ep2_ws', timestamp: Date.now() })}\n\n`)
            );

            // Subscribe to EP2 whale events  this starts the WS if not already running
            const unsubscribe = whaleEngine.subscribe((event) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'WHALE_TX', ...event })}\n\n`)
                    );
                } catch {
                    // Client disconnected
                }
            });

            // Keep-alive ping every 20s to defeat proxy buffering and Railway timeouts
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`: ping\n\n`));
                } catch {
                    clearInterval(keepAlive);
                }
            }, 20_000);

            // Cleanup on client disconnect
            req.signal.addEventListener('abort', () => {
                activeSSE--;
                clearInterval(keepAlive);
                unsubscribe();
                try { controller.close(); } catch {}
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type':  'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection':    'keep-alive',
            'X-Accel-Buffering': 'no', // Defeat Nginx/Railway buffering
        },
    });
}
