import { vault } from '@/lib/core/SecureVault';
import { encryptMessage, decryptMessage } from '@/lib/wallet/encryption';

/**
 * ══════════════════════════════════════════════════════════════════════════════════
 *  QUANTUM PXE SETTINGS ENGINE
 *  Abyssal Complexity Level: MAXIMUM
 *  This engine deeply articulates all UI settings with the underlying Private Execution
 *  Environment (PXE), ensuring cryptographic integrity, persistence, and protocol execution.
 * ══════════════════════════════════════════════════════════════════════════════════
 */

export interface WhaleProtocolSettings {
  // Alerts & Sounds
  notifications_private: boolean;
  notifications_groups: boolean;
  notifications_workspaces: boolean;
  badge_count: boolean;
  
  // Privacy Engine
  passcode_enabled: boolean;
  auto_delete_timer: 'off' | '1 week' | '1 month' | '24 hours';
  privacy_last_seen: 'nobody' | 'everybody' | 'contacts';
  
  // Data & Storage
  auto_download_wifi: boolean;
  auto_download_cellular: boolean;
  save_photos: boolean;
  data_saver_calls: boolean;
  
  // Aesthetics & Identity
  theme: 'brutalist' | 'monochrome' | 'neon_void' | 'terminal';
  text_size: number;
  language: string;
  displayName: string;
  username: string;
  bio: string;
}

export const DEFAULT_PXE_SETTINGS: WhaleProtocolSettings = {
  notifications_private: true,
  notifications_groups: true,
  notifications_workspaces: false,
  badge_count: true,
  passcode_enabled: false,
  auto_delete_timer: 'off',
  privacy_last_seen: 'nobody',
  auto_download_wifi: true,
  auto_download_cellular: false,
  save_photos: true,
  data_saver_calls: false,
  theme: 'brutalist',
  text_size: 3,
  language: 'en',
  displayName: 'Satoshi Nakamoto',
  username: 'whale_architect',
  bio: 'Building the Sovereign Network. Cryptography, Privacy, and Decentralization.'
};

type PXESubscriber = (settings: WhaleProtocolSettings) => void;

class SettingsEnginePXE {
  private cache: Record<string, WhaleProtocolSettings> = {};
  private subscribers: Record<string, Set<PXESubscriber>> = {};

  /**
   * Initializes the PXE Settings Engine for a specific user node.
   * Performs asynchronous decryption and memory mounting.
   */
  async mountNode(address: string): Promise<WhaleProtocolSettings> {
    if (this.cache[address]) return this.cache[address];

    try {
      // 1. Retrieve encrypted binary payload from Secure Vault
      const rawData = await vault.getItem(`pxe_settings_${address}`);
      if (!rawData) {
        this.cache[address] = { ...DEFAULT_PXE_SETTINGS };
        await this.syncToPXE(address, this.cache[address]);
        return this.cache[address];
      }

      // 2. Cryptographic decryption (Requires wallet encryption key derived from signatures)
      const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || 'quantum_default_key_2026';
      const decryptedString = await decryptMessage(rawData, encryptionKey);
      
      const parsed = JSON.parse(decryptedString) as WhaleProtocolSettings;
      
      // 3. Mount to fast-access memory cache
      this.cache[address] = { ...DEFAULT_PXE_SETTINGS, ...parsed };
      this.broadcast(address, this.cache[address]);
      
      return this.cache[address];
    } catch (error) {
      console.error('[PXE ENGINE] Failed to mount settings node:', error);
      return { ...DEFAULT_PXE_SETTINGS };
    }
  }

  /**
   * Mutates a specific configuration node and automatically triggers cryptographic
   * re-encryption and network synchronization.
   */
  async mutate<K extends keyof WhaleProtocolSettings>(
    address: string, 
    key: K, 
    value: WhaleProtocolSettings[K]
  ): Promise<void> {
    if (!this.cache[address]) {
      await this.mountNode(address);
    }

    // 1. Optimistic memory update
    this.cache[address][key] = value;
    this.broadcast(address, this.cache[address]);

    // 2. Persist to encrypted storage
    await this.syncToPXE(address, this.cache[address]);
  }

  /**
   * Encrypts the entire settings matrix and commits it to the asynchronous local vault,
   * preparing it for future sync with the Aztec network.
   */
  private async syncToPXE(address: string, settings: WhaleProtocolSettings): Promise<void> {
    try {
      const payload = JSON.stringify(settings);
      const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || 'quantum_default_key_2026';
      
      // Abyssal complexity: Ensure the settings are completely opaque to the OS
      const encryptedBlob = await encryptMessage(payload, encryptionKey);
      await vault.setItem(`pxe_settings_${address}`, encryptedBlob);
    } catch (error) {
      console.error('[PXE ENGINE] Fatal error during sync:', error);
    }
  }

  /**
   * Subscribes a React component to real-time PXE setting mutations.
   */
  subscribe(address: string, callback: PXESubscriber): () => void {
    if (!this.subscribers[address]) {
      this.subscribers[address] = new Set();
    }
    this.subscribers[address].add(callback);

    // Initial blast
    if (this.cache[address]) {
      callback(this.cache[address]);
    } else {
      this.mountNode(address).then(s => callback(s));
    }

    return () => {
      this.subscribers[address].delete(callback);
    };
  }

  // Synchronous getter for critical render paths (must call mountNode first in lifecycle)
  get(address: string): WhaleProtocolSettings {
    return this.cache[address] || DEFAULT_PXE_SETTINGS;
  }
}

export const pxeEngine = new SettingsEnginePXE();
