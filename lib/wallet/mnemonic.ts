/**
 * Secure Wallet Infrastructure - Seed Phrase & HD Wallet Management
 * Uses BIP39 for mnemonic generation and BIP32/BIP44 for HD wallet derivation
 */

import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

export interface WalletKeys {
  mnemonic: string;
  privateKey: string;
  publicKey: string;
  address: string;
  derivationPath: string;
}

export interface EncryptedWallet {
  encryptedMnemonic: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
}

/**
 * Generate a new BIP39 mnemonic (12 or 24 words)
 */
export function generateWalletMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 12 ? 128 : 256; // 128 bits = 12 words, 256 bits = 24 words
  return generateMnemonic(undefined as any, strength);
}

/**
 * Validate a BIP39 mnemonic phrase
 */
export function validateWalletMnemonic(mnemonic: string): boolean {
  try {
    return validateMnemonic(mnemonic, undefined as any);
  } catch {
    return false;
  }
}

/**
 * Derive HD wallet from mnemonic using BIP44 path
 * Default path: m/44'/60'/0'/0/0 (Ethereum)
 */
export async function deriveWalletFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0,
  change: number = 0,
  addressIndex: number = 0
): Promise<WalletKeys> {
  if (!validateWalletMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Generate seed from mnemonic
  const seed = await mnemonicToSeed(mnemonic);
  
  // Create master HD key
  const hdKey = HDKey.fromMasterSeed(seed);
  
  // BIP44 path: m / purpose' / coin_type' / account' / change / address_index
  // purpose = 44 (BIP44)
  // coin_type = 60 (Ethereum)
  const derivationPath = `m/44'/60'/${accountIndex}'/${change}/${addressIndex}`;
  
  // Derive child key
  const child = hdKey.derive(derivationPath);
  
  if (!child.privateKey) {
    throw new Error('Failed to derive private key');
  }

  // Get Ethereum address from public key
  const publicKey = child.publicKey;
  if (!publicKey) {
    throw new Error('Failed to derive public key');
  }
  const address = publicKeyToAddress(publicKey);

  return {
    mnemonic,
    privateKey: bytesToHex(child.privateKey),
    publicKey: bytesToHex(publicKey),
    address,
    derivationPath,
  };
}

/**
 * Convert public key to Ethereum address
 */
function publicKeyToAddress(publicKey: Uint8Array): string {
  // Remove the first byte (0x04 for uncompressed key)
  const publicKeyWithoutPrefix = publicKey.slice(1);
  
  // Keccak256 hash of public key
  const hash = keccak_256(publicKeyWithoutPrefix);
  
  // Take last 20 bytes
  const addressBytes = hash.slice(-20);
  
  // Convert to hex with 0x prefix
  return '0x' + bytesToHex(addressBytes);
}

/**
 * Encrypt wallet data using AES-256-GCM
 */
export async function encryptWallet(
  mnemonic: string,
  privateKey: string,
  password: string
): Promise<EncryptedWallet> {
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive encryption key from password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Generate random IV for each encryption
  const ivMnemonic = crypto.getRandomValues(new Uint8Array(12));
  const ivPrivateKey = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt mnemonic
  const encryptedMnemonicBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivMnemonic },
    key,
    new TextEncoder().encode(mnemonic)
  );

  // Encrypt private key
  const encryptedPrivateKeyBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivPrivateKey },
    key,
    new TextEncoder().encode(privateKey)
  );

  return {
    encryptedMnemonic: Buffer.from(encryptedMnemonicBuffer).toString('base64'),
    encryptedPrivateKey: Buffer.from(encryptedPrivateKeyBuffer).toString('base64'),
    salt: Buffer.from(salt).toString('base64'),
    iv: Buffer.from(ivMnemonic).toString('base64') + ':' + Buffer.from(ivPrivateKey).toString('base64'),
  };
}

/**
 * Decrypt wallet data using AES-256-GCM
 */
export async function decryptWallet(
  encryptedData: EncryptedWallet,
  password: string
): Promise<{ mnemonic: string; privateKey: string }> {
  // Parse salt and IVs
  const salt = Buffer.from(encryptedData.salt, 'base64');
  const [ivMnemonicStr, ivPrivateKeyStr] = encryptedData.iv.split(':');
  const ivMnemonic = Buffer.from(ivMnemonicStr, 'base64');
  const ivPrivateKey = Buffer.from(ivPrivateKeyStr, 'base64');

  // Derive encryption key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Decrypt mnemonic
  const decryptedMnemonicBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivMnemonic },
    key,
    Buffer.from(encryptedData.encryptedMnemonic, 'base64')
  );

  // Decrypt private key
  const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivPrivateKey },
    key,
    Buffer.from(encryptedData.encryptedPrivateKey, 'base64')
  );

  return {
    mnemonic: new TextDecoder().decode(decryptedMnemonicBuffer),
    privateKey: new TextDecoder().decode(decryptedPrivateKeyBuffer),
  };
}

/**
 * Import wallet from existing mnemonic
 */
export async function importWalletFromMnemonic(mnemonic: string): Promise<WalletKeys> {
  return deriveWalletFromMnemonic(mnemonic, 0, 0, 0);
}

/**
 * Create multiple accounts from single mnemonic
 */
export async function deriveMultipleAccounts(
  mnemonic: string,
  count: number = 5
): Promise<WalletKeys[]> {
  const accounts: WalletKeys[] = [];
  
  for (let i = 0; i < count; i++) {
    const wallet = await deriveWalletFromMnemonic(mnemonic, i, 0, 0);
    accounts.push(wallet);
  }
  
  return accounts;
}
