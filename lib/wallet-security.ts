/**
 * wallet-security.ts
 * Utilities for client-side encryption and decryption of mnemonics/private keys
 * using the Web Crypto API (AES-256-GCM + PBKDF2).
 *
 * PRODUCTION SECURITY PARAMETERS:
 *  - PBKDF2-SHA256 with 600,000 iterations (OWASP 2024 minimum for SHA-256)
 *  - AES-256-GCM with a unique 96-bit IV per encryption
 *  - 128-bit random salt per encryption
 *  - Version tag for forward-compatible migration
 */

import { Buffer } from 'buffer';

// Version tag embedded in all new ciphertexts.
// v1 = 100k PBKDF2 iterations (legacy)
// v2 = 600k PBKDF2 iterations (current OWASP 2024 standard)
const CURRENT_VERSION = 'v2';
const ITERATIONS_V1 = 100_000;
const ITERATIONS_V2 = 600_000;

/**
 * Derives a cryptographic AES-256-GCM key from a password and salt using PBKDF2.
 * @param password - User's plaintext password
 * @param salt - Unique random salt (Uint8Array)
 * @param iterations - PBKDF2 iteration count
 */
async function deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number = ITERATIONS_V2,
): Promise<CryptoKey> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        throw new Error('Web Crypto API no disponible. En móvil (iOS/Android) asegúrate de usar HTTPS, de lo contrario la seguridad del navegador bloquea la creación de wallets.');
    }
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations,
            hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}

/**
 * Encrypts a plaintext string with a password.
 * Returns a JSON string containing the version, salt, IV, and ciphertext (all hex-encoded).
 * Uses PBKDF2-SHA256 (600k iterations) + AES-256-GCM.
 */
export async function encryptWithPassword(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt, ITERATIONS_V2);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(plaintext),
    );

    return JSON.stringify({
        version:    CURRENT_VERSION,
        salt:       Buffer.from(salt).toString('hex'),
        iv:         Buffer.from(iv).toString('hex'),
        ciphertext: Buffer.from(encrypted).toString('hex'),
    });
}

/**
 * Decrypts a ciphertext JSON string with a password.
 * Automatically handles both v1 (100k) and v2 (600k) iterations.
 * Throws an error with a clear message if the password is wrong.
 */
export async function decryptWithPassword(encryptedJson: string, password: string): Promise<string> {
    let parsed: { version?: string; salt: string; iv: string; ciphertext: string };
    try {
        parsed = JSON.parse(encryptedJson);
    } catch {
        throw new Error('Ciphertext is not valid JSON. Data may be corrupted.');
    }

    const { version, salt, iv, ciphertext } = parsed;
    const saltUint8       = new Uint8Array(Buffer.from(salt, 'hex'));
    const ivUint8         = new Uint8Array(Buffer.from(iv, 'hex'));
    const ciphertextUint8 = new Uint8Array(Buffer.from(ciphertext, 'hex'));

    // Determine iteration count from version tag for backward compat
    const iterations = version === 'v2' ? ITERATIONS_V2 : ITERATIONS_V1;

    try {
        const key       = await deriveKey(password, saltUint8, iterations);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivUint8 },
            key,
            ciphertextUint8,
        );
        return new TextDecoder().decode(decrypted);
    } catch {
        throw new Error('Incorrect password. Please try again.');
    }
}

/**
 * Attempts to decrypt a mnemonic/private-key blob that may be in one of several formats:
 *  1. New AES-GCM format (v1 or v2) from this file
 *  2. Legacy ethers.js Keystore JSON (V3 scrypt) via the ethers library
 *
 * Returns the decrypted plaintext (mnemonic phrase or private key), or throws
 * a clean user-facing error if all strategies fail.
 *
 * This is the canonical entry point for all wallet unlock flows.
 */
export async function tryDecryptAny(
    blob: string,
    password: string,
): Promise<{ plaintext: string; wasLegacy: boolean }> {
    //  Strategy 1: New AES-GCM format (contains 'iv' + 'ciphertext' JSON keys) 
    try {
        const parsed = JSON.parse(blob);
        if ('ciphertext' in parsed && 'iv' in parsed && 'salt' in parsed) {
            const plaintext = await decryptWithPassword(blob, password);
            return { plaintext, wasLegacy: false };
        }
    } catch (e: any) {
        // If the JSON parsed correctly but AES-GCM rejected it, propagate the error
        // only if it looks like the right format (not a legacy keystore).
        try {
            const parsed = JSON.parse(blob);
            if ('ciphertext' in parsed && 'iv' in parsed && 'salt' in parsed) {
                throw new Error('Incorrect password. Please try again.');
            }
        } catch (innerE: any) {
            if (innerE.message === 'Incorrect password. Please try again.') throw innerE;
        }
    }

    //  Strategy 2: Legacy ethers.js Keystore (contains 'crypto.kdfparams') 
    try {
        const parsed = JSON.parse(blob);
        const isEthersKeystore =
            parsed.version === 3 ||
            ('crypto' in parsed && 'kdfparams' in (parsed.crypto ?? {})) ||
            ('Crypto' in parsed);

        if (isEthersKeystore) {
            const { ethers } = await import('ethers');
            try {
                const w = await ethers.Wallet.fromEncryptedJson(blob, password);
                // Successfully decrypted  return the private key
                // The caller will use it to reconstruct the wallet.
                return { plaintext: w.privateKey, wasLegacy: true };
            } catch {
                throw new Error('Incorrect password. Please try again.');
            }
        }
    } catch (e: any) {
        if (e.message === 'Incorrect password. Please try again.') throw e;
    }

    throw new Error('Unrecognized wallet format. If you have your 12-word phrase, use "Restore with phrase".');
}

/**
 * Generates a random hex salt.
 */
export function generateWalletSalt(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
}
