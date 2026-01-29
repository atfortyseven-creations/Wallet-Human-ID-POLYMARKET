import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-in-prod";
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        // 1. Verify JWT signature
        const verified = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET));
        const payload = verified.payload;

        // 2. Extract session ID from JWT
        const sessionId = payload.sessionId as string;

        if (!sessionId) {
            return NextResponse.json({ authenticated: false, reason: 'No session ID' }, { status: 401 });
        }

        // 3. Verify session exists in database
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true }
        });

        if (!session) {
            return NextResponse.json({ authenticated: false, reason: 'Session not found' }, { status: 401 });
        }

        // 4. Check if session has expired
        if (session.expiresAt < new Date()) {
            // Cleanup expired session
            await prisma.session.delete({ where: { id: sessionId } });
            return NextResponse.json({ authenticated: false, reason: 'Session expired' }, { status: 401 });
        }

        // 5. Update last activity timestamp
        await prisma.session.update({
            where: { id: sessionId },
            data: { lastActivity: new Date() }
        });

        // 6. Return authenticated status with user data
        return NextResponse.json({
            authenticated: true,
            user: {
                address: session.user.walletAddress,
                tier: session.user.tier,
            }
        });

    } catch (error) {
        console.error("Session validation error:", error);
        return NextResponse.json({ authenticated: false, reason: 'Invalid token' }, { status: 401 });
    }
}
