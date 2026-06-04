'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Package, ExternalLink } from 'lucide-react';
import type { ProductPassportPublic } from '@/lib/passport/types';
import { passportPublicUrl } from '@/lib/scan/parseScanPayload';

export function ProductPassportsPanel() {
  const [passports, setPassports] = useState<ProductPassportPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/passport/mine', { credentials: 'include' });
        if (res.status === 401) {
          setPassports([]);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        if (!cancelled) setPassports(data.passports || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border p-8 flex justify-center" style={{ borderColor: 'rgba(5,5,5,0.08)', background: '#fff' }}>
        <Loader2 className="animate-spin text-black/30" size={22} />
      </div>
    );
  }

  if (error) return null;
  if (passports.length === 0) return null;

  return (
    <div className="rounded-3xl border overflow-hidden mt-8" style={{ borderColor: 'rgba(5,5,5,0.08)', background: '#fff' }}>
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(5,5,5,0.08)' }}>
        <div className="flex items-center gap-3">
          <Package size={18} className="text-black/40" />
          <h2 className="font-black uppercase tracking-tight text-sm text-[#050505]">Product passports</h2>
        </div>
        <Link
          href="/studio/provenance"
          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black"
        >
          Studio
        </Link>
      </div>
      <ul className="divide-y divide-black/5">
        {passports.map((p) => (
          <li key={p.slug} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{p.title}</p>
              <p className="text-[10px] font-mono text-black/40 truncate">{p.slug}</p>
              {p.txHash && (
                <p className="text-[10px] text-black/50 font-bold uppercase tracking-wider mt-1">On-chain anchored</p>
              )}
            </div>
            <Link
              href={`/passport/${p.slug}`}
              className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black/50 hover:text-black"
            >
              View <ExternalLink size={12} />
            </Link>
          </li>
        ))}
      </ul>
      <p className="px-6 py-3 text-[10px] text-black/30 font-mono truncate border-t border-black/5">
        Label URL: {passportPublicUrl(passports[0]?.slug || 'example')}
      </p>
    </div>
  );
}
