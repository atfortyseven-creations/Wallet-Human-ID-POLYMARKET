export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ threshold: 50, muted: false, guest: true }, { status: 200 });
        }

        const authUser = await prisma.authUser.findUnique({
            where: { email: session.user.email },
            include: { userSettings: true }
        });

        if (!authUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return whale specific settings
        return NextResponse.json({
            threshold: authUser.userSettings?.whaleBtcThreshold ?? 50,
            muted: authUser.userSettings?.whaleAudioMuted ?? false,
        });

    } catch (error) {
        console.error('[Whale Prefs GET]', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threshold, muted } = await req.json();

        const authUser = await prisma.authUser.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!authUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const settings = await prisma.userSettings.upsert({
            where: { authUserId: authUser.id },
            update: {
                whaleBtcThreshold: threshold,
                whaleAudioMuted: muted,
            },
            create: {
                authUserId: authUser.id,
                whaleBtcThreshold: threshold,
                whaleAudioMuted: muted,
            }
        });

        return NextResponse.json({ success: true, settings });

    } catch (error) {
        console.error('[Whale Prefs POST]', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


