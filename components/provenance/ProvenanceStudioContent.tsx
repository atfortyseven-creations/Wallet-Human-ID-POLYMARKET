'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2,
  Package,
  QrCode,
  Anchor,
  CheckCircle2,
  ArrowLeft,
  Plus,
  LayoutList,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Tag,
  MapPin,
  Hash,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  parseAbi,
  parseEther,
  keccak256,
  toBytes,
  encodeAbiParameters,
  parseAbiParameters,
} from 'viem';
import { passportPublicUrl } from '@/lib/scan/parseScanPayload';
import type { ProductPassportPublic } from '@/lib/passport/types';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const LEDGER_ABI = parseAbi([
  'function transferWithReceipt(address to, uint256 amount, string calldata memo, uint256 coreEntropy, bytes calldata advancedMetadata) external returns (uint256)',
]);

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10);
const LEDGER_ADDR = (process.env.NEXT_PUBLIC_LEDGER_CONTRACT_ADDRESS || '0x') as `0x${string}`;

const EXPLORER_BASE =
  CHAIN_ID === 8453
    ? 'https://basescan.org/tx/'
    : CHAIN_ID === 1
    ? 'https://etherscan.io/tx/'
    : 'https://etherscan.io/tx/';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Tab = 'create' | 'registry' | 'aztec';

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
function generateCoreEntropy(): bigint {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return BigInt('0x' + Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join(''));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(str: string, len = 16): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

/** Single stat pill used in the header band */
function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[18px] font-black tracking-tight text-[#050505]">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">{label}</span>
    </div>
  );
}

/** Inline copy button */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/** Label wrapper used on form fields */
function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ─────────────────────────────────────────────
   TAB: CREATE
───────────────────────────────────────────── */
interface CreateTabProps {
  isMobile: boolean;
  onCreated: (passport: ProductPassportPublic) => void;
}

function CreateTab({ isMobile, onCreated }: CreateTabProps) {
  const { address } = useAccount();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const inputClass =
    'mt-1 w-full border border-black/10 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-black/30 transition-colors';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [origin, setOrigin] = useState('');
  const [batchId, setBatchId] = useState('');
  const [description, setDescription] = useState('');
  const [gs1Gtin, setGs1Gtin] = useState('');
  const [creating, setCreating] = useState(false);
  const [passport, setPassport] = useState<ProductPassportPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anchorEntropy, setAnchorEntropy] = useState<string | null>(null);
  const [anchoring, setAnchoring] = useState(false);

  const passportUrl = passport ? passportPublicUrl(passport.slug) : '';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          category: category,
          gs1Gtin: gs1Gtin.replace(/\D/g, '') || undefined,
          payload: {
            description: description.trim() || undefined,
            origin: origin.trim() || undefined,
            batchId: batchId.trim() || undefined,
          },
          events: origin
            ? [
                {
                  eventType: 'manufactured',
                  payload: { location: origin, note: 'Registered via Provenance Studio' },
                },
              ]
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setPassport(data);
      onCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setCreating(false);
    }
  };

  const handleAnchor = async () => {
    if (!passport || !address) {
      setError('Connect your wallet to confirm on-chain.');
      return;
    }
    if (LEDGER_ADDR === '0x') {
      setError('On-chain confirmation is not available on this network.');
      return;
    }
    setAnchoring(true);
    setError(null);
    const entropy = generateCoreEntropy();
    const entropyHex = `0x${entropy.toString(16).padStart(64, '0')}` as `0x${string}`;
    setAnchorEntropy(entropyHex);
    const metadata = encodeAbiParameters(
      parseAbiParameters('string platform, bytes32 passportSlug'),
      ['StudioProvenance/v1', keccak256(toBytes(passport.slug)) as `0x${string}`]
    );
    try {
      await writeContractAsync({
        address: LEDGER_ADDR,
        abi: LEDGER_ABI,
        functionName: 'transferWithReceipt',
        args: [address, parseEther('0'), `PASSPORT:${passport.slug}`, entropy, metadata],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'On-chain confirmation failed');
      setAnchoring(false);
    }
  };

  useEffect(() => {
    if (!confirmed || !txHash || !passport || !anchorEntropy) return;
    (async () => {
      await fetch(`/api/passport/${passport.slug}/anchor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          coreEntropy: anchorEntropy,
          txHash,
          chainId: CHAIN_ID,
        }),
      });
      setPassport((p) =>
        p ? { ...p, txHash, chainId: CHAIN_ID, coreEntropy: anchorEntropy } : p
      );
      setAnchoring(false);
    })();
  }, [confirmed, txHash, passport, anchorEntropy]);

  const handleReset = () => {
    setPassport(null);
    setTitle('');
    setCategory('OTHER');
    setOrigin('');
    setBatchId('');
    setDescription('');
    setGs1Gtin('');
    setError(null);
    setAnchorEntropy(null);
  };

  /* ── PASSPORT CREATED VIEW ── */
  if (passport) {
    return (
      <div className="space-y-5">
        {/* Success card */}
        <div className="rounded-2xl border border-black/12 bg-white p-5 flex items-start gap-3">
          <CheckCircle2 className="text-[#050505] shrink-0 mt-0.5" size={20} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#050505] text-sm">{passport.title}</p>
            {passport.payload?.batchId && (
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-0.5">
                Batch {passport.payload.batchId}
              </p>
            )}
            <p className="text-xs text-black/50 mt-1 font-mono break-all">{passportUrl}</p>
          </div>
          <CopyButton text={passportUrl} />
        </div>

        {/* QR Code */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-black/30">
            <QrCode size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Scannable QR Code
            </span>
          </div>
          <div className="p-3 border border-black/8 rounded-xl bg-white">
            <QRCodeSVG value={passportUrl} size={isMobile ? 180 : 200} level="M" includeMargin />
          </div>
          <p className="text-[10px] text-black/40 text-center leading-relaxed max-w-[240px]">
            Print this on the product label. Anyone who scans it sees the public record.
          </p>
          <Link
            href={`/passport/${passport.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-black/60 underline underline-offset-2"
          >
            Preview public record
            <ExternalLink size={11} />
          </Link>
        </div>

        {/* On-chain confirmation */}
        {!passport.txHash ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
            <div>
              <p className="text-xs font-bold text-[#050505]">Confirm on blockchain</p>
              <p className="text-[11px] text-black/50 mt-1 leading-relaxed">
                Optional. This writes a permanent, tamper-proof reference to this record on the
                public ledger. The record already exists — this step adds cryptographic proof of
                when it was created.
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-black/60">
                <AlertCircle size={13} />
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleAnchor}
              disabled={anchoring || isPending || confirming}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#050505] text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              {anchoring || isPending || confirming ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Anchor size={14} />
              )}
              {confirming ? 'Waiting for confirmation…' : 'Write to blockchain'}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[#050505]" />
              <p className="text-xs font-bold text-[#050505]">Confirmed on blockchain</p>
            </div>
            <p className="text-[11px] text-black/50 mb-3 leading-relaxed">
              This record has a permanent cryptographic reference on the public ledger.
            </p>
            <a
              href={`${EXPLORER_BASE}${passport.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-black/50 hover:text-black transition-colors"
            >
              {truncate(passport.txHash || '', 26)}
              <ExternalLink size={10} />
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
        >
          <Plus size={12} />
          Register another product
        </button>
      </div>
    );
  }

  /* ── CREATION FORM ── */
  return (
    <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
      <FieldLabel label="Product name *">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Organic cotton tote bag"
        />
      </FieldLabel>

      <FieldLabel label="Institutional Category">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="PHARMA">Pharmaceutical & Health</option>
          <option value="FOOD">Food & Agriculture</option>
          <option value="TECH">Technology & Electronics</option>
          <option value="INFRASTRUCTURE">Public Infrastructure</option>
          <option value="TEXTILE">Textile & Materials</option>
          <option value="DOCUMENTS">Official Documents</option>
          <option value="OTHER">Other Institutional Use</option>
        </select>
      </FieldLabel>

      <FieldLabel label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Describe the product, its materials, or purpose."
        />
      </FieldLabel>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <FieldLabel label="Country or region of origin">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className={inputClass}
            placeholder="Spain"
          />
        </FieldLabel>
        <FieldLabel label="Batch ID">
          <input
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className={inputClass}
            placeholder="LOT-2024-0891"
          />
        </FieldLabel>
      </div>

      <FieldLabel label="GS1 barcode number (optional)">
        <input
          value={gs1Gtin}
          onChange={(e) => setGs1Gtin(e.target.value)}
          className={`${inputClass} font-mono`}
          placeholder="00812345678901"
        />
      </FieldLabel>

      {error && (
        <div className="flex items-start gap-2 text-xs text-[#cc0000] bg-[#cc0000]/5 p-3 rounded-xl border border-[#cc0000]/10">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={creating}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {creating ? <Loader2 className="animate-spin" size={16} /> : <Package size={16} />}
        {creating ? 'Validating integrity via AI…' : 'Create product record'}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────
   TAB: ON-CHAIN REGISTRY
───────────────────────────────────────────── */
interface RegistryTabProps {
  isMobile: boolean;
  refreshKey: number;
}

function RegistryTab({ isMobile: _isMobile, refreshKey }: RegistryTabProps) {
  const [passports, setPassports] = useState<ProductPassportPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'anchored' | 'pending'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Batch ID', 'Origin', 'Status', 'Date', 'Public URL', 'Tx Hash'];
    const rows = filtered.map((p) => [
      p.title,
      p.category || '',
      p.payload?.batchId || '',
      p.payload?.origin || '',
      p.txHash ? 'Anchored' : 'Pending',
      new Date(p.createdAt).toISOString(),
      passportPublicUrl(p.slug),
      p.txHash || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((field) => `"${(field || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'institutional_registry_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/passport/mine', { credentials: 'include' });
      if (!res.ok) throw new Error('Could not load records');
      const data = await res.json();
      setPassports(data.passports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = passports.filter((p) => {
    if (filter === 'anchored') return !!p.txHash;
    if (filter === 'pending') return !p.txHash;
    return true;
  });

  const anchored = passports.filter((p) => !!p.txHash).length;
  const pending = passports.filter((p) => !p.txHash).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-black/30" size={24} />
        <p className="text-xs text-black/40 font-black uppercase tracking-widest">Loading records…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <AlertCircle className="text-black/30" size={24} />
        <p className="text-sm text-black/60">{error}</p>
        <button
          onClick={() => load()}
          className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (passports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Package className="text-black/20" size={32} />
        <div>
          <p className="text-sm font-bold text-[#050505]">No records yet</p>
          <p className="text-xs text-black/50 mt-1 leading-relaxed max-w-[260px] mx-auto">
            Create your first product record from the Create tab. All records registered with your
            wallet will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats band */}
      <div className="rounded-2xl border border-black/8 bg-white p-4 grid grid-cols-3 divide-x divide-black/8">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[22px] font-black tracking-tight text-[#050505]">
            {passports.length}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
            Total
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[22px] font-black tracking-tight text-[#050505]">{anchored}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
            On-chain
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[22px] font-black tracking-tight text-[#050505]">{pending}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
            Pending
          </span>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 flex-1 min-w-[200px]">
          {(['all', 'anchored', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                filter === f
                  ? 'bg-[#050505] text-white'
                  : 'bg-black/5 text-black/50 hover:bg-black/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'anchored' ? 'On-chain' : 'Pending'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#050505] text-white hover:opacity-80 transition-opacity text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
            >
              <Copy size={11} />
              Export CSV
            </button>
          )}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-black/5 text-black/40 hover:text-black/70 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-black/40 text-center py-8">No records match this filter.</p>
        )}
        {filtered.map((p) => {
          const isOpen = expanded === p.slug;
          const passportUrl = passportPublicUrl(p.slug);
          return (
            <div key={p.slug} className="rounded-xl border border-black/10 bg-white overflow-hidden">
              {/* Row header */}
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : p.slug)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
              >
                {/* Status dot */}
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    p.txHash ? 'bg-[#050505]' : 'bg-black/20'
                  }`}
                  title={p.txHash ? 'Confirmed on blockchain' : 'Not yet on blockchain'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#050505] truncate">{p.title}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {p.payload?.batchId && (
                      <span className="text-[10px] text-black/40 font-mono flex items-center gap-1">
                        <Hash size={9} />
                        {p.payload.batchId}
                      </span>
                    )}
                    {p.category && (
                      <span className="text-[10px] text-black/40 flex items-center gap-1">
                        <Tag size={9} />
                        {p.category}
                      </span>
                    )}
                    {p.payload?.origin && (
                      <span className="text-[10px] text-black/40 flex items-center gap-1">
                        <MapPin size={9} />
                        {p.payload.origin}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-black/30 mt-1 flex items-center gap-1">
                    <Clock size={9} />
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-black/30">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-black/8 px-4 pb-4 pt-3 space-y-3">
                  {p.payload?.description && (
                    <p className="text-xs text-black/60 leading-relaxed">{p.payload.description}</p>
                  )}

                  {/* QR mini */}
                  <div className="flex items-center gap-4">
                    <div className="border border-black/8 rounded-lg p-2 bg-white shrink-0">
                      <QRCodeSVG value={passportUrl} size={80} level="M" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                          Public URL
                        </p>
                        <p className="text-[10px] font-mono text-black/60 break-all mt-0.5">
                          {passportUrl}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CopyButton text={passportUrl} />
                        <Link
                          href={`/passport/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
                        >
                          <ExternalLink size={10} />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain status */}
                  {p.txHash ? (
                    <div className="rounded-lg bg-black/[0.03] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={12} className="text-[#050505]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#050505]">
                          On-chain confirmation
                        </p>
                      </div>
                      <a
                        href={`${EXPLORER_BASE}${p.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-black/50 hover:text-black transition-colors flex items-center gap-1 break-all"
                      >
                        {truncate(p.txHash, 32)}
                        <ExternalLink size={9} className="shrink-0" />
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-black/15 p-3">
                      <p className="text-[10px] text-black/40 leading-relaxed">
                        This record has not been confirmed on the blockchain yet. Open it from the
                        Create tab to add on-chain confirmation.
                      </p>
                    </div>
                  )}

                  {/* Events timeline */}
                  {p.events && p.events.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-black/40 mb-2">
                        Event history
                      </p>
                      <div className="space-y-1.5">
                        {p.events.map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-start gap-2 text-[10px] text-black/50"
                          >
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                            <div>
                              <span className="font-bold capitalize text-[#050505]">
                                {ev.eventType.replace(/_/g, ' ')}
                              </span>
                              {ev.payload?.location && ` · ${ev.payload.location}`}
                              {ev.payload?.note && (
                                <span className="text-black/40"> · {ev.payload.note}</span>
                              )}
                              <span className="text-black/30 ml-1">{formatDate(ev.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-black/30 text-center pt-2">
        Showing {filtered.length} of {passports.length} record{passports.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TAB: AZTEC NETWORK EXPLAINER
   Language: plain institutional — no jargon.
───────────────────────────────────────────── */
function AztecTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-[#050505] flex items-center justify-center">
            <ShieldCheck size={13} className="text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/50">
            Integration with Aztec Network
          </p>
        </div>
        <h2 className="text-xl font-black tracking-tight text-[#050505] leading-snug mb-3">
          Why product records need private confirmation
        </h2>
        <p className="text-sm text-black/60 leading-relaxed">
          Standard blockchains publish every record in public. This is a problem for organisations:
          recording where a product comes from also reveals who your suppliers are, how much you
          produce, and when you ship. Aztec Network solves this with a technology called{' '}
          <strong className="text-[#050505]">private proofs</strong> — a mathematical method that
          lets anyone verify a record is real without exposing the sensitive data inside it.
        </p>
      </div>

      {/* How it works — step by step */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
          How it works — step by step
        </p>

        {[
          {
            step: '01',
            title: 'The producer registers a batch',
            body: 'A manufacturer or public agency creates a product record in Studio Provenance. They enter the product name, batch number, origin, and any certification details. This creates a unique record with a scannable QR code.',
          },
          {
            step: '02',
            title: 'The sensitive data is kept private',
            body: "Using Aztec Network, the record is split into two parts: what the public can see (the product name and authenticity status) and what stays private (the exact supplier, the production volume, the internal batch notes). The private part is stored in encrypted form — only the issuing organisation can read it.",
          },
          {
            step: '03',
            title: 'A confirmation is written to the blockchain',
            body: 'A short cryptographic fingerprint of the record is published to the blockchain. This fingerprint proves the record existed at a specific date and has not been modified since. It contains no private data — only a mathematical proof of integrity.',
          },
          {
            step: '04',
            title: 'Anyone can verify — no data is revealed',
            body: 'A consumer, customs officer, or auditor scans the QR code. They receive confirmation that the record is genuine and unmodified. They do not see the private supplier details unless the producer chooses to share them.',
          },
          {
            step: '05',
            title: 'Ownership can transfer privately',
            body: 'When a product changes hands — from factory to distributor, from distributor to retailer — the record can be transferred on the blockchain without revealing the transaction price or the identities of the parties involved.',
          },
        ].map(({ step, title, body }) => (
          <div key={step} className="flex gap-4">
            <span className="text-[11px] font-black font-mono text-black/20 shrink-0 pt-0.5 w-6">
              {step}
            </span>
            <div>
              <p className="text-sm font-bold text-[#050505] mb-1">{title}</p>
              <p className="text-xs text-black/55 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Use cases for public institutions */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
          Practical applications for public institutions
        </p>

        {[
          {
            icon: '🏥',
            title: 'Medicine supply chains',
            body: 'Health authorities can verify that a batch of medication comes from a licensed manufacturer and has not been tampered with, without revealing the purchasing terms or the distribution network.',
          },
          {
            icon: '🌾',
            title: 'Agricultural certification',
            body: 'A government agency certifies that produce meets organic or fair-trade standards. The certification is publicly verifiable on the blockchain. The farmer\'s identity and volume of production remain confidential.',
          },
          {
            icon: '🏗️',
            title: 'Public procurement',
            body: 'Construction materials used in public infrastructure can be tracked from manufacturer to site. Auditors confirm compliance without access to commercial pricing data.',
          },
          {
            icon: '🛃',
            title: 'Customs and border control',
            body: 'Importers provide a QR code to customs officers. Officers verify the product origin and batch legitimacy on the blockchain in seconds, reducing manual paperwork.',
          },
          {
            icon: '♻️',
            title: 'Environmental compliance',
            body: 'Companies prove they meet recycling or emissions targets using verifiable records. Regulators confirm compliance without requiring full access to internal production data.',
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <span className="text-base shrink-0">{icon}</span>
            <div>
              <p className="text-sm font-bold text-[#050505] mb-0.5">{title}</p>
              <p className="text-xs text-black/55 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What Studio Provenance adds to Aztec */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
          What Studio Provenance brings to Aztec Network
        </p>
        <p className="text-sm text-black/60 leading-relaxed">
          Aztec Network provides the underlying privacy technology. Studio Provenance provides the
          interface and the workflow that makes that technology accessible to non-technical users —
          public bodies, manufacturers, certification agencies, and inspectors — without requiring
          any knowledge of how the technology works.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['No code required', 'Create verifiable records through a standard web form.'],
            ['Printable labels', 'Generate QR codes ready for product packaging.'],
            ['Full audit trail', 'Every event in a product\'s life is recorded.'],
            ['Institutional grade', 'Designed for public bodies and regulated industries.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-black/8 p-3">
              <p className="text-xs font-bold text-[#050505] mb-1">{title}</p>
              <p className="text-[10px] text-black/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link to Aztec */}
      <div className="rounded-2xl border border-black/8 bg-black/[0.02] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#050505]">Learn about Aztec Network</p>
          <p className="text-[11px] text-black/50 mt-0.5">
            The privacy layer this platform is built on.
          </p>
        </div>
        <a
          href="https://aztec.network"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#050505] hover:opacity-60 transition-opacity"
        >
          aztec.network
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export function ProvenanceStudioContent({
  variant = 'desktop',
}: {
  variant?: 'mobile' | 'desktop';
}) {
  const router = useRouter();
  const isMobile = variant === 'mobile';
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [registryRefreshKey, setRegistryRefreshKey] = useState(0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'create', label: 'Create', icon: <Plus size={13} /> },
    { id: 'registry', label: 'All Records', icon: <LayoutList size={13} /> },
    { id: 'aztec', label: 'Aztec Network', icon: <ShieldCheck size={13} /> },
  ];

  const handleCreated = (passport: ProductPassportPublic) => {
    // After creation, bump the refresh key so the registry reloads when user switches to it
    setRegistryRefreshKey((k) => k + 1);
    // Stay on create tab to show the QR — user can navigate to registry manually
    void passport;
  };

  return (
    <div
      className={`min-h-[100dvh] bg-[#FFFFFF] text-[#050505] ${
        isMobile ? 'pb-[calc(2rem+env(safe-area-inset-bottom))]' : ''
      }`}
    >
      {/* Mobile back header */}
      {isMobile && (
        <header className="sticky top-0 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-black/8 px-5 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => router.push('/connect')}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </header>
      )}

      <div className={`max-w-2xl mx-auto px-5 ${isMobile ? 'py-6' : 'px-6 py-12'}`}>
        {/* Page header */}
        {!isMobile && (
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30 mb-2">
            Studio
          </p>
        )}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h1
            className={`font-black tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}
          >
            Provenance Studio
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-black/5 text-black/50">
            Beta
          </span>
        </div>
        <p className="text-sm text-black/50 mb-8 leading-relaxed">
          Create verifiable product records, generate scannable QR labels, and confirm them on the
          public ledger.
        </p>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 rounded-xl border border-black/8 bg-black/[0.02] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-[#050505] text-white shadow-sm'
                  : 'text-black/40 hover:text-black/70'
              }`}
            >
              {tab.icon}
              <span className={isMobile ? 'hidden xs:inline' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'create' && (
          <CreateTab isMobile={isMobile} onCreated={handleCreated} />
        )}
        {activeTab === 'registry' && (
          <RegistryTab isMobile={isMobile} refreshKey={registryRefreshKey} />
        )}
        {activeTab === 'aztec' && <AztecTab />}
      </div>
    </div>
  );
}
