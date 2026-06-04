"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { 
  User, Activity, Bell, Shield, Settings, 
  MessageSquare, Edit3, Eye, Clock, ThumbsUp, 
  Bookmark, CheckCircle, ArrowDownCircle, Star, Filter, ChevronDown, AlignLeft
} from 'lucide-react';

export default function UserProfilePage() {
  const { address } = useParams() as { address: string | string[] };
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get('tab') || 'activity';
  const rawSub = searchParams.get('sub') || 'all';

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/user/${address}/summary`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setProfile(data);
        else setProfile({ error: true });
      })
      .catch(() => setProfile({ error: true }))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) return (
    <div className="py-20 text-center text-[13px] font-sans animate-pulse text-slate-400">
      Loading profile...
    </div>
  );

  if (!profile || profile.error) return (
    <div className="py-20 text-center text-[13px] font-sans text-slate-400">
      [ NODE NOT FOUND ]
    </div>
  );

  const user = profile.user || profile;
  const addrStr = typeof address === 'string' ? address : address[0];
  const shortAddr = `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
  const displayName = user.displayName || 'humanityledger'; // Fallback to match screenshot feeling
  const username = displayName.toLowerCase().replace(/\s+/g, '');

  const setTab = (tab: string) => router.push(`/forum/u/${address}?tab=${tab}`);
  const setSub = (sub: string) => router.push(`/forum/u/${address}?tab=activity&sub=${sub}`);

  // Tabs structure matching screenshot exactly
  const TABS = [
    { id: 'summary',       label: 'Summary',       icon: <User size={14} /> },
    { id: 'activity',      label: 'Activity',      icon: <AlignLeft size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'badges',        label: 'Badges',        icon: <Star size={14} /> },
    { id: 'preferences',   label: 'Preferences',   icon: <Settings size={14} /> },
  ];

  const SUBTABS = [
    { id: 'all',       label: 'All',           icon: <AlignLeft size={13} /> },
    { id: 'topics',    label: 'Topics',        icon: <Filter size={13} /> },
    { id: 'replies',   label: 'Replies',       icon: <MessageSquare size={13} /> },
    { id: 'read',      label: 'Read',          icon: <Clock size={13} /> },
    { id: 'drafts',    label: 'Drafts',        icon: <Edit3 size={13} /> },
    { id: 'pending',   label: 'Pending (1)',   icon: <Clock size={13} /> },
    { id: 'likes',     label: 'Likes',         icon: <ThumbsUp size={13} /> },
    { id: 'bookmarks', label: 'Bookmarks',     icon: <Bookmark size={13} /> },
    { id: 'solved',    label: 'Solved',        icon: <CheckCircle size={13} /> },
    { id: 'votes',     label: 'Votes',         icon: <ArrowDownCircle size={13} /> },
  ];

  return (
    <div className="w-full flex flex-col bg-white text-slate-900 min-h-screen">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
        
        {/* User Identity Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm">
              <img 
                src={user.avatarUrl || "https://i.imgur.com/Qv933oO.jpeg"} // Using a wave placeholder similar to the screenshot
                alt="avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex flex-col pt-2">
              <h1 className="text-[28px] font-sans font-bold leading-tight tracking-tight text-slate-900">{displayName}</h1>
              <span className="text-[15px] font-sans text-slate-500">{username}</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded hover:bg-black/5 transition-colors text-[13px] font-medium text-slate-700 shadow-sm mt-2">
            <ChevronDown size={14} />
            Expand
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center w-full border-b border-slate-200 mb-0 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[14px] font-medium transition-colors border-b-[3px] relative top-[1px] whitespace-nowrap ${
                rawTab === t.id 
                  ? 'border-[#0088cc] text-[#0088cc]' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={rawTab === t.id ? 'opacity-100' : 'opacity-60'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Activity Subtabs (if active) */}
        {rawTab === 'activity' && (
          <div className="flex items-center w-full border-b border-slate-200/60 overflow-x-auto no-scrollbar mb-8">
            {SUBTABS.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSub(sub.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-colors border-b-[3px] whitespace-nowrap relative top-[1px] ${
                  rawSub === sub.id 
                    ? 'border-[#0088cc] text-[#0088cc]' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-black/5'
                }`}
              >
                <span className={rawSub === sub.id ? 'opacity-100' : 'opacity-50'}>{sub.icon}</span>
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="pt-2">
          {rawTab === 'activity' && rawSub === 'all' && (
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-slate-900 mb-4">No activity yet</h2>
              <p className="text-[14px] text-slate-700 leading-relaxed max-w-[900px] mb-8">
                Welcome to our community! You are brand new here and have not yet contributed to discussions. As a first step, visit <Link href="/forum?filter=top" className="text-[#0088cc] hover:underline">Top</Link> or <Link href="/forum" className="text-[#0088cc] hover:underline">Categories</Link> and just start reading! Select <span className="text-pink-500"></span> on posts that you like or want to learn more about. As you participate, your activity will be listed here.
              </p>
              <p className="text-[14px] text-slate-600">
                There are no posts
              </p>
            </div>
          )}

          {rawTab === 'activity' && rawSub !== 'all' && (
            <div className="text-[14px] text-slate-600">
              There are no {rawSub} yet
            </div>
          )}

          {rawTab !== 'activity' && (
             <div className="py-20 text-center text-slate-400 font-mono text-[13px] uppercase tracking-widest border border-dashed border-slate-200 rounded-xl">
               [ {rawTab} interface loaded via aztec rollup ]
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
