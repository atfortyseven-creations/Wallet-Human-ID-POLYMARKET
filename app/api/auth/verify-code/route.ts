import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory rate limit to prevent OTP brute-forcing
const _rl = new Map<string, number[]>();
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const times = (_rl.get(key) || []).filter(t => now - t < windowMs);
  if (times.length >= limit) return false;
  _rl.set(key, [...times, now]);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (!email || typeof email !== 'string' || !code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Valid email and 6-digit code are required' }, { status: 400 });
    }

    // Rate limit: Max 10 verification attempts per IP per 5 minutes
    if (!checkRateLimit(`verify:ip:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
    }

    // Find user by email
    const user = await (prisma.authUser as any).findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Return 401 identical to invalid code to prevent email enumeration
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Find verification code
    const verificationCode = await (prisma as any).verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verificationCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Mark code as used
    await (prisma as any).verificationCode.update({
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

