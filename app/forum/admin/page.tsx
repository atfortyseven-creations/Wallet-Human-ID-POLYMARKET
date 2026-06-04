"use client";

import React, { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ShieldCheck, ShieldAlert, Check, X, Trash2, AlertTriangle } from 'lucide-react';

export default function SystemAdminPanel() {
  const [queue, setQueue] = useState<{ topics: any[], posts: any[] }>({ topics: [], posts: [] });
  const [error, setError] = useState<string | null>(null);
  const [purgeStep, setPurgeStep] = useState<0 | 1 | 2>(0); // 0=idle, 1=confirm, 2=done
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<{ posts: number; topics: number } | null>(null);

  const fetchQueue = () => {
    fetch('/api/forum/admin/queue')
      .then(r => {
        if (!r.ok) throw new Error('Unauthorized or Server Error');
        return r.json();
      })
      .then(data => setQueue(data))
      .catch(e => setError(e.message));
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (id: string, type: 'topic' | 'post', status: 'PUBLISHED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/forum/admin/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status })
      });
      if (res.ok) fetchQueue();
      else alert('Failed to update status.');
    } catch (e) { console.error(e); }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      const res = await fetch('/api/admin/purge-forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setPurgeResult(data.deleted);
        setPurgeStep(2);
        fetchQueue();
      } else {
        alert('Purge failed: ' + (data.error || 'Unknown error'));
        setPurgeStep(0);
      }
    } catch {
      alert('Network error during purge.');
      setPurgeStep(0);
    } finally {
      setPurging(false);
    }
  };

  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
       <ShieldAlert size={64} className="text-red-500 mb-4" />
       <h1 className="text-2xl font-bold" style={{ color: 'var(--forum-text)' }}>ACCESS DENIED</h1>
       <p className="mt-2" style={{ color: 'var(--forum-text-muted)' }}>Only the System Administrator can access this terminal.</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1110px] mx-auto py-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b" style={{ borderColor: 'var(--forum-border)' }}>
         <ShieldCheck size={32} className="text-green-600" />
         <div>
           <h1 className="text-[24px] font-bold" style={{ color: 'var(--forum-text)' }}>System Gatekeeper</h1>
           <p className="text-[14px]" style={{ color: 'var(--forum-text-muted)' }}>Global Moderation Queue. All standard user submissions land here as PENDING.</p>
         </div>
      </div>

      {/*  DANGER ZONE: Purge All Forum Content  */}
      <div className="mb-10 p-5 rounded-xl border-2 border-red-200 bg-red-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Trash2 size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-black text-[14px] text-red-700 uppercase tracking-wider">Purge All Forum Content</p>
              <p className="text-[12px] text-red-500 mt-0.5">Permanently deletes every topic and reply. This action cannot be undone.</p>
            </div>
          </div>

          {purgeStep === 0 && (
            <button
              onClick={() => setPurgeStep(1)}
              className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
              Delete All Posts
            </button>
          )}

          {purgeStep === 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-red-700 text-[12px] font-bold">
                <AlertTriangle size={14} />
                Are you absolutely sure? This is irreversible.
              </div>
              <button onClick={() => setPurgeStep(0)} className="px-4 py-2 border border-red-300 text-red-600 text-[12px] font-bold rounded-lg hover:bg-red-100 transition-all">
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={purging}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-[12px] font-black uppercase rounded-lg transition-all disabled:opacity-60"
              >
                {purging ? 'Purging' : 'Yes, Delete Everything'}
              </button>
            </div>
          )}

          {purgeStep === 2 && purgeResult && (
            <div className="flex items-center gap-2 text-green-700 text-[12px] font-bold">
              <Check size={14} />
              Done  {purgeResult.topics} topics and {purgeResult.posts} posts deleted. Forum is now empty.
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
         {/* Pending Topics */}
         <div className="flex-1 flex flex-col">
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--forum-text)' }}>Pending Topics ({queue.topics.length})</h2>
            <div className="flex flex-col gap-4">
              {queue.topics.length === 0 ? (
                <div className="p-6 border rounded text-center text-sm" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)', color: 'var(--forum-text-muted)' }}>
                  No pending topics.
                </div>
              ) : queue.topics.map(topic => (
                <div key={topic.id} className="p-4 border shadow-sm rounded flex flex-col gap-3" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)' }}>
                   <div className="flex items-center justify-between">
                      <div className="font-semibold text-[15px]" style={{ color: 'var(--forum-text)' }}>{topic.title}</div>
                      <div className="text-[12px]" style={{ color: 'var(--forum-text-muted)' }}>{formatDistanceToNowStrict(new Date(topic.createdAt), { addSuffix: true })}</div>
                   </div>
                   <div className="text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
                     By: <span className="font-mono" style={{ color: 'var(--forum-text)' }}>{topic.author.displayName || topic.author.walletAddress.slice(0,8)}</span>
                   </div>
                   <div className="p-3 text-[14px] whitespace-pre-wrap rounded" style={{ backgroundColor: 'var(--forum-hover)', color: 'var(--forum-text)' }}>
                     {topic.content}
                   </div>
                   <div className="flex justify-end gap-2 mt-2">
                     <button 
                       onClick={() => handleAction(topic.id, 'topic', 'REJECTED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                     >
                       <X size={14} /> Reject
                     </button>
                     <button 
                       onClick={() => handleAction(topic.id, 'topic', 'PUBLISHED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                     >
                       <Check size={14} /> Publish to World
                     </button>
                   </div>
                </div>
              ))}
            </div>
         </div>

         {/* Pending Posts */}
         <div className="flex-1 flex flex-col">
            <h2 className="text-[18px] font-semibold mb-4" style={{ color: 'var(--forum-text)' }}>Pending Replies ({queue.posts.length})</h2>
            <div className="flex flex-col gap-4">
              {queue.posts.length === 0 ? (
                <div className="p-6 border rounded text-center text-sm" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)', color: 'var(--forum-text-muted)' }}>
                  No pending replies.
                </div>
              ) : queue.posts.map(post => (
                <div key={post.id} className="p-4 border shadow-sm rounded flex flex-col gap-3" style={{ backgroundColor: 'var(--forum-surface)', borderColor: 'var(--forum-border)' }}>
                   <div className="flex items-center justify-between">
                      <div className="text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
                        Reply to: <span className="font-semibold" style={{ color: 'var(--forum-text)' }}>{post.topic.title}</span>
                      </div>
                      <div className="text-[12px]" style={{ color: 'var(--forum-text-muted)' }}>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</div>
                   </div>
                   <div className="text-[13px]" style={{ color: 'var(--forum-text-muted)' }}>
                     By: <span className="font-mono" style={{ color: 'var(--forum-text)' }}>{post.author.displayName || post.author.walletAddress.slice(0,8)}</span>
                   </div>
                   <div className="p-3 text-[14px] whitespace-pre-wrap rounded" style={{ backgroundColor: 'var(--forum-hover)', color: 'var(--forum-text)' }}>
                     {post.content}
                   </div>
                   <div className="flex justify-end gap-2 mt-2">
                     <button 
                       onClick={() => handleAction(post.id, 'post', 'REJECTED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                     >
                       <X size={14} /> Reject
                     </button>
                     <button 
                       onClick={() => handleAction(post.id, 'post', 'PUBLISHED')}
                       className="px-4 py-1.5 flex items-center gap-1 text-[13px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                     >
                       <Check size={14} /> Publish to World
                     </button>
                   </div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
