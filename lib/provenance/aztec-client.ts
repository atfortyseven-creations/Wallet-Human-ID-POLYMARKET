/**
 * lib/provenance/aztec-client.ts
 *
 * Helper functions for integrating Studio Provenance with Aztec Network.
 *
 * This module provides:
 *   1. Hash helpers — convert human-readable identifiers (slug, batch ID,
 *      supplier name) into the Field values that the Noir contract expects.
 *   2. Calldata builders — assemble the arguments for each contract function.
 *   3. Verification helpers — interpret the contract's return values.
 *
 * These functions are environment-agnostic: they can be called from a Next.js
 * API route (server side) or from a browser component (client side).
 * They do NOT import Aztec SDK dependencies directly so they remain compatible
 * with environments where the Aztec SDK is not yet installed.
 *
 * When the Aztec SDK is available, pass an AztecAddress and a PXE (Private
 * eXecution Environment) instance to the functions that need them.
 */

import { keccak256, toBytes } from 'viem';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */

/** Maximum byte length of a batch ID string. Longer strings are truncated. */
const MAX_BATCH_ID_BYTES = 64;

/** Maximum byte length of a supplier identifier string. */
const MAX_SUPPLIER_BYTES = 64;

/** Maximum byte length for a metadata JSON string hashed for the private note. */
const MAX_METADATA_BYTES = 256;

/* ─────────────────────────────────────────────────────────────────────────────
   HASH HELPERS
   Convert human-readable strings into 256-bit field elements (hex strings).
   The Noir contract stores and compares these hashes, never the raw strings.
───────────────────────────────────────────────────────────────────────────── */

/**
 * Convert a product slug into a 256-bit hex string suitable for the Noir
 * contract's `slug_hash` field.
 *
 * @param slug  The public slug, e.g. "organic-cotton-tote-abc123"
 * @returns     A 0x-prefixed 64-character hex string
 */
export function hashSlug(slug: string): `0x${string}` {
  return keccak256(toBytes(slug.trim().toLowerCase()));
}

/**
 * Convert a batch ID string into a 256-bit hex field element.
 *
 * @param batchId  The batch identifier, e.g. "LOT-2024-0891"
 * @returns        A 0x-prefixed 64-character hex string
 */
export function hashBatchId(batchId: string): `0x${string}` {
  const trimmed = batchId.trim().slice(0, MAX_BATCH_ID_BYTES);
  return keccak256(toBytes(trimmed));
}

/**
 * Convert a supplier identifier into a 256-bit hex field element.
 * The supplier identifier can be a name, a registration number, or any stable
 * string that uniquely identifies the supplier within the issuer's system.
 *
 * @param supplierId  Supplier's canonical identifier
 * @returns           A 0x-prefixed 64-character hex string
 */
export function hashSupplierId(supplierId: string): `0x${string}` {
  const trimmed = supplierId.trim().slice(0, MAX_SUPPLIER_BYTES);
  return keccak256(toBytes(trimmed));
}

/**
 * Hash the full off-chain metadata object into a 256-bit field element.
 * The hash serves as a tamper-evident fingerprint: if any field in the metadata
 * changes, the hash changes, and the proof of ownership no longer matches.
 *
 * @param metadata  The full product metadata object (will be JSON-stringified)
 * @returns         A 0x-prefixed 64-character hex string
 */
export function hashMetadata(metadata: Record<string, unknown>): `0x${string}` {
  const json = JSON.stringify(metadata, Object.keys(metadata).sort()).slice(0, MAX_METADATA_BYTES);
  return keccak256(toBytes(json));
}

/* ─────────────────────────────────────────────────────────────────────────────
   CALLDATA BUILDERS
   Produce the argument arrays for each Noir contract function.
   The caller supplies these arrays to their Aztec SDK instance.
───────────────────────────────────────────────────────────────────────────── */

/**
 * Arguments for ProvenanceRegistry.register_product()
 *
 * Call this to register a new product. The function is private: the
 * batch_id_hash, supplier_hash, and metadata_hash stay encrypted on-chain.
 * Only slug_hash and the issuer address appear in the public state.
 */
export interface RegisterProductArgs {
  slug_hash: `0x${string}`;
  batch_id_hash: `0x${string}`;
  supplier_hash: `0x${string}`;
  metadata_hash: `0x${string}`;
}

export function buildRegisterProductArgs(params: {
  slug: string;
  batchId: string;
  supplierId: string;
  metadata: Record<string, unknown>;
}): RegisterProductArgs {
  return {
    slug_hash: hashSlug(params.slug),
    batch_id_hash: hashBatchId(params.batchId),
    supplier_hash: hashSupplierId(params.supplierId),
    metadata_hash: hashMetadata(params.metadata),
  };
}

/**
 * Arguments for ProvenanceRegistry.verify_product() (public, read-only)
 *
 * Returns true if the product exists in the public record and has not been
 * revoked. Safe to call from any context — does not access private state.
 */
export function buildVerifyProductArgs(slug: string): { slug_hash: `0x${string}` } {
  return { slug_hash: hashSlug(slug) };
}

/**
 * Arguments for ProvenanceRegistry.revoke_product() (public)
 *
 * Only the original issuer address can call this. Marks the product as revoked
 * in the public state. Revocation is permanent and visible to all verifiers.
 */
export function buildRevokeProductArgs(slug: string): { slug_hash: `0x${string}` } {
  return { slug_hash: hashSlug(slug) };
}

/**
 * Arguments for ProvenanceRegistry.prove_batch_ownership() (private)
 *
 * Generates a zero-knowledge proof that the caller holds a private batch note
 * matching the given batch ID for the specified product. The actual batch ID
 * is never revealed — only the claim that the note exists.
 */
export function buildProveBatchOwnershipArgs(params: {
  slug: string;
  batchId: string;
}): { slug_hash: `0x${string}`; claimed_batch_id_hash: `0x${string}` } {
  return {
    slug_hash: hashSlug(params.slug),
    claimed_batch_id_hash: hashBatchId(params.batchId),
  };
}

/**
 * Arguments for ProvenanceRegistry.transfer_batch() (private)
 *
 * Transfers the private batch note from the current owner to a new owner.
 * The transfer is invisible in the public state — no transaction amount or
 * participant identity is published.
 */
export function buildTransferBatchArgs(params: {
  batchId: string;
  newOwnerAddress: string;
}): { claimed_batch_id_hash: `0x${string}`; new_owner: string } {
  return {
    claimed_batch_id_hash: hashBatchId(params.batchId),
    new_owner: params.newOwnerAddress,
  };
}

/**
 * Arguments for ProvenanceRegistry.update_batch_metadata() (private)
 *
 * Updates the metadata hash stored in the issuer's private note.
 * Use when a product gains a new certification or its data changes.
 * The old note is consumed; a new note with the updated hash is created.
 */
export function buildUpdateMetadataArgs(params: {
  batchId: string;
  newMetadata: Record<string, unknown>;
}): { claimed_batch_id_hash: `0x${string}`; new_metadata_hash: `0x${string}` } {
  return {
    claimed_batch_id_hash: hashBatchId(params.batchId),
    new_metadata_hash: hashMetadata(params.newMetadata),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   VERIFICATION HELPERS
   Interpret the results returned from on-chain calls.
───────────────────────────────────────────────────────────────────────────── */

export interface VerificationResult {
  /** Whether the record exists and has not been revoked. */
  isValid: boolean;
  /** Human-readable status message for display in the UI. */
  status: 'valid' | 'revoked' | 'not_found';
  /** A single-sentence explanation for non-technical users. */
  message: string;
}

/**
 * Convert the boolean returned by verify_product() into a structured result.
 *
 * @param onChainResult  The boolean returned by the Aztec contract call.
 * @param slugExists     Whether the slug was found at all in the public record.
 *                       Pass false if the contract returned a zero-address issuer.
 */
export function interpretVerificationResult(
  onChainResult: boolean,
  slugExists: boolean
): VerificationResult {
  if (!slugExists) {
    return {
      isValid: false,
      status: 'not_found',
      message: 'This product has not been registered in the provenance system.',
    };
  }
  if (!onChainResult) {
    return {
      isValid: false,
      status: 'revoked',
      message:
        'This product record has been revoked by the issuing organisation. Do not accept it as authentic.',
    };
  }
  return {
    isValid: true,
    status: 'valid',
    message: 'This product record is genuine and has not been modified or revoked.',
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   METADATA BUILDER
   Produces a standardised metadata object for a product passport.
   This object is what gets hashed and stored in the private note.
───────────────────────────────────────────────────────────────────────────── */

export interface ProvenanceMetadata {
  /** The product's public slug — stable, URL-safe identifier. */
  slug: string;
  /** Human-readable product title. */
  title: string;
  /** Product category (e.g. "textile", "food", "electronics"). */
  category?: string;
  /** Country or region of manufacture. */
  origin?: string;
  /** Batch production identifier. */
  batchId?: string;
  /** Optional GS1 GTIN barcode number. */
  gs1Gtin?: string;
  /** Free-text description visible in the private note. */
  description?: string;
  /** ISO 8601 creation timestamp. Set server-side at registration. */
  registeredAt: string;
  /** Name of the issuing organisation (not published in public state). */
  issuerName?: string;
  /** List of certification labels (e.g. ["Organic", "Fair Trade"]). */
  certifications?: string[];
}

/**
 * Build a standardised metadata object ready to be passed to hashMetadata().
 * Omits undefined fields to keep the hash deterministic across environments.
 */
export function buildProvenanceMetadata(
  params: Omit<ProvenanceMetadata, 'registeredAt'> & { registeredAt?: string }
): ProvenanceMetadata {
  const meta: ProvenanceMetadata = {
    slug: params.slug,
    title: params.title,
    registeredAt: params.registeredAt ?? new Date().toISOString(),
  };

  if (params.category) meta.category = params.category;
  if (params.origin) meta.origin = params.origin;
  if (params.batchId) meta.batchId = params.batchId;
  if (params.gs1Gtin) meta.gs1Gtin = params.gs1Gtin;
  if (params.description) meta.description = params.description;
  if (params.issuerName) meta.issuerName = params.issuerName;
  if (params.certifications?.length) meta.certifications = params.certifications;

  return meta;
}
