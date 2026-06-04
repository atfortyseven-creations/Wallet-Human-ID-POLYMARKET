import { NextResponse } from 'next/server';
import { createRedisClient, createSubClient } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    if (req.headers.get('accept') === 'text/event-stream') {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const redis = createRedisClient({ name: 'Whale-Stream' });
                const pSubscriber = createSubClient('Whale-Stream-Sub');

                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));

                // Send latest cache history on connect
                try {
                    const cachedRaw = await redis.get('latest_whale_alerts');
                    if (cachedRaw) {
                        const alerts = safeJsonParse(cachedRaw, [], 'WHALE_STREAM_HISTORY');
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'HISTORY', alerts })}\n\n`));
                    }
                } catch (e) {
                    console.error('Failed to fetch whale cache', e);
                }

                // Explicit types eliminate the three implicit-any errors
                pSubscriber.subscribe('whale_alerts_stream', (err: Error | null) => {
                    if (err) console.error('Redis sub error:', err);
                });

                pSubscriber.on('message', (channel: string, message: string) => {
                    if (channel === 'whale_alerts_stream') {
                        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
                    }
                });

                setInterval(() => {
                    controller.enqueue(encoder.encode(`:\n\n`)); // keep-alive
                }, 15000);

                req.signal.addEventListener('abort', () => {
                    pSubscriber.quit();
                    redis.quit();
                    controller.close();
                });
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    }

    return NextResponse.json({ error: 'SSE only' }, { status: 400 });
}
