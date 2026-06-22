import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Resolve the authenticated address from session OR x-web3-address header fallback.
 * This allows WalletConnect-only users (no server session cookie) to read their own
 * pending messages immediately after connecting their wallet.
 */
async function resolveUserId(req: NextRequest, queryAddress: string | null): Promise<string | null> {
  const session = await getSession();
  if (session?.userId) return session.userId.toLowerCase();

  const web3Address = req.headers.get('x-web3-address');
  if (web3Address) return web3Address.toLowerCase();
  
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
      where: { OR: [{ recipient: address }, { sender: address }] }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pending Chat] Error deleting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
