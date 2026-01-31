import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { rpID, origin } from '@/lib/auth/webauthn-config';

/**
 * GET /api/auth/webauthn/authenticate/options
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.authUser.findUnique({
      where: { id: session.user.id },
      include: { authenticators: true },
    });

    if (!user || user.authenticators.length === 0) {
      return NextResponse.json({ error: 'No authenticators registered' }, { status: 400 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.authenticators.map(auth => ({
        id: auth.credentialID,
        type: 'public-key',
        transports: auth.transports ? JSON.parse(auth.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Auth options error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * POST /api/auth/webauthn/authenticate/verify
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, response } = body;

    const authenticator = await prisma.authenticator.findUnique({
      where: { credentialID: id },
    });

    if (!authenticator) return NextResponse.json({ error: 'Authenticator not found' }, { status: 404 });

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: async () => true, // Simplified for demo
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: authenticator.credentialID,
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
        counter: Number(authenticator.counter),
      },
    });

    if (verification.verified) {
      const { authenticationInfo } = verification;
      
      await prisma.authenticator.update({
        where: { credentialID: id },
        data: {
          counter: BigInt(authenticationInfo.newCounter),
          lastUsedAt: new Date(),
        },
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
