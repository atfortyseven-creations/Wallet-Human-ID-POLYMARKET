import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createJWT, isValidPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { email, password, name, walletAddress, encryptedMnemonic, walletSalt } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update user with password and marked as verified
    // Also store the generated wallet if provided
    const user = await prisma.authUser.update({
      where: { email },
      data: {
        passwordHash,
        name: name || null,
        verified: true,
        walletAddress: walletAddress || null,
        encryptedMnemonic: encryptedMnemonic || null,
        walletSalt: walletSalt || null
      }
    });

    // Create the associated User profile if it doesn't exist
    if (walletAddress) {
        try {
            await prisma.user.upsert({
                where: { walletAddress },
                update: {
                    email,
                    name: name || null,
                },
                create: {
                    walletAddress,
                    email,
                    name: name || null,
                    tier: 'HUMAN', // Default to HUMAN for registered users
                }
            });
        } catch (e) {
            console.error('[Auth] Failed to create User profile:', e);
            // We don't fail the whole signup if just the user profile creation fails, 
            // but in production we'd want this to be atomic (transactional)
        }
    }

    // Generate access and refresh tokens
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    const { createAccessToken, createRefreshToken, setSessionCookies, generateFingerprint } = await import('@/lib/session');
    const fingerprint = generateFingerprint(userAgent, ip);
    
    const accessToken = await createAccessToken(user.id, user.email, fingerprint);
    const refreshToken = await createRefreshToken(user.id, user.email, fingerprint);

    // Set secure httpOnly cookies
    await setSessionCookies(accessToken, refreshToken);

    // Also set legacy auth_token for backward compatibility (will be removed later)
    const token = createJWT(user.id, user.email);
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('[Auth] Complete signup error:', error);
    console.error('[Auth] Error details:', {
      email: body?.email,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to complete signup' },
      { status: 500 }
    );
  }
}
