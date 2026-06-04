import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseScanPayload } from '@/lib/scan/parseScanPayload';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ error: 'url query parameter required' }, { status: 400 });
  }

  const route = parseScanPayload(urlParam);

  if (route.type === 'passport' && route.slug) {
    const found = await prisma.productPassport.findUnique({
      where: { publicSlug: route.slug },
      select: { publicSlug: true },
    });
    if (found) {
      return NextResponse.json({ slug: found.publicSlug, source: 'passport_url' });
    }
    return NextResponse.json({ error: 'Passport not found' }, { status: 404 });
  }

  if (route.type === 'gs1' && route.gtin) {
    const found = await prisma.productPassport.findFirst({
      where: { gs1Gtin: route.gtin },
      select: { publicSlug: true },
      orderBy: { createdAt: 'desc' },
    });
    if (found) {
      return NextResponse.json({ slug: found.publicSlug, source: 'gs1', gtin: route.gtin });
    }
    return NextResponse.json({ error: 'No passport mapped to this GTIN yet' }, { status: 404 });
  }

  return NextResponse.json(
    { error: 'URL is not a supported product or GS1 link', routeType: route.type },
    { status: 400 }
  );
}
