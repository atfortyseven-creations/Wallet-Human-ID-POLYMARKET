import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { striga } from '@/lib/wallet/striga';

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
    const user = await currentUser();
    const { userId: authUserId } = await auth();
    
    if (!authUserId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, linkedAddress } = body;

    // 1. Check if card or Striga user already exists in our DB
    let dbUser = await prisma.authUser.findUnique({
      where: { id: authUserId },
      include: { virtualCard: true }
    });

    if (dbUser?.virtualCard) {
      return NextResponse.json({ card: dbUser.virtualCard });
    }

    // 2. REAL STRIGA INTEGRATION: Create User if not exists
    let strigaUserId = dbUser?.strigaUserId;
    if (!strigaUserId) {
      const firstName = user.firstName || "Human";
      const lastName = user.lastName || "User";
      const email = user.emailAddresses[0]?.emailAddress;

      try {
        const strigaUser = await striga.createUser({ email, firstName, lastName });
        strigaUserId = strigaUser.userId;
        
        // Save Striga User ID
        await prisma.authUser.update({
          where: { id: authUserId },
          data: { strigaUserId }
        });
      } catch (e: any) {
        return NextResponse.json({ 
          error: 'STRIGA_USER_CREATION_FAILED', 
          message: 'Failed to register with financial provider.',
          details: e.message 
        }, { status: 502 });
      }
    }

    // 3. Check KYC Status
    const strigaStatus = await striga.getUserStatus(strigaUserId);
    if (strigaStatus.kycStatus !== 'APPROVED') {
       // In production, we create the VirtualCard record with PENDING status
       // but we cannot "issue" it on the network until KYC is done.
       const card = await prisma.virtualCard.create({
         data: {
           authUserId,
           cardNumber: "PENDING_KYC",
           cvv: "•••",
           expiry: "MM/YY",
           tier: tier || "BLACK",
           linkedAddress: linkedAddress || '',
           status: "PENDING_KYC"
         },
       });
       return NextResponse.json({ success: true, card, kycRequired: true });
    }

    // 4. Issue REAL Card on Striga
    try {
      const strigaCard = await striga.issueCard(strigaUserId, tier);
      
      const card = await prisma.virtualCard.create({
        data: {
          authUserId,
          strigaCardId: strigaCard.id,
          cardNumber: strigaCard.maskedNumber || "PROCESSING", // Real providers often mask initially
          cvv: "•••",
          expiry: strigaCard.expiry || "MM/YY",
          tier: tier || "BLACK",
          linkedAddress: linkedAddress || '',
          status: "ACTIVE"
        },
      });

      return NextResponse.json({ success: true, card });
    } catch (e: any) {
       return NextResponse.json({ 
         error: 'STRIGA_CARD_ISSUANCE_FAILED', 
         message: 'Real-world card issuance failed at provider level.',
         details: e.message 
       }, { status: 502 });
    }

  } catch (error: any) {
    console.error('Error issuing card:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
