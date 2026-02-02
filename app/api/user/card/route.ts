import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await prisma.virtualCard.findUnique({
      where: { authUserId },
    });

    return NextResponse.json({ card });
  } catch (error: any) {
    console.error('Error fetching card:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, linkedAddress } = body;

    // Check if card already exists
    const existing = await prisma.virtualCard.findUnique({
      where: { authUserId },
    });

    if (existing) {
      return NextResponse.json({ card: existing });
    }

    // Generate Mock Card Data
    const bin = "4288"; // Classic Visa Debit BIN for Human ID
    const randomBody = Math.floor(Math.random() * 999999999999).toString().padStart(12, '0');
    const cardNumber = bin + randomBody;
    const cvv = Math.floor(Math.random() * 899 + 100).toString();
    const expiry = "12/28"; // Dec 2028

    const card = await prisma.virtualCard.create({
      data: {
        authUserId,
        cardNumber,
        cvv,
        expiry,
        tier: tier || "BLACK",
        linkedAddress: linkedAddress || '',
      },
    });

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error('Error issuing card:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
