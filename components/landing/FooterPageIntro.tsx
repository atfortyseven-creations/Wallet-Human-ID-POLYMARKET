'use client';

import React, { useState } from 'react';
import type { AztecDocSection } from '@/components/landing/AztecDocPage';
import { ChevronDown } from 'lucide-react';

/** Collapsible Aztec vision intro for pages that keep custom UI (forum, marketplace, roadmap). */
export function FooterPageIntro({
  title,
  sections,
  defaultOpen = false,
  dark = false,
}: {
  title: string;
  sections: AztecDocSection[];
  defaultOpen?: boolean;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const border = dark ? 'border-white/10' : 'border-black/10';
  const bg = dark ? 'bg-white/[0.04]' : 'bg-[#2a1b4d]/[0.03]';
  const text = dark ? 'text-white/70' : 'text-[#050505]/65';
  const heading = dark ? 'text-white' : 'text-[#050505]';

  return (
    <div className={`mb-8 rounded-2xl border ${border} ${bg} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left ${heading}`}
      >
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em]">
          {title}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${dark ? 'text-white/50' : 'text-black/40'}`}
        />
      </button>
      {open && (
        <div className={`px-5 pb-6 space-y-8 border-t ${border}`}>
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className={`text-sm font-black mb-3 ${heading}`}>{s.title}</h3>
              <div className={`space-y-3 text-[13px] leading-relaxed ${text}`}>
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {s.bullets && (
                <ul className={`mt-3 space-y-2 text-[12px] ${text}`}>
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#c4f344] shrink-0">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
