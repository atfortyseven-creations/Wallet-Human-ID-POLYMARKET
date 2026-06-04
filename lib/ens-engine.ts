/**
 * ============================================================
 * ENS ENGINE — Ethereum Name Service (Full On-Chain)
 * ============================================================
 * Full bidirectional ENS resolution: name → address, address → name.
 * Resolves ENS text records (avatar, url, com.twitter, description).
 * Uses ethers.js EnsResolver — strict mainnet calls. NO simulations.
 */

import { ethers } from 'ethers';

// ENS registry is only on Ethereum mainnet
const MAINNET_RPC = 'https://cloudflare-eth.com';

export interface ENSProfile {
  name: string | null;          // Primary name (reverse lookup)
  address: string | null;        // Resolved address (forward lookup)
  avatar: string | null;         // IPFS/HTTP avatar URL
  description: string | null;
  url: string | null;
  twitter: string | null;
  email: string | null;
  resolverAddress: string | null;
  ttl: bigint | null;
}

function getMainnetProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(MAINNET_RPC);
}

/**
 * Forward resolution: ENS name → Ethereum address.
 * Connects strictly to Ethereum mainnet ENS registry.
 */
export async function resolveENSName(ensName: string): Promise<string | null> {
  if (!ensName.endsWith('.eth') && !ensName.includes('.')) return null;
  const provider = getMainnetProvider();
  return provider.resolveName(ensName);
}

/**
 * Reverse resolution: Ethereum address → primary ENS name.
 * Requires that the user has set their reverse record.
 */
export async function lookupENSAddress(address: string): Promise<string | null> {
  if (!ethers.isAddress(address)) return null;
  const provider = getMainnetProvider();
  return provider.lookupAddress(address);
}

/**
 * Full ENS profile resolution — fetches all public text records.
 * Uses ethers EnsResolver to read avatar, description, url, social handles.
 */
export async function fetchFullENSProfile(nameOrAddress: string): Promise<ENSProfile> {
  const provider = getMainnetProvider();

  let ensName: string | null = null;
  let resolvedAddress: string | null = null;

  if (ethers.isAddress(nameOrAddress)) {
    // Reverse lookup first
    ensName = await provider.lookupAddress(nameOrAddress).catch(() => null);
    resolvedAddress = nameOrAddress;
  } else {
    ensName = nameOrAddress;
    resolvedAddress = await provider.resolveName(nameOrAddress).catch(() => null);
  }

  if (!ensName) {
    return {
      name: null,
      address: resolvedAddress,
      avatar: null, description: null, url: null,
      twitter: null, email: null, resolverAddress: null, ttl: null,
    };
  }

  const resolver = await provider.getResolver(ensName).catch(() => null);
  if (!resolver) {
    return {
      name: ensName,
      address: resolvedAddress,
      avatar: null, description: null, url: null,
      twitter: null, email: null, resolverAddress: null, ttl: null,
    };
  }

  // Fetch all text records in parallel
  const [avatar, description, url, twitter, email] = await Promise.all([
    resolver.getText('avatar').catch(() => null),
    resolver.getText('description').catch(() => null),
    resolver.getText('url').catch(() => null),
    resolver.getText('com.twitter').catch(() => null),
    resolver.getText('email').catch(() => null),
  ]);

  return {
    name: ensName,
    address: resolvedAddress,
    avatar: avatar ?? null,
    description: description ?? null,
    url: url ?? null,
    twitter: twitter ?? null,
    email: email ?? null,
    resolverAddress: resolver.address,
    ttl: null, // Would require low-level registry call
  };
}

/**
 * Validates if a string is a valid ENS name (simple heuristic).
 */
export function isENSName(value: string): boolean {
  return /^[a-z0-9-]+\.eth$/.test(value.toLowerCase());
}
