export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ addresses: [] }, { status: 200 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { watchedWallets: true }
        });

        if (!user) {
            return NextResponse.json({ addresses: [] }); // User hasn't set up main wallet profile yet
        }

        return NextResponse.json({
            addresses: user.watchedWallets.map(w => w.address)
        });

    } catch (error) {
        console.error('[Whale Watch GET]', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { address, toggle } = await req.json();

        // Get the User associated with the AuthUser's email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User wallet profile not found" }, { status: 404 });
        }

        if (toggle) {
            // Add to watchlist
            await prisma.watchedWallet.upsert({
                where: {
                    userId_address: {
                        userId: user.walletAddress,
                        address: address
                    }
                },
                update: {
                    alertsEnabled: true,
                    isWhale: true
                },
                create: {
                    userId: user.walletAddress,
                    address: address,
                    label: `Whale_${address.slice(0, 8)}`,
                    isWhale: true,
                    alertsEnabled: true
                }
            });
        } else {
            // Remove from watchlist
            await prisma.watchedWallet.deleteMany({
                where: {
                    userId: user.walletAddress,
                    address: address
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Whale Watch POST]', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


