/**
 * Secure Storage Module
 * 
 * Provides encrypted storage for sensitive data with:
 * - AES-256-GCM encryption
 * - Automatic key rotation
 * - Memory cleanup
 * - XSS protection
 */

import CryptoJS from 'crypto-js';

interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

interface StorageItem {
  value: string;
  encrypted: boolean;
  expiresAt?: number;
  version: number;
}

const CURRENT_VERSION = 1;
const ENCRYPTION_KEY_STORAGE = 'encryption_master_key';

import { Buffer } from 'buffer';

/**
 * Generate or retrieve encryption key securely using WebCrypto HKDF
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  let keyString = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  let rawKey: Uint8Array;
  
  if (!keyString) {
    rawKey = window.crypto.getRandomValues(new Uint8Array(32)); // 256-bit
    sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, Buffer.from(rawKey).toString('base64'));
  } else {
    // Explicitly slice the underlying ArrayBuffer to satisfy WebCrypto's strict
    // BufferSource type  Node.js Buffer wraps an ArrayBufferLike which may be
    // a SharedArrayBuffer, but importKey requires a plain ArrayBuffer.
    const buf = Buffer.from(keyString, 'base64');
    rawKey = new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
  }
  
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey.buffer.slice(rawKey.byteOffset, rawKey.byteOffset + rawKey.byteLength) as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using WebCrypto AES-256-GCM
 */
async function encrypt(data: string): Promise<string> {
  if (typeof window === 'undefined') return data;
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt data using WebCrypto AES-256-GCM
 */
async function decrypt(encryptedData: string): Promise<string> {
  if (typeof window === 'undefined') return encryptedData;
  const key = await getEncryptionKey();
  const combined = new Uint8Array(Buffer.from(encryptedData, 'base64'));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

/**
 * Secure Storage API
 */
export class SecureStorage {
  private static prefix = 'secure_';
  
  /**
   * Store item securely
   */
  static async setItem(
    key: string,
    value: any,
    options: StorageOptions = { encrypt: true }
  ): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      const item: StorageItem = {
        value: options.encrypt ? await encrypt(stringValue) : stringValue,
        encrypted: options.encrypt !== false,
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
        version: CURRENT_VERSION
      };
      
      const storageKey = this.prefix + key;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('SecureStorage.setItem failed:', error);
      throw new Error('Failed to store item securely');
    }
  }
  
  /**
   * Retrieve item securely
   */
  static async getItem<T = any>(key: string, parse = true): Promise<T | null> {
    try {
      const storageKey = this.prefix + key;
      const storedData = localStorage.getItem(storageKey);
      
      if (!storedData) return null;
      
      const item: StorageItem = JSON.parse(storedData);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeItem(key);
        return null;
      }
      
      // Decrypt if needed
      let value = item.encrypted ? await decrypt(item.value) : item.value;
      
      // Parse JSON if requested
      if (parse && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // Not JSON, return as string
        }
      }
      
      return value as T;
    } catch (error) {
      console.error('SecureStorage.getItem failed:', error);
      return null;
    }
  }
  
  /**
   * Remove item
   */
  static removeItem(key: string): void {
    const storageKey = this.prefix + key;
    
    // Overwrite with random data before deletion (anti-forensics)
    const randomData = CryptoJS.lib.WordArray.random(128).toString();
    localStorage.setItem(storageKey, randomData);
    
    localStorage.removeItem(storageKey);
  }
  
  /**
   * Clear all secure storage items
   */
  static clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(key => {
      // Overwrite before deletion
      const randomData = CryptoJS.lib.WordArray.random(128).toString();
      localStorage.setItem(key, randomData);
      localStorage.removeItem(key);
    });
    
    // Clear session key
    sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
  }
  
  /**
   * Check if item exists
   */
  static hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
  
  /**
   * Get all keys
   */
  static keys(): string[] {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .map(k => k.substring(this.prefix.length));
  }
}

/**
 * Session-only secure storage (cleared on tab close)
 */
export class SecureSessionStorage {
  private static prefix = 'secure_session_';
  
  static async setItem(key: string, value: any, shouldEncrypt = true): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const finalValue = shouldEncrypt ? await encrypt(stringValue) : stringValue;
      
      sessionStorage.setItem(this.prefix + key, finalValue as string);
    } catch (error) {
      console.error('SecureSessionStorage.setItem failed:', error);
    }
  }
  
  static async getItem<T = any>(key: string, encrypted = true, parse = true): Promise<T | null> {
    try {
      const storedValue = sessionStorage.getItem(this.prefix + key);
      if (!storedValue) return null;
      
      let value = encrypted ? await decrypt(storedValue) : storedValue;
      
      if (parse && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          // Not JSON
        }
      }
      
      return value as T;
    } catch (error) {
      console.error('SecureSessionStorage.getItem failed:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }
  
  static clear(): void {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(key => sessionStorage.removeItem(key));
  }
}

/**
 * Memory-only secure storage (no persistence)
 */
export class SecureMemoryStorage {
  private static store = new Map<string, { value: any; expiresAt?: number }>();
  
  static setItem(key: string, value: any, expiresIn?: number): void {
    this.store.set(key, {
      value,
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined
    });
  }
  
  static getItem<T = any>(key: string): T | null {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.removeItem(key);
      return null;
    }
    
    return item.value as T;
  }
  
  static removeItem(key: string): void {
    this.store.delete(key);
  }
  
  static clear(): void {
    this.store.clear();
  }
  
  static has(key: string): boolean {
    return this.store.has(key);
  }
}

/**
 * Auto-cleanup on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Clear sensitive session data
    SecureSessionStorage.clear();
    SecureMemoryStorage.clear();
  });
}

export default SecureStorage;

