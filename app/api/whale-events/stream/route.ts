/**
 * GET /api/whale-events/stream
 * 
 * Server-Sent Events endpoint that bridges the GetBlock WebSocket whale 
 * detector (EP2) to browser clients in real time.
 * 
 * Architecture:
 *   GetBlock WSS (EP2)  whaleEngine singleton  SSE  Browser clients
 * 
 * This endpoint defeats Vercel/Railway proxy buffering via:
 * 1. X-Accel-Buffering: no
 * 2. Regular heartbeat pings every 15s
 * 3. Force-dynamic rendering (no edge caching)
 */

import { NextRequest } from 'next/server';
import { whaleEngine, WhaleEvent } from '@/lib/blockchain/whale-ws-engine';

export const dynamic = 'force-dynamic';
export const runtime  = 'nodejs';

const KEEPALIVE_INTERVAL_MS = 15_000;

export async function GET(req: NextRequest) {
  let cleanup: (() => void) | null = null;
  let keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  const encoder = new TextEncoder();

  const send = (data: object | string) => {
    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      controller?.enqueue(encoder.encode(`data: ${payload}\n\n`));
    } catch {
      // Stream may have closed  ignore
    }
  };

  const sendPing = () => {
    try {
      controller?.enqueue(encoder.encode(`:ping\n\n`));
    } catch {
      // Stream closed
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controller = ctrl;

      // Initial connection event
      send({ type: 'connected', timestamp: Date.now(), source: 'getblock-ep2' });

      // Subscribe to live whale events from GetBlock WS
      cleanup = whaleEngine.subscribe((event: WhaleEvent) => {
        send({ type: 'whale', ...event });
      });

      // Heartbeat to keep proxy connections alive
      keepaliveTimer = setInterval(sendPing, KEEPALIVE_INTERVAL_MS);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(keepaliveTimer!);
        cleanup?.();
        try { ctrl.close(); } catch { /* already closed */ }
      });
    },

    cancel() {
      clearInterval(keepaliveTimer!);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache, no-transform',
      'Connection':                  'keep-alive',
      'X-Accel-Buffering':           'no',        // Nginx/Railway anti-buffer
      'X-Content-Type-Options':      'nosniff',
      'Transfer-Encoding':           'chunked',
    },
  });
}
