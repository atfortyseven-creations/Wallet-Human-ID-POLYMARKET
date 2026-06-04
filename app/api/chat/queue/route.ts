import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sender, recipient, content } = await req.json();

    if (!sender || !recipient || !content ||
        typeof sender !== 'string' || typeof recipient !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
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
