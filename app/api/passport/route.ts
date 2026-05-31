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
  title: z.string().min(3).max(150).regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Title contains invalid characters'),
  category: z.enum(['PHARMA', 'FOOD', 'TECH', 'INFRASTRUCTURE', 'TEXTILE', 'DOCUMENTS', 'OTHER']),
  payload: z.object({
    batchId: z.string().min(5).max(32).regex(/^[A-Z0-9-]+$/, 'Batch ID must be uppercase alphanumeric and dashes only'),
    origin: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    carbonKg: z.number().nonnegative().optional(),
    certifications: z.array(z.string().max(50)).optional(),
  }),
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
      { error: 'Invalid data format', details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const validData = parseResult.data;

  // 3. AI Semantic Coherence Check
  // We ask OpenAI to evaluate if the input makes logical sense for a physical product registry.
  // We do this to prevent spam like "Book" with "Water bottle" batch ID.
  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI auditor for an institutional supply chain registry. 
Evaluate the provided product data for semantic coherence and realism.
Reject fake, spam, testing, or mismatched data (e.g., category 'FOOD' but title 'iPhone', or description 'test test').
Respond ONLY with a JSON object: {"valid": boolean, "reason": "Short explanation if invalid"}`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: validData.title,
            category: validData.category,
            description: validData.payload.description,
            batchId: validData.payload.batchId,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.1,
    });

    const result = JSON.parse(aiResponse.choices[0].message.content || '{"valid": false, "reason": "AI validation failed"}');
    if (!result.valid) {
      return NextResponse.json(
        { error: `Semantic validation failed: ${result.reason}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('OpenAI validation error:', error);
    // If OpenAI fails (e.g. no API key), we continue to not block production. 
    // In strict environments, you would return 500 here.
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
