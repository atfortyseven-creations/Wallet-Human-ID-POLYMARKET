import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const revalidate = 0;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date("2024-02-01T00:00:00Z"),
        },
      },
      select: {
        walletAddress: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const chatContacts = await (prisma as any).chatContact.findMany({
      select: {
        owner: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const uniqueUsersMap = new Map();
    users.forEach(u => {
      if (u.walletAddress) {
        uniqueUsersMap.set(u.walletAddress.toLowerCase(), {
          walletAddress: u.walletAddress,
          createdAt: u.createdAt
        });
      }
    });
    chatContacts.forEach((c: any) => {
      if (c.owner && !uniqueUsersMap.has(c.owner.toLowerCase())) {
        uniqueUsersMap.set(c.owner.toLowerCase(), {
          walletAddress: c.owner,
          createdAt: c.createdAt
        });
      }
    });

    const combinedUsers = Array.from(uniqueUsersMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
