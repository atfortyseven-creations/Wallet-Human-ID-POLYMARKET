// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isAdmin } from '@/lib/admin';

export async function GET(req: Request) {
  try {
    // [SECURITY HARDENING] Session logs contain sensitive PII (IPs, user agents, activity patterns).
    // Previously fully unauthenticated — any attacker could enumerate all users' sessions.
    // Now requires admin authentication.
    const session = await getSession();
    if (!session?.userId || !isAdmin(session.userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const rawLimit = parseInt(searchParams.get('limit') || '50');
    const limit = Math.min(rawLimit, 500); // Cap to prevent full-table dumps
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const logs = await prisma.userSessionLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.userSessionLog.count({ where });
    return NextResponse.json({ logs, total: total > 0 ? total : logs.length });
  } catch (error) {
    console.error('Session Logs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exportFormat, action } = body;

    // [SECURITY HARDENING] For export, require admin. For insertion, bind userId to session.
    const session = await getSession();

    //  Active insertion 
    if (!exportFormat && action) {
      // Bind userId to the authenticated session — never trust body-supplied userId
      const sessionUserId = session?.userId || null;
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const ua = req.headers.get('user-agent') || 'System';

      // Generate a deterministic sessionId from ip+ua so UserSessionLog.sessionId
      // (required non-null String in schema) is always reliably populated.
      const rawFingerprint = `${ip}||${ua}`;
      let hashVal = 0;
      for (let i = 0; i < rawFingerprint.length; i++) {
        hashVal = ((hashVal << 5) - hashVal) + rawFingerprint.charCodeAt(i);
        hashVal |= 0;
      }
      const sessionId = `sess_${Math.abs(hashVal).toString(36)}`;

      // --- REAL-TIME CLOUDFLARE GEOLOCATION FOR NETWORK MAP ---
      try {
        const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
        if (country !== 'UNKNOWN') {
            const { redisClient } = await import('@/lib/redis/client');
            // Track unique visitors per country using the sessionId
            const isNew = await (redisClient as any).sadd(`wc:unique_country_visitors:${country}`, sessionId).catch(() => 0);
            if (isNew) {
                await (redisClient as any).hincrby('wc:country', country, 1).catch(() => {});
            }
        }
      } catch (e) {
        // Silently ignore telemetry failures
      }

      try {
        const newLog = await prisma.userSessionLog.create({
          data: {
            userId: sessionUserId,
            sessionId,
            action,
            ipAddress: ip,
            userAgent: ua,
          },
        });
        return NextResponse.json({ success: true, log: newLog });
      } catch (err) {
        console.error('Log insertion error:', err);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
      }
    }

    // Bulk CSV export — admin only
    if (!session?.userId || !isAdmin(session.userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required for export' }, { status: 403 });
    }

    let logs = await prisma.userSessionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5000,
    });

    if (logs.length === 0) {
      logs = [{
        id: 'empty',
        userId: null,
        sessionId: 'none',
        action: 'NO_LOGS_FOUND',
        timestamp: new Date(),
        ipAddress: '0.0.0.0',
        userAgent: 'System',
        entityType: null,
        entityId: null,
        deviceType: null,
        location: null,
        metadata: null,
      }];
    }

    if (exportFormat === 'csv') {
      const header = 'ID,User_ID,Session_ID,Action,Timestamp,IP_Address,User_Agent\n';
      const escapeCsv = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;

      const rows = logs.map((l: any) => [
        escapeCsv(l.id),
        escapeCsv(l.userId || ''),
        escapeCsv(l.sessionId || ''),
        escapeCsv(l.action),
        escapeCsv(l.timestamp.toISOString()),
        escapeCsv(l.ipAddress || ''),
        escapeCsv(l.userAgent || ''),
      ].join(',')).join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="system_security_logs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Session Logs POST Error:', error);
    return NextResponse.json({ error: 'Failed to export logs' }, { status: 500 });
  }
}
