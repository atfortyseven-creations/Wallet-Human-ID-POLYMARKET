"use client";

import React, { useEffect, useState } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/tags')
      .then(r => r.json())
      .then(data => { if (!data.error) setTags(data); })
      .catch(console.error);
  }, []);

  const maxTopics = tags.reduce((m, t) => Math.max(m, t._count?.topics || 0), 1);

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">

      <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--forum-border)' }}>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--forum-text-muted)' }}>FORUM / TAGS</div>
        <h1 className="text-[13px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: 'var(--forum-text)' }}>
          VECTOR INDEX
        </h1>
      </div>

      {/* Table header */}
      <div className="flex items-center pb-3 border-b text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ borderColor: 'var(--forum-border)', color: 'var(--forum-text-muted)' }}>
        <div className="flex-1">TAG</div>
        <div className="w-48 hidden sm:block">SIGNAL MASS</div>
        <div className="w-16 text-right">COUNT</div>
      </div>

      {tags.length === 0 ? (
        <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--forum-text-muted)' }}>
          [ NULL VECTORS ]
        </div>
      ) : tags.map(tag => {
        const freq = tag._count?.topics || 0;
        const pct  = Math.round((freq / maxTopics) * 100);
        return (
          <div
            key={tag.id}
            className="flex items-center py-4 border-b transition-colors group hover:bg-[var(--forum-hover)]"
            style={{ borderColor: 'var(--forum-border)' }}
          >
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-mono font-black uppercase tracking-widest group-hover:underline underline-offset-2" style={{ color: 'var(--forum-text)' }}>
                #{tag.name}
              </span>
            </div>
            <div className="w-48 hidden sm:flex items-center gap-3 pr-4">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--forum-border)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: 'var(--forum-button-bg)' }}
                />
              </div>
              <span className="text-[9px] font-mono w-8 text-right" style={{ color: 'var(--forum-text-muted)' }}>{pct}%</span>
            </div>
            <div className="w-16 text-right text-[11px] font-mono font-black" style={{ color: 'var(--forum-text)' }}>
              {freq}
            </div>
          </div>
        );
      })}
    </div>
  );
}
