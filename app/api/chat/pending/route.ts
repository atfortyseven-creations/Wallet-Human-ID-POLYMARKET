import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * Resolve the authenticated address from session OR x-web3-address header fallback.
 * This allows WalletConnect-only users (no server session cookie) to read their own
 * pending messages immediately after connecting their wallet.
 */
async function resolveUserId(req: NextRequest, queryAddress: string | null): Promise<string | null> {
  // Priority 1: server session (Humanity Ledger login / SIWE / QR handshake cookie)
  const session = await getSession();
  if (session?.userId) return session.userId.toLowerCase();

  // Priority 2: x-web3-address header (sent by WhaleChat for wagmi/WalletConnect users)
  // We only accept it when it exactly matches the requested address to prevent spoofing.
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

    const pending = await prisma.pendingChatMessage.findMany({
      where: {
        OR: [
          { sender: address },
          { recipient: address }
        ]
      },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ pending });
  } catch (error) {
    console.error('[Pending Chat] Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sender, recipient, content } = await req.json();

    if (!sender || !recipient || !content) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const userId = await resolveUserId(req, sender);
    if (!userId || sender.toLowerCase() !== userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pending = await prisma.pendingChatMessage.create({
      data: {
        sender: sender.toLowerCase(),
        recipient: recipient.toLowerCase(),
        content
      }
    });

    return NextResponse.json({ success: true, pending });
  } catch (error) {
    console.error('[Pending Chat] Error saving:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address')?.toLowerCase() ?? null;

    const userId = await resolveUserId(req, address);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!address || address !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.pendingChatMessage.deleteMany({
      where: { recipient: address }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pending Chat] Error deleting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
