'use client';

import Link from 'next/link';
import {
  ExternalLink,
  Package,
  Leaf,
  MapPin,
  ShieldCheck,
  Hash,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Fingerprint,
  Globe,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { passportPublicUrl } from '@/lib/scan/parseScanPayload';
import type { ProductPassportPublic } from '@/lib/passport/types';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const CHAIN_EXPLORERS: Record<number, { name: string; base: string }> = {
  1:    { name: 'Etherscan',    base: 'https://etherscan.io/tx/' },
  8453: { name: 'Basescan',    base: 'https://basescan.org/tx/' },
  137:  { name: 'Polygonscan', base: 'https://polygonscan.com/tx/' },
  11155111: { name: 'Sepolia', base: 'https://sepolia.etherscan.io/tx/' },
};

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
function explorerUrl(chainId: number | null, txHash: string | null): string | null {
  if (!txHash || !chainId) return null;
  const explorer = CHAIN_EXPLORERS[chainId];
  return explorer ? `${explorer.base}${txHash}` : null;
}

function explorerName(chainId: number | null): string {
  if (!chainId) return 'blockchain explorer';
  return CHAIN_EXPLORERS[chainId]?.name ?? 'explorer';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatEventType(eventType: string): string {
  const labels: Record<string, string> = {
    manufactured:       'Manufactured',
    shipped:            'Shipped',
    received:           'Received',
    inspected:          'Inspected',
    certified:          'Certified',
    on_chain_confirmed: 'Confirmed on blockchain',
    revoked:            'Revoked',
    note:               'Note added',
  };
  return labels[eventType] ?? eventType.replace(/_/g, ' ');
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

/** Detail row inside a card */
function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-black/25 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/35 mb-0.5">
          {label}
        </p>
        <p className={`text-sm text-[#050505] break-words ${mono ? 'font-mono text-xs' : 'font-medium'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/** Section wrapper */
function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/8 bg-white overflow-hidden">
      {title && (
        <div className="px-5 py-3.5 border-b border-black/6">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/35">{title}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export function PassportView({ passport }: { passport: ProductPassportPublic }) {
  const p = passport.payload;
  const txUrl = explorerUrl(passport.chainId, passport.txHash);
  const passportUrl = passportPublicUrl(passport.slug);
  const isAnchored = !!passport.txHash;

  // Separate on_chain_confirmed events from other events for the timeline
  const timelineEvents = passport.events.filter(
    (ev) => ev.eventType !== 'on_chain_confirmed'
  );
  const anchorEvent = passport.events.find(
    (ev) => ev.eventType === 'on_chain_confirmed'
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] text-[#050505]">

      {/* ── Verification banner ── */}
      <div
        className={`w-full px-5 py-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest ${
          isAnchored
            ? 'bg-[#050505] text-white'
            : 'bg-black/5 text-black/60'
        }`}
      >
        {isAnchored ? (
          <>
            <ShieldCheck size={14} />
            Verified on blockchain
          </>
        ) : (
          <>
            <AlertCircle size={13} />
            Public record · Not yet on blockchain
          </>
        )}
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-black/8 px-5 pt-6 pb-8">
        <div className="max-w-lg mx-auto text-center space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/35">
            Product record · Studio Provenance
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#050505] leading-tight">
            {passport.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {passport.category && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/6 text-black/60 border border-black/8">
                <Tag size={9} />
                {passport.category}
              </span>
            )}
            {p?.batchId && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/6 text-black/60 border border-black/8 font-mono">
                <Hash size={9} />
                {p.batchId}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/6 text-black/60 border border-black/8">
              <Clock size={9} />
              {formatDate(passport.createdAt)}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-lg mx-auto px-5 py-6 space-y-4">

        {/* Description */}
        {p?.description && (
          <Card title="About this product">
            <p className="text-sm text-black/70 leading-relaxed">{p.description}</p>
          </Card>
        )}

        {/* Details */}
        {(p?.origin || p?.batchId || p?.carbonKg != null || passport.gs1Gtin) && (
          <Card title="Product details">
            <div className="space-y-4">
              {p?.origin && (
                <DetailRow icon={<MapPin size={15} />} label="Country or region of origin" value={p.origin} />
              )}
              {p?.batchId && (
                <DetailRow icon={<Package size={15} />} label="Batch identifier" value={p.batchId} mono />
              )}
              {typeof p?.carbonKg === 'number' && (
                <DetailRow
                  icon={<Leaf size={15} />}
                  label="Reported carbon footprint"
                  value={`${p.carbonKg} kg CO₂e`}
                />
              )}
              {passport.gs1Gtin && (
                <DetailRow
                  icon={<QrCode size={15} />}
                  label="GS1 barcode number"
                  value={passport.gs1Gtin}
                  mono
                />
              )}
            </div>
          </Card>
        )}

        {/* Certifications */}
        {p?.certifications && p.certifications.length > 0 && (
          <Card title="Certifications">
            <ul className="flex flex-wrap gap-2">
              {p.certifications.map((cert) => (
                <li
                  key={cert}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-black/5 text-black/70 border border-black/10"
                >
                  <CheckCircle2 size={10} className="text-[#050505]" />
                  {cert}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Event timeline */}
        {timelineEvents.length > 0 && (
          <Card title="Product history">
            <ol className="space-y-0">
              {timelineEvents.map((ev, i) => (
                <li key={ev.id} className="relative flex gap-3">
                  {/* Vertical connector line */}
                  {i < timelineEvents.length - 1 && (
                    <div className="absolute left-[7px] top-5 w-px bottom-0 bg-black/10" />
                  )}
                  {/* Dot */}
                  <div
                    className={`mt-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 z-10 ${
                      ev.eventType === 'revoked'
                        ? 'border-black/50 bg-black/20'
                        : 'border-[#050505] bg-white'
                    }`}
                  />
                  <div className="pb-5 min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                      {formatDatetime(ev.createdAt)}
                    </p>
                    <p className="text-sm font-bold text-[#050505] mt-0.5">
                      {formatEventType(ev.eventType)}
                    </p>
                    {ev.payload?.location && (
                      <p className="text-xs text-black/60 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {String(ev.payload.location)}
                      </p>
                    )}
                    {ev.payload?.note && (
                      <p className="text-xs text-black/50 mt-0.5 leading-relaxed">
                        {String(ev.payload.note)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Blockchain proof section */}
        <Card title="Blockchain record">
          {isAnchored ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#050505] text-white">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold mb-0.5">Record confirmed on blockchain</p>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    A permanent, tamper-proof reference to this record exists on the public ledger.
                    The information shown here matches what was registered. Any modification would
                    invalidate this confirmation.
                  </p>
                </div>
              </div>

              {/* Anchor event from timeline */}
              {anchorEvent?.payload?.confirmedAt && (
                <DetailRow
                  icon={<Clock size={15} />}
                  label="Confirmed on"
                  value={formatDatetime(String(anchorEvent.payload.confirmedAt))}
                />
              )}

              {/* Issuer */}
              {passport.issuerAddress && (
                <DetailRow
                  icon={<Fingerprint size={15} />}
                  label="Issuing organisation address"
                  value={passport.issuerAddress}
                  mono
                />
              )}

              {/* Entropy receipt */}
              {passport.coreEntropy && (
                <DetailRow
                  icon={<Hash size={15} />}
                  label="Record fingerprint"
                  value={passport.coreEntropy}
                  mono
                />
              )}

              {/* Transaction link */}
              {txUrl && (
                <div className="pt-1">
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#050505] border border-black/15 rounded-xl px-4 py-2.5 hover:border-black/30 transition-colors"
                  >
                    View on {explorerName(passport.chainId)}
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-black/30 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#050505]">
                    No blockchain confirmation yet
                  </p>
                  <p className="text-xs text-black/55 mt-1 leading-relaxed">
                    This record exists in the Studio Provenance database but has not been
                    confirmed on the public blockchain. The issuing organisation can add
                    blockchain confirmation from the Studio.
                  </p>
                </div>
              </div>
              {passport.issuerAddress && (
                <DetailRow
                  icon={<Fingerprint size={15} />}
                  label="Issuing organisation address"
                  value={passport.issuerAddress}
                  mono
                />
              )}
            </div>
          )}
        </Card>

        {/* QR Code for re-sharing */}
        <Card title="Share this record">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="border border-black/8 rounded-xl p-2.5 bg-white shrink-0">
              <QRCodeSVG value={passportUrl} size={120} level="M" />
            </div>
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <p className="text-xs text-black/55 leading-relaxed">
                Anyone who scans this code will see this public record. Print it on packaging,
                labels, or documents.
              </p>
              <p className="text-[10px] font-mono text-black/40 break-all">{passportUrl}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Link
                  href="/studio/provenance/registry"
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
                >
                  <Globe size={10} />
                  All records
                </Link>
                <Link
                  href="/studio/provenance/aztec"
                  className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black/70 transition-colors"
                >
                  How this works
                  <ArrowUpRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Aztec footer attribution */}
        <div className="rounded-2xl border border-black/6 bg-white p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/35 mb-0.5">
              Powered by
            </p>
            <p className="text-xs font-bold text-[#050505]">Studio Provenance · Aztec Network</p>
            <p className="text-[10px] text-black/40 mt-0.5 leading-relaxed">
              Public verification. Private data.
            </p>
          </div>
          <a
            href="https://aztec.network"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-black/60 transition-colors flex items-center gap-1"
          >
            aztec.network
            <ExternalLink size={9} />
          </a>
        </div>

        {/* Legal */}
        <p className="text-center text-[10px] text-black/30 pb-2">
          <Link href="/privacy#product-scan" className="underline underline-offset-2 hover:text-black/50">
            Privacy — how scanning works
          </Link>
        </p>
      </main>
    </div>
  );
}
