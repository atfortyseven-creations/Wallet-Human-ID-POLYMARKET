import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport, slugifyTitle } from '@/lib/passport/serialize';
import { sequencer } from '@/lib/provenance/qd-sequencer';
import { z } from 'zod';
import OpenAI from 'openai';
import { NODE_TIERS, PlanTier } from '@/lib/node_infrastructure/tiers';
import crypto from 'crypto';

// Init OpenAI for semantic validation
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Strict institutional schema
const passportSchema = z.object({
  title: z.string().min(2).max(150),
  category: z.enum(['PHARMA', 'FOOD', 'TECH', 'INFRASTRUCTURE', 'TEXTILE', 'DOCUMENTS', 'OTHER']),
  payload: z.object({
    batchId: z.string().min(1).max(64).optional(),
    origin: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    carbonKg: z.number().nonnegative().optional(),
    certifications: z.array(z.string().max(50)).optional(),
  }).strict(),
  gs1Gtin: z.string().max(14).optional(),
  publicSlug: z.string().max(64).optional(),
}).strict();

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Connect your wallet to create a passport' }, { status: 401 });
  }
  const issuerAddress = session.userId.toLowerCase();

  const isOwner = issuerAddress === '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a';

  if (!isOwner) {
    // 1. Rate Limiting (DB-based: max 5 passports per minute per wallet)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentCount = await prisma.productPassport.count({
      where: {
        issuerAddress,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 5 records per minute allowed to prevent spam.' },
        { status: 429 }
      );
    }

    // 2. Strict Plan Enforcement
    const user = await prisma.user.findUnique({
      where: { walletAddress: issuerAddress },
      select: { tier: true }
    });

    const userTierStr = user?.tier || 'FREE';
    const tierKey = NODE_TIERS[userTierStr as PlanTier] ? (userTierStr as PlanTier) : PlanTier.FREE;
    const planConfig = NODE_TIERS[tierKey];

    if (tierKey === PlanTier.FREE) {
      // Free users have a strict LIFETIME limit of 3 products
      const totalCount = await prisma.productPassport.count({
        where: { issuerAddress },
      });

      if (totalCount >= 3) {
        return NextResponse.json(
          { error: 'Free tier limit reached. You can only create 3 passports. Please upgrade your plan.' },
          { status: 403 }
        );
      }
    } else {
      const dailyLimit = planConfig.limits.requestsPerDay;
      if (dailyLimit !== -1) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayCount = await prisma.productPassport.count({
          where: {
            issuerAddress,
            createdAt: { gte: startOfToday },
          },
        });

        if (todayCount >= dailyLimit) {
          return NextResponse.json(
            { error: `Daily limit reached. Your ${planConfig.name} allows exclusively ${dailyLimit} DPPs per day. Please upgrade your plan.` },
            { status: 403 }
          );
        }
      }
    }
  }

  // 3. Parse and validate syntax
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = passportSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid data format', details: (parseResult.error as any).errors },
      { status: 400 }
    );
  }

  const validData = parseResult.data;

  // 3. Static Profanity / Obscenity Filter (Deterministic Blacklist)
  const PROFANITY_BLACKLIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'cock', 'bastard',
    'puta', 'mierda', 'pendejo', 'cabron', 'maricon', 'verga', 'culo', 'zorra', 'puto', 'gilipollas', 'concha', 'cojones'
  ];

  function containsProfanity(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    // Use word boundaries to avoid false positives (e.g. "assassin" -> "ass")
    return PROFANITY_BLACKLIST.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
  }

  const fieldsToCheck = [
    validData.title,
    validData.category,
    validData.payload?.description,
    validData.payload?.batchId
  ];

  if (fieldsToCheck.some(field => typeof field === 'string' && containsProfanity(field))) {
    return NextResponse.json(
      { error: 'Inappropriate content detected. Please use normal words.' },
      { status: 400 }
    );
  }

  // 4. Create the passport (Atomic Collision Fix)
  let publicSlug = (validData.publicSlug || '').trim();
  if (!publicSlug) publicSlug = slugifyTitle(validData.title);

  const existing = await prisma.productPassport.findUnique({ where: { publicSlug } });
  if (existing) {
    publicSlug = `${slugifyTitle(validData.title)}-${crypto.randomUUID().split('-')[0]}`;
  }

  let passport;
  try {
    passport = await prisma.productPassport.create({
      data: {
        publicSlug,
        title: validData.title,
        category: validData.category,
        issuerAddress,
        payload: validData.payload,
        gs1Gtin: validData.gs1Gtin?.replace(/\D/g, '') || null,
        events: {
          create: [{ eventType: 'manufactured', payload: { note: 'Registered via Studio Provenance API' } }],
        },
      },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    });
  } catch (error: any) {
    console.error('[WhaleFortress] Atomic DB Guard caught Prisma exception:', error);
    // P2002: Unique constraint failed
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation (Slug collision). Please try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal database error during quantum registry.' }, { status: 500 });
  }

  // 5. Instantly trigger the robust Aztec Sequencer (Async Queue)
  // This executes "como la mantequilla": it won't block the API response
  // but will safely handle PXE init, proof generation, and txHash DB sync.
  sequencer.submitPassportToAztec(passport.id, {
    slug: publicSlug,
    batchId: validData.payload?.batchId,
    supplierId: issuerAddress, // For this initial system, issuer acts as supplier
    metadata: validData.payload
  }).catch(err => {
    console.error(`[API] Failed to trigger sequencer for ${passport.id}:`, err);
  });

  return NextResponse.json(serializePassport(passport), { status: 201 });
}
