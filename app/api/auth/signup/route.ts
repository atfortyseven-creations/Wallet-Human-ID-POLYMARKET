import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // [PERSISTENCE FIX] Trim all string inputs — mobile keyboards inject trailing whitespace
    const email    = (body.email    || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const name     = (body.name     || '').trim() || null;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check duplicate — detect before create to return clean 409
    const existingUser = await prisma.authUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (salt rounds = 12)
    const passwordHash = await hashPassword(password);

    // Create AuthUser — prisma.verificationCode does NOT exist in schema.
    // Account is immediately active; email verification is a future enhancement.
    const user = await prisma.authUser.create({
      data: {
        email,
        passwordHash,
        name,
        verified: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      userId: user.id
    });

  } catch (error: any) {
    console.error('[Signup] Error:', error);
    // P2002 = Prisma unique constraint violation (race condition duplicate)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
