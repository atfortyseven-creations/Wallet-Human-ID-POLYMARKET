import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { getSession } = await import('@/lib/session');
    const session = await getSession();
    const web3Address = req.headers.get('x-verified-session-address');
    const userId = session?.userId || web3Address;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { sender, recipient, content } = await req.json();

    if (!sender || !recipient || !content ||
        typeof sender !== 'string' || typeof recipient !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // [SECURITY HARDENING] Prevent spoofing of the sender address
    const { deriveAztecAddress } = await import('@/lib/aztec/zk-identity');
    const aztecUserId = deriveAztecAddress(userId).toLowerCase();
    const senderLower = sender.toLowerCase();
    
    if (senderLower !== userId.toLowerCase() && senderLower !== aztecUserId) {
      return NextResponse.json({ error: 'Forbidden: You cannot spoof the sender address' }, { status: 403 });
    }

    // Basic Ethereum address or XMTP inboxId validation
    const ETH_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
    const AZTEC_ADDR_RE = /^0x[a-fA-F0-9]{64}$/;
    const isValidFormat = (id: string) => ETH_ADDR_RE.test(id) || AZTEC_ADDR_RE.test(id) || /^[a-zA-Z0-9]+$/.test(id);
    if (!isValidFormat(sender) || !isValidFormat(recipient)) {
      return NextResponse.json({ error: 'Invalid address or inboxId format' }, { status: 400 });
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
