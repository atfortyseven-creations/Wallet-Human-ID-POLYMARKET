"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default function UserProfilePage() {
  const { address } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics]   = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/forum/users/${address}`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setProfile(d);
          fetch(`/api/forum/topics?author=${address}`)
            .then(r => r.json())
            .then(t => Array.isArray(t) && setTopics(t));
        } else {
          setProfile({ error: true });
        }
      })
      .catch(() => setProfile({ error: true }));
  }, [address]);

  if (!profile) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-gray-500 min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-4">
      Locating Dossier...
    </div>
  );

  if (profile.error) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-red-500 min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-4">
      Dossier not found or classified.
    </div>
  );

  const joinDate = profile.createdAt && !isNaN(new Date(profile.createdAt).getTime())
    ? format(new Date(profile.createdAt), 'MMM yyyy')
    : 'Unknown';

  return (
    <div className="w-full min-h-[100dvh] bg-white text-black py-10 font-sans selection:bg-black selection:text-white">
      
      <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-12 flex flex-col gap-10">

        <div className="w-full">
          <Link href="/forum" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-6">
            BACK TO NEXUS
          </Link>
        </div>

        {/* Profile Card */}
        <div className="border-2 border-black p-8 md:p-12 relative overflow-hidden bg-white">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            {/* Avatar */}
            <div className="w-[100px] h-[100px] bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[32px] font-black text-black">
                  {profile.walletAddress?.slice(2, 4).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <h1 className="text-[32px] md:text-[40px] font-black leading-none text-black mb-2">
                  {profile.displayName || 'ANON OPERATIVE'}
                </h1>
                <div className="flex items-center gap-3">
                   <span className="text-[13px] font-mono text-gray-500 uppercase">
                     {profile.walletAddress?.slice(0, 8)}...{profile.walletAddress?.slice(-6)}
                   </span>
                   {profile.isPro && (
                     <span className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-black text-white">
                        VERIFIED
                     </span>
                   )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-[15px] leading-relaxed text-black font-medium max-w-2xl mt-2">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-[11px] font-black uppercase tracking-widest">Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-[11px] font-black uppercase tracking-widest">{topics.length} Transmissions</span>
                </div>
                {profile.isAdmin && (
                  <span className="text-[10px] font-black uppercase tracking-widest border border-red-500 text-red-500 px-2 py-0.5 ml-auto">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* User Topics */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-black border-b-2 border-black pb-4 flex items-center gap-2">
             RECENT ACTIVITY
          </h2>
          
          <div className="flex flex-col">
            {topics.length === 0 ? (
              <div className="py-16 text-center text-[12px] font-mono text-gray-500 uppercase tracking-widest border border-gray-200 bg-gray-50">
                No transmissions found for this node.
              </div>
            ) : (
              topics.map(t => (
                <Link key={t.id} href={`/forum/t/${t.id}`} className="group flex flex-col md:flex-row md:items-center justify-between p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                     <h3 className="text-[16px] font-bold text-black group-hover:underline decoration-2 underline-offset-4 truncate">
                       {t.title}
                     </h3>
                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 border border-gray-200 text-black max-w-min">
                        {t.category?.name || 'Sector'}
                     </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 shrink-0">
                     <span className="text-[14px] font-bold group-hover:text-black transition-colors">{t._count?.posts || 0} Replies</span>
                     <span className="text-[14px] font-bold hidden sm:inline group-hover:text-black transition-colors">{t.views || 0} Views</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
