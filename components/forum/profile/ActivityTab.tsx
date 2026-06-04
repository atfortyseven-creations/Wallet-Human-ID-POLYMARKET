import React from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export function ActivityTab({ items }: { items: any[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--forum-text-muted)' }}>
        [ NO TRANSMISSIONS ]
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const time = formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: false });
        const href = item._type === 'TOPIC'
          ? `/forum/t/${item.id}`
          : `/forum/t/${item.topicId}`;
        const label = item._type === 'TOPIC'
          ? (item.title || 'Untitled')
          : (item.content?.slice(0, 80) || '');

        return (
          <Link
            key={i}
            href={href}
            className="flex items-center gap-4 py-4 border-b transition-colors group hover:bg-[var(--forum-hover)]"
            style={{ borderColor: 'var(--forum-border)' }}
          >
            <span className="text-[9px] font-mono font-black w-14 shrink-0 uppercase" style={{ color: 'var(--forum-text-muted)' }}>
              {item._type}
            </span>
            <span className="flex-1 text-[12px] font-mono truncate group-hover:underline underline-offset-2" style={{ color: 'var(--forum-text)' }}>
              {label}
            </span>
            <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: 'var(--forum-text-muted)' }}>
              {time.replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
