import { IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'WhaleChatEngineDB';
const DB_VERSION = 1;

export interface OutboxMessage {
  id: string; // uuid
  walletAddress: string;
  peerAddress: string;
  content: string;
  timestamp: number;
  retryCount: number;
}

export interface StoredMessage {
  id: string;
  walletAddress: string;
  peerAddress: string;
  conversationId: string;
  content: string;
  timestamp: number;
  senderAddress: string;
  status: 'sent' | 'delivered' | 'read';
}

class WhaleDatabase {
  private dbPromise: Promise<IDBPDatabase<any>> | null = null;

  private getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Table for queued messages waiting for internet connection
          if (!db.objectStoreNames.contains('outbox')) {
            const outboxStore = db.createObjectStore('outbox', { keyPath: 'id' });
            outboxStore.createIndex('by_wallet', 'walletAddress');
          }
          // Table for massive local message cache
          if (!db.objectStoreNames.contains('messages')) {
            const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
            msgStore.createIndex('by_conversation', ['walletAddress', 'conversationId']);
            msgStore.createIndex('by_timestamp', 'timestamp');
          }
          // Table for media caching (blobs)
          if (!db.objectStoreNames.contains('media_cache')) {
            db.createObjectStore('media_cache', { keyPath: 'url' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  // --- OUTBOX ENGINE ---
  async addMessageToOutbox(msg: OutboxMessage) {
    const db = await this.getDB();
    await db.put('outbox', msg);
  }

  async getOutboxMessages(walletAddress: string): Promise<OutboxMessage[]> {
    const db = await this.getDB();
    return await db.getAllFromIndex('outbox', 'by_wallet', walletAddress);
  }

  async removeOutboxMessage(id: string) {
    const db = await this.getDB();
    await db.delete('outbox', id);
  }

  async incrementRetry(id: string) {
    const db = await this.getDB();
    const msg = await db.get('outbox', id);
    if (msg) {
      msg.retryCount += 1;
      await db.put('outbox', msg);
    }
  }

  // --- LOCAL MESSAGE CACHE ---
  async storeMessage(msg: StoredMessage) {
    const db = await this.getDB();
    await db.put('messages', msg);
  }

  async getMessagesForConversation(walletAddress: string, conversationId: string): Promise<StoredMessage[]> {
    const db = await this.getDB();
    const msgs = await db.getAllFromIndex('messages', 'by_conversation', [walletAddress, conversationId]);
    return msgs.sort((a, b) => a.timestamp - b.timestamp);
  }

  // --- MEDIA CACHE ---
  async cacheMediaBlob(url: string, blob: Blob) {
    const db = await this.getDB();
    await db.put('media_cache', { url, blob, timestamp: Date.now() });
  }

  async getCachedMedia(url: string): Promise<Blob | undefined> {
    const db = await this.getDB();
    const res = await db.get('media_cache', url);
    return res?.blob;
  }
}

export const whaleDB = new WhaleDatabase();
