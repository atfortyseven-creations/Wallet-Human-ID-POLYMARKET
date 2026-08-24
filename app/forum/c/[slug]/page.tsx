"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/forum/categories/${slug}`)
      .then(r => r.json())
      .then(data => setCategory(data))
      .catch(console.error);
  }, [slug]);

  if (!category) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-gray-500 min-h-[100dvh] bg-white flex items-center justify-center flex-col gap-4">
      Loading Sector...
    </div>
  );

  if (category.error) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest text-red-500 min-h-[100dvh] bg-white flex items-center justify-center flex-col gap-4">
      Sector not found.
    </div>
  );

  return (
    <div className="w-full bg-white text-black py-10 font-sans selection:bg-black selection:text-white relative">
      
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 mb-8">
        <Link href="/forum" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
          BACK TO NEXUS
        </Link>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b-2 border-black pb-8">
          <div className="flex items-center gap-4">
            <div>
               <h1 className="text-[28px] md:text-[36px] font-black text-black uppercase tracking-tighter leading-none mb-1">{category.name}</h1>
               <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{category._count?.topics ?? 0} Transmissions</span>
            </div>
          </div>

          <Link
            href={`/forum/new?category=${category.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors shadow-sm"
          >
            NEW TOPIC
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
                           PINNED
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
