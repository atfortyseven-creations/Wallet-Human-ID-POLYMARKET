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
  // GS1 GTIN: 8, 12, 13, or 14 digit numeric string (EAN-8, UPC-A, EAN-13, ITF-14)
  gs1Gtin: z.string().regex(/^\d{8}(\d{4}|\d{5}|\d{6})?$/, {
    message: 'GS1 barcode must be a valid GTIN: 8, 12, 13, or 14 numeric digits.'
  }).optional(),
  publicSlug: z.string().max(64).optional(),
  // Events are accepted from the frontend but handled server-side separately
  events: z.array(z.object({
    eventType: z.string(),
    payload: z.record(z.string(), z.any()),
  })).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Connect your wallet to create a passport' }, { status: 401 });
  }
  const issuerAddress = session.userId.toLowerCase();

  const adminWallet = (process.env.ADMIN_WALLET_ADDRESS || '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a').toLowerCase();
  const isOwner = issuerAddress === adminWallet;

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

    // 2. Strict Global Limit for non-owners (3 passports max)
    const totalCount = await prisma.productPassport.count({
      where: { issuerAddress },
    });

    if (totalCount >= 3) {
      return NextResponse.json(
        { error: 'Limit reached. You can only create 3 Product Passports maximum.' },
        { status: 403 }
      );
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
    // Build a human-readable error pointing to the first invalid field
    const firstError = (parseResult.error as any).errors[0];
    const fieldName = firstError?.path?.join('.') || 'unknown field';
    const message = firstError?.message || 'Validation failed';
    return NextResponse.json(
      { error: `${message} (field: ${fieldName})` },
      { status: 400 }
    );
  }

  const validData = parseResult.data;

  // 3. Static Profanity / Obscenity Filter (Deterministic Blacklist)
  const PROFANITY_BLACKLIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'cock', 'bastard',
    'puta', 'mierda', 'pendejo', 'cabron', 'maricon', 'verga', 'culo', 'zorra', 'puto', 'gilipollas', 'concha', 'cojones'
  ];

  // Anti-XSS Payload Sanitization Function
  const sanitizeHTML = (str: string) => str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );

  function containsProfanity(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    // Escape special chars to prevent ReDoS attacks
    return PROFANITY_BLACKLIST.some(word => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
    });
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

  // 4. Create the passport with resilient Anti-Collision Retry Loop
  let publicSlug = (validData.publicSlug || '').trim();
  if (!publicSlug) publicSlug = slugifyTitle(validData.title);
  
  // Fortification: Strip invalid URL characters
  publicSlug = publicSlug.replace(/[^a-z0-9-]/gi, '').toLowerCase();

  let passport = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (attempts < MAX_ATTEMPTS) {
    try {
      passport = await prisma.productPassport.create({
        data: {
          publicSlug,
          title: sanitizeHTML(validData.title),
          category: validData.category,
          issuerAddress,
          payload: validData.payload ? JSON.parse(JSON.stringify({
            ...validData.payload,
            description: validData.payload.description ? sanitizeHTML(validData.payload.description) : undefined,
            origin: validData.payload.origin ? sanitizeHTML(validData.payload.origin) : undefined,
            batchId: validData.payload.batchId ? sanitizeHTML(validData.payload.batchId) : undefined,
          })) : {},
          gs1Gtin: validData.gs1Gtin?.replace(/\D/g, '') || null,
          events: {
            create: [{ eventType: 'manufactured', payload: { note: 'Registered via Studio Provenance API' } }],
          },
        },
        include: { events: { orderBy: { createdAt: 'desc' } } },
      });
      break; // Success, break loop
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('publicSlug')) {
        attempts++;
        publicSlug = `${slugifyTitle(validData.title)}-${crypto.randomUUID().split('-')[0]}`;
      } else {
        console.error('[WhaleFortress] Atomic DB Guard caught Prisma exception:', error);
        return NextResponse.json({ error: 'Internal database error during quantum registry.' }, { status: 500 });
      }
    }
  }

  if (!passport) {
    return NextResponse.json({ error: 'System under heavy load. Unique slug generation failed. Try again.' }, { status: 409 });
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
