import { useState, useEffect, useCallback } from 'react';
import { chatDB, LocalMessage } from '@/lib/sync/chatDatabase';
import { sendMessage as sendXmtpMessage } from '@/lib/xmtp/client'; // Assuming this exists

/**
 * Quantum Hook: Manages Optimistic UI and Local-First rendering.
 * Instantly reflects messages on screen and handles background syncing.
 */
export function useOptimisticChat(myAddress: string | undefined, peerAddress: string) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // 1. Load instantly from local DB (Zero Latency)
  const loadLocalMessages = useCallback(async () => {
    if (!peerAddress) return;
    const localMsgs = await chatDB.getMessagesByPeer(peerAddress);
    setMessages(localMsgs);
  }, [peerAddress]);

  useEffect(() => {
    loadLocalMessages();
    
    // Set up an interval to poll DB for updates (e.g. from background worker)
    // In a pure reactive system, we would use an event emitter, but polling IDB is ~1ms.
    const interval = setInterval(loadLocalMessages, 1000);
    return () => clearInterval(interval);
  }, [loadLocalMessages]);

  // 2. Optimistic Send
  const sendMessage = async (content: string) => {
    if (!myAddress || !peerAddress) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const optimisticMsg: LocalMessage = {
      id: tempId,
      peerAddress,
      senderAddress: myAddress,
      content,
      sentAt: Date.now(),
      status: 'sending',
      isMine: true,
      type: 'text'
    };

    // Instantly show on UI & save locally
    setMessages(prev => [...prev, optimisticMsg]);
    await chatDB.saveMessage(optimisticMsg);

    // Background Sync
    try {
      // Execute the actual network call
      // Note: In production, pass the real XMTP client instance here
      await sendXmtpMessage(null as any, peerAddress, content); 
      
      // Update DB and UI to 'sent'
      await chatDB.updateStatus(tempId, 'sent');
      loadLocalMessages();
    } catch (error) {
      console.error('Failed to send message over XMTP:', error);
      await chatDB.updateStatus(tempId, 'failed');
      loadLocalMessages();
    }
  };

  return {
    messages,
    sendMessage,
    isTyping
  };
}