'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const APPS = [
  {
    id: 'portfolio',
    title: 'Portfolio Terminal',
    description: 'Track multi-chain balances and assets entirely locally. No server indexing.',
    href: '/terminal',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-blue-50 border-blue-100',
    tag: 'Financial',
  },
  {
    id: 'chat',
    title: 'Whale Chat',
    description: 'E2E encrypted P2P messaging with onion routing and Aztec ZK Identity.',
    href: '/chat',
    icon: (
      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-violet-50 border-violet-100',
    tag: 'Social',
  },
  {
    id: 'studio',
    title: 'Studio Provenance',
    description: 'Register real-world assets on L2. Public proof, encrypted ownership.',
    href: '/studio/provenance',
    icon: (
      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'bg-emerald-50 border-emerald-100',
    tag: 'Registry',
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    description: 'Track protocol milestones, technical upgrades, and the governance timeline.',
    href: '/terminal?tab=humanity-ledger',
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: 'bg-amber-50 border-amber-100',
    tag: 'Protocol',
  },
  {
    id: 'identity',
    title: 'Identity',
    description: 'Sovereign ZK identity layer. Claim your unique human credential on-chain.',
    href: '/terminal?tab=gold',
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'bg-indigo-50 border-indigo-100',
    tag: 'Identity',
  },
  {
    id: 'markets',
    title: 'Markets',
    description: 'Private DeFi position tracking and on-chain market data aggregation.',
    href: '/terminal?tab=markets',
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: 'bg-orange-50 border-orange-100',
    tag: 'Markets',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Read the Humanity Ledger privacy architecture and data governance policy.',
    href: '/privacy',
    icon: (
      <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: 'bg-slate-50 border-slate-200',
    tag: 'Legal',
  },
  {
    id: 'token',
    title: 'QDS Token',
    description: 'Quantum Defence Shield governance and utility token. Stake, vote, earn.',
    href: '/qds',
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-yellow-50 border-yellow-100',
    tag: 'Token',
  },
  {
    id: 'registry',
    title: 'Registry',
    description: 'Explore global node coverage, registered asset passports, and country data.',
    href: '/registry',
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-teal-50 border-teal-100',
    tag: 'Network',
  },
  {
    id: 'academy',
    title: 'Academy',
    description: 'Deep dive into cryptography, network economics, and protocol architecture.',
    href: '/academy',
    icon: (
      <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    color: 'bg-rose-50 border-rose-100',
    tag: 'Education',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055 },
  },
};

const item: any = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
};

export function AppLauncherHub() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
    >
      {APPS.map((app) => (
        <motion.div key={app.id} variants={item}>
          <Link href={app.href} className="block h-full group">
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 md:p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 hover:border-slate-300 relative overflow-hidden cursor-pointer">
              {/* Subtle corner gradient */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-slate-50/80 to-transparent rounded-bl-[80px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${app.color} flex-shrink-0`}>
                  {app.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0">
                  {app.tag}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-[16px] md:text-[17px] font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors leading-snug">
                  {app.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {app.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
