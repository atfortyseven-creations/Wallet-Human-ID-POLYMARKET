"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { useSystemAccount } from '@/hooks/useSystemAccount';

const STATIC_SECTORS = [
  { id: 'general', name: 'General', slug: 'general', description: 'Network-wide announcements and discussion' },
  { id: 'whale-network', name: 'Whale Network', slug: 'whale-network', description: 'Institutional architecture discussions' },
  { id: 'applications', name: 'Applications', slug: 'applications', description: 'DApp integrations and deployment' },
  { id: 'testnets', name: 'Testnets', slug: 'testnets', description: 'Testnet node operations' },
  { id: 'noir', name: 'Noir', slug: 'noir', description: 'ZK programming and circuits' },
  { id: 'site-feedback', name: 'Site Feedback', slug: 'site-feedback', description: 'Platform issues and feedback' }
];

export default function ForumPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTopics: 0, totalPosts: 0, activeUsers: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/forum/topics?limit=25')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTopics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/stats/platform')
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setStats({
            totalTopics: data.topics ?? 0,
            totalPosts: data.posts ?? 0,
            activeUsers: data.personas ?? 0
          });
        }
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/forum/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(data => setSearchResults(Array.isArray(data) ? data : []));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className="w-full min-h-[100dvh] bg-white text-black py-10 font-sans selection:bg-black selection:text-white relative">
      
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-white/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[640px] bg-white border-2 border-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
            <div className="flex items-center px-4 py-4 border-b-2 border-black gap-3">
              <span className="text-[12px] font-black uppercase tracking-widest text-black">SEARCH</span>
              <input 
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query database..."
                className="flex-1 bg-transparent text-[18px] font-bold outline-none text-black placeholder:text-gray-400"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[11px] font-black uppercase tracking-widest px-2 py-1 bg-black text-white hover:bg-gray-800 transition-colors">ESC</button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto">
              {searchQuery.length >= 2 && searchResults.length === 0 ? (
                 <div className="p-8 text-center text-[12px] font-mono text-gray-500 uppercase tracking-widest">
                   No records found.
                 </div>
              ) : (
                searchResults.map(res => (
                  <Link href={`/forum/t/${res.id}`} key={res.id} onClick={() => setSearchOpen(false)}>
                    <div className="px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-black">{res.title}</span>
                      <span className="text-[11px] font-mono text-gray-500 line-clamp-1">{res.content.replace(/\[SIGNATURE:.*?\]/g, '')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col gap-12">
        
        {/* Header Section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end justify-between border-b-2 border-black pb-8">
          <div className="flex flex-col gap-3">
             <h1 className="text-[40px] md:text-[56px] font-black tracking-tighter text-black leading-none">
               Discourse
             </h1>
          </div>
          
          <div className="flex gap-6 items-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Transmissions</span>
              <span className="text-[28px] font-black text-black leading-none">{stats.totalPosts.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Operatives</span>
              <span className="text-[28px] font-black text-black leading-none">{stats.activeUsers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
           <div className="flex flex-wrap items-center gap-2">
              <Link href="/forum/new" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors shadow-sm">
                NEW TOPIC
              </Link>
              <button onClick={() => setSearchOpen(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-black text-[11px] font-bold uppercase tracking-widest hover:border-black transition-colors shadow-sm">
                SEARCH
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono opacity-50 ml-1 bg-gray-100 px-1.5 py-0.5 rounded">
                  CMD+K
                </span>
              </button>
           </div>
           
           <div className="flex items-center gap-2">
              <Link href="/forum/settings" className="px-5 py-2.5 border border-gray-300 hover:border-black transition-colors text-black text-[11px] font-black uppercase tracking-[0.15em] bg-white shadow-sm flex items-center justify-center">
                 SETTINGS
              </Link>
           </div>
        </div>

        {/* 2-Column Split: Topics (Left) / Sectors (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px] items-start">
           
           {/* Feed */}
           <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-black">
                 <h2 className="text-[16px] font-black uppercase tracking-widest flex items-center gap-2">
                   DISCUSSIONS
                 </h2>
                 <span className="text-[11px] font-mono text-gray-500 uppercase">LATEST</span>
              </div>
              
              <div className="flex flex-col">
                 {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                 ) : topics.length === 0 ? (
                    <div className="py-20 text-center text-[12px] font-mono text-gray-500 uppercase tracking-widest border border-gray-200">
                      No transmissions.
                    </div>
                 ) : (
                   topics.map(topic => {
                     const date = topic.createdAt ? new Date(topic.createdAt) : new Date();
                     const isValid = !isNaN(date.getTime());
                     const timeStr = isValid ? formatDistanceToNowStrict(date) : 'Unknown';
                     
                     return (
                       <Link key={topic.id} href={`/forum/t/${topic.id}`} className="group flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-200 hover:bg-gray-50 transition-colors gap-4">
                          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
                             <h3 className="text-[16px] font-bold text-black group-hover:underline decoration-2 underline-offset-4 truncate">
                               {topic.title}
                             </h3>
                             <div className="flex items-center gap-3">
                               {topic.category && (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-black px-2 py-0.5 border border-black bg-white">
                                   {topic.category.name}
                                 </span>
                               )}
                               <span className="text-[11px] font-mono text-gray-500">
                                 {topic.author?.displayName || (topic.author?.walletAddress ? `${topic.author.walletAddress.slice(0,6)}...${topic.author.walletAddress.slice(-4)}` : 'ANON')}
                               </span>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0 sm:w-auto w-full justify-between sm:justify-end">
                             <div className="flex items-center gap-1.5 text-black">
                               <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Replies</span>
                               <span className="text-[14px] font-bold">{topic._count?.posts || 0}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-black">
                               <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Views</span>
                               <span className="text-[14px] font-bold">{topic.views || 0}</span>
                             </div>
                             <div className="text-[12px] font-mono text-gray-500 w-16 text-right">
                               {timeStr}
                             </div>
                          </div>
                       </Link>
                     )
                   })
                 )}
              </div>
           </div>

           {/* Sectors */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-gray-50 border-2 border-black p-6">
                 <h2 className="text-[16px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                   SECTORS
                 </h2>
                 <div className="flex flex-col gap-1">
                   {STATIC_SECTORS.map(sec => (
                     <Link key={sec.id} href={`/forum/c/${sec.slug}`} className="group flex items-center justify-between p-3 border border-transparent hover:border-black hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-bold uppercase tracking-widest text-black">{sec.name}</span>
                        </div>
                     </Link>
                   ))}
                 </div>
              </div>
           </div>

        </div>
      </div>
      
      {/* Mobile Spacer */}
      <div className="lg:hidden w-full h-[80px]" />
    </div>
  );
}
