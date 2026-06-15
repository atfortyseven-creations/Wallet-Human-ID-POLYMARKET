import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

// [PRODUCTION] Public V1 Whale API
// "Whale Real Time" - 100% Data Integrity
// Access: Paid/Key only

// [CORS] Helper to add headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*', // Allow ALL sites to use this API
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    };
}

// [CORS] Preflight for browsers
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const apiKeyHeader = req.headers.get('x-api-key');

  if (!apiKeyHeader) {
    return NextResponse.json(
      { error: 'Missing x-api-key header', docs: '/developer' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // [SECURITY HARDENING] Compare hashed key against stored hash to prevent
  // plaintext API key exposure in case of database breach.
  // Keys stored as SHA-256 hashes; incoming key is hashed before lookup.
  const keyHash = createHash('sha256').update(apiKeyHeader).digest('hex');

  try {
      // Try hash-based lookup first (secure), fall back to plaintext for legacy keys
      let validKey = await (prisma as any).apiKey.findFirst({
          where: { 
            OR: [
              { keyHash: keyHash },    // New secure format
              { key: apiKeyHeader }    // Legacy plaintext (migrate gradually)
            ],
            isActive: true
          }
      });

      if (!validKey) {
           return NextResponse.json({ error: 'Invalid or expired API Key' }, { status: 403, headers: corsHeaders() });
      }

      // [METRICS] Increment usage (async fire and forget to not block response)
      (prisma as any).apiKey.update({
          where: { id: validKey.id },
          data: { 
              requests: { increment: 1 },
              lastUsedAt: new Date()
          }
      }).catch((err: any) => console.error('Failed to update stats', err));

      // [LOGIC] Fetch Real Whale Data
      // Use Singleton Service for connection pooling
      const { whaleService } = await import('@/lib/services/whale-data');
      
      const alerts = await whaleService.getLatestWhaleActivity(
          25,       // Limit
          undefined, // All tokens (symbol)
          100000    // Min Value $100k
      );

      return NextResponse.json({
          status: 'live',
          tier: validKey.plan,
          count: alerts.length,
          data: alerts,
          meta: {
              source: 'Harmony RPC / Alchemy Mainnet',
              latency: 'real-time'
          }
      }, {
          headers: corsHeaders() 
      });

  } catch (error) {
      console.error('[API V1 Error]', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders() });
  }
}

