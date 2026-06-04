import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * Resolve the authenticated address from session OR x-web3-address header fallback.
 * This allows WalletConnect-only users (no server session cookie) to read their own
 * contact list immediately after connecting their wallet.
 */
async function resolveUserId(req: NextRequest, queryAddress: string | null): Promise<string | null> {
  // Priority 1: server session (Humanity Ledger / SIWE / QR handshake)
  const session = await getSession();
  if (session?.userId) return session.userId.toLowerCase();

  // Priority 2: x-web3-address header (sent by WhaleChat for wagmi/WalletConnect users)
  const headerAddr = req.headers.get('x-web3-address')?.toLowerCase();
  if (
    headerAddr &&
    /^0x[a-f0-9]{40}$/.test(headerAddr) &&
    queryAddress &&
    headerAddr === queryAddress.toLowerCase()
  ) {
    return headerAddr;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address')?.toLowerCase() ?? null;

    const userId = await resolveUserId(req, address);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!address || address !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const contacts = await prisma.chatContact.findMany({
      where: { owner: address },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ peers: contacts.map(c => c.peer) });
  } catch (error) {
    console.error('[Chat Contacts] Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qAddress = searchParams.get('address')?.toLowerCase() ?? null;

    const userId = await resolveUserId(req, qAddress);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { address, peers } = await req.json();

    if (!address || !peers || !Array.isArray(peers)) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    if (address.toLowerCase() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const owner = address.toLowerCase();

    const promises = peers.map(async (peerAddr: string) => {
      const peer = peerAddr.toLowerCase();
      return prisma.chatContact.upsert({
        where: { owner_peer: { owner, peer } },
        update: { updatedAt: new Date() },
        create: { owner, peer }
      });
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat Contacts] Error saving:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
