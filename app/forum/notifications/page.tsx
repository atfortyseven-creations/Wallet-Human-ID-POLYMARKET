"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forum/notifications')
      .then(r => r.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
          // Mark as read after fetching
          fetch('/api/forum/notifications', { method: 'PUT' }).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--forum-text-muted)' }}>
        [ RETRIEVING SECURE COMMS ]
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[860px] mx-auto py-10 px-4">
      <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--forum-border)' }}>
        <h1 className="text-[16px] font-aztec-h2 font-black uppercase tracking-tight leading-snug" style={{ color: 'var(--forum-text)' }}>
          Analytics Alerts
        </h1>
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] mt-2" style={{ color: 'var(--forum-button-bg)' }}>
          Mention and reply notifications
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--forum-text-muted)' }}>
            [ NO NEW ALERTS ]
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = !n.isRead;
            const linkHref = n.topicId ? `/forum/t/${n.topicId}` : '#';
            const actorName = n.actor?.displayName || (n.actor?.walletAddress ? `${n.actor.walletAddress.slice(0,6)}` : 'Unknown');
            
            let message = '';
            if (n.type === 'REPLY') message = 'replied to your transmission';
            else if (n.type === 'LIKE') message = 'verified your intel (like)';
            else if (n.type === 'MENTION') message = 'mentioned you in a broadcast';
            else message = 'interacted with your profile';

            return (
              <Link
                key={n.id}
                href={linkHref}
                className="flex items-start gap-4 p-4 border transition-colors group hover:opacity-90"
                style={{ 
                  backgroundColor: isUnread ? 'var(--forum-surface)' : 'transparent',
                  borderColor: isUnread ? 'var(--forum-border)' : 'transparent',
                }}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
                  {n.actor?.avatarUrl ? (
                     <img src={n.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-[10px] font-mono font-black" style={{ color: 'var(--forum-text)' }}>{actorName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-mono" style={{ color: 'var(--forum-text)' }}>
                    <span className="font-black" style={{ color: 'var(--forum-button-bg)' }}>{actorName}</span> {message}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-widest mt-1.5" style={{ color: 'var(--forum-text-muted)' }}>
                    {formatDistanceToNowStrict(new Date(n.createdAt))} ago
                  </div>
                </div>
                
                {isUnread && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: 'var(--forum-button-bg)' }} />
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
