import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Domain configuration
import { getRpID, getOrigin, rpName } from '@/lib/auth/webauthn-config';
import { createSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const rpID = getRpID(req);
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      include: { authenticators: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate Registration Options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // Save challenge to cookie
    const cookieStore = await cookies();
    cookieStore.set('reg-challenge', options.challenge, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 60 * 5 // 5 minutes
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rpID = getRpID(req);
    const origin = getOrigin(req);
    const body = await req.json();
    const { userId } = body; 

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('reg-challenge');
    const expectedChallenge = challengeCookie?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });
    }

    const user = await prisma.authUser.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      // Save authenticator to DB
      await prisma.authenticator.create({
        data: {
            credentialID: Buffer.from(credentialID).toString('base64url'),
            credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
            counter: BigInt(counter),
            credentialDeviceType,
            credentialBackedUp,
            transports: body.response.transports ? JSON.stringify(body.response.transports) : null,
            userId: user.id
        }
      });
      
      // Cleanup challenge
      cookieStore.delete('reg-challenge');

      // [LEGENDARY] Create persistent session after registration
      await createSession(user.id);

      return NextResponse.json({ 
        verified: true,
        userId: user.id,
        email: user.email,
        name: user.name
      });
    }

    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

