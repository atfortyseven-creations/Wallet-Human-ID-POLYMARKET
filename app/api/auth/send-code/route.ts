import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// In-memory rate limit: { key -> [timestamps] }
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
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const body = await request.json();
    const { email } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Rate limit: 3 per IP per 5 minutes, 1 per email per 60 seconds
    if (!checkRateLimit(`ip:${ip}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many code requests. Please wait before trying again.' }, { status: 429 });
    }
    const emailKey = `email:${email.toLowerCase()}`;
    if (!checkRateLimit(emailKey, 1, 60 * 1000)) {
      return NextResponse.json({ error: 'A code was recently sent to this email. Please wait 60 seconds.' }, { status: 429 });
    }

    // (validation and rate limit already done above)

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
        
        return NextResponse.json({
          error: 'Failed to send verification email due to provider error.'
        }, { status: 500 });
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
