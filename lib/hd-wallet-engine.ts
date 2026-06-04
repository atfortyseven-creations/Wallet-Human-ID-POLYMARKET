/**
 * ============================================================
 * HD WALLET ENGINE — BIP-32 / BIP-39 / BIP-44
 * ============================================================
 * Full hierarchical deterministic wallet derivation.
 * Derives unlimited accounts from a single 12/24-word seed.
 * Standards: BIP-39 (mnemonic), BIP-32 (HD tree), BIP-44 (paths)
 * NO SIMULATIONS. Direct ethers.js HDNodeWallet primitives.
 */

import { ethers } from 'ethers';

// ─── Derivation Path Constants ─────────────────────────────────────────────────
export const BIP44_PATHS = {
  ethereum:   "m/44'/60'/0'/0",   // Ethereum + EVM chains (Polygon, Arbitrum, etc.)
  aztecAlpha: "m/44'/60'/1'/0",   // Aztec shielded account space (same curve, isolated index)
  bitcoin:    "m/44'/0'/0'/0",    // BTC (informational, not used for EVM)
} as const;

export type CoinPath = keyof typeof BIP44_PATHS;

// ─── Derived Account ──────────────────────────────────────────────────────────
export interface DerivedAccount {
  index: number;
  path: string;
  address: string;
  publicKey: string;
  // Private key is NEVER serialized. Held only in memory during session.
  privateKey?: string;
}

// ─── Core HD Engine ──────────────────────────────────────────────────────────

/**
 * Derives N accounts from a BIP-39 mnemonic phrase along the specified coin path.
 * Each call is pure cryptographic computation — no network calls.
 */
export function deriveAccountsFromMnemonic(
  mnemonic: string,
  count: number = 10,
  coinPath: CoinPath = 'ethereum',
  includePrivateKeys: boolean = false
): DerivedAccount[] {
  const phrase = mnemonic.trim();
  if (!ethers.Mnemonic.isValidMnemonic(phrase)) {
    throw new Error('Invalid BIP-39 mnemonic phrase.');
  }

  const basePath = BIP44_PATHS[coinPath];
  const accounts: DerivedAccount[] = [];

  for (let i = 0; i < count; i++) {
    const fullPath = `${basePath}/${i}`;
    const node = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(phrase),
      fullPath
    );

    accounts.push({
      index: i,
      path: fullPath,
      address: node.address,
      publicKey: node.publicKey,
      ...(includePrivateKeys ? { privateKey: node.privateKey } : {}),
    });
  }

  return accounts;
}

/**
 * Derives a single account at a specific index — used for targeted key retrieval.
 * Returns the live ethers.Wallet connected to the given provider.
 */
export function deriveWalletAtIndex(
  mnemonic: string,
  index: number,
  provider: ethers.Provider,
  coinPath: CoinPath = 'ethereum'
): ethers.HDNodeWallet {
  const phrase = mnemonic.trim();
  if (!ethers.Mnemonic.isValidMnemonic(phrase)) {
    throw new Error('Invalid BIP-39 mnemonic phrase.');
  }

  const fullPath = `${BIP44_PATHS[coinPath]}/${index}`;
  const node = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(phrase),
    fullPath
  );

  return node.connect(provider);
}

/**
 * Derives the Aztec-isolated account at a given index using coin path index 1.
 * These accounts are used exclusively for ZK privacy operations on Aztec L2.
 */
export function deriveAztecShieldedAccount(
  mnemonic: string,
  index: number = 0,
  provider: ethers.Provider
): ethers.HDNodeWallet {
  return deriveWalletAtIndex(mnemonic, index, provider, 'aztecAlpha');
}

/**
 * Scans derived accounts for non-zero on-chain balances.
 * Uses gap-limit logic: stops after finding `gapLimit` consecutive zero-balance accounts.
 * This is how MetaMask and hardware wallets auto-discover accounts.
 */
export async function scanActiveAccounts(
  mnemonic: string,
  provider: ethers.Provider,
  gapLimit: number = 5,
  maxScan: number = 50
): Promise<DerivedAccount[]> {
  const activeAccounts: DerivedAccount[] = [];
  let consecutiveZeros = 0;

  for (let i = 0; i < maxScan; i++) {
    const path = `${BIP44_PATHS.ethereum}/${i}`;
    const node = ethers.HDNodeWallet.fromMnemonic(
      ethers.Mnemonic.fromPhrase(mnemonic.trim()),
      path
    );

    let balance = 0n;
    try {
      balance = await provider.getBalance(node.address);
    } catch {
      // Network error — treat as zero
    }

    const txCount = await provider.getTransactionCount(node.address);

    if (balance > 0n || txCount > 0) {
      consecutiveZeros = 0;
      activeAccounts.push({
        index: i,
        path,
        address: node.address,
        publicKey: node.publicKey,
      });
    } else {
      consecutiveZeros++;
      if (consecutiveZeros >= gapLimit) break;
    }
  }

  return activeAccounts;
}

/**
 * Generates a cryptographically secure BIP-39 mnemonic using ethers entropy.
 * Entropy sourced from ethers.randomBytes — equivalent to MetaMask's key generation.
 */
export function generateSecureMnemonic(wordCount: 12 | 24 = 12): string {
  const entropyBytes = wordCount === 24 ? 32 : 16;
  const entropy = ethers.randomBytes(entropyBytes);
  return ethers.Mnemonic.entropyToPhrase(entropy);
}

/**
 * Validates that a given private key is a valid secp256k1 scalar.
 */
export function validatePrivateKey(key: string): boolean {
  try {
    const formatted = key.startsWith('0x') ? key : `0x${key}`;
    new ethers.Wallet(formatted); // Will throw if invalid
    return true;
  } catch {
    return false;
  }
}
