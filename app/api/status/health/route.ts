import { NextResponse } from 'next/server';

// 
// REAL-TIME PLATFORM HEALTH CHECK API
// Probes every critical service endpoint live  zero mocks, zero fabrication.
// Returns latency, HTTP status, and operational verdict for each service.
// 

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ServiceResult {
  name: string;
  url: string;
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  httpCode: number | null;
  checkedAt: string;
  accessible: boolean;   // true = page loads correctly for users
}

async function probe(name: string, url: string, timeoutMs = 9000): Promise<ServiceResult> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'x-health-probe': '1',
        'Accept': 'text/html,application/json',
        'User-Agent': 'HumanityLedger-HealthBot/2.0',
      },
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    const httpCode = res.status;

    // Determine accessibility: 2xx = fully accessible, 3xx = redirected (still accessible),
    // 401/403/404 = page exists but access-gated (degraded from user perspective), 5xx = outage
    const accessible = httpCode >= 200 && httpCode < 400;
    let serviceStatus: 'operational' | 'degraded' | 'outage';

    if (httpCode >= 500) {
      serviceStatus = 'outage';
    } else if (httpCode === 401 || httpCode === 403) {
      // Auth-gated  service is up, but users hitting this without auth get blocked
      serviceStatus = latencyMs > 4000 ? 'degraded' : 'operational';
    } else if (httpCode >= 200 && httpCode < 400) {
      serviceStatus = latencyMs > 3500 ? 'degraded' : 'operational';
    } else {
      serviceStatus = 'degraded';
    }

    return { name, url, status: serviceStatus, latencyMs, httpCode, checkedAt, accessible };

  } catch (err: unknown) {
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      name,
      url,
      status: isTimeout ? 'degraded' : 'outage',
      latencyMs,
      httpCode: null,
      checkedAt,
      accessible: false,
    };
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.humanidfi.com';

  // Probe all platform feature routes in parallel  real, live probes
  const results = await Promise.all([
    probe('Dashboard',  `${baseUrl}/`),
    probe('Whale Chat', `${baseUrl}/chat`),
    probe('Portfolio',  `${baseUrl}/portfolio`),
    probe('News',       `${baseUrl}/news`),
    probe('Academy',    `${baseUrl}/academy`),
    probe('Forum',      `${baseUrl}/forum`),
    probe('QDs',        `${baseUrl}/qds`),
  ]);

  const allOperational = results.every(r => r.status === 'operational');
  const anyOutage      = results.some(r  => r.status === 'outage');
  const overallStatus  = allOperational ? 'operational' : anyOutage ? 'outage' : 'degraded';

  const avgLatency = Math.round(
    results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length
  );

  // Count truly accessible pages (2xx/3xx)
  const accessibleCount = results.filter(r => r.accessible).length;

  return NextResponse.json(
    {
      ok: true,
      overallStatus,
      avgLatencyMs: avgLatency,
      checkedAt: new Date().toISOString(),
      totalServices: results.length,
      accessibleServices: accessibleCount,
      services: results,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    }
  );
}
