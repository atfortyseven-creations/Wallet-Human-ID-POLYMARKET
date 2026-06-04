import React from 'react';
import Link from 'next/link';
import { DOCS_CONTENT } from '../content';

export default function DocLayout({ children }: { children: React.ReactNode }) {
  // Group topics roughly by category based on their position in the array
  // For simplicity, we just chunk them or list them.
  const allDocs = DOCS_CONTENT;

  return (
    <div className="min-h-screen w-full bg-[#fcfcfc] text-[#111] font-sans flex flex-col md:flex-row selection:bg-black selection:text-white">
      
      {/*  SIDEBAR  */}
      <aside className="w-full md:w-[280px] shrink-0 border-r border-black/5 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <Link href="/developer" className="font-black text-[14px] tracking-tight hover:opacity-70 transition-opacity flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white"><path fillRule="evenodd" clipRule="evenodd" d="M12 2.5C12.5 2.5 13 2.7 13.4 3.1L20.9 10.6C21.7 11.4 21.7 12.6 20.9 13.4L13.4 20.9C12.6 21.7 11.4 21.7 10.6 20.9L3.1 13.4C2.3 12.6 2.3 11.4 3.1 10.6L10.6 3.1C11 2.7 11.5 2.5 12 2.5ZM12 8.5C11.6 8.5 11.2 8.7 10.9 8.9L8.9 10.9C8.3 11.5 8.3 12.5 8.9 13.1L10.9 15.1C11.5 15.7 12.5 15.7 13.1 15.1L15.1 13.1C15.7 12.5 15.7 11.5 15.1 10.9L13.1 8.9C12.8 8.7 12.4 8.5 12 8.5Z" fill="currentColor"/></svg>
            </div>
            Tech Docs
          </Link>
          <Link href="/" className="text-[10px] uppercase font-bold text-black/40 hover:text-black">
            Home
          </Link>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-8">
          {/* Quick structural grouping based on the generation order */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Core Concepts</span>
            {allDocs.slice(0, 11).map(doc => (
              <Link key={doc.slug} href={`/developer/${doc.slug}`} className="text-[13px] font-medium text-black/70 hover:text-black hover:translate-x-1 transition-all">
                {doc.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Protocol Architecture</span>
            {allDocs.slice(11, 23).map(doc => (
              <Link key={doc.slug} href={`/developer/${doc.slug}`} className="text-[13px] font-medium text-black/70 hover:text-black hover:translate-x-1 transition-all">
                {doc.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Network & Integration</span>
            {allDocs.slice(23).map(doc => (
              <Link key={doc.slug} href={`/developer/${doc.slug}`} className="text-[13px] font-medium text-black/70 hover:text-black hover:translate-x-1 transition-all">
                {doc.title}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/*  CONTENT AREA  */}
      <main className="flex-1 min-h-screen bg-white">
        {children}
      </main>

    </div>
  );
}
