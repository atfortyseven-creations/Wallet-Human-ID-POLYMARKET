import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || address.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      select: { chatPinHash: true }
    });

    return NextResponse.json({ pinHash: user?.chatPinHash || null });
  } catch (error) {
    console.error('[Chat PIN] Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, pinHash } = await req.json();

    if (!address || !pinHash) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (address.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.user.upsert({
      where: { walletAddress: address.toLowerCase() },
      update: { chatPinHash: pinHash },
      create: { 
        walletAddress: address.toLowerCase(),
        chatPinHash: pinHash
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat PIN] Error saving:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
