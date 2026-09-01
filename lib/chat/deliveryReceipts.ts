import { safeRedisSet, safeRedisGet } from '@/lib/redis/client';

export type ReceiptStatus = 'sent' | 'delivered' | 'read';

export async function setMessageReceipt(
  messageId: string, 
  status: ReceiptStatus, 
  recipientAddress: string
): Promise<void> {
  await safeRedisSet(
    `receipt:${messageId}:${recipientAddress}`,
    JSON.stringify({ status, timestamp: Date.now() }),
    'EX',
    86400 // 24h TTL
  );
}

export async function getMessageReceipt(
  messageId: string,
  recipientAddress: string
): Promise<{ status: ReceiptStatus; timestamp: number } | null> {
  const raw = await safeRedisGet(`receipt:${messageId}:${recipientAddress}`);
  if (!raw || raw === 'TIMEOUT') return null;
  try { return JSON.parse(raw); } catch { return null; }
}
