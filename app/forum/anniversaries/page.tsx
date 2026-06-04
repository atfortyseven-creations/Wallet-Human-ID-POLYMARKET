import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic   = 'force-dynamic';

export default async function ForumAnniversariesPage() {
  const currentMonth = new Date().getMonth();
  const monthNames   = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

  let users: any[] = [];
  try {
    // Try with displayName (extended schema)
    const all = await (prisma as any).user.findMany({
      select: { walletAddress: true, displayName: true, createdAt: true },
    });
    users = all
      .filter((u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    // Fallback: base columns only
    try {
      const all = await prisma.user.findMany({
        select: { walletAddress: true, createdAt: true },
      });
      users = (all as any[])
        .filter((u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth)
        .map(u => ({ ...u, displayName: null }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (e) {
      console.warn('Failed to fetch anniversaries:', e);
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
            <span className="text-slate-900">Anniversaries</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-slate-900 leading-none mb-2">
            {monthNames[currentMonth]}
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">New members who joined the community this month.</p>
        </div>

        {/* Table header */}
        <div className="flex items-center pb-3 text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 mb-4 px-4">
          <div className="flex-1">Member</div>
          <div className="w-24 text-right">Joined</div>
          <div className="w-16 text-right">Since</div>
        </div>

        <div className="flex flex-col gap-2">
          {users.length === 0 ? (
            <div className="py-16 text-center text-[13px] font-sans text-slate-400">
              No new members joined in {monthNames[currentMonth]} yet.
            </div>
          ) : users.map((u, i) => {
            const joined = new Date(u.createdAt);
            const years  = new Date().getFullYear() - joined.getFullYear();
            const addr   = u.walletAddress;
            const label  = u.displayName || `${addr.slice(0,6)}...${addr.slice(-4)}`;

            return (
              <Link
                key={i}
                href={`/forum/u/${addr}`}
                className="flex items-center py-4 px-4 rounded-xl transition-all duration-200 bg-white border border-transparent hover:border-slate-200 hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-sans font-bold truncate text-slate-900 group-hover:text-[#0088cc] transition-colors">
                    {label}
                  </div>
                </div>
                <div className="w-24 text-right text-[12px] font-mono uppercase text-slate-500">
                  {monthNames[joined.getMonth()].slice(0,3)} {joined.getFullYear()}
                </div>
                <div className="w-16 text-right text-[14px] font-sans font-bold text-slate-900">
                  {years > 0 ? `${years}y` : 'New'}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
