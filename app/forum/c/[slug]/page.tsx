"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Plus } from 'lucide-react';

const CATEGORY_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-amber-500',
  'bg-sky-500', 'bg-slate-800', 'bg-pink-500', 'bg-purple-500',
];

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
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-24 flex items-center justify-center">
      <span className="text-sm text-slate-400 animate-pulse">Loading category...</span>
    </div>
  );

  if (category.error) return (
    <div className="p-12 text-center text-red-500 text-sm">Category not found.</div>
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 flex flex-col gap-0">
      
      {/*  Breadcrumb & Controls  */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/forum" className="text-slate-500 hover:text-slate-800 transition-colors">
            Categories
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-black/5">
            <span className={`w-2.5 h-2.5 rounded-sm ${CATEGORY_COLORS[0]}`} />
            <span className="font-semibold text-slate-900">{category.name}</span>
          </div>
        </div>

        <Link
          href={`/forum/new?category=${category.id}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#0088cc] text-white text-[14px] font-medium hover:bg-[#0077b3] transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Topic
        </Link>
      </div>

      {/* Category Description */}
      {category.description && (
        <div className="mb-6 p-4 rounded-md border border-slate-200 bg-black/5 border-l-4 border-l-slate-400">
          <p className="text-[14px] text-slate-600">{category.description}</p>
        </div>
      )}

      <div className="w-full">
        {/*  Table Header  */}
        <div className="flex items-center py-2 border-b-2 border-slate-200 text-[13px] font-medium text-slate-500">
          <div className="flex-1">Topic</div>
          <div className="w-20 text-center hidden sm:block">Replies</div>
          <div className="w-16 text-center hidden sm:block">Views</div>
          <div className="w-20 text-right">Activity</div>
        </div>

        {/*  Topic List  */}
        <div className="flex flex-col">
          {!category.topics?.length ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No topics in this category yet. Be the first to start a discussion!
            </div>
          ) : category.topics.map((topic: any, i: number) => {
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
                className="group flex items-center py-3.5 border-b border-slate-100 hover:bg-black/5 transition-colors"
              >
                {/* Topic Title */}
                <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0 hidden md:flex">
                    {initials}
                  </div>
                  <h3 className="text-[15px] font-medium text-slate-900 group-hover:text-[#0088cc] transition-colors truncate">
                    {topic.title}
                  </h3>
                </div>

                {/* Replies */}
                <div className="w-16 text-center hidden sm:block text-[13px] text-slate-500">
                  {topic._count?.posts || 0}
                </div>

                {/* Views */}
                <div className="w-16 text-center hidden sm:block text-[13px] text-slate-500">
                  {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views || 0}
                </div>

                {/* Activity */}
                <div className="w-20 text-right text-[13px] text-slate-500">
                  {activityText}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
