import { ethers } from 'ethers';

// Strict type alias: Web Crypto API requires ArrayBuffer-backed typed arrays.
// Plain Uint8Array is compatible with all SubtleCrypto operations.
type CryptoBytes = Uint8Array;

/**
 * Derives a symmetric AES-256-GCM key from a wallet signature and a cryptographically
 * random salt. Each encryption call generates its own unique salt, ensuring that
 * no two key derivations ever share the same input  eliminating rainbow table attacks.
 *
 * @param signature - EIP-191 personal_sign output from the user's wallet
 * @param salt      - Cryptographically random 16-byte salt (unique per encryption call)
 */
async function deriveKey(signature: string, salt: CryptoBytes): Promise<CryptoKey> {
    const enc = new TextEncoder();

    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(signature),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 210_000, // OWASP 2024 minimum for PBKDF2-SHA256
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/** Helper: produces a strongly-typed CryptoBytes array of the requested length. */
function randomBytes(length: number): CryptoBytes {
    return window.crypto.getRandomValues(new Uint8Array(length)) as CryptoBytes;
}

// 
// PUBLIC API
// 

export interface EncryptedVault {
    /** The AES-GCM ciphertext. */
    encryptedData: CryptoBytes;
    /** 12-byte random initialization vector used during encryption. */
    iv: CryptoBytes;
    /** 16-byte random salt used during PBKDF2 key derivation  MUST be stored alongside the ciphertext. */
    salt: CryptoBytes;
    /** The EIP-191 wallet signature that unlocks decryption. Not stored server-side. */
    signature: string;
}

/**
 * Encrypts a JSON-serializable object into a secure AES-GCM-256 blob.
 *
 * The user's wallet signs a fixed access message (EIP-191  zero gas cost, no
 * on-chain transaction). That signature becomes the seed for PBKDF2 key derivation
 * combined with a freshly generated random salt, guaranteeing that every encryption
 * of the same data produces a completely different ciphertext.
 *
 * To decrypt: the user must sign the same message again from the same wallet address.
 * Without both the original salt and a valid signature, decryption is cryptographically
 * impossible  even with full access to the ciphertext.
 */
export async function encryptVault(
    data: unknown,
    signer: ethers.Signer
): Promise<EncryptedVault> {
    const message = 'Allow Access to Whale Vault';

    // Step 1  Prove ownership: request an EIP-191 signature from the wallet.
    const signature = await signer.signMessage(message);

    // Step 2  Generate a fresh random salt unique to this encryption call.
    const salt = randomBytes(16);

    // Step 3  Derive a 256-bit AES key from the signature and salt via PBKDF2.
    const key = await deriveKey(signature, salt);

    // Step 4  Encrypt with a unique random IV.
    const iv = randomBytes(12);
    const plaintext = new TextEncoder().encode(JSON.stringify(data));

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
    );

    return {
        encryptedData: new Uint8Array(ciphertext) as CryptoBytes,
        iv,
        salt,      // Must be persisted alongside encryptedData for future decryption.
        signature, // Returned for optional session caching  never store server-side.
    };
}

/**
 * Decrypts an encrypted vault blob.
 *
 * Requires the exact salt from the original encryption call and a fresh wallet
 * signature to reconstruct the AES key. If either is incorrect, decryption
 * throws a hard error  there is no silent failure mode.
 */
export async function decryptVault(
    encryptedData: CryptoBytes,
    iv: CryptoBytes,
    salt: CryptoBytes,
    signature: string
): Promise<unknown> {
    const key = await deriveKey(signature, salt);

    let decrypted: ArrayBuffer;
    try {
        decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );
    } catch {
        throw new Error(
            'Whale Vault: decryption failed. The wallet signature, salt, or ciphertext is invalid.'
        );
    }

    return JSON.parse(new TextDecoder().decode(decrypted));
}
