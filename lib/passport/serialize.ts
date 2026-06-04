import type { ProductPassport, ProvenanceEvent } from '@prisma/client';
import type { PassportEventPayload, PassportPayload, ProductPassportPublic } from './types';

export function serializePassport(
  passport: ProductPassport & { events?: ProvenanceEvent[] }
): ProductPassportPublic {
  return {
    slug: passport.publicSlug,
    title: passport.title,
    category: passport.category,
    issuerAddress: passport.issuerAddress,
    payload: (passport.payload || {}) as PassportPayload,
    coreEntropy: passport.coreEntropy,
    txHash: passport.txHash,
    chainId: passport.chainId,
    gs1Gtin: passport.gs1Gtin,
    createdAt: passport.createdAt.toISOString(),
    events: (passport.events || []).map((e) => ({
      id: e.id,
      eventType: e.eventType,
      payload: (e.payload || {}) as PassportEventPayload,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `passport-${suffix}`;
}
