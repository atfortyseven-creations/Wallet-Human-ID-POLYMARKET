import React from 'react';
import Link from 'next/link';

export function SummaryTab({ summary }: { summary: any }) {
  if (!summary) return null;

  const { stats, topTopics, topReplies, topCategories, mostLikedBy, mostLiked, badges } = summary;

  return (
    <div className="flex flex-col gap-10">
      {/* STATS */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          <StatBox value={stats.daysVisited} label="days visited" />
          <StatBox value={`${stats.readTimeHours}h`} label="read time" />
          <StatBox value={`${stats.recentReadTimeHours}h`} label="recent read time" />
          <StatBox value={stats.topicsViewed} label="topics viewed" />
          <StatBox value={stats.postsRead} label="posts read" />
          <StatBox value={stats.likesGiven} label="given" icon="" />
          <StatBox value={stats.likesReceived} label="received" icon="" />
          <StatBox value={stats.topicsCreated} label="topics created" />
          <StatBox value={stats.postsCreated} label="posts created" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* TOP REPLIES */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Top Replies</h3>
          {topReplies.length === 0 ? <EmptyState /> : topReplies.map((reply: any) => (
            <div key={reply.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#050505]/40">
                <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="text-[#D4AF37]"> {reply._count?.likes || 0}</span>
              </div>
              <Link href={`/forum/t/${reply.topic.id}`} className="text-[12px] font-mono text-[#050505] hover:underline underline-offset-2 truncate">
                {reply.topic.title}
              </Link>
            </div>
          ))}
        </div>

        {/* TOP TOPICS */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Top Topics</h3>
          {topTopics.length === 0 ? <EmptyState /> : topTopics.map((topic: any) => (
            <div key={topic.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#050505]/40">
                <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="text-[#D4AF37]"> {topic._count?.likes || 0}</span>
              </div>
              <Link href={`/forum/t/${topic.id}`} className="text-[12px] font-mono text-[#050505] hover:underline underline-offset-2 truncate">
                {topic.title}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* MOST LIKED BY */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Most Liked By</h3>
          {mostLikedBy.length === 0 ? <EmptyState /> : mostLikedBy.map((u: any) => (
            <UserLikeRow key={u.walletAddress} user={u} />
          ))}
        </div>

        {/* MOST LIKED */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Most Liked</h3>
          {mostLiked.length === 0 ? <EmptyState /> : mostLiked.map((u: any) => (
            <UserLikeRow key={u.walletAddress} user={u} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* TOP CATEGORIES */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Top Categories</h3>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-12 text-[9px] font-mono uppercase tracking-widest text-[#050505]/30 pb-1">
              <div className="col-span-8">Category</div>
              <div className="col-span-2 text-center">Topics</div>
              <div className="col-span-2 text-center">Replies</div>
            </div>
            {topCategories.length === 0 ? <EmptyState /> : topCategories.map((cat: any) => (
              <div key={cat.name} className="grid grid-cols-12 items-center text-[11px] font-mono">
                <div className="col-span-8 flex items-center gap-2">
                  <span className="w-2 h-2" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-[#050505]/70">{cat.name}</span>
                </div>
                <div className="col-span-2 text-center text-[#050505]">{cat.topics}</div>
                <div className="col-span-2 text-center text-[#050505]/40">{cat.replies}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP BADGES */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#050505]/50 border-b border-[#E0E0E0] pb-2">Top Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {badges.slice(0, 6).map((badge: any) => (
              <div key={badge.id} className="border border-[#E0E0E0] p-2 flex flex-col gap-1 hover:bg-[#F5F5F5] transition-colors">
                <div className="flex items-center gap-2">
                  <span className={badge.type === 'gold' ? 'text-[#D4AF37]' : badge.type === 'silver' ? 'text-[#A8A9AD]' : 'text-[#CD7F32]'}>
                    
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#050505] truncate">{badge.name}</span>
                </div>
              </div>
            ))}
          </div>
          {badges.length > 6 && (
            <div className="text-[9px] font-mono text-[#050505]/40 uppercase tracking-widest mt-1">
              + {badges.length - 6} More Badges
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label, icon }: { value: string | number, label: string, icon?: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-[14px] font-mono font-black text-[#050505]">
        {value} {icon && <span className="text-[#D4AF37] text-[12px]">{icon}</span>}
      </div>
      <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#050505]/40">
        {label}
      </div>
    </div>
  );
}

function UserLikeRow({ user }: { user: any }) {
  const avatarColor = `#${user.walletAddress.slice(2, 8)}`;
  return (
    <Link href={`/forum/u/${user.walletAddress}`} className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-mono font-black text-white" style={{ backgroundColor: avatarColor }}>
        {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user.walletAddress.slice(2, 3).toUpperCase()}
      </div>
      <div className="flex-1 flex flex-col">
        <span className="text-[11px] font-mono text-[#050505] group-hover:underline underline-offset-2">
          {user.displayName || `${user.walletAddress.slice(0, 6)}`}
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-mono text-[#D4AF37]">
        <span></span>
        <span>{user.count}</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20 py-2">[ NONE ]</div>;
}
