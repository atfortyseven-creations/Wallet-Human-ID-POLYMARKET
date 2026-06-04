"use client";

import { useEffect } from "react";
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Application Error:", error);
    
    // [ABYSMALLY COMPLEX OPTIMIZATION]: Auto-heal Next.js Server Action mismatch
    if (error?.message?.includes("Failed to find Server Action") || error?.digest?.includes("Failed to find Server Action")) {
      console.warn("Server Action Desync Detected. Initiating auto-reload...");
      window.location.reload();
      return;
    }

    // [ABYSMALLY COMPLEX OPTIMIZATION]: Auto-heal ChunkLoadError (Stale build cache)
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      const reloadKey = 'global_chunk_reload_attempted';
      try {
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, '1');
          console.warn('Global ChunkLoadError detected. Initiating auto-reload to fetch fresh chunks...');
          window.location.reload();
        } else {
          sessionStorage.removeItem(reloadKey);
        }
      } catch (e) {
        console.error("Session storage failed during chunk reload", e);
      }
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-8 text-center bg-transparent">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("/api/checkpoint-image?name=patron-cosmico-4k.png")',
          backgroundSize: '300px auto',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative z-10 w-full max-w-md p-8 bg-white border border-black/5 rounded-3xl shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mb-6 ring-8 ring-[#FF3B30]/5">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-2xl font-black text-black uppercase tracking-widest mb-2">
          System Fault
        </h1>
        
        <p className="text-[13px] font-bold text-black/50 leading-relaxed mb-6">
          The system terminal encountered an unexpected execution fault. Our sentinels have logged the anomaly.
        </p>

        {error.message && (
          <div className="w-full bg-red-500/10 rounded-xl p-4 mb-4 border border-red-500/20 text-left overflow-auto max-h-48">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500/80 block mb-1">Error Message:</span>
            <span className="text-[11px] font-mono font-bold text-red-500">{error.message}</span>
            {error.stack && (
               <pre className="text-[9px] font-mono mt-2 text-red-500/60 overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
            )}
          </div>
        )}
        {error.digest && (
          <div className="w-full bg-black/5 rounded-xl p-3 mb-8 border border-black/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Fault ID:</span>
            <span className="text-[11px] font-mono font-bold text-black/70">{error.digest}</span>
          </div>
        )}

        <div className="flex w-full items-center gap-3">
            <button 
              onClick={() => reset()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-black/5 hover:bg-black/10 text-black text-[11px] font-black uppercase tracking-widest rounded-2xl transition-colors"
            >
              <RefreshCw size={14} className="opacity-50" />
              Reset State
            </button>
            <Link 
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-black hover:bg-black/90 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-colors shadow-lg shadow-black/10"
            >
              <Home size={14} className="opacity-50" />
              Terminal Root
            </Link>
        </div>
      </div>
    </div>
  );
}
