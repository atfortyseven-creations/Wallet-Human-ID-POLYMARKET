import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(authUserId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const sessionToken = crypto.randomUUID();

  // 1. Persist session in Database  Session schema: sessionToken, userId, expiresAt, ipAddress
  const session = await prisma.session.create({
    data: {
      userId: authUserId,   // Session.userId  correct column per schema.prisma
      sessionToken,
      expiresAt,
    },
  });

  // 2. Set HttpOnly Cookie
  const cookieStore = await cookies();
  cookieStore.set('human_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    priority: 'high',
    expires: expiresAt,
  });

  return session;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('human_session')?.value;

  if (!sessionToken) return null;

  // 3. Verify Session against DB  no relation to include (Session has no user FK in schema)
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } }); // Cleanup
      return null;
    }

    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('human_session')?.value;

  if (sessionToken) {
    try {
        await prisma.session.delete({
            where: { sessionToken }
        });
    } catch (e) {
        // Ignore if already deleted
    }
  }

  cookieStore.delete('human_session');
}

