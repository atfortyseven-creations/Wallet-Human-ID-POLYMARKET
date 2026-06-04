/**
 * GET /api/analytics/dune/queries
 *
 * System Dune Query Catalog
 *
 * Returns the curated library of ready-to-deploy Dune Analytics SQL queries
 * for on-chain whale analytics. Each query can be copy-pasted directly
 * into dune.com or imported via the Dune API.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

//  Curated Query Library 

const Private_QUERIES = [
    {
        id:          'whale-volume-by-chain',
        title:       'Whale Volume by Chain (Last 30 Days)',
        category:    'macro',
        description: 'Aggregates total whale-grade USD volume per blockchain over the last 30 days. Ideal for cross-chain capital flow analysis.',
        sql: `
-- Whale Alert Network  System Dune Query: Volume by Chain
SELECT
    chain,
    COUNT(*)                             AS tx_count,
    SUM(usd_value)                       AS total_volume_usd,
    AVG(usd_value)                       AS avg_volume_usd,
    MAX(usd_value)                       AS max_single_tx_usd,
    SUM(usd_value) / 1e6                 AS total_volume_millions
FROM dune_upload.whalealert_system_events
WHERE
    detected_at >= NOW() - INTERVAL '30' DAY
    AND usd_value >= 50000
GROUP BY chain
ORDER BY total_volume_usd DESC
`.trim(),
        tags: ['volume', 'cross-chain', 'macro'],
    },
    {
        id:          'mega-whale-timeline',
        title:       'Mega Whale Events Timeline (>$10M)',
        category:    'high-conviction',
        description: 'Chronological log of all transactions exceeding $10M USD. Raw institutional-grade signals.',
        sql: `
-- Whale Alert Network  System Dune Query: Mega Whale Timeline
SELECT
    detected_at,
    chain,
    token,
    tx_hash,
    FORMAT('$%,.0f', usd_value)          AS volume_formatted,
    usd_value_bucket,
    CONCAT(SUBSTRING(from_address, 1, 6), '...', RIGHT(from_address, 4)) AS from_short,
    CONCAT(SUBSTRING(to_address,   1, 6), '...', RIGHT(to_address,   4)) AS to_short
FROM dune_upload.whalealert_system_events
WHERE usd_value_bucket = 'MEGA'
ORDER BY detected_at DESC
LIMIT 500
`.trim(),
        tags: ['mega-whale', 'high-conviction', 'monitoring'],
    },
    {
        id:          'token-concentration',
        title:       'Token Whale Concentration Heatmap',
        category:    'tokenomics',
        description: 'Ranks tokens by whale concentration score  high whale activity relative to total events signals institutional accumulation pressure.',
        sql: `
-- Whale Alert Network  System Dune Query: Token Concentration
SELECT
    token,
    COUNT(*)                              AS total_events,
    SUM(usd_value)                        AS total_usd,
    COUNT(CASE WHEN usd_value_bucket IN ('MEGA','MACRO') THEN 1 END) AS institutional_events,
    ROUND(
        100.0 * COUNT(CASE WHEN usd_value_bucket IN ('MEGA','MACRO') THEN 1 END) / COUNT(*),
        2
    )                                     AS institutional_pct,
    SUM(usd_value) / 1e6                  AS volume_millions
FROM dune_upload.whalealert_system_events
WHERE detected_at >= NOW() - INTERVAL '7' DAY
GROUP BY token
HAVING COUNT(*) >= 3
ORDER BY institutional_pct DESC, total_usd DESC
LIMIT 50
`.trim(),
        tags: ['tokenomics', 'concentration', 'accumulation'],
    },
    {
        id:          'hourly-flow-pattern',
        title:       'Hourly Whale Flow Pattern (UTC)',
        category:    'timing',
        description: 'Maps whale activity to UTC hour. Reveals institutional trading windows  critical for entry timing.',
        sql: `
-- Whale Alert Network  System Dune Query: Hourly Flow Pattern
SELECT
    EXTRACT(HOUR FROM detected_at)        AS utc_hour,
    COUNT(*)                              AS event_count,
    SUM(usd_value)                        AS total_usd,
    AVG(usd_value)                        AS avg_usd
FROM dune_upload.whalealert_system_events
WHERE detected_at >= NOW() - INTERVAL '30' DAY
GROUP BY utc_hour
ORDER BY utc_hour ASC
`.trim(),
        tags: ['timing', 'sessions', 'pattern'],
    },
    {
        id:          'wallet-repeat-whales',
        title:       'Repeat Whale Wallets (Smart Money)',
        category:    'wallets',
        description: 'Identifies wallets that appear multiple times in whale-grade transactions. High-repeat wallets = institutional smart money.',
        sql: `
-- Whale Alert Network  System Dune Query: Repeat Whale Wallets
SELECT
    from_address,
    COUNT(*)                              AS tx_count,
    SUM(usd_value)                        AS total_volume_usd,
    MIN(detected_at)                      AS first_seen,
    MAX(detected_at)                      AS last_seen,
    ARRAY_AGG(DISTINCT token)             AS tokens_traded,
    ARRAY_AGG(DISTINCT chain)             AS chains_used
FROM dune_upload.whalealert_system_events
WHERE
    from_address NOT IN ('UNKNOWN', 'Contract')
    AND usd_value >= 100000
GROUP BY from_address
HAVING COUNT(*) >= 3
ORDER BY total_volume_usd DESC
LIMIT 200
`.trim(),
        tags: ['wallets', 'smart-money', 'tracking'],
    },
    {
        id:          'evm-thermodynamics-zscore',
        title:       'EVM Thermodynamics  Z-Score Spike Detection',
        category:    'research',
        description: 'Academic-grade Z-score analysis. Detects statistical anomalies in whale volume that precede significant price movements. Based on the EVM Thermodynamics paper.',
        sql: `
-- Whale Alert Network  EVM Thermodynamics Z-Score Query
WITH daily_stats AS (
    SELECT
        token,
        DATE_TRUNC('day', detected_at)    AS day,
        SUM(usd_value)                    AS daily_volume,
        COUNT(*)                          AS daily_count
    FROM dune_upload.whalealert_system_events
    WHERE detected_at >= NOW() - INTERVAL '90' DAY
    GROUP BY token, day
),
rolling AS (
    SELECT
        token,
        day,
        daily_volume,
        AVG(daily_volume) OVER w          AS rolling_avg,
        STDDEV(daily_volume) OVER w       AS rolling_std
    FROM daily_stats
    WINDOW w AS (PARTITION BY token ORDER BY day ROWS BETWEEN 14 PRECEDING AND 1 PRECEDING)
),
zscores AS (
    SELECT
        token,
        day,
        daily_volume,
        rolling_avg,
        CASE WHEN rolling_std > 0
            THEN ROUND((daily_volume - rolling_avg) / rolling_std, 3)
            ELSE 0
        END                               AS z_score
    FROM rolling
)
SELECT * FROM zscores
WHERE z_score >= 2.0
ORDER BY z_score DESC, day DESC
`.trim(),
        tags: ['research', 'z-score', 'thermodynamics', 'academic'],
    },
];

//  Handler 

export async function GET() {
    return NextResponse.json({
        version:       '2026.1',
        total:         Private_QUERIES.length,
        dataset_table: 'dune_upload.whalealert_system_events',
        export_url:    '/api/analytics/dune/export?format=csv&days=30',
        queries:       Private_QUERIES,
        instructions: {
            step1: 'Download your dataset at /api/analytics/dune/export?format=csv',
            step2: 'Go to dune.com  My Uploads  Upload CSV',
            step3: 'Name the dataset: whalealert_system_events',
            step4: 'Copy any query from this catalog and run it in the Dune editor',
            step5: 'Share your dashboard publicly to contribute to the System Analytics Commons',
        },
    }, {
        headers: { 'Cache-Control': 'public, max-age=300' },
    });
}
