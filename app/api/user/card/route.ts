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

    // [PRODUCTION REAL] In a real app, we would call a BaaS provider like Striga here
    // Example: const strigaCard = await striga.createCard({ userId: authUserId, tier });
    
    // For now, we ensure that if a REAL CONFIG is not provided, we don't invent numbers.
    const PROVIDER_API_KEY = process.env.STRIGA_API_KEY;
    
    if (!PROVIDER_API_KEY) {
      return NextResponse.json({ 
        error: 'CONFIGURATION_REQUIRED', 
        message: 'Real-world Card Provider (BaaS) not configured. Please add STRIGA_API_KEY to environment.' 
      }, { status: 501 });
    }

    // This section would be replaced by actual data from the provider
    // const { cardNumber, cvv, expiry } = strigaCard;

    const card = await prisma.virtualCard.create({
      data: {
        authUserId,
        cardNumber: "PENDING_ACTIVATION", // Real number would go here from Provider
        cvv: "•••",
        expiry: "MM/YY",
        tier: tier || "BLACK",
        linkedAddress: linkedAddress || '',
        status: "PENDING_CONFIG"
      },
    });

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error('Error issuing card:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
