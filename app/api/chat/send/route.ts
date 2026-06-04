/**
 * POST /api/chat/send
 * Publishes a chat message to a Redis channel so all SSE listeners receive it in real-time.
 * Body: { channelId, sender, content }
 *
 * Resilience: If Upstash Redis is not configured, falls back to in-memory store
 * so the route never crashes regardless of environment.
 */
import { NextRequest, NextResponse } from 'next/server';

//  Lazy Upstash client  only created when env vars are present 
// Previously: `new Redis({url: process.env.UPSTASH_REDIS_REST_URL!, token: ...})`
// crashed at module-load time when env vars were undefined (! is a TypeScript-only
// assertion; at runtime it's just `undefined`). Upstash constructor throws on
// undefined url/token, taking down the entire route with a 500 for every user.
let _upstashRedis: any = null;
function getUpstashRedis(): any | null {
  if (_upstashRedis) return _upstashRedis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = require('@upstash/redis');
    _upstashRedis = new Redis({ url, token });
    return _upstashRedis;
  } catch {
    return null;
  }
}

//  Shared in-memory fallback store (global so it's shared with the SSE stream route) 
declare global {
  var __whaleChatMemStore: Map<string, Array<{ id: string; sender: string; content: string; sentAt: string; _score: number }>>;
}
if (!global.__whaleChatMemStore) {
  global.__whaleChatMemStore = new Map();
}
const memoryStore = global.__whaleChatMemStore;

export async function POST(req: NextRequest) {
  try {
    const { channelId, sender, content } = await req.json();

    if (!channelId || !sender || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = {
      id:      crypto.randomUUID(),
      sender:  sender.toLowerCase(),
      content: content.trim(),
      sentAt:  new Date().toISOString(),
    };

    const redis = getUpstashRedis();

    if (redis) {
      try {
        // Persist last 100 messages per channel in Redis (sorted set by timestamp)
        const key = `whale_chat:messages:${channelId}`;
        await redis.zadd(key, { score: Date.now(), member: JSON.stringify(message) });
        await redis.expire(key, 60 * 60 * 24 * 7); // 7 days TTL
        // Publish to channel for SSE subscribers
        await redis.publish(`whale_chat:channel:${channelId}`, JSON.stringify(message));
      } catch (redisErr) {
        console.warn('[Whale Chat] Redis write failed, falling back to memory:', redisErr);
      }
    }

    // Always update shared in-memory store (fallback + local consistency)
    if (!memoryStore.has(channelId)) memoryStore.set(channelId, []);
    const msgs = memoryStore.get(channelId)!;
    msgs.push({ ...message, _score: Date.now() });
    if (msgs.length > 100) msgs.shift();

    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error('[Whale Chat] Send error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

/**
 * GET /api/chat/send?channelId=...
 * Fetches recent messages (polling fallback for environments without SSE)
 */
export async function GET(req: NextRequest) {
  try {
    const channelId = req.nextUrl.searchParams.get('channelId');
    if (!channelId) return NextResponse.json({ messages: [] });

    const redis = getUpstashRedis();

    if (redis) {
      try {
        const key = `whale_chat:messages:${channelId}`;
        const since = req.nextUrl.searchParams.get('since');
        const sinceScore = since ? Number(since) : Date.now() - 5 * 60 * 1000;
        const raw = await redis.zrangebyscore(key, sinceScore, '+inf', { withScores: false });
        const messages = (raw as unknown[]).map((r) => {
          try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; }
        }).filter(Boolean);
        return NextResponse.json({ messages });
      } catch (redisErr) {
        console.warn('[Whale Chat] Redis read failed, falling back to memory:', redisErr);
      }
    }

    // In-memory fallback
    const msgs = memoryStore.get(channelId) ?? [];
    const since = req.nextUrl.searchParams.get('since');
    const sinceScore = since ? Number(since) : Date.now() - 5 * 60 * 1000;
    const filtered = msgs.filter(m => new Date(m.sentAt).getTime() >= sinceScore);
    return NextResponse.json({ messages: filtered });

  } catch (err) {
    console.error('[Whale Chat] Fetch error:', err);
    return NextResponse.json({ messages: [] });
  }
}
