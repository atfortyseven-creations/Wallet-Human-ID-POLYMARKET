import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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

    // [PRODUCTION REAL] Official Google Wallet Structure
    // Requires a service account private key stored in GOOGLE_WALLET_PRIVATE_KEY
    
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
    const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_WALLET_PRIVATE_KEY;

    if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      return NextResponse.json({ 
        error: 'CONFIGURATION_REQUIRED', 
        message: 'Google Wallet Production credentials missing (ISSUER_ID, SERVICE_ACCOUNT, PRIVATE_KEY).' 
      }, { status: 501 });
    }

    try {
      const payload = {
        iss: SERVICE_ACCOUNT_EMAIL,
        aud: 'google',
        typ: 'savetowallet',
        iat: Math.floor(Date.now() / 1000),
        origins: [],
        payload: {
          genericObjects: [
            {
              id: `${ISSUER_ID}.HumanCard_${card.id}`,
              classId: `${ISSUER_ID}.HumanCardClass`,
              genericType: 'GENERIC_TYPE_UNSPECIFIED',
              hexBackgroundColor: '#1F1F1F',
              logo: {
                sourceUri: {
                  uri: 'https://humanid.fi/logo-v2.png',
                },
              },
              cardTitle: {
                defaultValue: {
                  language: 'en',
                  value: 'Human Card',
                },
              },
              subheader: {
                defaultValue: {
                  language: 'en',
                  value: 'Status',
                },
              },
              header: {
                defaultValue: {
                  language: 'en',
                  value: card.status === 'ACTIVE' ? 'Verified' : 'Pending KYC',
                },
              },
              barcode: {
                type: 'QR_CODE',
                value: card.linkedAddress || 'https://humanid.fi',
              },
              hexFontColor: '#FFFFFF'
            },
          ],
        },
      };

      // Sign JWT with RS256 using the Service Account Private Key
      // Note: We replace literal \n with real newlines for the PEM format
      const token = jwt.sign(payload, PRIVATE_KEY.replace(/\\n/g, '\n'), { algorithm: 'RS256' });
      const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

      return NextResponse.json({ 
        success: true,
        saveUrl,
        message: 'Google Wallet pass generated successfully.'
      });
    } catch (jwtError: any) {
      console.error('JWT Signing Error:', jwtError);
      return NextResponse.json({ 
        error: 'JWT_SIGNING_FAILED', 
        message: 'Failed to sign the Google Wallet pass.',
        details: jwtError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error generating Google Wallet pass:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
