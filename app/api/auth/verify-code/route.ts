import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.authUser.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true }
    });

    // Check if this is a passwordless login attempt
    const { isLogin } = body;
    
    if (isLogin && user.verified) {
      // Passwordless login - create session and authenticate
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      
      const { createAccessToken, createRefreshToken, setSessionCookies, generateFingerprint } = await import('@/lib/session');
      const fingerprint = generateFingerprint(userAgent, ip);
      
      const accessToken = await createAccessToken(user.id, user.email, fingerprint);
      const refreshToken = await createRefreshToken(user.id, user.email, fingerprint);

      // Set secure httpOnly cookies
      await setSessionCookies(accessToken, refreshToken);

      return NextResponse.json({
        success: true,
        message: 'Logged in successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Code verified'
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
