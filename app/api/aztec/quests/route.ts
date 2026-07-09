import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * GET /api/aztec/quests
 * Returns available quests and the claim status for a given aztecAddress
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const aztecAddress = searchParams.get('aztecAddress');

    if (!aztecAddress) {
        return NextResponse.json({ error: 'Missing aztecAddress' }, { status: 400 });
    }

    try {
        // Fetch all active quests. If the table doesn't exist yet, we catch the error.
        // We use queryRaw to avoid Prisma Client generation issues if schema is fresh.
        const quests: any[] = await prisma.$queryRaw`SELECT * FROM "AztecQuest" WHERE "isActive" = true ORDER BY "createdAt" ASC`;
        
        const claims: any[] = await prisma.$queryRaw`SELECT * FROM "QuestClaim" WHERE "aztecAddress" = ${aztecAddress}`;
        const claimMap = new Map(claims.map(c => [c.questId, c.status]));

        const result = quests.map(q => ({
            id: q.id,
            slug: q.slug,
            title: q.title,
            description: q.description,
            qdReward: q.qdReward,
            status: claimMap.get(q.id) || 'UNCLAIMED'
        }));

        return NextResponse.json({ quests: result });
    } catch (error: any) {
        // Fallback mock if tables aren't created yet during dev
        if (error.message.includes('does not exist')) {
            const fallbackQuests = [
                { id: '1', slug: 'twitter-follow', title: 'Follow on Twitter', description: 'Follow @whalecosystem for 50 QDs', qdReward: 50, status: 'UNCLAIMED' },
                { id: '2', slug: 'youtube-follow', title: 'Subscribe to YouTube', description: 'Subscribe to Humanity Ledger for 200 QDs', qdReward: 200, status: 'UNCLAIMED' },
                { id: '3', slug: 'tg-join', title: 'Join Telegram', description: 'Join t.me/humanityledger for 200 QDs', qdReward: 200, status: 'UNCLAIMED' },
                { id: '4', slug: 'page-share', title: 'Share Page', description: 'Share this page for 15 QDs', qdReward: 15, status: 'UNCLAIMED' }
            ];
            return NextResponse.json({ quests: fallbackQuests, notice: 'Database tables not yet initialized.' });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/aztec/quests
 * Claims a quest reward
 * Body: { questId, slug, aztecAddress }
 */
export async function POST(req: NextRequest) {
    // Use the first IP from x-forwarded-for (actual client, not proxy chain)
    const rawIp = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    // Salt IP hash with server secret to prevent rainbow table reversal
    const ipHash = crypto.createHash('sha256').update(rawIp + (process.env.JWT_SECRET || 'whale-oracle-secret')).digest('hex');

    try {
        const body = await req.json();
        const { questId, slug, aztecAddress } = body;

        if (!aztecAddress || !slug) {
            return NextResponse.json({ error: 'Missing required fields: aztecAddress and slug' }, { status: 400 });
        }

        // Validate slug against hardcoded allowlist — cannot be spoofed via questId injection
        const rewardMap: Record<string, number> = {
            'twitter-follow': 50,
            'page-share': 15,
            'youtube-follow': 200,
            'tg-join': 200
        };

        const rewardAmount = rewardMap[slug];
        if (!rewardAmount) {
            return NextResponse.json({ error: 'Invalid quest slug' }, { status: 400 });
        }

        // Resolve canonical questId from slug to prevent ID/slug mismatch attacks
        let resolvedQuestId: string = questId || slug;
        try {
            const questRows: any[] = await prisma.$queryRaw`
                SELECT id FROM "AztecQuest" WHERE slug = ${slug} AND "isActive" = true LIMIT 1
            `;
            if (questRows.length > 0) resolvedQuestId = questRows[0].id;
        } catch (_) { /* table may not exist in dev — use slug as fallback */ }

        // ── STEP 1: WALLET deduplication — atomic ON CONFLICT ─────────────────────
        // @@unique([questId, aztecAddress]) in schema is the source of truth.
        // If this INSERT succeeds → wallet has never claimed this quest. Safe to proceed.
        // If it returns 0 rows inserted → already claimed. Abort immediately. No mint.
        const claimId = crypto.randomUUID();
        let walletInserted: number | bigint = 0;
        try {
            walletInserted = await prisma.$executeRaw`
                INSERT INTO "QuestClaim" (id, "questId", "aztecAddress", "ipHash", status, "claimedAt")
                VALUES (${claimId}, ${resolvedQuestId}, ${aztecAddress}, ${ipHash}, 'CLAIMED', NOW())
                ON CONFLICT ("questId", "aztecAddress") DO NOTHING
            `;
        } catch (dbErr: any) {
            // Any DB error (connection, table missing, etc.) = hard fail — NEVER mint on uncertainty
            console.error('[Quest] CRITICAL: DB INSERT failed — aborting mint to prevent exploit:', dbErr?.message);
            return NextResponse.json({ error: 'Claim registration failed. Please try again.', code: 'DB_ERROR' }, { status: 503 });
        }

        if (!walletInserted || walletInserted === BigInt(0) || walletInserted === 0) {
            return NextResponse.json({ error: 'Quest already claimed by this wallet.', alreadyClaimed: true }, { status: 403 });
        }

        // ── STEP 2: IP deduplication check (read-after-write, non-atomic but sufficient) ───
        // The @@unique([questId, ipHash]) is enforced. We already inserted with this ipHash.
        // If another row exists with the same questId + ipHash, the insert above would have
        // inserted a new row (since it was a different aztecAddress), so we check explicitly.
        try {
            const ipConflict: any[] = await prisma.$queryRaw`
                SELECT id FROM "QuestClaim"
                WHERE "questId" = ${resolvedQuestId} AND "ipHash" = ${ipHash} AND id != ${claimId}
                LIMIT 1
            `;
            if (ipConflict.length > 0) {
                // Same IP already claimed this quest from a different wallet — anti-sybil block
                // Rollback our insert
                await prisma.$executeRaw`DELETE FROM "QuestClaim" WHERE id = ${claimId}`;
                return NextResponse.json({ error: 'This IP address has already claimed this quest.', alreadyClaimed: true }, { status: 403 });
            }
        } catch (_) { /* Non-fatal: if IP check fails, wallet uniqueness already guaranteed */ }

        // 2. MINT ON-CHAIN ONLY AFTER DB COMMIT
        const oraclePayload = `${aztecAddress}:${slug}:${rewardAmount}:${Date.now()}`;
        const oracleSig = crypto
          .createHmac('sha256', process.env.JWT_SECRET || 'whale-oracle-secret')
          .update(oraclePayload)
          .digest('hex');

        const baseUrl = new URL(req.url).origin;
        let onChainResult: any = null;
        try {
          const mintRes = await fetch(`${baseUrl}/api/aztec/airdrop`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Oracle-Sig': oracleSig,
              'X-Oracle-Payload': oraclePayload,
              'X-Internal-Call': 'quest-reward',
            },
            body: JSON.stringify({ 
              address: aztecAddress, 
              amount: rewardAmount,
              reason: `Quest: ${slug}`,
              oracleSig,
            }),
          });
          onChainResult = await mintRes.json();
        } catch (mintErr: any) {
          console.error('[Quest] On-chain mint failed:', mintErr?.message);
        }

        // 3. AUDIT LOG
        try {
            await prisma.transaction.create({
                data: {
                    txHash: onChainResult?.txHash || `quest_oracle_${crypto.randomBytes(16).toString('hex')}`,
                    status: 'COMPLETED',
                    type: 'RECEIVE',
                    amount: rewardAmount,
                    token: 'QDs',
                    tokenSymbol: 'QDs',
                    fromAddress: '0xAztecQuestTreasury',
                    toAddress: aztecAddress.toLowerCase(),
                    chainId: 89021716,
                    metadata: {
                        network: 'aztec-testnet',
                        onChain: onChainResult?.onChain ?? false,
                        txHash: onChainResult?.txHash || null,
                        oracleSig,
                        reason: `Quest reward: ${slug}`
                    }
                }
            });
        } catch (dbErr: any) {
            console.error('[Quest] Failed to record transaction in DB:', dbErr?.message);
        }

        return NextResponse.json({ 
            success: true, 
            rewardAmount,
            onChain: onChainResult?.onChain ?? false,
            txHash: onChainResult?.txHash || null
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * DELETE /api/aztec/quests
 * Slashing logic: Admin/System endpoint to slash QDs if user unfollows
 */
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { aztecAddress, slug } = body;

        const rewardMap: Record<string, number> = {
            'twitter-follow': 50,
            'page-share': 15,
            'youtube-follow': 200,
            'tg-join': 200
        };
        const slashAmount = rewardMap[slug] || 0;

        const AZTEC_BURN_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://humanidfi.com';

        // Trigger real on-chain transfer-to-burn-address for slashing
        let burnResult: any = null;
        try {
          const burnRes = await fetch(`${baseUrl}/api/aztec/transfer`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Internal-Call': 'slash',
            },
            body: JSON.stringify({
              from: aztecAddress,
              to: AZTEC_BURN_ADDRESS,
              amount: slashAmount,
              reason: `Slash: unfollow ${slug}`,
            }),
          });
          burnResult = await burnRes.json();
        } catch (burnErr: any) {
          console.error('[Quest Slash] On-chain burn failed:', burnErr?.message);
        }

        // Deduct from ledger as audit trail
        await prisma.transaction.create({
            data: {
                txHash: burnResult?.txHash || `slash_${crypto.randomBytes(16).toString('hex')}`,
                status: 'COMPLETED',
                type: 'SLASH',
                amount: slashAmount,
                token: 'QDs',
                tokenSymbol: 'QDs',
                fromAddress: aztecAddress.toLowerCase(),
                toAddress: '0xAztecSlashingTreasury',
                chainId: 89021716,
                metadata: {
                    network: 'aztec-testnet',
                    onChain: burnResult?.onChain ?? false,
                    txHash: burnResult?.txHash || null,
                    reason: `Quest unfollow penalty: ${slug} (-${slashAmount} QDs)`
                }
            }
        });

        try {
            await prisma.$executeRaw`
                UPDATE "QuestClaim" SET status = 'SLASHED', "slashedAt" = NOW() 
                WHERE "aztecAddress" = ${aztecAddress} AND ("questId" = ${slug} OR "questId" IN (SELECT id FROM "AztecQuest" WHERE slug = ${slug}))
            `;
        } catch(e) {}

        return NextResponse.json({ 
          success: true, 
          slashedAmount: slashAmount,
          onChain: burnResult?.onChain ?? false,
          txHash: burnResult?.txHash || null,
        });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

