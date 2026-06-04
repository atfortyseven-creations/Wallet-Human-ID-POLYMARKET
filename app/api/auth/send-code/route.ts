import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`[Auth] Attempting to send code to: ${email}`);

    // Create or update AuthUser
    // We use upsert to handle cases where the user might already exist but not be verified
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

    // [LEGENDARY BYPASS] Print code to server logs for manual recovery
    console.log(`
    
     [AUTH BYPASS] VERIFICATION CODE FOR: ${email.padEnd(25)} 
     CODE: ${code.padEnd(54)} 
    
    `);

    // Send verification email
    try {
        await sendVerificationEmail(email, code);
        console.log(`[Auth] Code sent successfully to: ${email}`);
    } catch (emailError: any) {
        const errorMessage = emailError?.message || 'Unknown provider error';
        const errorCode = emailError?.code || 'EMAIL_PROVIDER_ERROR';
        
        console.error('[Auth] Failed to send email via Resend:', {
            error: errorMessage,
            code: errorCode,
            email: email,
            apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) : 'MISSING'
        });
        
        // Return a legendary detailed error so the user knows exactly why it failed
        return NextResponse.json(
            { 
                error: `Email delivery failed: ${errorMessage}`,
                code: errorCode,
                details: 'Please ensure your email is valid and that the project domain is correctly verified in Resend.'
            },
            { status: 503 } // Service Unavailable
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      userId: user.id
    });

  } catch (error: any) {
    console.error('[Auth] Send code general error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send code' },
      { status: 500 }
    );
  }
}

