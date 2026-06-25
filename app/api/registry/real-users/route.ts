import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all real wallet users connected since February 2024
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date("2024-02-01T00:00:00Z"),
        },
        walletAddress: {
          not: null,
        },
      },
      select: {
        walletAddress: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Deduplicate by lowercase wallet address
    const uniqueUsersMap = new Map<string, { walletAddress: string; updatedAt: Date }>();
    for (const u of users) {
      if (u.walletAddress) {
        const key = u.walletAddress.toLowerCase();
        if (!uniqueUsersMap.has(key)) {
          uniqueUsersMap.set(key, {
            walletAddress: u.walletAddress,
            updatedAt: u.updatedAt,
          });
        }
      }
    }

    const combinedUsers = Array.from(uniqueUsersMap.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    return NextResponse.json(
      { users: combinedUsers, total: combinedUsers.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache",
        },
      }
    );
  } catch (err: any) {
    console.error("[registry-real-users] Error:", err?.message);
    return NextResponse.json({ users: [], total: 0 }, { status: 200 });
  }
}
