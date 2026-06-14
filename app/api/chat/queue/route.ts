import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { sender, recipient, content } = await req.json();

    if (!sender || !recipient || !content ||
        typeof sender !== 'string' || typeof recipient !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // [SECURITY HARDENING] Prevent spoofing of the sender address
    if (sender.toLowerCase() !== session.userId.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden: You cannot spoof the sender address' }, { status: 403 });
    }

    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(sender) || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 });
    }

    const prisma = getPrisma();
    const pendingMsg = await prisma.pendingChatMessage.create({
      data: {
        sender: sender.toLowerCase(),
        recipient: recipient.toLowerCase(),
        content,
      },
    });

    return NextResponse.json({ success: true, message: pendingMsg });
  } catch (error: any) {
    console.error('[OfflineQueue] Error inserting message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
