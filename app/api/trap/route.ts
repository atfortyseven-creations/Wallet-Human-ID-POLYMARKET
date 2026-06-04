import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge runtime for zero-latency trap response

// 
// HONEYPOT ROUTES  /api/trap/*
//
// These routes mimic paths that automated scanners and attackers probe
// (admin panels, debug endpoints, exposed configs, credential endpoints).
//
// ANY hit on these routes:
//   1. Returns a plausible-but-empty 200 response (low noise)
//   2. Logs the IP, User-Agent, and path to console (Railway logs + alerting)
//   3. Sets a "Private_TRAP_HIT" header for downstream WAF correlation
//
// Legitimate traffic never hits these paths.
// 

const TRAP_ROUTES = [
    '/api/admin/users',
    '/api/admin/config',
    '/api/debug',
    '/api/debug/env',
    '/api/config',
    '/api/env',
    '/.env',
    '/api/keys',
    '/api/secret',
    '/phpMyAdmin',
    '/wp-admin',
    '/wp-login.php',
    '/api/v1/admin',
    '/api/internal',
    '/api/private',
    '/api/management',
    '/api/swagger',
    '/api/graphql/introspection',
];

export async function GET(req: NextRequest) {
    const ip        = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const ua        = req.headers.get('user-agent') ?? 'unknown';
    const path      = req.nextUrl.pathname;
    const referer   = req.headers.get('referer') ?? 'none';
    const timestamp = new Date().toISOString();

    // Log to Railway console  surfaced in log drain + monitoring
    console.warn(JSON.stringify({
        level:     'SECURITY_TRAP',
        event:     'HONEYPOT_HIT',
        ip,
        path,
        userAgent: ua,
        referer,
        timestamp,
        severity:  'MEDIUM',
        note:      'Automated scanner or attacker probing restricted paths',
    }));

    // Return realistic but empty response  don't alert attacker they were detected
    // Vary response slightly by path type to appear real
    if (path.includes('admin') || path.includes('users')) {
        return NextResponse.json({ users: [], total: 0, page: 1 }, {
            headers: {
                'X-System-Trap': 'HIT',
                'Cache-Control': 'no-store',
            }
        });
    }

    if (path.includes('debug') || path.includes('env') || path.includes('config')) {
        return NextResponse.json({ debug: false, environment: 'production' }, {
            headers: { 'X-System-Trap': 'HIT', 'Cache-Control': 'no-store' }
        });
    }

    // Default: 404-like response
    return NextResponse.json({ error: 'Not found' }, {
        status: 404,
        headers: { 'X-System-Trap': 'HIT', 'Cache-Control': 'no-store' },
    });
}

export const POST = GET;
export const PUT  = GET;
export const DELETE = GET;
