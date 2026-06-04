import React from 'react';
import { notFound } from 'next/navigation';
import { DOCS_CONTENT } from '../content';

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS_CONTENT.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const doc = DOCS_CONTENT.find((d) => d.slug === resolvedParams.slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="w-full max-w-[800px] mx-auto px-8 md:px-16 py-20 pb-40">
      
      {/*  HEADER  */}
      <div className="mb-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-black/40 mb-6">
          Technical Specification / {doc.title}
        </div>
        <h1 className="text-[36px] md:text-[52px] font-black tracking-[-0.03em] leading-[1.05] text-[#050505] mb-8">
          {doc.title}
        </h1>
        <div className="w-full h-px bg-black/5" />
      </div>

      {/*  CONTENT BODY  */}
      <div className="prose prose-lg prose-neutral max-w-none">
        {doc.content.map((paragraph, idx) => (
          <p key={idx} className="text-[17px] md:text-[19px] leading-[1.8] text-[#1a1a1a] font-serif mb-8 opacity-90">
            {paragraph}
          </p>
        ))}
      </div>

      {/*  FOOTER  */}
      <div className="mt-32 pt-10 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[12px] font-mono text-black/40 uppercase tracking-widest font-bold">
          © 2026 Humanity Ledger Protocol
        </p>
        <div className="flex gap-4">
          <a href="/developer" className="px-6 py-3 bg-black/5 hover:bg-black/10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors">
            Back to Docs
          </a>
        </div>
      </div>
      
    </article>
  );
}
