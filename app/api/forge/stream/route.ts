import { NextRequest } from 'next/server';
import { createSubClient } from '@/lib/redis/client';
import { FORGE_ENABLED } from '@/lib/forge';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (!FORGE_ENABLED) {
        return new Response('Forge Disabled', { status: 403 });
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const subClient = createSubClient('ForgeSSE');
    
    // Server-Sent Events headers
    const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    try {
        await subClient.psubscribe('system:forge:trigger:*', (err: any) => {
            if (err) console.error('SSE Subscribe Error:', err);
        });

        subClient.on('pmessage', async (pattern: string, channel: string, message: string) => {
            if (channel.startsWith('system:forge:trigger:')) {
                try {
                    const entity = JSON.parse(message);
                    const payload = `data: ${JSON.stringify({ type: 'ENTITY_SPAWN', entity })}\n\n`;
                    await writer.write(new TextEncoder().encode(payload));
                } catch {
                    console.warn('[ForgeSSE] Malformed pmessage skipped on channel:', channel);
                }
            }
        });

        // Keep-Alive heartbeat
        const interval = setInterval(async () => {
            try {
                // We could also poll hive energy here and send it via SSE heartbeat
                await writer.write(new TextEncoder().encode(`data: {"type": "HEARTBEAT"}\n\n`));
            } catch {
                clearInterval(interval);
            }
        }, 15000);

        request.signal.addEventListener('abort', () => {
            clearInterval(interval);
            subClient.punsubscribe();
            subClient.quit();
            writer.close();
        });

    } catch (e) {
        console.error('SSE Setup Error:', e);
        writer.close();
    }

    return new Response(readable, { headers });
}
