import { Client } from '@xmtp/browser-sdk';
import { AegisEventBus } from '@/lib/core/EventBus';

/**
 * REAL XMTP GROUP CHAT ENGINE (SYNDICATES)
 * Executes real cryptography using XMTP's conversation API. No mock rooms.
 */
export class SyndicateGroupEngine {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Creates a real on-chain/XMTP group (Syndicate)
   */
  public async createSyndicate(addresses: string[], groupName: string) {
    try {
      if (!this.client.conversations.newGroup) {
        throw new Error("XMTP V3 Group feature not available in this client version.");
      }
      
      // XMTP V3 Real Group Creation
      const group = await this.client.conversations.newGroup(addresses);
      
      AegisEventBus.publish('SYNDICATE_CREATED', { groupId: group.id, name: groupName });
      return group;
    } catch (error) {
      console.error("[AEGIS SYNDICATE] Failed to deploy real group:", error);
      throw error;
    }
  }

  /**
   * Syncs and streams real group messages
   */
  public async syncSyndicateMessages(groupId: string) {
    try {
      // Synchronize MLS state with network
      await this.client.conversations.sync();
      
      const groups = await this.client.conversations.listGroups();
      const targetGroup = groups.find(g => g.id === groupId);
      
      if (!targetGroup) throw new Error("Syndicate not found in your encrypted graph.");
      
      const messages = await targetGroup.messages();
      return messages;
    } catch (error) {
      console.error("[AEGIS SYNDICATE] Sync failed:", error);
      return [];
    }
  }
}