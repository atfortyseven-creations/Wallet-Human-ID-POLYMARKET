import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport, slugifyTitle } from '@/lib/passport/serialize';
import { z } from 'zod';
import OpenAI from 'openai';

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
  }),
  events: z.array(z.any()).optional(),
  gs1Gtin: z.string().max(14).optional(),
  publicSlug: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Connect your wallet to create a passport' }, { status: 401 });
  }
  const issuerAddress = session.userId.toLowerCase();

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
      { error: 'Rate limit exceeded. Maximum 5 records per minute allowed.' },
      { status: 429 }
    );
  }

  // 2. Parse and validate syntax
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

  // 4. Create the passport
  let publicSlug = (validData.publicSlug || '').trim();
  if (!publicSlug) publicSlug = slugifyTitle(validData.title);

  const existing = await prisma.productPassport.findUnique({ where: { publicSlug } });
  if (existing) publicSlug = slugifyTitle(validData.title);

  const passport = await prisma.productPassport.create({
    data: {
      publicSlug,
      title: validData.title,
      category: validData.category,
      issuerAddress,
      payload: validData.payload as any,
      gs1Gtin: validData.gs1Gtin?.replace(/\D/g, '') || null,
      events: {
        create: [{ eventType: 'manufactured', payload: { note: 'Registered via Studio Provenance API' } }],
      },
    },
    include: { events: { orderBy: { createdAt: 'desc' } } },
  });

  return NextResponse.json(serializePassport(passport), { status: 201 });
}
