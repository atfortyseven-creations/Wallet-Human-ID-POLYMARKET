import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ForumUsersPage() {
  let rankedUsers: any[] = [];

  try {
    // Try full query with extended columns
    const users = await (prisma as any).user.findMany({
      take: 50,
      where: { OR: [{ forumTopics: { some: {} } }, { forumPosts: { some: {} } }] },
      select: {
        id: true, walletAddress: true,
        displayName: true, avatarUrl: true, tier: true, isPro: true,
        _count: { select: { forumTopics: true, forumPosts: true, forumLikes: true } }
      }
    });

    rankedUsers = users.map((u: any) => ({
      id: u.id, walletAddress: u.walletAddress,
      displayName: u.displayName || null,
      avatarUrl: u.avatarUrl || null,
      tier: u.tier || 'basic', isPro: u.isPro || false,
      stats: { topics: u._count.forumTopics, posts: u._count.forumPosts, likes: u._count.forumLikes },
      prestigeScore: (u._count.forumTopics * 10) + (u._count.forumPosts * 5) + (u._count.forumLikes * 2)
    })).sort((a: any, b: any) => b.prestigeScore - a.prestigeScore);

  } catch {
    // Fallback: base columns only (no displayName / avatarUrl)
    try {
      const users = await prisma.user.findMany({
        take: 50,
        select: { id: true, walletAddress: true }
      });
      // Fetch counts separately
      const enriched = await Promise.all(users.map(async (u) => {
        let topics = 0, posts = 0, likes = 0;
        try {
          const c = await (prisma as any).user.findUnique({
            where: { id: u.id },
            select: { _count: { select: { forumTopics: true, forumPosts: true, forumLikes: true } } }
          });
          topics = c?._count?.forumTopics || 0;
          posts  = c?._count?.forumPosts  || 0;
          likes  = c?._count?.forumLikes  || 0;
        } catch {}
        return {
          ...u, displayName: null, avatarUrl: null, tier: 'basic', isPro: false,
          stats: { topics, posts, likes },
          prestigeScore: (topics * 10) + (posts * 5) + (likes * 2)
        };
      }));
      rankedUsers = enriched.filter(u => u.prestigeScore > 0).sort((a, b) => b.prestigeScore - a.prestigeScore);
    } catch (e) {
      console.warn('[Leaderboard Error]:', e);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAF9] text-slate-900 w-full min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {/* Breadcrumb & Header */}
        <div className="mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-[12px] font-sans font-bold text-slate-500">
            <Link href="/forum" className="transition-colors hover:text-[#0088cc]">Forum</Link>
            <span>/</span>
            <span className="text-slate-900">Users</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-slate-900 leading-none mb-2">Leaderboard</h1>
          <p className="text-[14px] text-slate-500 font-medium">Most active and helpful members of the community.</p>
        </div>

        {/* Table header */}
        <div className="flex items-center pb-3 text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 mb-4 px-4">
          <div className="w-12 text-center">Rank</div>
          <div className="flex-1">User</div>
          <div className="w-20 text-center hidden sm:block">Topics</div>
          <div className="w-20 text-center hidden sm:block">Posts</div>
          <div className="w-20 text-center hidden sm:block">Likes</div>
          <div className="w-24 text-right">Score</div>
        </div>

        <div className="flex flex-col gap-2">
          {rankedUsers.length > 0 ? (
            rankedUsers.map((u, i) => (
              <Link
                href={`/forum/u/${u.walletAddress}`}
                key={u.id}
                className="flex items-center py-4 rounded-xl transition-all duration-200 px-4 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
              >
                <div className="w-12 text-center text-[16px] font-sans font-bold text-slate-400">#{i + 1}</div>

                <div className="flex-1 min-w-0 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 border border-slate-200">
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[14px] font-sans font-bold text-slate-500">{u.walletAddress?.slice(2, 4).toUpperCase() || '??'}</span>
                    }
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[15px] font-sans font-bold text-slate-900">
                      {u.displayName || (u.walletAddress ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}` : 'Anonymous')}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-sans font-medium text-slate-500">
                        {u.tier === 'basic' ? 'Initiate' : u.tier}
                      </span>
                      {u.isPro && <span className="text-[10px] font-sans font-bold bg-[#D4AF37] text-black px-1.5 py-0.5 rounded-sm">PRO</span>}
                    </div>
                  </div>
                </div>

                <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-slate-600">{u.stats.topics}</div>
                <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-slate-600">{u.stats.posts}</div>
                <div className="w-20 text-center hidden sm:block text-[14px] font-sans text-slate-600">{u.stats.likes}</div>
                <div className="w-24 text-right text-[16px] font-sans font-bold text-slate-900">{u.prestigeScore}</div>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center text-[13px] font-sans text-slate-400">No active users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
