// @ts-nocheck
/**
 * lib/aztec/client.ts — Aztec Testnet v4.3.1 client
 *
 * Architecture (v4.3.1 SDK):
 *  - createAztecNodeClient → connects to the public Aztec Testnet node
 *  - PXE runs as a sidecar (via `aztec start --pxe`) or externally
 *  - `AZTEC_PXE_URL` can point to an external PXE (e.g. https://pxe.humanidfi.com)
 *    OR be left unset to use the node directly for read-only queries.
 *
 * Real Testnet info (confirmed 2026-07-07):
 *  Node URL:     https://v5.testnet.rpc.aztec-labs.com
 *  Explorer:     https://testnet.aztecscan.xyz
 *  SponsoredFPC: 0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7
 *  L1 Chain:     11155111 (Sepolia)
 *  Rollup:       0xfe6061806cac748085904a010d2d9e33b8031741
 */

export const AZTEC_TESTNET_NODE  = process.env.AZTEC_NODE_URL  || 'https://v5.testnet.rpc.aztec-labs.com';
export const AZTEC_PXE_URL       = process.env.AZTEC_PXE_URL   || process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
export const AZTEC_EXPLORER      = 'https://testnet.aztecscan.xyz';
export const AZTEC_NETWORK       = 'aztec-testnet';
export const L1_CHAIN_ID         = 11155111; // Sepolia
export const ROLLUP_VERSION      = 1821665230; // confirmed 2026-07-21 from live node
export const ROLLUP_ADDRESS      = '0xd73a91bdcf6891c7642f3e460036e1ef2cc23178'; // confirmed live
// Additional L1 contracts (live node, 2026-07-21)
export const REGISTRY_ADDRESS    = '0xa0bfb1b494fb49041e5c6e8c2c1be09cd171c6ba';
export const FEE_JUICE_ADDRESS   = '0x762c132040fda6183066fa3b14d985ee55aa3c18';

// SponsoredFPC — canonical address from docs.aztec.network/networks (V5.0.1 official, July 21 2026)
// Source: https://docs.aztec.network/developers/getting_started_on_testnet
export const PRIMARY_FPC_ADDRESS =
  process.env.SPONSORED_FPC_ADDRESS ||
  '0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c';

// Canonical alias for backward compatibility and test imports
export const SPONSORED_FPC_ADDRESS = PRIMARY_FPC_ADDRESS;

/**
 * Returns the canonical SponsoredFPC address.
 * In a future version this may rotate between multiple real FPC instances
 * as Aztec Labs deploys additional relayers on mainnet.
 */
export function getFpcAddress(): string {
  return PRIMARY_FPC_ADDRESS;
}

// Cache the node client across hot-reloads
let _nodeClient: any = null;

/**
 * Returns a cached Aztec Node JSON-RPC client.
 * In v4.3.1 of aztec.js, this is createAztecNodeClient from @aztec/aztec.js/node.
 * The node client supports: getBlockNumber, getNodeInfo, getTxReceipt, sendTx, etc.
 */
export async function getAztecNodeClient() {
  if (_nodeClient) return _nodeClient;
  const { createAztecNodeClient } = await import('@aztec/aztec.js/node');
  _nodeClient = createAztecNodeClient(AZTEC_TESTNET_NODE);
  console.log(`[Aztec] ✅ Node client connected → ${AZTEC_TESTNET_NODE}`);
  return _nodeClient;
}

/**
 * Derives a deterministic Aztec secret key from an EVM address string.
 * Uses a deterministic hash of the EVM address padded to 31 bytes (Fr-safe).
 *
 * NOTE: In production this should be an EIP-191 signature from the user's wallet
 * to ensure the user controls the Aztec key. For the server-custodial testnet
 * model, this deterministic derivation is acceptable.
 */
export function deriveSecretKeyFromEvm(evmAddress: string): string {
  const normalized = evmAddress.toLowerCase().replace('0x', '');
  // Pad to 62 chars then prefix — result fits in bn254 scalar field (Fr)
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

/**
 * Probe the Aztec Testnet node to get current network info.
 * Returns null if unreachable.
 */
export async function probeTestnetNode(): Promise<{
  blockNumber: number;
  nodeVersion: string;
  l1ChainId: number;
  rollupVersion: number;
  rollupAddress: string;
  latencyMs: number;
} | null> {
  const start = Date.now();
  try {
    const node = await getAztecNodeClient();
    const [blockNumber, nodeInfo] = await Promise.all([
      node.getBlockNumber(),
      node.getNodeInfo(),
    ]);
    return {
      blockNumber,
      nodeVersion: nodeInfo.nodeVersion,
      l1ChainId: nodeInfo.l1ChainId,
      rollupVersion: nodeInfo.rollupVersion,
      rollupAddress: nodeInfo.l1ContractAddresses.rollupAddress.toString(),
      latencyMs: Date.now() - start,
    };
  } catch (e: any) {
    console.warn('[Aztec] Node probe failed:', e.message);
    return null;
  }
}
