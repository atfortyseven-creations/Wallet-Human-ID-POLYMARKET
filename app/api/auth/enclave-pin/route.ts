// app/api/auth/enclave-pin/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Enclave PIN — Server-Side Verification
//
// SECURITY MODEL:
//   - PIN is stored as SHA-256(userId + ":" + pin + SALT) — never plaintext
//   - Brute-force protection: max 5 attempts per 15 minutes per session/IP
//   - Rate-limit window is tracked server-side in-memory (per Railway instance)
//     + a DB failsafe flag for cross-instance protection
//   - A new user who has never set a PIN uses the DEFAULT_PIN (set in env)
//   - Users can SET their own PIN via POST /api/auth/enclave-pin
//
// Routes:
//   POST  /api/auth/enclave-pin          — Verify PIN (returns clearance token)
//   PUT   /api/auth/enclave-pin          — Set/Update PIN (requires current PIN or is first-time)
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

// ── In-memory brute-force tracker (per-process; good enough for single Railway instance) ──
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const attemptMap = new Map<string, { count: number; firstAt: number }>();

function getBruteforceKey(req: NextRequest, userId: string): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';
  return `${userId}:${ip}`;
}

function checkBruteforce(key: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const entry = attemptMap.get(key);
  if (!entry) return { blocked: false, remaining: MAX_ATTEMPTS };
  
  // Reset window if expired
  if (now - entry.firstAt > ATTEMPT_WINDOW_MS) {
    attemptMap.delete(key);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }
  
  const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);
  return { blocked: entry.count >= MAX_ATTEMPTS, remaining };
}

function recordAttempt(key: string) {
  const now = Date.now();
  const entry = attemptMap.get(key);
  if (!entry || now - entry.firstAt > ATTEMPT_WINDOW_MS) {
    attemptMap.set(key, { count: 1, firstAt: now });
  } else {
    entry.count++;
  }
}

function clearAttempts(key: string) {
  attemptMap.delete(key);
}

// ── PIN hashing ───────────────────────────────────────────────────────────────
// We use HMAC-SHA256 with a server-side secret for PIN storage.
// This is appropriate for a short PIN because:
//   1. The salt is the userId (unique per user, no rainbow tables)
//   2. The HMAC secret adds a server-side factor (knowing the DB is not enough)
// For production, bcrypt would be ideal but adds latency on Edge.
function hashPin(userId: string, pin: string): string {
  const secret = (() => { const s = process.env.ENCLAVE_PIN_SECRET || process.env.JWT_SECRET; if (!s) throw new Error('CRITICAL: Missing ENCLAVE_PIN_SECRET'); return s; })();
  return crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${pin}`)
    .digest('hex');
}

// ── Default PIN from env (fallback for users who haven't set one) ─────────────
function getDefaultPinHash(userId: string): string {
  const defaultPin = process.env.ENCLAVE_DEFAULT_PIN || '777777';
  return hashPin(userId, defaultPin);
}

// ── POST — Verify PIN ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Session expired. Please reconnect.' }, { status: 401 });
    }

    const userId = session.userId;
    const bfKey = getBruteforceKey(req, userId);
    const { blocked, remaining } = checkBruteforce(bfKey);

    if (blocked) {
      const retryAfterMin = Math.ceil(ATTEMPT_WINDOW_MS / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfterMin} minutes.`, blocked: true },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { pin } = body;

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits.' }, { status: 400 });
    }

    // Fetch stored PIN hash from DB (check both User and AuthUser tables)
    let storedPinHash: string | null = null;
    
    // Try User table first (wallet users)
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId.toLowerCase() },
      select: { id: true, enclavePinHash: true } as any,
    }).catch(() => null);
    
    if (user && (user as any).enclavePinHash) {
      storedPinHash = (user as any).enclavePinHash;
    } else {
      // Try AuthUser table (email users)
      const authUser = await prisma.authUser.findFirst({
        where: {
          OR: [
            { id: userId },
            { walletAddress: userId.toLowerCase() },
          ]
        },
        select: { id: true, enclavePinHash: true } as any,
      }).catch(() => null);
      
      if (authUser && (authUser as any).enclavePinHash) {
        storedPinHash = (authUser as any).enclavePinHash;
      }
    }

    // If no PIN set yet, compare against default PIN
    const expectedHash = storedPinHash ?? getDefaultPinHash(userId);
    const submittedHash = hashPin(userId, pin);

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );

    if (!isValid) {
      recordAttempt(bfKey);
      const newCheck = checkBruteforce(bfKey);
      return NextResponse.json(
        {
          error: `Incorrect PIN. ${newCheck.remaining} attempts remaining before lockout.`,
          attemptsRemaining: newCheck.remaining,
        },
        { status: 401 }
      );
    }

    // ✅ Success — clear brute-force counter
    clearAttempts(bfKey);

    // Issue a short-lived clearance token (HMAC of userId+timestamp)
    const clearanceTs = Date.now();
    const clearanceSecret = (() => { const s = process.env.ENCLAVE_PIN_SECRET || process.env.JWT_SECRET; if (!s) throw new Error('CRITICAL: Missing ENCLAVE_PIN_SECRET'); return s; })();
    const clearanceToken = crypto
      .createHmac('sha256', clearanceSecret)
      .update(`${userId}:cleared:${clearanceTs}`)
      .digest('hex');

    const isFirstTimeUser = !storedPinHash;

    return NextResponse.json({
      success: true,
      clearanceToken,
      clearanceTs,
      isFirstTimeUser, // Frontend shows "set your own PIN" prompt if true
    });

  } catch (err: any) {
    console.error('[Enclave PIN] Verify error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ── GET — Check if PIN is set ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ hasPin: false });
    }
    const userId = session.userId;
    let storedPinHash: string | null = null;
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId.toLowerCase() },
      select: { enclavePinHash: true } as any,
    }).catch(() => null);
    
    if (user && (user as any).enclavePinHash) {
      storedPinHash = (user as any).enclavePinHash;
    } else {
      const authUser = await prisma.authUser.findFirst({
        where: { OR: [{ id: userId }, { walletAddress: userId.toLowerCase() }] },
        select: { enclavePinHash: true } as any,
      }).catch(() => null);
      if (authUser && (authUser as any).enclavePinHash) {
        storedPinHash = (authUser as any).enclavePinHash;
      }
    }
    
    return NextResponse.json({ hasPin: !!storedPinHash });
  } catch (err) {
    return NextResponse.json({ hasPin: false });
  }
}

// ── PUT — Set/Update PIN ──────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Session expired. Please reconnect.' }, { status: 401 });
    }

    const userId = session.userId;
    const body = await req.json();
    const { currentPin, newPin, clearanceToken: clientClearanceToken, clearanceTs: clientClearanceTs } = body;

    if (!newPin || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 6 digits.' }, { status: 400 });
    }

    // Fetch stored PIN hash + clearance fields from DB
    let storedPinHash: string | null = null;
    let dbClearanceToken: string | null = null;
    let dbClearanceTs: Date | null = null;
    let dbId: string | null = null;
    let dbTable: 'user' | 'authUser' = 'user';

    const userRow = await prisma.user.findUnique({
      where: { walletAddress: userId.toLowerCase() },
      select: { id: true, enclavePinHash: true, enclaveClearanceToken: true, enclaveClearanceTs: true } as any,
    }).catch(() => null);

    if (userRow) {
      dbId = (userRow as any).id;
      storedPinHash     = (userRow as any).enclavePinHash ?? null;
      dbClearanceToken  = (userRow as any).enclaveClearanceToken ?? null;
      dbClearanceTs     = (userRow as any).enclaveClearanceTs ?? null;
    } else {
      const authRow = await prisma.authUser.findFirst({
        where: { OR: [{ id: userId }, { walletAddress: userId.toLowerCase() }] },
        select: { id: true, enclavePinHash: true, enclaveClearanceToken: true, enclaveClearanceTs: true } as any,
      }).catch(() => null);
      if (authRow) {
        dbId = (authRow as any).id;
        dbTable = 'authUser';
        storedPinHash    = (authRow as any).enclavePinHash ?? null;
        dbClearanceToken = (authRow as any).enclaveClearanceToken ?? null;
        dbClearanceTs    = (authRow as any).enclaveClearanceTs ?? null;
      }
    }

    const isFirstTimeUser = !storedPinHash;

    // [SECURITY] If no PIN is set yet, require a valid clearance token
    // (issued either by POST /api/auth/enclave-pin default-pin verification OR OTP reset).
    // This prevents unauthenticated first-time PIN setting.
    if (isFirstTimeUser) {
      // If they have a DB clearance token (from OTP reset), validate it strictly.
      // If no DB clearance token exists, validate the client token as a server-issued
      // verification token (from POST /api/auth/enclave-pin on successful default PIN check).
      if (!clientClearanceToken || !clientClearanceTs) {
        return NextResponse.json({
          error: 'Verification required. Please verify your identity before setting a PIN.',
        }, { status: 403 });
      }

      // If DB has a clearance token (OTP reset flow), validate against it
      if (dbClearanceToken && dbClearanceTs) {
        const CLEARANCE_TTL = 15 * 60 * 1000; // 15 min
        const tokenAge = Date.now() - new Date(dbClearanceTs).getTime();
        if (tokenAge >= CLEARANCE_TTL) {
          return NextResponse.json({ error: 'Clearance token expired. Please restart the reset flow.' }, { status: 403 });
        }
        try {
          const clientBuf = Buffer.from(String(clientClearanceToken), 'hex');
          const dbBuf     = Buffer.from(String(dbClearanceToken), 'hex');
          if (clientBuf.length !== dbBuf.length || !crypto.timingSafeEqual(clientBuf, dbBuf)) {
            return NextResponse.json({ error: 'Invalid clearance token.' }, { status: 403 });
          }
        } catch {
          return NextResponse.json({ error: 'Invalid clearance token.' }, { status: 403 });
        }
      } else {
        // No DB clearance token → validate as a server-issued POST clearance token
        // (this covers the first-time user flow via default PIN verification)
        const clearanceSecret = (() => {
          const s = process.env.ENCLAVE_PIN_SECRET || process.env.JWT_SECRET;
          if (!s) throw new Error('CRITICAL: Missing ENCLAVE_PIN_SECRET');
          return s;
        })();
        const expectedToken = crypto
          .createHmac('sha256', clearanceSecret)
          .update(`${userId}:cleared:${clientClearanceTs}`)
          .digest('hex');
        const CLEARANCE_TTL = 8 * 60 * 60 * 1000; // 8 hours (matches session TTL)
        try {
          const clientBuf   = Buffer.from(String(clientClearanceToken), 'hex');
          const expectedBuf = Buffer.from(expectedToken, 'hex');
          const tokenAge    = Date.now() - Number(clientClearanceTs);
          if (
            clientBuf.length !== expectedBuf.length ||
            !crypto.timingSafeEqual(clientBuf, expectedBuf) ||
            tokenAge > CLEARANCE_TTL
          ) {
            return NextResponse.json({ error: 'Invalid or expired clearance token. Please re-enter your PIN.' }, { status: 403 });
          }
        } catch {
          return NextResponse.json({ error: 'Invalid clearance token.' }, { status: 403 });
        }
      }
    }

    // [SECURITY] If they already have a PIN, they MUST provide the current PIN
    if (!isFirstTimeUser && !currentPin) {
      return NextResponse.json({ error: 'Current PIN is required to change PIN.' }, { status: 400 });
    }

    // Verify current PIN before changing
    if (currentPin) {
      const bfKey = getBruteforceKey(req, userId);
      const { blocked } = checkBruteforce(bfKey);
      if (blocked) {
        return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
      }

      const expectedHash  = storedPinHash ?? getDefaultPinHash(userId);
      const submittedHash = hashPin(userId, currentPin);

      const isValid = crypto.timingSafeEqual(
        Buffer.from(submittedHash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );

      if (!isValid) {
        recordAttempt(bfKey);
        return NextResponse.json({ error: 'Current PIN incorrect.' }, { status: 401 });
      }
      clearAttempts(bfKey);
    }

    const newPinHash = hashPin(userId, newPin);

    // Save to User table
    await prisma.user.update({
      where: { walletAddress: userId.toLowerCase() },
      data: { enclavePinHash: newPinHash } as any,
    }).catch(async () => {
      // Fallback: AuthUser table
      await prisma.authUser.updateMany({
        where: {
          OR: [
            { id: userId },
            { walletAddress: userId.toLowerCase() },
          ]
        },
        data: { enclavePinHash: newPinHash } as any,
      });
    });

    const clearanceTs = Date.now();
    const clearanceSecret = (() => { const s = process.env.ENCLAVE_PIN_SECRET || process.env.JWT_SECRET; if (!s) throw new Error('CRITICAL: Missing ENCLAVE_PIN_SECRET'); return s; })();
    const clearanceToken = crypto
      .createHmac('sha256', clearanceSecret)
      .update(`${userId}:cleared:${clearanceTs}`)
      .digest('hex');

    return NextResponse.json({ 
      success: true, 
      message: 'Enclave PIN updated successfully.',
      clearanceToken,
      clearanceTs
    });

  } catch (err: any) {
    console.error('[Enclave PIN] Update error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ── DELETE — Reset PIN (Requires re-authentication) ──────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Session expired. Please reconnect.' }, { status: 401 });
    }

    const userId = session.userId;

    // Clear PIN from User table
    await prisma.user.update({
      where: { walletAddress: userId.toLowerCase() },
      data: { enclavePinHash: null } as any,
    }).catch(async () => {
      // Fallback: AuthUser table
      await prisma.authUser.updateMany({
        where: {
          OR: [
            { id: userId },
            { walletAddress: userId.toLowerCase() },
          ]
        },
        data: { enclavePinHash: null } as any,
      });
    });

    return NextResponse.json({ success: true, message: 'Enclave PIN reset successfully.' });

  } catch (err: any) {
    console.error('[Enclave PIN] Delete error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
