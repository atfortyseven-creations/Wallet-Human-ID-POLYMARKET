import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

const CHAT_CACHE_TTL = 300; // 5 minutes

/** Cache recent messages for a conversation to reduce DB reads */
export async function getCachedMessages(conversationKey: string): Promise<any[] | null> {
  const raw = await safeRedisGet(`chat:messages:${conversationKey}`);
  if (!raw || raw === 'TIMEOUT') return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function setCachedMessages(conversationKey: string, messages: any[]): Promise<void> {
  await safeRedisSet(`chat:messages:${conversationKey}`, JSON.stringify(messages), 'EX', CHAT_CACHE_TTL);
}

/** Invalidate chat cache when new message arrives */
export async function invalidateChatCache(conversationKey: string): Promise<void> {
  await safeRedisSet(`chat:messages:${conversationKey}`, '', 'EX', 1);
}
