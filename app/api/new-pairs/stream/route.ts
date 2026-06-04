/**
 * GET /api/new-pairs/stream
 * 
 * SSE endpoint: streams new UniswapV3 pair events from GetBlock EP3 WebSocket.
 * Also returns buffered events from the last ~50 pairs on connection.
 * 
 * Architecture:
 *   GetBlock WSS (EP3)  newPairsEngine singleton  SSE  Browser
 */

import { NextRequest } from 'next/server';
import { newPairsEngine, NewPairEvent } from '@/lib/blockchain/new-pairs-ws-engine';

export const dynamic = 'force-dynamic';
export const runtime  = 'nodejs';

const KEEPALIVE_INTERVAL_MS = 15_000;

export async function GET(req: NextRequest) {
  let cleanup: (() => void) | null = null;
  let keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  const encoder = new TextEncoder();

  const send = (data: object) => {
    try {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      // Stream closed
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;

      // Send buffered recent pairs immediately on connection
      const buffered = newPairsEngine.buffer;
      if (buffered.length > 0) {
        send({ type: 'buffer', pairs: buffered });
      }

      send({ type: 'connected', timestamp: Date.now(), source: 'getblock-ep3' });

      // Subscribe to live new pairs from GetBlock WS EP3
      cleanup = newPairsEngine.subscribe((event: NewPairEvent) => {
        send({ type: 'new_pair', ...event });
      });

      // Heartbeat
      keepaliveTimer = setInterval(() => {
        try { ctrl.enqueue(encoder.encode(`:ping\n\n`)); } catch { /* closed */ }
      }, KEEPALIVE_INTERVAL_MS);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepaliveTimer!);
        cleanup?.();
        try { ctrl.close(); } catch { /* closed */ }
      });
    },

    cancel() {
      clearInterval(keepaliveTimer!);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':           'text/event-stream',
      'Cache-Control':          'no-cache, no-transform',
      'Connection':             'keep-alive',
      'X-Accel-Buffering':      'no',
      'Transfer-Encoding':      'chunked',
    },
  });
}
