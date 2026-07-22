/**
 * lib/aztec/account.ts
 * 
 * Aztec account creation helper — uses dynamic imports to avoid bundling
 * the Aztec SDK at build time (native C++ binaries only run in Linux/Railway).
 */
import { deriveSecretKeyFromEvm, PRIMARY_FPC_ADDRESS } from './client';

export async function createAndRegisterAztecAccount(evmAddress: string, pxe: any) {
  // Dynamic imports — Aztec SDK uses native binaries only available in Linux (Railway)
  const { getSchnorrAccount, AztecAddress, Fr, NativeFeePaymentMethod } = await import('@aztec/aztec.js/node');

  const secretKeyHex = deriveSecretKeyFromEvm(evmAddress);
  const secretKey = Fr.fromString(secretKeyHex);
  
  const fpcAddress = AztecAddress.fromString(PRIMARY_FPC_ADDRESS);
  const feePaymentMethod = new NativeFeePaymentMethod(fpcAddress);

  const account = getSchnorrAccount(pxe, secretKey, secretKey, 1);
  
  // Register the account in the local PXE (does not deploy if already deployed)
  const wallet = await account.getWallet();
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
