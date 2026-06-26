import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // [DATA LEAKAGE FIX] Never log the full email address in plaintext
    const emailMasked = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    console.log(`[Auth] Sending verification code to: ${emailMasked}`);

    // Create or update AuthUser
    const user = await (prisma.authUser as any).upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: '',
        verified: false
      }
    });

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await (prisma as any).verificationCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt
      }
    });

    // [DATA LEAKAGE FIX] REMOVED: "AUTH BYPASS" that printed codes in plaintext to server logs.
    // The code is ONLY sent via the secure email channel. Railway log access must not
    // be sufficient to compromise any user account. This was a critical vulnerability.

    // Send verification email
    try {
        await sendVerificationEmail(email, code);
        console.log(`[Auth] Code delivered successfully to: ${emailMasked}`);
    } catch (emailError: any) {
        const errorMessage = emailError?.message || 'Unknown provider error';
        const errorCode = emailError?.code || 'EMAIL_PROVIDER_ERROR';
        
        // [DATA LEAKAGE FIX] Never log API key fragments — check presence only
        console.error('[Auth] Failed to send email:', {
            error: errorMessage,
            code: errorCode,
            apiKeyPresent: !!process.env.RESEND_API_KEY,
        });
        
        return NextResponse.json(
            { 
                error: 'Email delivery failed. Please try again.',
                details: 'Ensure your email address is valid.'
            },
            { status: 503 }
        );
    }

    // [DATA LEAKAGE FIX] Do NOT return internal userId to the client
    return NextResponse.json({
      success: true,
      message: 'Verification code sent'
    });

  } catch (error: any) {
    console.error('[Auth] Send code error');
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
