import { NextResponse } from 'next/server';
import { safeRedisGet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const energy = await safeRedisGet('system:hive:energy');
  return NextResponse.json({
    energy: energy && energy !== 'TIMEOUT' ? parseFloat(energy) : 0,
    status: 'ACTIVE'
  });
}
