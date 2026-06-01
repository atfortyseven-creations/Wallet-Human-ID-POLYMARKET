import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

/**
 * Public platform stats endpoint — only returns aggregate counts, never
 * PII or individual wallet addresses.
 *
 * Metrics returned:
 *  totalUsers          – total registered Humanity Ledger accounts
 *  newUsersLast30d     – accounts created in the last 30 days
 *  whaleChatUsers      – unique wallets that have initiated at least one chat contact
 *  whaleChatConversations – total unique chat contact pairs (cross-user)
 *  registryTotal       – total registered users (same as totalUsers, from registry)
 *  growthByMonth       – array of { month, count } for the last 6 months, sorted ascending
 */
export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── 1. Total registered users ────────────────────────────────────────────
    let totalUsers = 0;
    try {
      totalUsers = await prisma.user.count();
    } catch {}

    // ── 2. New users in last 30 days ─────────────────────────────────────────
    let newUsersLast30d = 0;
    try {
      newUsersLast30d = await prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });
    } catch {}

    // ── 3. Whale Chat — unique wallet owners who have saved at least one contact
    let whaleChatUsers = 0;
    try {
      const distinctOwners = await (prisma as any).chatContact.findMany({
        select: { owner: true },
        distinct: ['owner'],
      });
      whaleChatUsers = distinctOwners?.length ?? 0;
    } catch {}

    // ── 4. Whale Chat — total conversation pairs ─────────────────────────────
    let whaleChatConversations = 0;
    try {
      whaleChatConversations = await (prisma as any).chatContact.count();
    } catch {}

    // ── 5. Monthly growth (last 6 calendar months) ───────────────────────────
    // We fetch users grouped by month. Since Prisma does not have a native
    // groupBy + date-truncation shorthand across all dialects, we fetch the
    // raw list of createdAt dates for the last 6 months and bucket them in JS.
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const growthByMonth: { month: string; users: number; chatUsers: number }[] = [];

    try {
      const recentUsers = await prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      });

      // Build bucket map
      const buckets: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets[key] = 0;
      }

      for (const u of recentUsers) {
        const d = new Date(u.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in buckets) buckets[key]++;
      }

      const sortedKeys = Object.keys(buckets).sort();
      for (const key of sortedKeys) {
        const [year, month] = key.split('-');
        const label = new Date(parseInt(year), parseInt(month) - 1, 1)
          .toLocaleString('en-US', { month: 'short', year: '2-digit' });
        growthByMonth.push({ month: label, users: buckets[key], chatUsers: 0 });
      }
    } catch {}

    // ── 6. Chat contact creation by month (same 6-month window) ──────────────
    try {
      const recentContacts = await (prisma as any).chatContact.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      });

      if (recentContacts?.length) {
        // Build a YYYY-MM → count map for chat contacts
        const chatBuckets: Record<string, number> = {};
        for (const c of recentContacts) {
          const d = new Date(c.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          chatBuckets[key] = (chatBuckets[key] ?? 0) + 1;
        }
        // Merge chat counts into the already-built growthByMonth array.
        // growthByMonth was built from sortedKeys (ascending YYYY-MM), so we
        // match by re-deriving the YYYY-MM key for each position.
        const baseKeys = Object.keys(
          // Re-create the registry bucket keys in ascending order
          (() => {
            const tmp: Record<string, number> = {};
            for (let i = 0; i < 6; i++) {
              const d = new Date(now);
              d.setMonth(d.getMonth() - i);
              const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              tmp[k] = 0;
            }
            return tmp;
          })()
        ).sort();

        for (let i = 0; i < growthByMonth.length; i++) {
          const key = baseKeys[i];
          if (key !== undefined && chatBuckets[key] !== undefined) {
            growthByMonth[i].chatUsers = chatBuckets[key];
          }
        }
      }
    } catch {}

    return NextResponse.json({
      totalUsers,
      newUsersLast30d,
      whaleChatUsers,
      whaleChatConversations,
      registryTotal: totalUsers,
      growthByMonth,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('[stats/platform] Error:', err?.message);
    return NextResponse.json({
      totalUsers: 0,
      newUsersLast30d: 0,
      whaleChatUsers: 0,
      whaleChatConversations: 0,
      registryTotal: 0,
      growthByMonth: [],
    });
  }
}
