import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await prisma.virtualCard.findUnique({
      where: { authUserId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not issued' }, { status: 404 });
    }

    // SIMULATION: Generate a Google Wallet "Save to Wallet" JWT
    // In production, this would use googleapis package and a Service Account
    const mockJwt = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
      iss: "humanid-defi@human-wallet-332.iam.gserviceaccount.com",
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [{
          id: `issuer_id.human_card_${card.id}`,
          classId: "issuer_id.human_card_class",
          genericType: "GENERIC_TYPE_UNSPECIFIED",
          cardTitle: { defaultValue: { language: "en-US", value: "Human ID Card" } },
          subheader: { defaultValue: { language: "en-US", value: "Cardholder" } },
          header: { defaultValue: { language: "en-US", value: "HUMAN ID" } },
          barcode: { type: "QR_CODE", value: card.linkedAddress },
          hexBackgroundColor: card.tier === 'METAL' ? "#D1D5DB" : "#1F1F1F",
          logo: { sourceUri: { uri: "https://humanid.fi/logo-black.png" } }
        }]
      }
    }))}.mock_signature`;

    const saveUrl = `https://pay.google.com/gp/v/save/${mockJwt}`;

    return NextResponse.json({ 
      success: true, 
      saveUrl,
      message: "Google Wallet deep link generated successfully" 
    });
  } catch (error: any) {
    console.error('Error generating Google Wallet pass:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
