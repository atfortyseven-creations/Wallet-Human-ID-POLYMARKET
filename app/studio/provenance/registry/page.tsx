'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Package,
  Clock,
  Hash,
  MapPin,
  Tag,
  ExternalLink,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  LayoutGrid,
  LayoutList,
  Filter,
  X,
} from 'lucide-react';
import { passportPublicUrl } from '@/lib/scan/parseScanPayload';
import type { ProductPassportPublic } from '@/lib/passport/types';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface RegistryResponse {
  records: ProductPassportPublic[];
  count: number;
  nextCursor: string | null;
}

type ViewMode = 'list' | 'grid';
type AnchorFilter = 'all' | 'anchored' | 'pending';

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncateTx(tx: string, len = 14): string {
  return tx.length > len ? `${tx.slice(0, 8)}…${tx.slice(-6)}` : tx;
}

const EXPLORER_BASE =
  typeof window !== 'undefined'
    ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10) === 1
      ? 'https://etherscan.io/tx/'
      : 'https://basescan.org/tx/'
    : 'https://basescan.org/tx/';

/* ─────────────────────────────────────────────
   RECORD CARD — grid view
───────────────────────────────────────────── */
function RecordCard({ record }: { record: ProductPassportPublic }) {
  const url = passportPublicUrl(record.slug);
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 flex flex-col gap-3 hover:border-black/20 transition-colors">
      {/* Status + title */}
      <div className="flex items-start gap-2">
        <div
          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
            record.txHash ? 'bg-[#050505]' : 'bg-black/20'
          }`}
        />
        <p className="text-sm font-bold text-[#050505] leading-snug line-clamp-2">{record.title}</p>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {record.payload?.batchId && (
          <span className="text-[10px] text-black/50 font-mono flex items-center gap-1">
            <Hash size={9} />
            {record.payload.batchId}
          </span>
        )}
        {record.category && (
          <span className="text-[10px] text-black/50 flex items-center gap-1">
            <Tag size={9} />
            {record.category}
          </span>
        )}
        {record.payload?.origin && (
          <span className="text-[10px] text-black/50 flex items-center gap-1">
            <MapPin size={9} />
            {record.payload.origin}
          </span>
        )}
      </div>

      {/* Mini QR */}
      <div className="flex justify-center">
        <div className="border border-black/8 rounded-xl p-2 bg-white">
          <QRCodeSVG value={url} size={100} level="M" />
        </div>
      </div>

      {/* On-chain badge */}
      {record.txHash ? (
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-[#050505] shrink-0" />
          <a
            href={`${EXPLORER_BASE}${record.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-black/50 hover:text-black transition-colors flex items-center gap-0.5"
          >
            {truncateTx(record.txHash)}
            <ExternalLink size={9} className="ml-0.5" />
          </a>
        </div>
      ) : (
        <span className="text-[10px] text-black/30">Not yet on blockchain</span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-black/6">
        <span className="text-[10px] text-black/30 flex items-center gap-1">
          <Clock size={9} />
          {formatDate(record.createdAt)}
        </span>
        <Link
          href={`/passport/${record.slug}`}
          target="_blank"
          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors flex items-center gap-1"
        >
          View
          <ExternalLink size={9} />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECORD ROW — list view
───────────────────────────────────────────── */
function RecordRow({ record }: { record: ProductPassportPublic }) {
  const [expanded, setExpanded] = useState(false);
  const url = passportPublicUrl(record.slug);

  return (
    <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-black/[0.02] transition-colors"
      >
        <div
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
            record.txHash ? 'bg-[#050505]' : 'bg-black/20'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#050505] truncate">{record.title}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            {record.payload?.batchId && (
              <span className="text-[10px] text-black/40 font-mono flex items-center gap-1">
                <Hash size={9} />
                {record.payload.batchId}
              </span>
            )}
            {record.category && (
              <span className="text-[10px] text-black/40 flex items-center gap-1">
                <Tag size={9} />
                {record.category}
              </span>
            )}
            {record.payload?.origin && (
              <span className="text-[10px] text-black/40 flex items-center gap-1">
                <MapPin size={9} />
                {record.payload.origin}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {record.txHash && <ShieldCheck size={13} className="text-[#050505]" />}
          <span className="text-[10px] text-black/30">{formatDate(record.createdAt)}</span>
          {expanded ? (
            <ChevronUp size={13} className="text-black/30" />
          ) : (
            <ChevronDown size={13} className="text-black/30" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-black/8 px-4 pb-4 pt-3 flex gap-4">
          {/* Mini QR */}
          <div className="border border-black/8 rounded-xl p-2 bg-white shrink-0">
            <QRCodeSVG value={url} size={72} level="M" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {record.payload?.description && (
              <p className="text-xs text-black/55 leading-relaxed">{record.payload.description}</p>
            )}

            {record.txHash ? (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-0.5">
                  Blockchain reference
                </p>
                <a
                  href={`${EXPLORER_BASE}${record.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-black/50 hover:text-black transition-colors flex items-center gap-1 break-all"
                >
                  {record.txHash}
                  <ExternalLink size={9} className="shrink-0" />
                </a>
              </div>
            ) : (
              <p className="text-[10px] text-black/30 italic">
                No blockchain confirmation yet.
              </p>
            )}

            <Link
              href={`/passport/${record.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
            >
              Open public record
              <ExternalLink size={9} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN REGISTRY COMPONENT
───────────────────────────────────────────── */
export default function AztecRegistryPage() {
  const [records, setRecords] = useState<ProductPassportPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorFilter, setAnchorFilter] = useState<AnchorFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildUrl = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      params.set('limit', '24');
      if (anchorFilter === 'anchored') params.set('anchored', 'true');
      if (categoryFilter.trim()) params.set('category', categoryFilter.trim());
      if (cursor) params.set('cursor', cursor);
      return `/api/passport/public-registry?${params.toString()}`;
    },
    [anchorFilter, categoryFilter]
  );

  const load = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true);
        setRecords([]);
        setNextCursor(null);
        setTotalLoaded(0);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const url = buildUrl(reset ? undefined : nextCursor || undefined);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load records');
        const data: RegistryResponse = await res.json();

        setRecords((prev) => (reset ? data.records : [...prev, ...data.records]));
        setNextCursor(data.nextCursor);
        setTotalLoaded((prev) => (reset ? data.count : prev + data.count));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl, nextCursor]
  );

  // Reload when filters change
  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorFilter, categoryFilter]);

  // Initial load
  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side search filter on top of server results
  const displayed = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      (r.payload?.batchId || '').toLowerCase().includes(term) ||
      (r.category || '').toLowerCase().includes(term) ||
      (r.payload?.origin || '').toLowerCase().includes(term)
    );
  });

  const anchored = records.filter((r) => !!r.txHash).length;

  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] text-[#050505]">
      {/* ── Page header ── */}
      <div className="border-b border-black/8 bg-white">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-2">
            Studio Provenance · Aztec Network
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#050505] mb-3">
            Product Registry
          </h1>
          <p className="text-sm text-black/55 leading-relaxed max-w-xl">
            All product records registered through Studio Provenance. Each record has a unique QR
            code and a permanent reference on the public blockchain. Records with a shield icon have
            been confirmed on-chain.
          </p>

          {/* Summary band */}
          <div className="mt-6 flex gap-6">
            <div>
              <span className="text-2xl font-black text-[#050505]">{totalLoaded}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">
                Total records
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-[#050505]">{anchored}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">
                On-chain
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="max-w-5xl mx-auto px-5 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              }}
              placeholder="Search by name, batch ID, category…"
              className="w-full pl-8 pr-4 py-2.5 border border-black/10 rounded-xl text-sm bg-white focus:outline-none focus:border-black/30 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${
              showFilters
                ? 'bg-[#050505] text-white border-[#050505]'
                : 'border-black/10 text-black/50 hover:border-black/30'
            }`}
          >
            <Filter size={12} />
            Filters
          </button>

          {/* View toggle */}
          <div className="flex gap-1 border border-black/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#050505] text-white' : 'text-black/40 hover:text-black/70'
              }`}
            >
              <LayoutList size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#050505] text-white' : 'text-black/40 hover:text-black/70'
              }`}
            >
              <LayoutGrid size={13} />
            </button>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-black/10 text-black/40 hover:text-black/70 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-3 p-4 rounded-xl border border-black/8 bg-black/[0.02]">
            {/* Anchor filter */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2">
                Blockchain status
              </p>
              <div className="flex gap-1">
                {(['all', 'anchored', 'pending'] as AnchorFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setAnchorFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                      anchorFilter === f
                        ? 'bg-[#050505] text-white'
                        : 'bg-white border border-black/10 text-black/50 hover:border-black/30'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'anchored' ? 'On-chain' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2">
                Category
              </p>
              <input
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="e.g. textile, food…"
                className="px-3 py-1.5 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black/30 transition-colors"
              />
            </div>

            {/* Clear */}
            {(anchorFilter !== 'all' || categoryFilter) && (
              <button
                type="button"
                onClick={() => {
                  setAnchorFilter('all');
                  setCategoryFilter('');
                }}
                className="self-end flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
              >
                <X size={10} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Records ── */}
      <div className="max-w-5xl mx-auto px-5 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-black/30" size={24} />
            <p className="text-xs text-black/40 font-black uppercase tracking-widest">
              Loading records…
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <AlertCircle className="text-black/30" size={24} />
            <p className="text-sm text-black/60">{error}</p>
            <button
              onClick={() => load(true)}
              className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Package className="text-black/20" size={32} />
            <div>
              <p className="text-sm font-bold text-[#050505]">No records found</p>
              <p className="text-xs text-black/50 mt-1 max-w-[280px] mx-auto">
                {searchTerm
                  ? `No records match "${searchTerm}".`
                  : 'No records have been registered yet.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((record) => (
              <RecordCard key={record.slug} record={record} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((record) => (
              <RecordRow key={record.slug} record={record} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && !error && nextCursor && !searchTerm && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => load(false)}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-black/15 text-[11px] font-black uppercase tracking-widest text-black/50 hover:text-black hover:border-black/30 transition-colors disabled:opacity-40"
            >
              {loadingMore ? <Loader2 className="animate-spin" size={13} /> : null}
              Load more records
            </button>
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <p className="text-center text-[10px] text-black/25 mt-6">
            Showing {displayed.length} record{displayed.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
