'use client';

import React, { useState } from 'react';

export function VisionAboutSection() {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="about-us-leadership"
      className="w-full bg-white border-t border-black/8"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-16 py-20 md:py-28">

        {/* Section label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.025] mb-7">
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-black/45">
            About Us &amp; Leadership
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl md:text-[2.6rem] font-black tracking-tighter text-black leading-tight mb-14 max-w-lg">
          Spearheading privacy in<br className="hidden md:block" /> a transparent world.
        </h2>

        {/* Main card layout */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* ── Portrait + name badge ─────────────────────────────────── */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-[200px] h-[248px] md:w-[216px] md:h-[264px] overflow-hidden rounded-md border border-black/10 bg-black/[0.03]">
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/system-shots/photo_2026-05-16_19-57-16.jpg"
                  alt="Stefan Antonio Cirisanu"
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                /* Monogram fallback — polished, on-brand */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/[0.04]">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#e8e8e8 0%,#cfcfcf 100%)' }}
                  >
                    <span className="font-mono font-black text-2xl text-black/25 select-none">SAC</span>
                  </div>
                  <span className="text-[8px] font-mono text-black/20 uppercase tracking-widest text-center px-4">
                    Stefan Antonio<br />Cirisanu
                  </span>
                </div>
              )}
            </div>

            {/* Name & title */}
            <div className="mt-4 text-center">
              <p className="text-[11px] font-black text-black uppercase tracking-wider">
                Stefan Antonio Cirisanu
              </p>
              <p className="text-[9px] font-mono text-black/40 uppercase tracking-widest mt-0.5">
                CEO &amp; Founder
              </p>

              {/* Social links */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <a
                  href="https://www.linkedin.com/in/stefan-antonio-cirisanu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black/10 rounded-full text-black/40 hover:border-black/25 hover:text-black/70 transition-all"
                  title="LinkedIn"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-wider">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Copy block ──────────────────────────────────────────────── */}
          <div className="flex-1 space-y-5 text-[13px] md:text-[14px] leading-relaxed text-black/60 font-sans">
            <p>
              The <span className="text-black font-semibold">Whale Alert Network</span> and{' '}
              <a
                href="https://www.linkedin.com/company/humanity-ledger/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-semibold underline decoration-black/20 hover:decoration-black transition-all"
              >
                Humanity Ledger
              </a>{' '}
              ecosystems were founded on a singular vision: to bring absolute{' '}
              <span className="text-black font-semibold">privacy and security</span> to
              decentralized finance without compromising compliance. Led by Stefan Antonio Cirisanu,
              our global team of engineers and cryptographers is dedicated to building tools that
              empower individuals to take control of their{' '}
              <span className="text-black font-semibold">financial identities</span>.
            </p>

            <p>
              Our current architecture{' '}
              <span className="text-black font-semibold">leverages the Aztec Network</span> to
              execute zero-knowledge proofs directly on your device. This ensures that every capital
              flow you track and every identity attribute you verify remains{' '}
              <span className="text-black font-semibold">completely shielded</span>. We process
              mathematical proofs, not personal data.
            </p>

            <p>
              Operating as an open-source initiative, we are actively expanding our integration with
              Layer-2 protocols. We believe that true financial sovereignty requires transparent
              code and trustless systems, giving you the power to monitor global markets privately
              and <span className="text-black font-semibold">securely</span>.
            </p>

            {/* Feature pillars */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-black/6">
              {[
                {
                  n: '01',
                  title: 'Zero-Knowledge',
                  desc: 'Mathematical proofs replace personal data at every layer of the stack.',
                },
                {
                  n: '02',
                  title: 'Open Source',
                  desc: 'Fully auditable codebase on GitHub — trust nothing, verify everything.',
                },
                {
                  n: '03',
                  title: 'Trustless Rails',
                  desc: 'No middlemen. No honeypots. No single points of failure, ever.',
                },
              ].map((p) => (
                <div key={p.n} className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20">
                    {p.n}
                  </span>
                  <p className="text-[11px] font-black uppercase tracking-wide text-black/70">
                    {p.title}
                  </p>
                  <p className="text-[10px] text-black/38 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
