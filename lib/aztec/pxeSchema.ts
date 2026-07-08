// @ts-nocheck
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
  getNodeInfo:            z.function().args().returns(z.any()),
  getBlockNumber:         z.function().args().returns(z.any()),
  getProvenBlockNumber:   z.function().args().returns(z.any()),
  getL1ContractAddresses: z.function().args().returns(z.any()),
  getRegisteredAccounts:  z.function().args().returns(z.array(z.any())),
  registerAccount:        z.function().args(z.any(), z.any()).returns(z.any()),
  addAuthWitness:         z.function().args(z.any()).returns(z.void()),
  simulateTx:             z.function().args(z.any(), z.any()).returns(z.any()),
  sendTx:                 z.function().args(z.any()).returns(z.any()),
  getTxReceipt:           z.function().args(z.any()).returns(z.any()),
  getPublicStorageAt:     z.function().args(z.any(), z.any()).returns(z.any()),
  addNote:                z.function().args(z.any()).returns(z.void()),
  getNotes:               z.function().args(z.any()).returns(z.array(z.any())),
  getContractInstance:    z.function().args(z.any()).returns(z.any()),
  getContractArtifact:    z.function().args(z.any()).returns(z.any()),
  getOutgoingNotes:       z.function().args(z.any()).returns(z.array(z.any())),
  syncProofVerificationEvents: z.function().args(z.any()).returns(z.any()),
};
