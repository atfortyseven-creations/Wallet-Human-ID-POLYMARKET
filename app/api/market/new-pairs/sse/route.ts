/**
 * GET /api/market/new-pairs/sse
 * Server-Sent Events endpoint  streams new UniswapV3 pool events from EP3 WebSocket in real time.
 * Connects GetBlock EP3 (wss://go.getblock.io/d20bc88064f545478a74dc464c14a09a) directly to browser.
 *
 * Architecture:
 *   GetBlock WS EP3  newPairsEngine singleton  SSE push  NewPairsTable
 *
 * Format per event:
 *   data: {"type":"NEW_PAIR","pool":"0x...","token0":"0x...","token1":"0x...","fee":3000,"blockNumber":...,"timestamp":...}
 */

import { newPairsEngine } from '@/lib/blockchain/new-pairs-ws-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Send connection ACK + current buffer snapshot
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                    type: 'CONNECTED',
                    source: 'getblock_ep3_ws',
                    buffered: newPairsEngine.buffer.length,
                    timestamp: Date.now(),
                })}\n\n`)
            );

            // Push buffered history immediately on connect
            if (newPairsEngine.buffer.length > 0) {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                        type: 'HISTORY',
                        pairs: newPairsEngine.buffer.slice(0, 20),
                    })}\n\n`)
                );
            }

            // Subscribe to new pool creation events  starts the WS if not already running
            const unsubscribe = newPairsEngine.subscribe((event) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'NEW_PAIR', ...event })}\n\n`)
                    );
                } catch {
                    // Client disconnected
                }
            });

            // Keep-alive every 20s
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`: ping\n\n`));
                } catch {
                    clearInterval(keepAlive);
                }
            }, 20_000);

            // Cleanup on disconnect
            req.signal.addEventListener('abort', () => {
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
            'X-Accel-Buffering': 'no',
        },
    });
}
