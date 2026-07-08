import { z } from 'zod';

/**
 * Minimal mock PXE schema — pure Zod definitions, no @aztec SDK imports.
 * Using z.any() for Aztec-specific types to avoid Webpack bundling issues
 * with the ESM-only @aztec packages.
 *
 * At runtime, the server loads @aztec packages natively via Node.js
 * (they are in serverExternalPackages in next.config.js).
 */

export const mockPXESchema = {
  getNodeInfo:            z.function().parameters().returns(z.any()),
  getBlockNumber:         z.function().parameters().returns(z.any()),
  getProvenBlockNumber:   z.function().parameters().returns(z.any()),
  getL1ContractAddresses: z.function().parameters().returns(z.any()),
  getRegisteredAccounts:  z.function().parameters().returns(z.array(z.any())),
  registerAccount:        z.function().parameters(z.any(), z.any()).returns(z.any()),
  addAuthWitness:         z.function().parameters(z.any()).returns(z.void()),
  simulateTx:             z.function().parameters(z.any(), z.any()).returns(z.any()),
  sendTx:                 z.function().parameters(z.any()).returns(z.any()),
  getTxReceipt:           z.function().parameters(z.any()).returns(z.any()),
  getPublicStorageAt:     z.function().parameters(z.any(), z.any()).returns(z.any()),
  addNote:                z.function().parameters(z.any()).returns(z.void()),
  getNotes:               z.function().parameters(z.any()).returns(z.array(z.any())),
  getContractInstance:    z.function().parameters(z.any()).returns(z.any()),
  getContractArtifact:    z.function().parameters(z.any()).returns(z.any()),
  getOutgoingNotes:       z.function().parameters(z.any()).returns(z.array(z.any())),
  syncProofVerificationEvents: z.function().parameters(z.any()).returns(z.any()),
};
