import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  
  // Get wallet address from query params (supplied by frontend)
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');

  // If neither matches, 401
  if (!email && !walletAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let allNotifications: any[] = [];

  // 1. Fetch Email-based Notifications (AuthUser)
  if (email) {
    const authUser = await prisma.authUser.findUnique({ where: { email } });
    if (authUser) {
      const emailNotifs = await prisma.userNotification.findMany({
        where: { authUserId: authUser.id, archived: false },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      allNotifications = [...allNotifications, ...emailNotifs.map(n => ({...n, source: 'email'}))];
    }
  }

  // 2. Fetch Wallet-based Notifications (User)
  if (walletAddress) {
      const walletNotifs = await prisma.notification.findMany({
          where: { userId: walletAddress, archived: false },
          orderBy: { createdAt: 'desc' },
          take: 20
      });
      allNotifications = [...allNotifications, ...walletNotifs.map(n => ({...n, source: 'wallet'}))];
  }

  // 3. Merge and Sort
  allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 4. Default "Welcome" if absolutely empty (Pure UX)
  if (allNotifications.length === 0 && email) {
      // Temporary in-memory welcome for new users so it's not empty
      return NextResponse.json({ notifications: [{
          id: 'welcome-seed',
          title: "Welcome to HumanDefi",
          message: "System initialized. No new alerts.",
          type: "system",
          read: true,
          createdAt: new Date().toISOString()
      }]});
  }

  return NextResponse.json({ notifications: allNotifications });
}

export async function PUT(req: Request) {
    const { id, read, address } = await req.json();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email && !address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        if (id) {
            // Try updating both tables (IDs are CUIDs so unlikely to collide, but safe to try/catch or check existence)
            // We optimize by checking which one exists, but a direct UPDATE is faster if ID is unique enough.
            // However, Prisma requires knowing the model. We'll try Notification (Wallet) first then UserNotification.
            
            const walletNotif = await prisma.notification.findUnique({ where: { id } });
            if (walletNotif) {
                await prisma.notification.update({ where: { id }, data: { read: read ?? true } });
            } else {
                 await prisma.userNotification.update({ where: { id }, data: { read: read ?? true } }).catch(() => null);
            }
        } else {
            // Mark ALL as read
            if (email) {
                const authUser = await prisma.authUser.findUnique({ where: { email } });
                if (authUser) {
                    await prisma.userNotification.updateMany({
                        where: { authUserId: authUser.id, read: false },
                        data: { read: true }
                    });
                }
            }
            if (address) {
                await prisma.notification.updateMany({
                    where: { userId: address, read: false },
                    data: { read: true }
                });
            }
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to update notification", e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
