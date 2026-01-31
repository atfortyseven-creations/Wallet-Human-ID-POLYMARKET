/**
 * wallet-security.ts
 * Utilities for client-side encryption and decryption of mnemonics/private keys
 * using the Web Crypto API.
 */

/**
 * Derives a cryptographic key from a password and salt using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: 100000,
            hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a plaintext string with a password.
 * Returns a JSON string containing the salt, IV, and ciphertext (hex encoded).
 */
export async function encryptWithPassword(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(plaintext)
    );

    const result = {
        salt: Buffer.from(salt).toString('hex'),
        iv: Buffer.from(iv).toString('hex'),
        ciphertext: Buffer.from(encrypted).toString('hex')
    };

    return JSON.stringify(result);
}

/**
 * Decrypts a ciphertext JSON string with a password.
 */
export async function decryptWithPassword(encryptedJson: string, password: string): Promise<string> {
    try {
        const { salt, iv, ciphertext } = JSON.parse(encryptedJson);
        const saltUint8 = new Uint8Array(Buffer.from(salt, 'hex'));
        const ivUint8 = new Uint8Array(Buffer.from(iv, 'hex'));
        const ciphertextUint8 = new Uint8Array(Buffer.from(ciphertext, 'hex'));

        const key = await deriveKey(password, saltUint8);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivUint8 },
            key,
            ciphertextUint8
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        throw new Error('Decryption failed. Incorrect password?');
    }
}

/**
 * Generates a random salt for the wallet.
 */
export function generateWalletSalt(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
}
