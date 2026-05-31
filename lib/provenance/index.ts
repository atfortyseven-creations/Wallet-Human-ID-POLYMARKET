/**
 * lib/provenance/index.ts
 *
 * Central export point for all provenance-related utilities.
 * Import from here rather than from individual files to keep
 * import paths stable as the module grows.
 */

export {
  // Hash helpers
  hashSlug,
  hashBatchId,
  hashSupplierId,
  hashMetadata,
  // Calldata builders
  buildRegisterProductArgs,
  buildVerifyProductArgs,
  buildRevokeProductArgs,
  buildProveBatchOwnershipArgs,
  buildTransferBatchArgs,
  buildUpdateMetadataArgs,
  // Verification
  interpretVerificationResult,
  // Metadata builder
  buildProvenanceMetadata,
} from './aztec-client';

export type {
  RegisterProductArgs,
  VerificationResult,
  ProvenanceMetadata,
} from './aztec-client';
