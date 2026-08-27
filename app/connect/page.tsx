"use client";
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RemoteLottie } from '@/components/ui/RemoteLottie';


// Desktop connect page (QR handshake)
const ConnectPage = dynamic(() => import('@/components/landing/ConnectPage'), { 
  ssr: false,
  loading: () => null
});

/**
function ConnectLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-6 p-6">
      <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-black/50 font-medium">
        Loading Connect...
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ConnectLoading />}>
      <ConnectPage />
    </Suspense>
  );
}
