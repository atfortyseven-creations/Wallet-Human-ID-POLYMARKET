/**
 * SECURE VAULT SUBSTRATE (Phase 35)
 * PBKDF2 + AES-GCM Implementation for Client-Side Mnemonic Encryption.
 */
export class SecureVault {
  /**
   * Encrypts a string using a password-derived key.
   */
  public async encrypt(plaintext: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordKey = await this.deriveKey(password, salt);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      passwordKey,
      encoder.encode(plaintext)
    );

    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return Buffer.from(result).toString('base64');
  }

  /**
   * Decrypts a base64 string using a password.
   */
  public async decrypt(ciphertextBase64: string, password: string): Promise<string> {
    const raw = Buffer.from(ciphertextBase64, 'base64');
    const data = new Uint8Array(raw);
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);

    const passwordKey = await this.deriveKey(password, salt as any);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      passwordKey,
      encrypted as any
    );

    return new TextDecoder().decode(decrypted);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
