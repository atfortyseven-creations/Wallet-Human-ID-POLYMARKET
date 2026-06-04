import { createHash } from 'crypto';

/**
 * UHRP (Universal Hash Resolution Protocol) - Institutional Utility
 * -------------------------------------------------------------
 * Provides content-addressable hashing (SHA-256) for the System Vault.
 */
export class Uhrp {
    /**
     * Generates a standard UHRP-compatible hash for any data blob.
     */
    public static generateHash(data: any): string {
        const content = typeof data === 'string' ? data : JSON.stringify(data);
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Verifies that the data matches the provided UHRP hash.
     */
    public static verify(data: any, hash: string): boolean {
        return this.generateHash(data) === hash;
    }
}
