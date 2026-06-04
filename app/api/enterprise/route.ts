/**
 * Enterprise Edition API
 *
 * GET  /api/enterprise           Edition info + feature grid
 * POST /api/enterprise/contact   Enterprise inquiry / deal initiation
 * GET  /api/enterprise/status    Authenticated enterprise customer status
 *
 * Philosophy: Enterprise Edition adds SUPPORT and SLA guarantees.
 * It does NOT remove systemty  the system architecture is 
 * non-negotiable at all tiers.
 *
 * Tiers:
 *   COMMUNITY    Open-source, self-hosted, no SLA
 *   PRO          $99/mo. API key, email support, 48h response
 *   ENTERPRISE   Custom pricing. SLA 99.9%, Slack channel, 4h response
 *   Private    Air-gapped deployment, on-site audit, phone+Slack
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

//  Feature Grid 

const EDITION_MATRIX = {
    COMMUNITY: {
        price:          'Free (self-hosted)',
        sourceCode:     true,
        apiMarketplace: false,
        whaleStream:    true,
        telegramAlerts: true,
        duneExport:     true,
        sla:            null,
        support:        'Community (GitHub Issues)',
        kubernetes:     'Self-managed',
        contractAudit:  false,
        enterpriseSlack: false,
        features: [
            'Real-time whale detection (5 chains)',
            'SSE streaming feed',
            'Telegram bot integration',
            'Dune Analytics export',
            'Smart contract inheritance (DeadManSwitch)',
            'Hall of Fame + Ambassador Program',
            'Full source code + all tests',
        ],
    },
    PRO: {
        price:          '$99 / month',
        sourceCode:     true,
        apiMarketplace: true,
        whaleStream:    true,
        telegramAlerts: true,
        duneExport:     true,
        sla:            '99.5% uptime',
        support:        'Email (48h response)',
        kubernetes:     'Helm chart included',
        contractAudit:  false,
        enterpriseSlack: false,
        features: [
            'Everything in COMMUNITY',
            'API Marketplace (PRO tier key)',
            '100 events/min API rate limit',
            'Priority email support',
            '99.5% SLA guarantee',
            'Kubernetes Helm chart',
        ],
    },
    ENTERPRISE: {
        price:          'Custom (contact us)',
        sourceCode:     true,
        apiMarketplace: true,
        whaleStream:    true,
        telegramAlerts: true,
        duneExport:     true,
        sla:            '99.9% uptime',
        support:        'Dedicated Slack channel (4h response)',
        kubernetes:     'Managed K8s deployment support',
        contractAudit:  true,
        enterpriseSlack: true,
        features: [
            'Everything in PRO',
            'INSTITUTIONAL API tier (300 req/min)',
            'HMAC-signed webhook delivery',
            'Dedicated Slack support channel',
            '4h SLA response guarantee',
            'Smart contract security audit assistance',
            'Custom chain/token watchlists',
            'Priority Dune query assistance',
        ],
    },
    Private: {
        price:          'Custom (strategic partnership)',
        sourceCode:     true,
        apiMarketplace: true,
        whaleStream:    true,
        telegramAlerts: true,
        duneExport:     true,
        sla:            '99.99% uptime + air-gapped',
        support:        'Phone + Slack + On-site (2h response)',
        kubernetes:     'On-site K8s deployment',
        contractAudit:  true,
        enterpriseSlack: true,
        features: [
            'Everything in ENTERPRISE',
            'Air-gapped (offline) deployment option',
            'On-site deployment and audit',
            'Custom algorithm tuning for your data',
            'Co-authorship on academic research',
            'Quarterly analytics briefing calls',
            'System Ambassador Program credit',
        ],
    },
};

//  GET  Edition Info 

export async function GET() {
    return NextResponse.json({
        product:      'Whale Alert Network',
        version:      '3.0.0',
        philosophy:   'Enterprise support. System architecture. Non-custodial always.',
        editions:     EDITION_MATRIX,
        contactUrl:   '/api/enterprise/contact',
        docsUrl:      '/docs/enterprise',
        schedulingUrl: 'https://cal.com/whalealert/enterprise',
    }, {
        headers: { 'Cache-Control': 'public, max-age=300' },
    });
}
