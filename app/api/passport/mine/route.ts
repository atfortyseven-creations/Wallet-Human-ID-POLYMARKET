import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport } from '@/lib/passport/serialize';

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issuerAddress = session.userId.toLowerCase();
  const passports = await prisma.productPassport.findMany({
    where: { issuerAddress },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { events: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });

  return NextResponse.json({
    passports: passports.map(serializePassport),
  });
}
