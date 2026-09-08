import { Client } from '@xmtp/browser-sdk';
import { chatDB, LocalMessage } from '@/lib/sync/chatDatabase';
import { streamMessages, sendMessage as xmtpSend } from '@/lib/xmtp/client';

export class ChatSyncEngine {
  private client: Client | null = null;
  private abortController: AbortController | null = null;
  private myAddress: string = '';

  constructor(client: Client, address: string) {
    this.client = client;
    this.myAddress = address;
  }

  public async startDaemon() {
    if (!this.client) return;
    this.abortController = new AbortController();

    console.log('[ChatSyncEngine] Quantum Daemon Started for', this.myAddress);

    try {
      const gen = streamMessages(this.client, this.abortController.signal);
      for await (const msg of gen as any) {
        if (this.abortController.signal.aborted) break;

        const resolvedPeerAddr = msg.conversation?.peerAddress?.toLowerCase() || '';
        if (!resolvedPeerAddr) continue;

        const isMine = msg.senderInboxId === this.client.inboxId || msg.senderAddress === this.myAddress;
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

        const localMsg: LocalMessage = {
          id: msg.id,
          peerAddress: resolvedPeerAddr,
          senderAddress: msg.senderAddress || '',
          content,
          sentAt: msg.sentAtNs ? Number(msg.sentAtNs / 1000000n) : msg.sentAt.getTime(),
          status: 'sent',
          isMine,
          type: 'text'
        };

        await chatDB.saveMessage(localMsg);
        window.dispatchEvent(new CustomEvent('ledger_chat_sync', { detail: localMsg }));
      }
    } catch (e) {
      console.error('[ChatSyncEngine] Daemon stream interrupted:', e);
    }
  }

  public stopDaemon() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  public async sendOptimisticMessage(peerAddress: string, content: string) {
    if (!this.client) throw new Error("Client not initialized");
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const msg: LocalMessage = {
      id: tempId, peerAddress: peerAddress.toLowerCase(), senderAddress: this.myAddress,
      content, sentAt: Date.now(), status: 'sending', isMine: true, type: 'text'
    };

    await chatDB.saveMessage(msg);
    window.dispatchEvent(new CustomEvent('ledger_chat_sync', { detail: msg }));

    try {
      await xmtpSend(this.client, peerAddress, content);
      await chatDB.updateStatus(tempId, 'sent');
      window.dispatchEvent(new CustomEvent('ledger_chat_sync_update', { detail: { id: tempId, status: 'sent' } }));
    } catch (error) {
      await chatDB.updateStatus(tempId, 'failed');
      window.dispatchEvent(new CustomEvent('ledger_chat_sync_update', { detail: { id: tempId, status: 'failed' } }));
    }
  }
}