import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiRequest } from '@/lib/api-guard';
import { WacAnalyticsService } from '@/lib/analytics-service';

export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/v1/whale/signals Advanced Elite Signals
 * Returns Heikin-Ashi trends and Z-Score anomalies.
 */
export async function GET(req: NextRequest) {
  const endpoint = '/api/v1/whale/signals';
  
  const auth = await validateApiKey(req);
  if (!auth.valid || !auth.subscription) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  const { subscription } = auth;
  
  // Pro/Elite only
  if (subscription.tier === 'starter') {
    return NextResponse.json({ 
      error: 'Access denied. Upgrade to Pro or Elite for Signals API.' 
    }, { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token') || 'ETH';
    
    // 1. Fetch HA Signals
    const signals = await WacAnalyticsService.getHeikinAshiSignals(token, 20);
    
    // 2. Fetch Anomaly Alerts
    const anomalies = await WacAnalyticsService.getAnomalyAlerts(token);

    // 3. Fetch Dark Pool Logic (Elite Only)
    let darkPool = [];
    if (subscription.tier === 'Elite') {
      darkPool = await WacAnalyticsService.getDarkPoolEvents();
    }

    await logApiRequest(req, subscription.id, endpoint, 200);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      token,
      tier: subscription.tier,
      analytics: {
        heikin_ashi: signals,
        anomalies: anomalies.map(a => ({
          hash: a.hash,
          usd_value: a.usdValue,
          anomaly_score: a.anomalyScore,
          severity: a.severity
        }))
      },
      Elite_exclusive: subscription.tier === 'Elite' ? {
        dark_pool_transfers: darkPool
      } : "Upgrade to Elite for Dark Pool monitoring.",
      attribution: "Proprietary Analytics by Whale Alert Corporation."
    });

  } catch (error: any) {
    console.error('[SIGNALS API] Error:', error);
    return NextResponse.json({ error: 'Failed to process analytics signals' }, { status: 500 });
  }
}

