import crypto from 'crypto';

/**
 * LEGENDARY ENCRYPTION UTILITIES
 * Centralized, secure encryption/decryption for wallet private keys
 * Uses AES-256-GCM with authentication tags
 */

const DEV_FALLBACK_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Get encryption key from environment
 * CRITICAL: Must be 32-byte hex string in production
 */
export const getEncryptionKey = (): string => {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  
  if (!key) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error(' CRITICAL: WALLET_ENCRYPTION_KEY missing in production!');
      throw new Error('Encryption key not configured');
    }
    console.warn('️  Using fallback encryption key (development only)');
    return DEV_FALLBACK_KEY;
  }
  
  // Validate key format
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error('WALLET_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  
  return key;
};

/**
 * Encrypt sensitive data (private keys, mnemonics)
 * @param plaintext - Data to encrypt
 * @returns Encrypted string in format: iv:encrypted:authTag
 */
export function encrypt(plaintext: string): string {
  try {
    const encryptionKey = getEncryptionKey();
    
    // Generate key from encryption key
    const key = crypto.createHash('sha256').update(String(encryptionKey)).digest();
    
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:encrypted:authTag (all hex)
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param encryptedText - Encrypted string in format: iv:encrypted:authTag
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedText: string): string {
  try {
    const encryptionKey = getEncryptionKey();
    
    // Parse encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, encryptedHex, authTagHex] = parts;
    
    // Generate key from encryption key
    const key = crypto.createHash('sha256').update(String(encryptionKey)).digest();
    
    // Convert hex to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Validate Ethereum private key format
 * @param privateKey - Private key to validate
 * @returns true if valid
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // Remove 0x prefix if present
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Must be 64 hex characters (32 bytes)
  return /^[0-9a-fA-F]{64}$/.test(key);
}

/**
 * Generate a secure random salt for additional security
 * @returns 32-byte hex salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

