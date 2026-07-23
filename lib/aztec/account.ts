/**
 * lib/aztec/account.ts
 * 
 * Aztec account creation helper — uses dynamic imports to avoid bundling
 * the Aztec SDK at build time (native C++ binaries only run in Linux/Railway).
 *
 * Correct import paths for @aztec v5:
 *   - getSchnorrAccountContractAddress → @aztec/accounts/schnorr
 *   - SchnorrAccountContract           → @aztec/accounts/schnorr
 *   - AztecAddress, Fr                 → @aztec/aztec.js
 *   - SponsoredFeePaymentMethod        → @aztec/aztec.js/fee
 *
 * NOTE: This file is ONLY ever executed server-side on Railway (Linux).
 * The PXE parameter is injected by the caller from the node environment.
 */
import { deriveSecretKeyFromEvm, PRIMARY_FPC_ADDRESS } from './client';

export async function createAndRegisterAztecAccount(evmAddress: string, pxe: any) {
  // Dynamic imports — Aztec SDK native binaries only available in Linux (Railway)
  const aztecJs         = await import('@aztec/aztec.js');
  const feeModule       = await import('@aztec/aztec.js/fee');
  const schnorrModule   = await import('@aztec/accounts/schnorr');

  // Pull the correct named exports using the actual API surface discovered from
  // installed package types. `NativeFeePaymentMethod` does not exist in v5 —
  // we use `SponsoredFeePaymentMethod` (the Aztec Labs FPC).
  // We use `any` casts for pxe/wallet since we're in a pure-server dynamic context.
  const { AztecAddress, Fr }       = aztecJs as any;
  const { SponsoredFeePaymentMethod } = feeModule as any;
  // getSchnorrAccount is the correct public factory in @aztec/accounts/schnorr
  const { getSchnorrAccount }      = schnorrModule as any;

  const secretKeyHex = deriveSecretKeyFromEvm(evmAddress);
  const secretKey    = Fr.fromString(secretKeyHex);

  const fpcAddress       = AztecAddress.fromString(PRIMARY_FPC_ADDRESS);
  const feePaymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

  const account = getSchnorrAccount(pxe, secretKey, secretKey, 1);

  // Register the account in the local PXE (does not deploy if already deployed)
  const wallet  = await account.getWallet();
  const address = wallet.getAddress();

  const isDeployed = await pxe.getContractInstance(address).catch(() => null);

  if (!isDeployed) {
    console.log(`[Aztec] Deploying account ${address.toString()}...`);
    await account.deploy().send({ fee: { paymentMethod: feePaymentMethod } }).wait();
    console.log(`[Aztec] Account deployed successfully.`);
  } else {
    console.log(`[Aztec] Account ${address.toString()} already deployed.`);
  }

  return wallet;
}
