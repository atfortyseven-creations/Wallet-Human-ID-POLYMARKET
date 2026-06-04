import { NextRequest, NextResponse } from 'next/server';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

import { getRpID, getOrigin } from '@/lib/auth/webauthn-config';
import { createSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const rpID = getRpID(req);
    // ...
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // Optional, for autofill

    let userAuthenticators: any[] = [];
    
    if (userId) {
        const user = await prisma.authUser.findUnique({
            where: { id: userId },
            include: { authenticators: true }
        });
        if (user) {
            userAuthenticators = user.authenticators;
        }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map(auth => ({
          id: Buffer.from(auth.credentialID, 'base64url'),
          type: 'public-key',
          transports: auth.transports ? JSON.parse(auth.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-challenge', options.challenge, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 60 * 5 
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
    const { userId } = body; // Optional if we identify user by credentialId, but simplified for now

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('auth-challenge');
    const expectedChallenge = challengeCookie?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });
    }

    // Identify user
    // In a real passkey flow, we might look up user by credentialID
    // But for this first iteration, let's assume userId is passed or we find it
    
    let user;
    if (userId) {
        user = await prisma.authUser.findUnique({
            where: { id: userId },
            include: { authenticators: true }
        });
    } else {
        // Try to find user by credential ID (credential.id)
        const credentialID = body.id;
        // Search all authenticators? No, that's slow.
        // We should query by credentialID.
        const authenticator = await prisma.authenticator.findUnique({
            where: { credentialID: body.id }, // ID from client is base64url usually
            include: { user: true }
        });
        
        if (authenticator) {
            user = await prisma.authUser.findUnique({
                where: { id: authenticator.userId },
                include: { authenticators: true }
            });
        }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const authenticator = user.authenticators.find(auth => auth.credentialID === body.id);

    if (!authenticator) {
      return NextResponse.json({ error: 'Authenticator not found for user' }, { status: 400 });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
        counter: Number(authenticator.counter),
        transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
      },
    });

    if (verification.verified) {
      // Update counter
      await prisma.authenticator.update({
        where: { id: authenticator.id },
        data: {
          counter: BigInt(verification.authenticationInfo.newCounter),
          lastUsedAt: new Date()
        }
      });
      
      cookieStore.delete('auth-challenge');

      // [LEGENDARY] Create persistent session
      await createSession(user.id);

      // Return session info or token
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

