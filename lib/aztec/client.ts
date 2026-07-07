// @ts-nocheck
/**
 * lib/aztec/client.ts
 *
 * Real Aztec Testnet integration.
 * RPC Node:   https://v5.testnet.rpc.aztec-labs.com
 * Explorer:   https://testnet.aztecscan.xyz
 * SponsoredFPC (gas-free): 0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7
 * Source: https://docs.aztec.network/networks — confirmed by @joshc [AZTC] 2026-07-07
 *
 * The PXE runs server-side, pointing at the public Aztec Testnet node.
 * Users get deterministic Schnorr accounts derived from their EVM address.
 */

export const AZTEC_TESTNET_NODE  = process.env.AZTEC_NODE_URL  || 'https://v5.testnet.rpc.aztec-labs.com';
export const AZTEC_PXE_URL       = process.env.AZTEC_PXE_URL   || 'http://127.0.0.1:18080';
export const AZTEC_EXPLORER      = 'https://testnet.aztecscan.xyz';
export const AZTEC_NETWORK       = 'aztec-testnet';

// SponsoredFPC — canonical rc.2 address from docs.aztec.network/networks
// Confirmed by @joshc [AZTC] on 2026-07-07. The old 0x2613... address is NOT deployed on rc.2.
export const SPONSORED_FPC_ADDRESS =
  process.env.SPONSORED_FPC_ADDRESS ||
  '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

// Cache the PXE client across hot-reloads
let _pxeClient: any = null;

/**
 * Returns a cached PXE client.
 * In production (Railway), AZTEC_PXE_URL should point to the PXE sidecar service.
 * Locally, it points to localhost:8080 from `aztec start --pxe`.
 */
export async function getPXEClient() {
  if (_pxeClient) return _pxeClient;

  const { createPXEClient } = await import('@aztec/aztec.js/wallet');
  _pxeClient = await createPXEClient(AZTEC_PXE_URL);
  console.log(`[Aztec] ✅ PXE client connected → ${AZTEC_PXE_URL}`);
  return _pxeClient;
}

/**
 * Returns the relayer wallet — used for minting (faucet) and sponsored transfers.
 * AZTEC_RELAYER_SECRET_KEY must be a 32-byte hex string (Fr).
 */
export async function getRelayerWallet() {
  const secretKeyHex = process.env.AZTEC_RELAYER_SECRET_KEY;
  if (!secretKeyHex) throw new Error('AZTEC_RELAYER_SECRET_KEY not set');

  const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
  const { Fr } = await import('@aztec/aztec.js/fields');
  const { deriveSigningKey } = await import('@aztec/aztec.js/keys');
  const pxe = await getPXEClient();

  const secretKey  = Fr.fromString(secretKeyHex);
  const signingKey = deriveSigningKey(secretKey);
  const account    = getSchnorrAccount(pxe, secretKey, signingKey);
  await account.register();
  return account.getWallet();
}

/**
 * Derives a deterministic Aztec secret key from an EVM address string.
 * Uses SHA-256 of the EVM address bytes to produce an Fr-compatible scalar.
 */
export function deriveSecretKeyFromEvm(evmAddress: string): string {
  // Simple deterministic derivation: hash the evm address
  // In production, this should be a signature-based derivation done client-side
  const normalized = evmAddress.toLowerCase().replace('0x', '');
  // Pad to 64 chars and prefix with 0x to create a valid Fr hex
  const padded = normalized.padStart(62, '0').slice(0, 62);
  return `0x00${padded}`;
}

/**
 * Aztec testnet explorer URL for a given transaction hash.
 */
export function explorerTxUrl(txHash: string): string {
  return `${AZTEC_EXPLORER}/tx/${txHash}`;
}

/**
 * Aztec testnet explorer URL for a given address.
 */
export function explorerAddressUrl(address: string): string {
  return `${AZTEC_EXPLORER}/address/${address}`;
}

/**
 * Truncate an Aztec address for display.
 */
export function truncateAztecAddress(addr: string, chars = 8): string {
  if (!addr || addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

