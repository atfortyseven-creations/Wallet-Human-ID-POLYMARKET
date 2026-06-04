import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRedisClient } from '@/lib/redis/client';
import { safeJsonParse } from '@/lib/utils/json';
import crypto from 'crypto';

const redis = createRedisClient({ name: 'Whale-Webhook' });

// This endpoint receives HTTP POST requests from an on-chain indexing service like Alchemy Custom Webhooks or QuickNode Destinatioms.
export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        
        //  INHUMAN OPTIMIZATION: Cryptographic Signature Validation 
        const signature = req.headers.get('x-alchemy-signature') || req.headers.get('x-quicknode-signature');
        const secret = process.env.ALCHEMY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
        
        if (secret && signature) {
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(rawBody);
            const digest = hmac.digest('hex');
            
            // Prevent timing attacks
            const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
            if (!isValid) {
                console.error('[WEBHOOK ERROR] Cryptographic signature mismatch. Possible spoofing attack.');
                return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Cryptographic Signature' }, { status: 401 });
            }
        }

        const body = safeJsonParse(rawBody, null, 'WHALE_WEBHOOK') as any;
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ success: false, error: 'Malformed or empty payload' }, { status: 400 });
        }

        // Parse Payload - Expecting an array of transfers.
        const activities = body.event?.activity || body.transfers || (Array.isArray(body) ? body : [body]);

        for (const activity of activities) {
            if (!activity) continue; // Skip null entries in corrupted arrays
            const { fromAddress, toAddress, value, asset, hash, category } = activity;
            const threshold = 500000; // $500k Whale Threshold for notifications

            // Rough estimation if missing fiat value (assuming stablecoin or ETH payload mostly)
            const usdValue = (activity as any).usdValue || (asset === 'ETH' ? value * 3000 : value);

            if (usdValue >= threshold) {
                const txHash = hash || (activity as any).transactionHash || `0xWeb3Tx${Date.now()}`;
                const safeAsset = asset || 'UNKNOWN';

                // 1. Create a Persistent DB Notification (Global)
                await prisma.notification.create({
                    data: {
                        userId: null, // Global Notification
                        title: ` ${usdValue >= 1000000 ? 'MEGALODON' : 'WHALE'} DETECTED`,
                        message: `${category || 'TRANSFER'}: ${parseFloat(value).toFixed(2)} ${safeAsset} ($${usdValue.toLocaleString()})`,
                        type: 'whale',
                        isGlobal: true,
                        actionUrl: `https://etherscan.io/tx/${txHash}`
                    }
                });

                // 2. Push to Redis for immediate WebSocket Engine pickup
                const streamPayload = {
                    id: `whale-${Date.now()}`,
                    type: 'WHALE',
                    asset: safeAsset,
                    usdValue: usdValue,
                    from: fromAddress,
                    to: toAddress,
                    txHash: txHash,
                    timestamp: new Date().toISOString()
                };

                await redis.publish('whale_alerts_stream', JSON.stringify(streamPayload));
                
                // Keep the last 100 cached for late-joiners
                const cacheKey = 'latest_whale_alerts';
                const cachedRaw = await redis.get(cacheKey);
                let cachedAlerts = safeJsonParse(cachedRaw, [], 'WHALE_WEBHOOK') as any[];
                cachedAlerts.unshift(streamPayload);
                if (cachedAlerts.length > 100) cachedAlerts = cachedAlerts.slice(0, 100);
                await redis.set(cacheKey, JSON.stringify(cachedAlerts), 'EX', 86400); // 24h
                
                console.log(`[WHALE WEBHOOK] Processed TX: ${txHash} -> $${usdValue.toLocaleString()}`);
            }
        }

        return NextResponse.json({ success: true, processed: activities.length });
    } catch (error) {
        console.error('[WHALE WEBHOOK ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal processing failure' }, { status: 500 });
    }
}
