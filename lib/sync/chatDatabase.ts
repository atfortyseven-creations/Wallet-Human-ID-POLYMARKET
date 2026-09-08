import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface LocalMessage {
  id: string;
  peerAddress: string;
  senderAddress: string;
  content: string;
  sentAt: number;
  status: 'sending' | 'sent' | 'failed';
  isMine: boolean;
  isZkVerified?: boolean;
  type?: 'text' | 'voice' | 'payment' | 'system';
  
  // [AEGIS COMPATIBILITY SHIM] TS fixes for Legacy LedgerChat logic
  senderInboxId?: string;
  conversationId?: string;
  burnAtNs?: number;
  sentAtNs?: bigint | number;
  reactions?: any[];
  isPinned?: boolean;
  isDestructing?: boolean;
}

interface LedgerChatDB extends DBSchema {
  messages: {
    key: string;
    value: LocalMessage;
    indexes: { 'by-peer': string; 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<LedgerChatDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LedgerChatDB>('ledger-chat-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('messages', { keyPath: 'id' });
        store.createIndex('by-peer', 'peerAddress');
        store.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
};

export const chatDB = {
  async saveMessage(msg: LocalMessage) {
    const db = await getDB();
    await db.put('messages', msg);
  },
  async getMessagesByPeer(peerAddress: string): Promise<LocalMessage[]> {
    const db = await getDB();
    const msgs = await db.getAllFromIndex('messages', 'by-peer', peerAddress);
    return msgs.sort((a, b) => a.sentAt - b.sentAt);
  },
  async updateStatus(id: string, status: 'sending' | 'sent' | 'failed') {
    const db = await getDB();
    const msg = await db.get('messages', id);
    if (msg) {
      msg.status = status;
      await db.put('messages', msg);
    }
  },
  async getPendingMessages(): Promise<LocalMessage[]> {
    const db = await getDB();
    return db.getAllFromIndex('messages', 'by-status', 'sending');
  }
};