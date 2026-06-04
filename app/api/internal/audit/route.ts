import { NextResponse } from 'next/server';
import { appendAuditEntry } from '@/lib/audit/audit-trail';

// This route must NOT be edge runtime. It runs on Node.js to support Prisma and crypto.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Simple internal security check to prevent external spam
  const isInternal = req.headers.get('x-internal-audit');
  const expectedSecret = process.env.AUDIT_SECRET || 'true';
  
  if (!isInternal || isInternal !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let payload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    const { action, actor, ip, metadata } = payload;
    if (action && actor && ip) {
      await appendAuditEntry(action as any, actor, ip, metadata);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Internal Audit API] Failed to log:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
