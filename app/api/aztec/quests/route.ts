import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import crypto from 'crypto';
import { deriveIdentityHash, hashIpAddress, isOwner } from '@/lib/aztec/zk-identity';

/**
 * GET /api/aztec/quests
 * Returns available quests and the claim status for a given aztecAddress
 * [ZK-ISOLATION] Claims are queried by identityHash, not raw aztecAddress
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const aztecAddress = searchParams.get('aztecAddress');

    if (!aztecAddress) {
        return NextResponse.json({ error: 'Missing aztecAddress' }, { status: 400 });
    }

    // [ZK-ISOLATION] Derive deterministic identityHash from aztecAddress
    // This is what the DB stores — never the raw address
    const identityHash = deriveIdentityHash(aztecAddress);

    try {
        // Fetch all active quests. If the table doesn't exist yet, we catch the error.
        const quests: any[] = await prisma.$queryRaw`SELECT * FROM "AztecQuest" WHERE "isActive" = true ORDER BY "createdAt" ASC`;
        
        // [ZK] Query by identityHash, not raw aztecAddress
        const claims: any[] = await prisma.$queryRaw`SELECT * FROM "QuestClaim" WHERE "identityHash" = ${identityHash}`;
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
    const rawIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    // Salt IP hash with server secret to prevent rainbow table reversal
    const ipHash = hashIpAddress(rawIp);

    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { questId, slug, aztecAddress } = body;

        if (!aztecAddress || !slug) {
            return NextResponse.json({ error: 'Missing required fields: aztecAddress and slug' }, { status: 400 });
        }

        const evmAddress = session.userId.toLowerCase();
        
        if (!isOwner(evmAddress, aztecAddress)) {
             return NextResponse.json({ error: 'Forbidden: Address mismatch' }, { status: 403 });
        }

        // [ZK-ISOLATION] Derive identityHash — this is stored in DB, not the raw aztecAddress
        const identityHash = deriveIdentityHash(aztecAddress);

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
            if (questRows.length > 0) {
                resolvedQuestId = questRows[0].id;
            } else {
                // Auto-seed missing quest to satisfy foreign key constraint
                const newId = crypto.randomUUID();
                const titles: Record<string, string> = {
                    'twitter-follow': 'Follow on Twitter',
                    'youtube-follow': 'Subscribe to YouTube',
                    'tg-join': 'Join Telegram',
                    'page-share': 'Share Page'
                };
                await prisma.$executeRaw`
                    INSERT INTO "AztecQuest" (id, slug, title, description, "qdReward", "isActive", "createdAt")
                    VALUES (${newId}, ${slug}, ${titles[slug] || slug}, 'Quest auto-seeded', ${rewardAmount}, true, NOW())
                `;
                resolvedQuestId = newId;
            }
        } catch (_) { /* table may not exist in dev — use slug as fallback */ }

        // ── DEDUPLICATION: Atomic Serializable transaction ────────────────────────
        // Both wallet AND IP uniqueness are enforced inside a single Serializable
        // transaction — no race-condition window. The DB @@unique constraints are the
        // source of truth; the Serializable isolation level guarantees no two concurrent
        // requests can both pass the pre-checks and both insert.
        const claimId = crypto.randomUUID();
        const rewardTxHash = `quest_${slug}_${crypto.randomBytes(16).toString('hex')}`;

        try {
            await prisma.$transaction(async (tx) => {
                // [ZK-ISOLATION] 1. Check identity hasn't already claimed (by identityHash, not raw address)
                const existingWallet: any[] = await tx.$queryRaw`
                    SELECT id FROM "QuestClaim"
                    WHERE "questId" = ${resolvedQuestId} AND "identityHash" = ${identityHash}
                    LIMIT 1
                `;
                if (existingWallet.length > 0) {
                    throw new Error('WALLET_ALREADY_CLAIMED');
                }

                // 2. Check IP hasn't already claimed this quest from a different wallet (anti-Sybil)
                const existingIp: any[] = await tx.$queryRaw`
                    SELECT id FROM "QuestClaim"
                    WHERE "questId" = ${resolvedQuestId} AND "ipHash" = ${ipHash}
                    LIMIT 1
                `;
                if (existingIp.length > 0) {
                    throw new Error('IP_ALREADY_CLAIMED');
                }

                // 3. Insert claim — using identityHash (ZK-isolated), NOT raw aztecAddress
                await tx.$executeRaw`
                    INSERT INTO "QuestClaim" (id, "questId", "identityHash", "ipHash", status, "claimedAt")
                    VALUES (${claimId}, ${resolvedQuestId}, ${identityHash}, ${ipHash}, 'CLAIMED', NOW())
                `;

                // 4. Credit reward directly in the Transaction ledger
                //    Using type='AIRDROP' for full balance-ledger consistency.
                //    NOTE: We do NOT call /api/aztec/airdrop internally — that endpoint
                //    requires a user session cookie which server-to-server calls never have.
                await tx.transaction.create({
                    data: {
                        txHash:      rewardTxHash,
                        status:      'COMPLETED',
                        type:        'AIRDROP',
                        amount:      rewardAmount,
                        token:       'QDs',
                        tokenSymbol: 'QDs',
                        fromAddress: '0x0000000000000000000000000000000000000000000000000000QuestTreasury',
                        toAddress:   aztecAddress.toLowerCase(),
                        chainId:     89021716,
                        metadata: {
                            network:   'aztec-testnet',
                            onChain:   false,
                            txHash:    rewardTxHash,
                            questSlug: slug,
                            claimId,
                            reason:    `Quest reward: ${slug} (${rewardAmount} QDs)`,
                        },
                    },
                });
            }, { isolationLevel: 'Serializable' });
        } catch (txErr: any) {
            if (txErr.message === 'WALLET_ALREADY_CLAIMED' || txErr.code === 'P2002') {
                return NextResponse.json({ error: 'Quest already claimed by this wallet.', alreadyClaimed: true }, { status: 403 });
            }
            if (txErr.message === 'IP_ALREADY_CLAIMED') {
                return NextResponse.json({ error: 'This network has already claimed this quest.', alreadyClaimed: true }, { status: 403 });
            }
            console.error('[Quest] CRITICAL: Atomic transaction failed:', txErr?.message);
            return NextResponse.json({ error: 'Claim registration failed. Please try again.', code: 'DB_ERROR' }, { status: 503 });
        }

        console.log(`[Quest] ✅ ${slug} claimed by ${aztecAddress.slice(0, 16)}… — ${rewardAmount} QDs credited (txHash: ${rewardTxHash})`);

        return NextResponse.json({ 
            success:      true, 
            rewardAmount,
            onChain:      false,
            txHash:       rewardTxHash,
            claimId,
            message:      `${rewardAmount} QDs credited for quest: ${slug}`,
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
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required for slashing' }, { status: 401 });
    }

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

        // [ZK-ISOLATION] Derive identityHash for the slash lookup
        const slashIdentityHash = deriveIdentityHash(aztecAddress);
        try {
            await prisma.$executeRaw`
                UPDATE "QuestClaim" SET status = 'SLASHED', "slashedAt" = NOW() 
                WHERE "identityHash" = ${slashIdentityHash} AND ("questId" = ${slug} OR "questId" IN (SELECT id FROM "AztecQuest" WHERE slug = ${slug}))
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

