"use client";

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

import Image from 'next/image';
import Link from 'next/link';

export default function StatusNavbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full bg-white border-b border-black/10 flex items-center justify-between px-6 py-4 fixed top-0 left-0 right-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Image 
          src="/official-whale-monochrome.png" 
          alt="Whale Alert Network" 
          width={32} 
          height={32} 
          className="rounded-full bg-black p-1"
        />
        <span className="font-bold text-black text-lg tracking-tight">Whale Alert Network</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-black/5 hover:bg-black/10 border border-black/10 px-4 py-2 rounded-md transition-colors text-sm font-semibold text-black/70">
          <span className="font-mono text-[10px] font-black text-black/50">[CAL]</span>
          Subscribe to Updates
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              if (!session) {
                signIn('google');
              } else {
                setMenuOpen(!menuOpen);
              }
            }}
            className="flex items-center gap-2 bg-black/5 hover:bg-black/10 border border-black/10 px-4 py-2 rounded-md transition-colors text-sm font-semibold text-black/70"
          >
            Account
            {session && <span className="font-mono text-[10px] font-black text-black/50">[v]</span>}
          </button>

          {menuOpen && session && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-black/10 rounded-lg shadow-xl py-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-black/5 text-xs text-black/50 truncate">
                {session.user?.email}
              </div>
              <Link href="/status/account" className="text-left px-4 py-3 text-sm text-black/70 hover:bg-black/5 font-medium">
                Manage subscriptions
              </Link>
              <button 
                onClick={() => signOut()}
                className="text-left px-4 py-3 text-sm text-black/70 hover:bg-black/5 font-medium border-t border-black/5"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
