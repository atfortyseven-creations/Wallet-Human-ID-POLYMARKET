"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StatusNavbar from '@/components/status/StatusNavbar';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If unauthenticated, redirect to the main status page
  // where they can click Account to log in.
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      router.push('/status');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans relative">
      <StatusNavbar />
      
      <main className="w-full max-w-[900px] mx-auto px-6 pt-32 pb-24 flex flex-col gap-10">
        <div className="w-full">
          {/* Account Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Account</h2>
            <p className="text-sm text-slate-500">
              {session?.user?.email || 'Loading account details...'}
            </p>
          </div>

          {/* Subscriptions Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Subscriptions</h2>
            <p className="text-sm text-slate-500 mb-4">
              Manage how you receive incident updates.
            </p>
            <p className="text-sm text-slate-400 italic">
              Coming soon
            </p>
          </div>

          {/* Log Out Button */}
          <div>
            <button 
              onClick={() => signOut({ callbackUrl: '/status' })}
              className="bg-black/5 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-md text-sm transition-colors shadow-sm"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
