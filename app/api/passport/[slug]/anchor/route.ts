import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { serializePassport } from '@/lib/passport/serialize';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  if (!slug || !/^[a-zA-Z0-9_-]{4,64}$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid passport identifier' }, { status: 400 });
  }

  const passport = await prisma.productPassport.findUnique({
    where: { publicSlug: slug },
    select: { id: true, issuerAddress: true, txHash: true, coreEntropy: true, chainId: true },
  });
  if (!passport) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }

  if (passport.issuerAddress?.toLowerCase() !== session.userId.toLowerCase()) {
    return NextResponse.json(
      { error: 'Only the issuing organisation can confirm this record on-chain' },
      { status: 403 }
    );
  }

  let body: { coreEntropy?: string; txHash?: string; chainId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Idempotency: if already anchored with the same txHash, return current state
  if (body.txHash && passport.txHash === body.txHash) {
    const current = await prisma.productPassport.findUnique({
      where: { id: passport.id },
      include: { events: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    return NextResponse.json(serializePassport(current!));
  }

  const updated = await prisma.productPassport.update({
    where: { id: passport.id },
    data: {
      coreEntropy: body.coreEntropy ?? passport.coreEntropy,
      txHash: body.txHash ?? passport.txHash,
      chainId: typeof body.chainId === 'number' ? body.chainId : passport.chainId,
    },
    include: { events: { orderBy: { createdAt: 'desc' }, take: 50 } },
  });

  // Write an audit event so the confirmation appears in the product timeline
  if (body.txHash) {
    await prisma.provenanceEvent.create({
      data: {
        passportId: passport.id,
        eventType: 'on_chain_confirmed',
        payload: {
          txHash: body.txHash,
          chainId: body.chainId ?? null,
          confirmedAt: new Date().toISOString(),
          platform: 'StudioProvenance/v1',
        } as any,
      },
    });
  }

  return NextResponse.json(serializePassport(updated));
}
