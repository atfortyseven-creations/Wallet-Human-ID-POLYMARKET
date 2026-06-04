import { ethers } from 'ethers';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
// @ts-expect-error  subpath types may be missing depending on @scure/bip39 version
import { wordlist } from '@scure/bip39/wordlists/english';

/**
 * Elite-Grade Key Management System (KMS)
 * Implements security standards for non-custodial wallets.
 */
export class KMS {
  private static readonly DERIVATION_PATH = "m/44'/60'/0'/0"; // BIP-44 Ethereum

  /**
   * Generates a new cryptographically secure 12-word mnemonic.
   */
  public static generateMnemonic(): string {
    return generateMnemonic(wordlist);
  }

  /**
   * Validates a mnemonic phrase against BIP-39 standard.
   */
  public static isValidMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Derives a HD Node from a mnemonic and an optional password (salt).
   */
  public static deriveHDNode(mnemonic: string, password?: string): ethers.HDNodeWallet {
    if (!this.isValidMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase provided to KMS.');
    }
    return ethers.HDNodeWallet.fromPhrase(mnemonic, password, this.DERIVATION_PATH + "/0");
  }

  /**
   * Derives a specific account by index following BIP-44.
   */
  public static deriveAccount(mnemonic: string, index: number, password?: string): ethers.HDNodeWallet {
    const path = `${this.DERIVATION_PATH}/${index}`;
    return ethers.HDNodeWallet.fromPhrase(mnemonic, password, path);
  }

  /**
   * Encrypts a mnemonic or private key using Elite-grade AES-256-GCM.
   * This uses the Web Crypto API for maximum security.
   */
  public static async encrypt(data: string, password: string): Promise<{
    ciphertext: string;
    iv: string;
    salt: string;
    iterations: number;
    tagLength: number;
  }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const iterations = 100000; // SOC2/ISO standard
    const tagLength = 128;

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
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength },
      key,
      new TextEncoder().encode(data)
    );

    return {
      ciphertext: Buffer.from(encrypted).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      salt: Buffer.from(salt).toString('base64'),
      iterations,
      tagLength,
    };
  }

  /**
   * Decrypts Elite-grade encrypted data.
   */
  public static async decrypt(
    encryptedData: {
      ciphertext: string;
      iv: string;
      salt: string;
      iterations: number;
      tagLength: number;
    },
    password: string
  ): Promise<string> {
    const { ciphertext, iv, salt, iterations, tagLength } = encryptedData;
    
    const saltBuffer = Buffer.from(salt, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');

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
        salt: saltBuffer,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer, tagLength },
      key,
      ciphertextBuffer
    );

    return new TextDecoder().decode(decrypted);
  }
}

