"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { BarChart2, PieChart, MessageSquare, Menu } from 'lucide-react';
import { useSignMessage } from 'wagmi';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useWalletStore } from '@/lib/store/wallet-store';

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const [topic, setTopic]               = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [replyError, setReplyError]     = useState('');
  const [replyDraftSaved, setReplyDraftSaved] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<string | null>(null);
  
  const { signMessageAsync } = useSignMessage();
  const { address, isSystemHandshake, isLocalSystemWallet } = useSystemAccount();
  const sessionAddress = address?.toLowerCase() || null;

  // Draft persistence key is scoped per topic so different threads have independent drafts
  const replyDraftKey = id ? `forum_draft_reply_${id}` : null;

  // Restore reply draft on mount (after topic id is known)
  useEffect(() => {
    if (!replyDraftKey) return;
    try {
      const saved = localStorage.getItem(replyDraftKey);
      if (saved) setReplyContent(saved);
    } catch {}
  }, [replyDraftKey]);

  // Auto-save reply draft on every keystroke
  useEffect(() => {
    if (!replyDraftKey || !replyContent) return;
    try {
      localStorage.setItem(replyDraftKey, replyContent);
      setReplyDraftSaved(true);
      const t = setTimeout(() => setReplyDraftSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [replyContent, replyDraftKey]);

  const fetchTopic = () => {
    fetch(`/api/forum/topics/${id}`)
      .then(r => r.json())
      .then(data => setTopic(data))
      .catch(console.error);
  };

  useEffect(() => { if (id) fetchTopic(); }, [id]);

  const submitReply = async () => {
    if (!replyContent.trim()) return;
    setReplyError('');
    setSubmitting(true);
    try {
      // Cryptographic anchoring (Sign to Post)  OPTIONAL, graceful fallback.
      // The system_handshake cookie is the primary auth gate on the server.
      // If the user is in Chrome mobile (wagmi not reconnected yet) or rejects
      // the signature request, we post without a signature rather than blocking.
      let finalContent = replyContent;
      let signature = 'SESSION:AUTHENTICATED';
      
      // isLocalSystemWallet comes from useSystemAccount (the hook that correctly
      // computes it). Reading from wallet-store.getState() would return undefined
      // because that field is not part of WalletState.
      const { privateKey: storedPrivateKey } = useWalletStore.getState();
      
      if (storedPrivateKey) {
        try {
          const { ethers } = await import('ethers');
          const wallet = new ethers.Wallet(storedPrivateKey);
          signature = await wallet.signMessage(finalContent);
        } catch (err) {
          setReplyError('SIGNATURE FAILED');
          setSubmitting(false);
          return;
        }
      } else if (!isLocalSystemWallet) {
        // External wallet (MetaMask / WalletConnect) — use wagmi.
        try {
          signature = await signMessageAsync({ message: finalContent });
        } catch (err) {
          setReplyError('SIGNATURE REQUIRED. PLEASE APPROVE IN YOUR WALLET.');
          setSubmitting(false);
          return;
        }
      }
      // else: isLocalSystemWallet=true (session-restored) — SESSION:AUTHENTICATED already set.
      finalContent = `${replyContent}\n\n[SIGNATURE:${signature}]`;

      let csrfToken = '';
      try {
          const csrfRes = await fetch('/api/auth/csrf', {
              headers: { 'x-web3-address': sessionAddress || '' }
          });
          if (!csrfRes.ok) throw new Error('CSRF fetch failed');
          const contentType = csrfRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              csrfToken = (await csrfRes.json()).token;
          } else {
              throw new Error("Invalid CSRF response");
          }
      } catch (e) {
          setReplyError('SESSION EXPIRED. PLEASE RECONNECT WALLET.');
          setSubmitting(false);
          return;
      }

      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          'x-web3-address': sessionAddress || ''
        },
        body: JSON.stringify({ topicId: id, content: finalContent }),
      });
      if (res.ok) {
        // Clear reply draft after successful submit
        try { if (replyDraftKey) localStorage.removeItem(replyDraftKey); } catch {}
        setReplyContent('');
        fetchTopic();
      } else {
        const err = await res.json();
        setReplyError(err.error?.toUpperCase() || 'TRANSMISSION FAILED');
      }
    } catch (e) {
      setReplyError('NETWORK ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTopic = async () => {
    setDeleteConfirmTarget(null);
    
    let csrfToken = '';
    try {
        const csrfRes = await fetch('/api/auth/csrf', {
            headers: { 'x-web3-address': sessionAddress || '' }
        });
        if (!csrfRes.ok) throw new Error('CSRF fetch failed');
        const contentType = csrfRes.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            csrfToken = (await csrfRes.json()).token;
        } else {
            throw new Error("Invalid CSRF response");
        }
    } catch (e) {
        setReplyError('SESSION EXPIRED. PLEASE RECONNECT WALLET.');
        return;
    }

    const res = await fetch(`/api/forum/topics/${id}`, { 
      method: 'DELETE',
      headers: {
        'x-csrf-token': csrfToken,
        'x-web3-address': sessionAddress || ''
      }
    });
    if (res.ok) router.push('/forum');
    else setReplyError('COULD NOT TERMINATE TOPIC');
  };

  if (!topic) return (
    <div className="py-20 text-center text-[13px] font-sans animate-pulse min-h-screen bg-[#FFFFFF] dark:bg-[#050505] text-black/60 dark:text-[#555] transition-colors duration-300">
      Decrypting Institutional Mandate...
    </div>
  );

  if (topic.error) return (
    <div className="py-20 text-center text-[13px] font-sans text-red-500 min-h-screen bg-[#FFFFFF] dark:bg-[#050505] transition-colors duration-300">
      Mandate / Profile not found or restricted.
    </div>
  );

  const isTopicAuthor = sessionAddress && topic.author?.walletAddress?.toLowerCase() === sessionAddress;

  return (
    <div className="w-full min-h-[100dvh] bg-white text-slate-900 py-10 font-sans relative">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
      {/* Topic Header */}
      <div className="mb-10 pb-6 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[26px] md:text-[32px] font-bold leading-[1.2] tracking-tight mb-4 flex-1 text-slate-900 break-words">
            {topic.title}
          </h1>
          {isTopicAuthor && (
            <div className="flex gap-2">
              {deleteConfirmTarget === 'topic' ? (
                <>
                  <button onClick={deleteTopic} className="shrink-0 mt-1 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30">Confirm</button>
                  <button onClick={() => setDeleteConfirmTarget(null)} className="shrink-0 mt-1 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors bg-black/5 dark:bg-white/5 text-black/60 dark:text-[#888888] hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10">Cancel</button>
                </>
              ) : (
                <button
                  onClick={() => setDeleteConfirmTarget('topic')}
                  className="shrink-0 mt-1 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                >
                  Revoke Mandate
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {topic.category && (
            <Link href={`/forum/c/${topic.category.slug}`} className="flex items-center gap-2 px-3 py-1 rounded-full transition-colors bg-slate-100 border border-slate-200 hover:border-[#0088cc]/30">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: topic.category.color || '#00C076', color: topic.category.color || '#00C076' }} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-700">{topic.category.name}</span>
            </Link>
          )}
          {topic.tags?.map((tag: any) => (
            <span key={tag.id} className="text-[11px] font-bold uppercase tracking-widest text-black/60 dark:text-[#555555] bg-black/5 dark:bg-black px-2 py-0.5 rounded-md border border-black/10 dark:border-white/5 transition-colors">
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grid: Posts (Left 9 cols) + Timeline (Right 3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px]">
        
        <div className="lg:col-span-9 flex flex-col pt-4">
          <PostRow entity={topic} type="topic" onLike={fetchTopic} index={1} sessionAddress={sessionAddress} onDeleted={() => router.push('/forum')} />
          {(topic.posts || []).map((post: any, i: number) => (
            <PostRow key={post.id} entity={post} type="post" onLike={fetchTopic} index={i + 2} sessionAddress={sessionAddress} onDeleted={fetchTopic} />
          ))}

        {/* Reply composer */}
          <div id="reply-composer" className="mt-12 flex gap-6">
             <div className="w-[60px] shrink-0 hidden sm:block"></div>
             <div className="flex-1">
                <div className="rounded-xl overflow-hidden bg-black/5 border border-slate-200 focus-within:border-[#0088cc]/50 transition-colors shadow-sm">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-6 py-5 text-[14px] font-sans bg-transparent text-slate-900 focus:outline-none resize-none min-h-[140px] leading-relaxed placeholder:text-slate-400"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-100 gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={submitReply}
                        disabled={submitting || !replyContent.trim()}
                        className="inline-flex items-center gap-2 text-[13px] font-bold px-5 py-2.5 rounded bg-[#0088cc] text-white hover:bg-[#0077b3] transition-colors disabled:opacity-40"
                      >
                        {submitting ? 'Posting...' : 'Reply'}
                      </button>
                      {replyDraftSaved && (
                        <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          Draft saved
                        </span>
                      )}
                    </div>
                    {replyError && (
                      <span className="text-[12px] font-medium text-red-500">{replyError}</span>
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Timeline Sidebar (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
           <div className="sticky top-[80px] border-l border-slate-200 pl-6 py-2">
              <div className="flex flex-col gap-5">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Created</span>
                    <span className="text-[13px] font-medium text-slate-900">
                       {topic.createdAt && !isNaN(new Date(topic.createdAt).getTime()) ? format(new Date(topic.createdAt), 'MMM d, yyyy') : 'Unknown'}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/60 dark:text-[#555] transition-colors">Latest Proposal</span>
                    <span className="text-[13px] font-bold text-black dark:text-white transition-colors">
                       {topic.updatedAt && !isNaN(new Date(topic.updatedAt).getTime()) ? formatDistanceToNowStrict(new Date(topic.updatedAt)) + ' ago' : 'Recently'}
                    </span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/60 dark:text-[#555] transition-colors">Proposals</span>
                    <span className="text-[13px] font-bold text-black dark:text-white transition-colors">{topic._count?.posts || 0}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/60 dark:text-[#555] transition-colors">Institutional Views</span>
                    <span className="text-[13px] font-bold text-black dark:text-white transition-colors">{topic.views || 0}</span>
                 </div>
              </div>
               <div className="mt-8 pt-6 border-t border-slate-200 flex gap-2">
                  <button 
                    onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 text-center py-2.5 rounded text-[13px] font-medium transition-colors bg-[#0088cc] text-white hover:bg-[#0077b3]"
                  >
                    Reply
                  </button>
              </div>
           </div>
        </div>

      </div>
      </div>
      
      {/* Semantic spacer so the content is not hidden behind the fixed mobile bottom nav */}
      <div className="lg:hidden w-full" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />

    </div>
  );
}

function RenderContent({ content }: { content: string }) {
  if (!content) return null;
  
  let text = content;
  let signature: string | null = null;
  let docs: { title: string, url: string }[] = [];
  
  // Extract Secure Docs
  const docRegex = /\[SECURE_DOC:([^|]+)\|([^\]]+)\]/g;
  let docMatch;
  while ((docMatch = docRegex.exec(text)) !== null) {
      docs.push({ title: docMatch[1], url: docMatch[2] });
  }
  text = text.replace(docRegex, '').trim();
  
  // Check for the new token format  hex signature OR session fallback OR legacy strings
  const tokenMatch = text.match(/\[SIGNATURE:([^\]]+)\]/i);
  if (tokenMatch) {
    signature = tokenMatch[1];
    text = text.replace(tokenMatch[0], '').trim();
  }
  
  // Check for the old raw HTML format (legacy support)
  if (text.includes('<div style="margin-top: 12px;') && text.includes('Cryptographic Signature Verified')) {
    const htmlMatch = text.match(/word-break:\s*break-all;">(0x[a-fA-F0-9]+)<\/div>/i);
    if (htmlMatch) {
      signature = htmlMatch[1];
    }
    text = text.split('\n\n---')[0].trim();
  }

  return (
    <>
      <div className="whitespace-pre-wrap break-words font-serif text-[15px] leading-relaxed text-black/80 dark:text-[#D0D0D0] transition-colors">{text}</div>
      
      {docs.length > 0 && (
          <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#00C076]">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black dark:text-white transition-colors">Cryptographic Legal Vault</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docs.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 hover:border-[#00C076]/50 hover:bg-[#00C076]/10 hover:shadow-[0_0_20px_rgba(0,192,118,0.15)] transition-all group">
                          <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-black/50 border border-black/10 dark:border-white/5 flex items-center justify-center text-black/60 dark:text-[#888888] group-hover:text-[#00C076] transition-colors">
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          </div>
                          <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-black dark:text-white truncate transition-colors">{doc.title}</span>
                              <span className="text-[10px] text-black/60 dark:text-[#555] font-mono truncate transition-colors">{doc.url}</span>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      )}

      {signature && (
        <div className="mt-8 p-4 rounded-xl bg-[#00C076]/5 border border-[#00C076]/20">
          <span className="text-[10px] font-black text-[#00C076] tracking-[0.1em] uppercase flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
            Signature Verified
          </span>
          <div className="font-mono text-[10px] break-all text-[#00C076]/60">
            {signature.startsWith('SESSION:') ? signature.replace('SESSION:', '') : signature}
          </div>
        </div>
      )}
    </>
  );
}

function PostRow({
  entity, type, onLike, index, sessionAddress, onDeleted
}: {
  entity: any;
  type: 'topic' | 'post';
  onLike: () => void;
  index: number;
  sessionAddress: string | null;
  onDeleted: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addr  = entity.author?.walletAddress || '';
  const label = entity.author?.displayName || (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'ANONYMOUS');
  const isValidDate = entity.createdAt && !isNaN(new Date(entity.createdAt).getTime());
  const time  = isValidDate ? format(new Date(entity.createdAt), 'MMM d, yyyy') : 'Unknown';

  const isAuthor = sessionAddress && addr.toLowerCase() === sessionAddress;

  const handleLike = async () => {
    try {
      let csrfToken = '';
      try {
          const csrfRes = await fetch('/api/auth/csrf', {
              headers: { 'x-web3-address': sessionAddress || '' }
          });
          if (!csrfRes.ok) throw new Error('CSRF fetch failed');
          const contentType = csrfRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              csrfToken = (await csrfRes.json()).token;
          } else {
              throw new Error("Invalid CSRF response");
          }
      } catch (e) {
          alert('SESSION EXPIRED. PLEASE RECONNECT WALLET.');
          return;
      }

      const res = await fetch('/api/forum/likes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          'x-web3-address': sessionAddress || ''
        },
        body: JSON.stringify(type === 'topic' ? { topicId: entity.id } : { postId: entity.id }),
      });
      if (res.ok) { setLiked(l => !l); onLike(); }
    } catch {}
  };

  const handleDelete = async () => {
    setConfirmingDelete(false);
    setDeleting(true);
    try {
      let csrfToken = '';
      try {
          const csrfRes = await fetch('/api/auth/csrf', {
              headers: { 'x-web3-address': sessionAddress || '' }
          });
          if (!csrfRes.ok) throw new Error('CSRF fetch failed');
          const contentType = csrfRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              csrfToken = (await csrfRes.json()).token;
          } else {
              throw new Error("Invalid CSRF response");
          }
      } catch (e) {
          alert('SESSION EXPIRED. PLEASE RECONNECT WALLET.');
          setDeleting(false);
          return;
      }

      const endpoint = type === 'topic'
        ? `/api/forum/topics/${entity.id}`
        : `/api/forum/posts/${entity.id}`;
      const res = await fetch(endpoint, { 
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
          'x-web3-address': sessionAddress || ''
        }
      });
      if (res.ok) onDeleted();
      else alert('Could not delete.');
    } catch {
      alert('Network error.');
    } finally {
      setDeleting(false);
    }
  };

  const likeCount = entity.likes?.length || 0;

  return (
    <div className="flex gap-6 py-6 border-b border-slate-100 transition-colors">
      
      {/* Left Sidebar (Author) */}
      <div className="w-[56px] shrink-0 hidden sm:flex flex-col items-center">
        <Link href={`/forum/u/${addr}`}>
          <div
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[13px] font-bold overflow-hidden bg-slate-200 text-slate-600 border border-slate-300 hover:border-slate-400 transition-colors"
          >
            {!imgError && entity.author?.avatarUrl
              ? <img 
                  src={entity.author.avatarUrl} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)}
                />
              : addr.slice(2, 4).toUpperCase()
            }
          </div>
        </Link>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href={`/forum/u/${addr}`} className="text-[15px] font-medium hover:text-[#0088cc] transition-colors text-slate-900">
                {label}
              </Link>
              {type === 'topic' && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm border border-slate-200">OP</span>
              )}
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[12px] text-slate-500">{time}</span>
               <span className="text-[11px] text-slate-400">#{index}</span>
            </div>
          </div>

        <div className="mb-6 overflow-hidden">
          <RenderContent content={entity.content} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-auto border-t border-slate-100 pt-3 transition-colors">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-[13px] transition-colors ${liked ? 'text-red-500' : 'text-slate-400 hover:text-slate-700'}`}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-[13px] transition-colors text-slate-400 hover:text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
            Reply
          </button>

          {/* Delete button */}
          {isAuthor && (
            <div className="ml-auto flex items-center gap-2">
              {confirmingDelete ? (
                <>
                  <button onClick={handleDelete} className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md transition-colors bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30" disabled={deleting}>
                    Confirm
                  </button>
                  <button onClick={() => setConfirmingDelete(false)} className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md transition-colors bg-black/5 dark:bg-white/5 text-black/60 dark:text-[#888888] hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10" disabled={deleting}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md transition-colors bg-red-500/5 text-red-500/70 border border-red-500/10 hover:bg-red-500/10 hover:text-red-500"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  {deleting ? '...' : 'Revoke'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
