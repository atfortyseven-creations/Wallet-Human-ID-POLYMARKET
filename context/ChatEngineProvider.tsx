"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { ChatSyncEngine } from '@/lib/engine/ChatSyncEngine';
import { WebRTCEngine } from '@/lib/engine/WebRTCEngine';
import { LocalMessage, chatDB } from '@/lib/sync/chatDatabase';
import { Client } from '@xmtp/browser-sdk';
import { useSystemAccount } from '@/hooks/useSystemAccount'; // Assuming this hook exists based on previous logs
import { getXMTPClient } from '@/lib/xmtp/client';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

interface ChatEngineContextType {
  messages: LocalMessage[];
  sendMessage: (peer: string, content: string) => Promise<void>;
  startCall: (peer: string, isVideo: boolean) => Promise<void>;
  endCall: () => void;
  syncEngine: ChatSyncEngine | null;
  rtcEngine: WebRTCEngine | null;
  activePeer: string;
  setActivePeer: (peer: string) => void;
}

const ChatEngineContext = createContext<ChatEngineContextType>({} as any);

export function ChatEngineProvider({ children }: { children: React.ReactNode }) {
  const { address } = useSystemAccount();
  const [client, setClient] = useState<Client | null>(null);
  const [activePeer, setActivePeer] = useState<string>("");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  
  const syncEngineRef = useRef<ChatSyncEngine | null>(null);
  const rtcEngineRef = useRef<WebRTCEngine | null>(null);

  useEffect(() => {
    const initClient = async () => {
      if (address) {
        try {
          const xmtpClient = await getXMTPClient(address);
          setClient(xmtpClient);
        } catch (e) {
          console.error("Failed to init XMTP in provider", e);
        }
      }
    };
    initClient();
  }, [address]);

  // 1. Initialize Engines
  useEffect(() => {
    if (client && address && !syncEngineRef.current) {
      const syncEngine = new ChatSyncEngine(client, address);
      syncEngine.startDaemon();
      syncEngineRef.current = syncEngine;

      const rtcEngine = new WebRTCEngine(address);
      rtcEngine.initialize();
      rtcEngineRef.current = rtcEngine;
    }
    return () => {
      syncEngineRef.current?.stopDaemon();
    };
  }, [client, address]);

  // 2. Local Database Subscription (Optimistic UI)
  useEffect(() => {
    if (!activePeer) return;
    
    const loadMessages = async () => {
      
      const msgs = await chatDB.getMessagesByPeer(activePeer.toLowerCase());
      // [AEGIS AUDIT FIX] Guarantee RenderableMessage compatibility
      const mappedMsgs = msgs.map(m => ({
         ...m,
         reactions: m.reactions || [],
         isPinned: m.isPinned || false,
         isDestructing: m.isDestructing || false
      }));
      setMessages(mappedMsgs as any);

    };
    loadMessages();

    const handleSync = (e: any) => {
      
      const newMsg = e.detail as LocalMessage;
      if (newMsg.peerAddress === activePeer.toLowerCase()) {
        const mappedMsg = {
           ...newMsg,
           reactions: [],
           isPinned: false,
           isDestructing: false
        };
        setMessages(prev => [...prev, mappedMsg as any]);
      }

    };
    const handleUpdate = (e: any) => {
      const { id, status } = e.detail;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    };

    window.addEventListener('ledger_chat_sync', handleSync);
    window.addEventListener('ledger_chat_sync_update', handleUpdate);

    return () => {
      window.removeEventListener('ledger_chat_sync', handleSync);
      window.removeEventListener('ledger_chat_sync_update', handleUpdate);
    };
  }, [activePeer]);

  const sendMessage = async (peer: string, content: string) => {
    await syncEngineRef.current?.sendOptimisticMessage(peer, content);
  };

  const startCall = async (peer: string, isVideo: boolean) => {
    await rtcEngineRef.current?.startCall(peer, isVideo);
  };

  const endCall = () => {
    rtcEngineRef.current?.endCall();
  };

  return (
    <ChatEngineContext.Provider value={{ messages, sendMessage, startCall, endCall, syncEngine: syncEngineRef.current, rtcEngine: rtcEngineRef.current, activePeer, setActivePeer }}>
      {children}
    </ChatEngineContext.Provider>
  );
}

export const useChatEngine = () => useContext(ChatEngineContext);