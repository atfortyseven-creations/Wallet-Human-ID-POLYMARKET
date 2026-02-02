import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, merchant } = body;

    const card = await prisma.virtualCard.findUnique({
      where: { authUserId },
    });

    if (!card) {
      return NextResponse.json({ error: 'No card found' }, { status: 404 });
    }

    // In a real app, this would check on-chain balance and trigger a relayer
    // For this "Authentic Demo", we simulate the transaction in the DB
    // We can use the 'Trade' or 'ZapTransaction' model or a new 'CardTransaction'
    // Since we don't have CardTransaction, we'll just return success and a mock receipt
    
    // Optional: Log it somewhere if we had a model. For now, just simulate.

    return NextResponse.json({ 
      success: true, 
      transaction: {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        merchant: merchant || "Global Merchant",
        timestamp: new Date().toISOString(),
        status: "APPROVED",
        authCode: Math.floor(Math.random() * 999999).toString().padStart(6, '0')
      }
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Transaction declined' }, { status: 400 });
  }
}
