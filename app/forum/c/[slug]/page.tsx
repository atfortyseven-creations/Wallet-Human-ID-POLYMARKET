"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Plus, ChevronLeft, Layers, Shield, Bug, Zap, Globe, Radio, Activity, Hash } from 'lucide-react';

const CATEGORY_META: Record<string, { icon: React.ReactNode }> = {
  'whale-network':  { icon: <Activity size={18} /> },
  'general':        { icon: <Globe size={18} /> },
  'applications':   { icon: <Layers size={18} /> },
  'testnets':       { icon: <Radio size={18} /> },
  'noir':           { icon: <Shield size={18} /> },
  'site-feedback':  { icon: <Bug size={18} /> },
  'qds-connect':    { icon: <Zap size={18} /> },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/forum/categories/${slug}`)
      .then(r => r.json())
      .then(data => setCategory(data))
      .catch(console.error);
  }, [slug]);

  if (!category) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-gray-500 min-h-[100dvh] bg-white flex items-center justify-center flex-col gap-4">
      <div className="w-8 h-8 border-2 border-t-black border-r-black border-b-transparent border-l-transparent rounded-full animate-spin" />
      Loading Sector...
    </div>
  );

  if (category.error) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-red-500 min-h-[100dvh] bg-white flex items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-2 border-red-500 flex items-center justify-center text-red-500">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      Sector not found.
    </div>
  );

  const meta = CATEGORY_META[typeof slug === 'string' ? slug : ''] || { icon: <Hash size={18} /> };

  return (
    <div className="w-full min-h-[100dvh] bg-white text-black py-10 font-sans selection:bg-black selection:text-white relative">
      
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 mb-8">
        <Link href="/forum" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
          <ChevronLeft size={14} /> Back
        </Link>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b-2 border-black pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-black bg-white">
               {meta.icon}
            </div>
            <div>
               <h1 className="text-[28px] md:text-[36px] font-black text-black uppercase tracking-tighter leading-none mb-1">{category.name}</h1>
               <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{category._count?.topics ?? 0} Transmissions</span>
            </div>
          </div>

          <Link
            href={`/forum/new?category=${category.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus size={14} strokeWidth={3} />
            New Topic
          </Link>
        </div>

        {category.description && (
          <div className="p-5 border border-gray-200 bg-gray-50">
            <p className="text-[14px] text-black font-medium">{category.description}</p>
          </div>
        )}

        <div className="w-full">
          <div className="grid grid-cols-[1fr_auto] gap-4 pb-4 px-4 border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Transmission</span>
            <span className="flex items-center gap-6 shrink-0">
              <span className="w-12 text-center">Replies</span>
              <span className="w-12 text-center hidden sm:block">Views</span>
              <span className="w-16 text-right">Activity</span>
            </span>
          </div>

          <div className="flex flex-col divide-y divide-gray-200">
            {!category.topics?.length ? (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-2 border-gray-300 flex items-center justify-center mb-2">
                    <Radio size={20} className="text-gray-500" />
                 </div>
                <span className="text-[12px] font-mono text-gray-500 uppercase tracking-widest">No transmissions found.</span>
              </div>
            ) : category.topics.map((topic: any) => {
              const lastActivity = topic.updatedAt || topic.createdAt;
              const parsedDate = lastActivity ? new Date(lastActivity) : null;
              const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
              
              const activityText = isValidDate
                ? formatDistanceToNowStrict(parsedDate!, { addSuffix: false })
                    .replace(' minutes', 'm').replace(' minute', 'm')
                    .replace(' hours', 'h').replace(' hour', 'h')
                    .replace(' days', 'd').replace(' day', 'd')
                    .replace(' months', 'mo').replace(' month', 'mo')
                : '';
                
              const initials = (topic.author?.walletAddress?.slice(2, 4) || '??').toUpperCase();

              return (
                <Link
                  key={topic.id}
                  href={`/forum/t/${topic.id}`}
                  className="group flex items-center py-5 px-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-[11px] font-black text-black shrink-0 border border-gray-300 hidden md:flex group-hover:border-black transition-colors">
                      {initials}
                    </div>
                    <div className="flex flex-col gap-1.5">
                       <h3 className="text-[16px] font-bold text-black group-hover:underline decoration-2 underline-offset-4 truncate">
                         {topic.title}
                       </h3>
                       {topic.isPinned && (
                         <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-black border border-black px-1.5 py-0.5 max-w-min">
                           <Shield size={10} fill="currentColor" /> Pinned
                         </span>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-gray-500">
                    <div className="w-12 text-center text-[14px] font-bold group-hover:text-black transition-colors">
                      {topic._count?.posts || 0}
                    </div>
                    <div className="w-12 text-center hidden sm:block text-[14px] font-bold group-hover:text-black transition-colors">
                      {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views || 0}
                    </div>
                    <div className="w-16 text-right text-[12px] font-mono group-hover:text-black transition-colors">
                      {activityText}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
