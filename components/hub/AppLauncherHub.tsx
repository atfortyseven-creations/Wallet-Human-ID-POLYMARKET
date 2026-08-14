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
    tag: 'Financial'
  },
  {
    id: 'chat',
    title: 'Whale Chat',
    description: 'E2E encrypted P2P messaging utilizing Aztec ZK Identity.',
    href: '/chat',
    icon: (
      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-violet-50 border-violet-100',
    tag: 'Social'
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
    tag: 'Registry'
  },
  {
    id: 'markets',
    title: 'Predictive Markets',
    description: 'Tap into global prediction markets with zero-knowledge position sizing.',
    href: '/predictions',
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: 'bg-orange-50 border-orange-100',
    tag: 'Markets'
  },
  {
    id: 'identity',
    title: 'Identity Vault',
    description: 'Manage your ZK proofs and World ID credentials locally.',
    href: '/settings',
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    color: 'bg-indigo-50 border-indigo-100',
    tag: 'Security'
  },
  {
    id: 'academy',
    title: 'Academy',
    description: 'Deep dive into cryptography, network economics, and protocol architecture.',
    href: '/academy',
    icon: (
      <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    color: 'bg-rose-50 border-rose-100',
    tag: 'Education'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function AppLauncherHub() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {APPS.map((app) => (
        <motion.div key={app.id} variants={item}>
          <Link href={app.href} className="block h-full group">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 h-full transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-[100px] -z-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${app.color}`}>
                  {app.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                  {app.tag}
                </span>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[18px] font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {app.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
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
