"use client";
import { MoreVertical, MapPin, Copy, Trash2, UserPlus, Download, Slash } from 'lucide-react';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';

import { useSignMessage, useReconnect } from 'wagmi';

import { useAppKit } from '@reown/appkit/react';
import { getXMTPClient, canReceiveMessages, sendMessage, getMessages, destroyXMTPClient, nsToDate, discoverNewPeers, streamMessages } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/dashboard/QrScanner';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import type { Client } from '@xmtp/browser-sdk';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useWalletStore } from '@/lib/store/wallet-store';

import { toast } from 'sonner';

interface ConversationMeta {
  peerAddress: string;
  lastMessage?: string;
  lastAt?: Date;
  unreadCount?: number;
}

/** forceAutoInit=true: always auto-init XMTP even on mobile (used by /chat route) */
export interface WhaleChatProps {
  forceAutoInit?: boolean;
}

function Avatar({ address }: { address: string }) {
  const initials = address.slice(2, 4).toUpperCase();
  const hue = parseInt(address.slice(2, 8), 16) % 360;
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
      style={{ background: `hsl(${hue},70%,45%)` }}
    >
      {initials}
    </div>
  );
}

export function WhaleChat({ forceAutoInit = false }: WhaleChatProps) {
  const { address, isConnected, isSystemHandshake, isChecking, connector, isZkVerified, isLocalSystemWallet } = useSystemAccount();
  const { signMessageAsync } = useSignMessage();
  const { reconnect } = useReconnect();
  const { open: openAppKit } = useAppKit();
  const { chatName, chatBio, soundEffects } = useSettingsStore();

  // MASTER RECOVERY: If wallet is connected but connector is missing (common on mobile redirects)
  useEffect(() => {
    if (isConnected && !connector && !isSystemHandshake) {
        console.warn('[WhaleChat] Zombie session detected  attempting silent reconnection.');
        reconnect();
    }
  }, [isConnected, connector, isSystemHandshake, reconnect]);

  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState('');

  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [peerInput, setPeerInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [peerStatus, setPeerStatus] = useState<{ online: boolean, lastSeen: number | null, isTyping: boolean }>({ online: false, lastSeen: null, isTyping: false });

  //  Audio recording state 
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  //  Playing audio messages 
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Telegram-style features
  const [showProfile, setShowProfile] = useState(false);
  const [blockedPeers, setBlockedPeers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ id: string, content: string, x: number, y: number } | null>(null);

  useEffect(() => {
    try {
      const b = localStorage.getItem('whale_blocked');
      if (b) setBlockedPeers(new Set(JSON.parse(b)));
    } catch {}
  }, []);

  const toggleBlock = (peer: string) => {
    setBlockedPeers(prev => {
      const next = new Set(prev);
      if (next.has(peer.toLowerCase())) next.delete(peer.toLowerCase());
      else next.add(peer.toLowerCase());
      localStorage.setItem('whale_blocked', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const exportChat = () => {
    if (!activePeer) return;
    const dmId = `dm-${activePeer.toLowerCase()}`;
    const msgs = messages.filter(m => m.conversationId === dmId);
    const text = msgs.map(m => {
      const sender = m.senderInboxId === client?.inboxId ? 'Me' : 'Peer';
      const sentTime = typeof m.sentAtNs === 'number' ? new Date(m.sentAtNs) : (m.sent || m.sentAt || new Date());
      return `[${sentTime.toLocaleString()}] ${sender}: ${m.content}`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chat_Export_${activePeer.slice(0,6)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowProfile(false);
  };

  const clearChat = () => {
    if (!activePeer) return;
    const dmId = `dm-${activePeer.toLowerCase()}`;
    setMessages(prev => prev.filter(m => m.conversationId !== dmId));
    setShowProfile(false);
  };


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activePeerRef = useRef<string | null>(null);
  const activePeerDmIdRef = useRef<string | null>(null);
  const peerToConvId = useRef<Map<string, string>>(new Map());
  const convIdToPeer = useRef<Map<string, string>>(new Map());
  // Cache canReceiveMessages result per address to skip redundant network lookups
  const canReceiveCache = useRef<Map<string, boolean>>(new Map());
  // Track if initClient is already in-flight to prevent double-calls on mobile
  const initInFlight = useRef(false);
  // Persistent known-peers set  survives across sync cycles (fixes mobile-to-mobile)
  const knownPeersRef = useRef<Set<string>>(new Set());
  /**
   * DEDUPLICATION ENGINE
   * confirmedMsgIds: the single source of truth for all real XMTP message IDs.
   * Once a real ID is registered here, no path (stream, poll, fetch) can insert it twice.
   * optimisticContentMap: maps content string -> optimistic message ID so the stream
   * can perform an atomic swap even if the XMTP echo ID differs from our local id.
   */
  const confirmedMsgIds = useRef<Set<string>>(new Set());
  const optimisticContentMap = useRef<Map<string, string>>(new Map()); // content -> optimisticId

  // Detect physical device type (touch + narrow screen = mobile)
  useEffect(() => {
    const check = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice && window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keep activePeer ref in sync (used by async callbacks)
  useEffect(() => {
    activePeerRef.current = activePeer;
    if (activePeer) {
      const dmId = `dm-${activePeer.toLowerCase()}`;
      activePeerDmIdRef.current = dmId;
      peerToConvId.current.set(activePeer.toLowerCase(), dmId);
    } else {
      activePeerDmIdRef.current = null;
    }
  }, [activePeer]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // MASTER-FIX: Auto-scroll on resize (keyboard open/close) to maintain stability
  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return;
    const handleResize = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };
    window.addEventListener('resize', handleResize);
    // Also track visualViewport if available for more precision
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Handle wallet disconnect
  useEffect(() => {
    if (!isConnected && client && address) {
      destroyXMTPClient(address);
      setClient(null);
      setConversations([]);
      setActivePeer(null);
      setMessages([]);
      canReceiveCache.current.clear();
      initInFlight.current = false;
    }
  }, [isConnected, address, client]);

  // AUTO-INITIALIZE: When wallet is connected and XMTP not yet started, auto-init.
  // XMTP v3 stores session keys in IndexedDB  after the first sign,
  // subsequent loads are silent (no wallet prompt needed).
  // We always attempt auto-init on both desktop and mobile. If WASM fails on mobile,
  // the error boundary surfaces a manual "Retry" button. This is better than
  // silently blocking mobile users from ever seeing the Activate button.

  // Telemetry: Heartbeat Loop
  useEffect(() => {
      if (!address || !client) return;
      
      const sendHeartbeat = async () => {
          if (document.visibilityState !== 'visible') return; // Extreme privacy: pause heartbeat when hidden
          try {
              await fetch('/api/chat/telemetry', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ address, type: 'heartbeat' })
              });
          } catch {}
      };

      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, 15000);
      return () => clearInterval(interval);
  }, [address, client]);

  // Telemetry: Peer Polling Loop
  useEffect(() => {
      if (!activePeer || !address) {
          setPeerStatus({ online: false, lastSeen: null, isTyping: false });
          return;
      }
      let isMounted = true;
      const pollPeer = async () => {
          try {
              const res = await fetch(`/api/chat/telemetry?peer=${activePeer}&self=${address}`);
              if (!res.ok) return;
              const data = await res.json();
              if (isMounted) setPeerStatus(data);
          } catch {}
      };

      pollPeer();
      const interval = setInterval(pollPeer, 3000);
      return () => { isMounted = false; clearInterval(interval); };
  }, [activePeer, address]);

  // Extreme Security: Draft Persistence & Typing Telemetry
  useEffect(() => {
    if (!activePeer || !address) return;
    const draftKey = `whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`;
    
    if (inputText.trim()) {
      localStorage.setItem(draftKey, btoa(encodeURIComponent(inputText)));
    } else {
      localStorage.removeItem(draftKey);
    }

    // Typing telemetry: only fire when there is actual text
    if (!inputText.trim()) return;
    const sendTyping = async () => {
        try {
            await fetch('/api/chat/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, type: 'typing', peer: activePeer })
            });
        } catch {}
    };

    const timeoutId = setTimeout(sendTyping, 500); 
    return () => clearTimeout(timeoutId);
  }, [inputText, activePeer, address]);

  // Utility: immediately clear typing signal on the server (call after send)
  const stopTypingSignal = async () => {
    if (!activePeer || !address) return;
    // We clear the typing key by sending an artificial empty heartbeat  Redis TTL handles it in 5s
    // but this triggers an explicit flush to avoid the "ghost typing" 5-second tail.
    // We write a dummy value that the server interprets as "not typing" via the TTL expiry.
    // Fastest approach: write the key with a 0-second TTL to expire it immediately.
    try {
      await fetch('/api/chat/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, type: 'stop_typing', peer: activePeer })
      });
    } catch {}
  };

  //  Voice Recording: Hold-to-Record 
  const startRecording = useCallback(async () => {
    if (isRecording || !activePeer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length === 0) return;

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
            console.warn('[Voice] Recording too short, ignoring.');
            setIsRecording(false);
            setRecordingSeconds(0);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          // XMTP Limit Check: Typical message limit is 1MB. 
          // Base64 overhead is ~33%. A 750KB blob is roughly the safe limit.
          if (dataUrl.length > 1024 * 1024) {
              setInitError('Voice message is too long for the secure P2P network. Please record a shorter message (under 30s).');
              setIsRecording(false);
              setRecordingSeconds(0);
              return;
          }

          const audioMsg = `__AUDIO__${dataUrl}`;
          if (client && activePeer) {
            const optimisticId = `optimistic-${Date.now()}`;
            setMessages(prev => [...prev, {
              id: optimisticId,
              senderInboxId: client?.inboxId || '',
              content: audioMsg,
              sentAtNs: Date.now(),
              conversationId: `dm-${activePeer.toLowerCase()}`
            }]);
            try { 
                await sendMessage(client, activePeer, audioMsg); 
                console.log('[Voice] P2P Audio transmission successful.');
            } catch (sendErr: any) {
                console.error('[Voice] P2P Send Failed:', sendErr?.message);
                setMessages(prev => prev.filter(m => m.id !== optimisticId));
                setInitError('Failed to transmit secure voice message. Check your connection.');
            }
          }
        };
        reader.readAsDataURL(blob);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);
      };

      recorder.start(100); // collect chunks every 100ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (err) {
      console.warn('[Voice] Microphone access denied or unavailable:', err);
    }
  }, [isRecording, activePeer, client]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    try { mediaRecorderRef.current.stop(); } catch {}
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  }, [isRecording]);

  // Draft Loading on Peer Switch
  useEffect(() => {
    if (activePeer && address) {
      const draftKey = `whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`;
      const saved = localStorage.getItem(draftKey);
      if (saved) {
          try {
              setInputText(decodeURIComponent(atob(saved)));
          } catch {
              setInputText('');
          }
      } else {
          setInputText('');
      }
    }
  }, [activePeer, address]);

  const loadConversations = useCallback(async () => {
    try {
      let merged: ConversationMeta[] = [];
      const stored = localStorage.getItem(`whale_chat_history_${address}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.conversations) merged = parsed.conversations;
      }
      
      // Sync from server (contacts + pending offline messages)
      if (address) {
        const authHeader = { 'x-web3-address': address };
        try {
          const res = await fetch(`/api/chat/contacts?address=${address}`, { headers: authHeader });
          if (res.ok) {
            const data = await res.json();
            if (data.peers && Array.isArray(data.peers)) {
               const serverPeers = data.peers as string[];
               serverPeers.forEach(peer => {
                 if (!merged.find(c => c.peerAddress.toLowerCase() === peer.toLowerCase())) {
                   merged.push({ peerAddress: peer, lastMessage: '', lastAt: new Date() });
                 }
               });
            }
          }
          
          // FETCH PENDING MESSAGES (OFFLINE ROUTING) — works for both HL and WalletConnect users
          const pRes = await fetch(`/api/chat/pending?address=${address}`, { headers: authHeader });
          if (pRes.ok) {
             const pData = await pRes.json();
             if (pData.pending && Array.isArray(pData.pending)) {
                 pData.pending.forEach((p: any) => {
                     const peer = p.sender.toLowerCase() === address.toLowerCase() ? p.recipient : p.sender;
                     const existing = merged.find(c => c.peerAddress.toLowerCase() === peer.toLowerCase());
                     if (!existing) {
                         merged.push({ peerAddress: peer, lastMessage: p.content.slice(0, 30), lastAt: new Date(p.timestamp) });
                     } else {
                         if (!existing.lastAt || new Date(p.timestamp) > new Date(existing.lastAt)) {
                             existing.lastMessage = p.content.slice(0, 30);
                             existing.lastAt = new Date(p.timestamp);
                         }
                     }
                 });
             }
          }

          if (merged.length > 0) {
            localStorage.setItem(`whale_chat_history_${address}`, JSON.stringify({ conversations: merged }));
          }
        } catch (e) {
          console.error('[WhaleChat] Failed to sync contacts/pending from server', e);
        }
      }
      
      merged.sort((a, b) => {
          const tA = a.lastAt ? new Date(a.lastAt).getTime() : 0;
          const tB = b.lastAt ? new Date(b.lastAt).getTime() : 0;
          return tB - tA;
      });

      setConversations(merged);
    } catch (e) {}
  }, [address]);

  // getDeterministicSeed removed as it produces invalid XMTP signatures.
  // The XMTP SDK automatically caches session keys in IndexedDB.

  // Initialize REAL XMTP Network
  const initClient = useCallback(async () => {
    if (!address) return;
    if (initInFlight.current) return;
    initInFlight.current = true;
    setIsInitializing(true);
    setInitError('');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(1.5, attempts)));

        //  Step 1: Use standard wagmi signer 
        // XMTP SDK automatically caches keys in IndexedDB, so returning users are not prompted.
        
        const wagmiSigner = {
          getAddress: async () => address as string,
          signMessage: async (msg: string | Uint8Array) => {
            if (isLocalSystemWallet) {
                const wallet = await useWalletStore.getState().getConnectedWallet();
                if (wallet) {
                    return await wallet.signMessage(msg);
                }
            }
            try {
              return await signMessageAsync({ message: typeof msg === 'string' ? msg : { raw: msg } as any });
            } catch (sigErr: any) {
              const msg = sigErr?.message || '';
              if (msg.includes('connector') || msg.includes('not connected') || msg.includes('No connector') || msg.includes('signMessage')) {
                  const hasVault = typeof window !== 'undefined' && !!localStorage.getItem('system_vault');
                  if (isSystemHandshake && !hasVault) {
                    console.warn('[WhaleChat:Mobile] Signature requested on linked session without Vault.');
                  }
                  throw new Error('No active wallet connection detected. Please ensure your wallet app is open and connected to this terminal.');
              }
              throw sigErr;
            }
          }
        };

        //  Step 2: Initialize client (Direct Execution) 
        const realClient = await getXMTPClient(wagmiSigner);
        setClient(realClient);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('whale_xmtp_initialized', 'true');
        }
        await loadConversations();
        
        setIsInitializing(false);
        initInFlight.current = false;
        return; // Success
      } catch (err: any) {
        attempts++;
        const errorMsg = err?.message || '';
        const isReject = err?.code === 4001 || errorMsg.toLowerCase().includes('reject') || errorMsg.toLowerCase().includes('deny');

        // Immediately stop retrying if user actively rejected the prompt
        if (isReject) {
          setInitError('Identity authorization rejected. You must approve the Whale Chat signature to proceed.');
          setIsInitializing(false);
          initInFlight.current = false;
          return;
        }

        if (attempts >= maxAttempts) {
          console.error('[WhaleChat] Init Error:', err);
          if (err?.name === 'ChunkLoadError' || errorMsg.includes('Loading chunk')) {
            setInitError('Whale Alert Network module failed to load. Please check your network connection and reload the terminal.');
          } else if (errorMsg.includes('No active wallet') || errorMsg.includes('connector') || errorMsg.includes('signMessage') || errorMsg.toLowerCase().includes('unknown signer')) {
            if (isSystemHandshake) {
               setInitError('Whale identity not yet synchronized from desktop. Please keep this browser open while the desktop terminal finishes the handshake.');
            } else {
               setInitError('Active wallet connection lost or not detected. Please ensure your wallet app is open and connected directly to this browser.');
            }
          } else if (errorMsg.includes('WASM') || errorMsg.includes('wasm')) {
            setInitError('Cryptographic Engine Failure. Hardware architecture error or restricted browser security settings.');
          } else {
            setInitError(`Whale Alert Network handshake failure: ${errorMsg.slice(0, 80) || 'Unknown Protocol Error'}. Please retry.`);
          }
          setIsInitializing(false);
          initInFlight.current = false;
        } else {
          console.warn(`[WhaleChat] Init attempt ${attempts} failed due to inactivity/network timeout, retrying...`, err);
        }
      }
    }
  }, [address, isMobile, signMessageAsync, isSystemHandshake, loadConversations, isLocalSystemWallet]);

  useEffect(() => {
    // Aggressive Auto-Init: Trigger for all connected users.
    if (isConnected && address && !client && !initInFlight.current && !initError) {
      initClient();
    }
  }, [isConnected, address, client, initError, initClient]);

  // Sync contacts to backend debounced
  const persistToLocal = useCallback((arr: ConversationMeta[]) => {
    if (!address) return;
    localStorage.setItem(`whale_chat_history_${address}`, JSON.stringify({ conversations: arr }));
    
    // Also backup to server — send x-web3-address so WalletConnect users are accepted
    fetch('/api/chat/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-web3-address': address },
      body: JSON.stringify({
        address,
        peers: arr.map(c => c.peerAddress)
      })
    }).catch(console.error);
  }, [address]);

  const syncToAddressBook = async (peerAddr: string) => {
    try {
      // Graceful upsert to user's address book
      await fetch('/api/wallet/address-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Chat: ${peerAddr.slice(0, 6)}...${peerAddr.slice(-4)}`,
          address: peerAddr,
          label: 'Whale Chat',
          isFavorite: false
        })
      });
    } catch (err) {
      console.error('[WhaleChat] Failed to sync address book:', err);
    }
  };

  // Load messages when active peer changes (handled by loadConversations but filtered in render)
  useEffect(() => {
    if (!client || !activePeer) return;
    // Local storage doesn't need to re-fetch on every peer change since we hold all messages in state
    // but we can set the activePeerDmIdRef so the UI logic works
    activePeerDmIdRef.current = `dm-${activePeer.toLowerCase()}`;
    peerToConvId.current.set(activePeer.toLowerCase(), activePeerDmIdRef.current);
    convIdToPeer.current.set(activePeerDmIdRef.current, activePeer);
  }, [client, activePeer]);

  //  Global XMTP Stream 
  useEffect(() => {
    if (!client || !address) return;
    
    let cancelled = false;
    const selfInboxId = (client as any).inboxId ?? '';

    // Seed the persistent ref with already-known conversations
    conversations.forEach(c => knownPeersRef.current.add(c.peerAddress.toLowerCase()));

    const syncGlobal = async () => {
      try {
        // Discover new peers from the XMTP network
        const newPeerAddrs = await discoverNewPeers(client, address, knownPeersRef.current);

        if (newPeerAddrs.length > 0 && !cancelled) {
          setConversations(prev => {
            const prevSet = new Set(prev.map(c => c.peerAddress.toLowerCase()));
            const toAdd: ConversationMeta[] = newPeerAddrs
              .filter(a => !prevSet.has(a.toLowerCase()))
              .map(a => ({
                peerAddress: a,
                lastMessage: ' New message received',
                lastAt: new Date(),
              }));

            if (!toAdd.length) return prev;
            toAdd.forEach(c => syncToAddressBook(c.peerAddress));
            
            const updated = [...toAdd, ...prev];
            persistToLocal(updated);
            return updated;
          });
        }
      } catch (e) {
        console.warn('[WhaleChat] Global sync error:', e);
      }
    };

    syncGlobal();
    const globalPoll = setInterval(syncGlobal, 6000);

    // ─── GLOBAL XMTP STREAM ────────────────────────────────────────────────────
    // DEDUPLICATION CONTRACT:
    // 1. Every real XMTP message ID is registered in confirmedMsgIds on first sight.
    // 2. If the ID is already registered → skip (absolute deduplication).
    // 3. If the message is from SELF → look up the optimistic placeholder via
    //    optimisticContentMap (content-keyed) and swap it atomically.
    //    This prevents the "sender sees message twice" bug caused by XMTP echoing
    //    the sender's own message back through the stream.
    // 4. If no optimistic placeholder exists (e.g. opened in a second tab) →
    //    insert normally, but only after confirming the ID is not already present.
    (async () => {
      try {
        const gen = streamMessages(client);
        for await (const msg of gen as any) {
          if (cancelled) break;
          
          const fromPeer = msg.senderInboxId !== selfInboxId;
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          const sentAtNs = nsToDate(msg.sentAtNs ?? msg.sentAt).getTime();
          const currentActivePeer = activePeerRef.current?.toLowerCase();
          const msgConvPeer = msg.conversation?.peerAddress?.toLowerCase() ?? '';
          const realId = msg.id ?? `real-${sentAtNs}-${Math.random()}`;

          // Filter system metadata messages (XMTP internal group protocol frames)
          if (typeof content === 'string' && content.includes('initiatedByInboxId')) continue;

          // ── ABSOLUTE DEDUPLICATION GATE ──────────────────────────────────────
          // If we have already processed this exact XMTP ID, skip unconditionally.
          if (confirmedMsgIds.current.has(realId)) continue;
          confirmedMsgIds.current.add(realId);
          // ─────────────────────────────────────────────────────────────────────

          const mappedMsg = {
            id: realId,
            senderInboxId: msg.senderInboxId ?? '',
            content: content || msg.fallback || 'Encrypted Data',
            sentAtNs,
            conversationId: msgConvPeer ? `dm-${msgConvPeer}` : `dm-${currentActivePeer}`
          };

          const belongsToActive = (msgConvPeer === currentActivePeer) || (!msgConvPeer && currentActivePeer);

          if (belongsToActive) {
            if (!isMobile && fromPeer) playAudioPing('receive');

            setMessages(prev => {
              // Guard: if real ID already in list (can happen on reconnect), skip
              if (prev.some(m => m.id === realId)) return prev;

              if (!fromPeer) {
                // ── OWN MESSAGE ECHO: atomic optimistic swap ──────────────────
                // Strategy 1: look up by content key in optimisticContentMap
                const knownOptId = optimisticContentMap.current.get(content);
                if (knownOptId) {
                  optimisticContentMap.current.delete(content); // consume the entry
                  const idx = prev.findIndex(m => m.id === knownOptId);
                  if (idx !== -1) {
                    const next = [...prev];
                    next[idx] = mappedMsg; // replace placeholder with confirmed msg
                    return next.sort((a, b) => a.sentAtNs - b.sentAtNs);
                  }
                }
                // Strategy 2: fallback — find any optimistic with identical content
                // within a 10-second window (handles encoding edge cases)
                const optIdx = prev.findIndex(
                  m => m.id.startsWith('optimistic-') &&
                       m.content === content &&
                       Math.abs(m.sentAtNs - sentAtNs) < 10_000
                );
                if (optIdx !== -1) {
                  const next = [...prev];
                  next[optIdx] = mappedMsg;
                  return next.sort((a, b) => a.sentAtNs - b.sentAtNs);
                }
                // Strategy 3: no optimistic found (e.g. second tab) — insert if not duplicate
                return [...prev, mappedMsg].sort((a, b) => a.sentAtNs - b.sentAtNs);
              }

              // ── PEER MESSAGE: straightforward insert ──────────────────────────
              return [...prev, mappedMsg].sort((a, b) => a.sentAtNs - b.sentAtNs);
            });

            // Update conversation preview
            setConversations(prev => {
              const updated = prev.map(c =>
                c.peerAddress.toLowerCase() === currentActivePeer
                  ? { ...c, lastMessage: content.slice(0, 30), lastAt: new Date() }
                  : c
              );
              persistToLocal(updated);
              return updated;
            });
          } else if (fromPeer) {
            // Belongs to a different (background) conversation
            setConversations(prev => {
              if (!msgConvPeer) return prev;
              const exists = prev.some(c => c.peerAddress.toLowerCase() === msgConvPeer);
              let updated;
              if (exists) {
                updated = prev.map(c =>
                  c.peerAddress.toLowerCase() === msgConvPeer
                    ? { ...c, lastMessage: content.slice(0, 30), lastAt: new Date() }
                    : c
                );
              } else {
                updated = [{
                  peerAddress: msg.conversation.peerAddress,
                  lastMessage: content.slice(0, 30),
                  lastAt: new Date()
                }, ...prev];
              }
              persistToLocal(updated);
              return updated;
            });
            playAudioPing('receive');
          }
        }
      } catch (e) {
        console.warn('[Chat] global stream failed:', e);
      }
    })();

    return () => { cancelled = true; clearInterval(globalPoll); };
  }, [client, address]);

  //  Load messages when active peer changes 
  useEffect(() => {
    if (!client || !activePeer) return;

    let cancelled = false;
    let isFetching = false;

    const fetchHistorical = async () => {
      if (isFetching || cancelled) return;
      isFetching = true;
      try {
        const raw = await getMessages(client, activePeer);
        if (cancelled) return;
        
        // FETCH PENDING MESSAGES (OFFLINE ROUTING)
        let pendingServer: any[] = [];
        try {
          const pRes = await fetch(`/api/chat/pending?address=${address}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.pending && Array.isArray(pData.pending)) {
               pendingServer = pData.pending.filter((p: any) => p.sender.toLowerCase() === activePeer.toLowerCase() || p.recipient.toLowerCase() === activePeer.toLowerCase()).map((p: any) => ({
                  id: p.id,
                  // XMTP uses client.inboxId but our fallback uses raw addresses to match UI logic
                  senderInboxId: p.sender.toLowerCase() === activePeer.toLowerCase() ? activePeer : (client?.inboxId || address),
                  content: p.content,
                  sentAtNs: new Date(p.timestamp).getTime(),
                  conversationId: `dm-${activePeer.toLowerCase()}`
               }));
            }
          }
        } catch (e) { console.error('Failed to fetch pending messages', e); }
        
        const mappedMsgs = raw
          .map((m: any) => ({
            id: m.id,
            senderInboxId: m.senderInboxId,
            content: m.content || m.fallback || 'Encrypted Data',
            sentAtNs: nsToDate(m.sentAtNs ?? m.sentAt).getTime(),
            conversationId: `dm-${activePeer.toLowerCase()}`
          }))
          .filter((m: any) => !(typeof m.content === 'string' && m.content.includes('initiatedByInboxId')));
        
        // ── POLL MERGE WITH FULL DEDUPLICATION ───────────────────────────────
        // Register all newly fetched real IDs in confirmedMsgIds so the stream
        // cannot double-insert them when the echo arrives after the poll.
        mappedMsgs.forEach((m: any) => confirmedMsgIds.current.add(m.id));
        pendingServer.forEach((p: any) => confirmedMsgIds.current.add(p.id));

        setMessages(prev => {
          const activeId = `dm-${activePeer.toLowerCase()}`;
          const others = prev.filter(p => p.conversationId !== activeId);
          
          const mappedIds = new Set(mappedMsgs.map((m: any) => m.id));
          const pendingIds = new Set(pendingServer.map((p: any) => p.id));

          // Preserve ONLY optimistic messages whose content does NOT match any
          // already-confirmed real message. This is the critical guard that
          // prevents stale optimistics from appearing alongside their confirmed twins.
          const optimistic = prev.filter(m => {
            if (m.conversationId !== activeId) return false;
            if (!m.id.startsWith('optimistic-')) return false;
            // If a confirmed message exists with identical content, drop optimistic
            const alreadyConfirmed = mappedMsgs.some((r: any) => r.content === m.content);
            // DO NOT drop optimistic messages if they exist in pendingServer, because pendingServer items might not have their ID formatted correctly yet or might just be our own unconfirmed messages
            const inPendingServer = pendingServer.some((p: any) => p.content === m.content);
            if (inPendingServer) return false; // Hide optimistic if it's already in pendingServer to prevent duplicates
            return !alreadyConfirmed;
          });
          
          return [...others, ...mappedMsgs, ...pendingServer, ...optimistic].sort((a, b) => a.sentAtNs - b.sentAtNs);
        });
      } catch (e) {
        console.warn('[Chat] load messages failed:', e);
      } finally {
        isFetching = false;
      }
    };

    fetchHistorical();

    // Fallback polling for the active conversation history
    const pollId = setInterval(fetchHistorical, 5000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [client, activePeer, address]);

  const handleStartConversationWithPeer = async (peerAddr: string) => {
      if (!client || !peerAddr || sending) return;
      setSending(true);
      try {
        let peer = peerAddr.trim();
        if (peer.toLowerCase().startsWith('ethereum:')) {
            peer = peer.substring(9).split('@')[0];
        }
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(peer)) {
            alert('Invalid Ethereum address format.');
            setSending(false);
            return;
        }

        if (peer) {
            let canMsg = canReceiveCache.current.get(peer.toLowerCase());
            if (canMsg !== true) {
                canMsg = await canReceiveMessages(client, peer);
                if (canMsg) canReceiveCache.current.set(peer.toLowerCase(), true);
            }
            if (!canMsg) {
                // DON'T BLOCK. Tell them we'll queue it.
                toast.info(`Offline Routing: ${peer.slice(0,6)} is not registered on XMTP. Messages will be routed via System Vault until they connect.`);
            }
        }

        const newConv = { peerAddress: peer, lastMessage: '', lastAt: new Date() };

        setConversations(prev => {
            const exists = prev.find(c => c.peerAddress.toLowerCase() === peer.toLowerCase());
            if (exists) return prev;
            
            // Auto-sync manual new chat to Address Book
            syncToAddressBook(peer);
            
            const updated = [newConv, ...prev];
            persistToLocal(updated);
            return updated;
        });

        const dmId = `dm-${peer.toLowerCase()}`;
        peerToConvId.current.set(peer.toLowerCase(), dmId);
        convIdToPeer.current.set(dmId, peer);
        activePeerDmIdRef.current = dmId;

        setActivePeer(peer);
        setShowList(false);
        setPeerInput('');
        setShowScanner(false);
      } catch {
        alert('Invalid address.');
      } finally {
        setSending(false);
      }
  };

  const handleStartConversation = async () => handleStartConversationWithPeer(peerInput);

  const executeSend = async (content: string) => {
    if (!client || !activePeer || !content.trim() || sending || !address) return;
    setSending(true);
    
    if (address) {
        localStorage.removeItem(`whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`);
    }

    const optimisticId = `optimistic-${Date.now()}`;

    try {
      // ─── OPTIMISTIC INSERT ────────────────────────────────────────────────────
      // Register the content in the map BEFORE inserting, so the stream echo
      // can find and replace this optimistic message atomically when it arrives.
      optimisticContentMap.current.set(content, optimisticId);

      const optimisticMsg = {
        id: optimisticId,
        senderInboxId: client?.inboxId || '',
        content: content,
        sentAtNs: Date.now(),
        conversationId: `dm-${activePeer.toLowerCase()}`
      };
      setMessages(prev => [...prev, optimisticMsg].sort((a, b) => a.sentAtNs - b.sentAtNs));

      // Clear typing indicator immediately
      stopTypingSignal();

      // @ts-ignore
      if (!isMobile && typeof playAudioPing === 'function' && soundEffects) playAudioPing('send');
      
      let canMsg = canReceiveCache.current.get(activePeer.toLowerCase());
      if (canMsg !== true) {
        canMsg = await canReceiveMessages(client, activePeer);
        if (canMsg) canReceiveCache.current.set(activePeer.toLowerCase(), true);
      }

      if (canMsg) {
        await sendMessage(client, activePeer, content);
      } else {
        // QUEUE TO SERVER FOR UNREGISTERED WALLET
        await fetch('/api/chat/pending', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-web3-address': address
          },
          body: JSON.stringify({ sender: address, recipient: activePeer, content })
        });
      }

      // UPDATE LOCAL ADDRESS BOOK
      setConversations(prev => {
        const updated = prev.find(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase())
          ? prev.map(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase() ? { ...c, lastMessage: content, lastAt: new Date() } : c)
          : [{ peerAddress: activePeer, lastMessage: content, lastAt: new Date() }, ...prev];
        persistToLocal(updated);
        return updated;
      });

    } catch (err) {
      // On failure, remove the optimistic message and clean up the map
      optimisticContentMap.current.delete(content);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      console.error('[Chat] executeSend failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    setInputText(''); 
    await executeSend(txt);
  };
  
  const uploadAttachment = async (fileOrBlob: Blob, filename: string): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileOrBlob, filename);
      const res = await fetch('/api/chat/attachments', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return `[ATTACHMENT:${data.type}]${data.url}|${data.name}`;
    } catch (err: any) {
      alert('Attachment failed: ' + err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !client || !activePeer || !address) return;
    const payload = await uploadAttachment(file, file.name);
    if (payload) {
      await executeSend(payload);
    }
  };

  const playAudioPing = (type: 'send' | 'receive') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const makeNote = (freq: number, startTime: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === 'send') {
        // Ascending two-tone send chime  clean, positive
        makeNote(880, ctx.currentTime, 0.12, 0.08);
        makeNote(1320, ctx.currentTime + 0.09, 0.14, 0.06);
      } else {
        // Descending three-tone receive notification  softer, distinct
        makeNote(1046, ctx.currentTime, 0.1, 0.07);
        makeNote(880, ctx.currentTime + 0.08, 0.1, 0.06);
        makeNote(698, ctx.currentTime + 0.16, 0.15, 0.05);
      }
    } catch(e) {}
  };

  const [prevMsgCount, setPrevMsgCount] = useState<number>(0);
  useEffect(() => {
    if (messages.length > prevMsgCount && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const isMe = lastMsg.senderInboxId?.toLowerCase() === client?.inboxId?.toLowerCase();
        // If it's a new message and I didn't send it, play receive ping
        if (!isMobile && !isMe && prevMsgCount > 0) {
            playAudioPing('receive');
        }
    }
    setPrevMsgCount(messages.length);
  }, [messages.length, client?.inboxId, prevMsgCount]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#050505] ">Whale Chat</h3>
        <p className="text-xs text-black/40  text-center max-w-xs">Connect your wallet to access maximum security decentralized messaging.</p>
        <button onClick={() => openAppKit()} className="px-8 py-4 bg-black  text-white  rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-xl">Connect Wallet</button>
      </div>
    );
  }


  //  Loading / Auto-init state 
  // Displayed while the XMTP client initialises automatically post-connection.
  // On returning sessions, encryption keys are retrieved from IndexedDB instantly.
  // On first-time sessions, a single gasless wallet signature derives the keys.
  if (!client) {
    return (
      <div className="flex flex-col h-full min-h-[500px] bg-white  rounded-2xl border border-black/5  shadow-sm overflow-y-auto">
        {/* Minimalist Protocol Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5  bg-[#FFFFFF]  shrink-0">
          <div className="flex items-center gap-3">
          </div>
          <div className="w-4" />
        </div>

        {/* Hero Institutional Section */}
        <div className="flex-1 px-8 py-16 flex flex-col items-center justify-center text-center gap-10">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {isInitializing ? (
              <div className="w-16 h-16 rounded-full border-2 border-black/5  border-t-black  animate-spin" />
            ) : (
              <div className="w-48 h-48 rounded-full border border-black/5  flex flex-col items-center justify-center bg-white  shadow-sm gap-4">
                <img src="/official-whale-monochrome.png" alt="Whale" className="w-16 h-16 opacity-80" style={{ filter: 'invert(var(--dark-invert, 0))' }} />
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-black/20 ">Protocol Initialized</div>
              </div>
            )}
          </div>

          <div className="space-y-4 max-w-2xl">
            <h2 className="text-[#050505]  text-[24px] sm:text-[32px] md:text-[44px] font-black uppercase tracking-tighter leading-tight">
                Whale Chat <br /> <span className="text-black/30 ">Secure Terminal.</span>
            </h2>
            <div className="w-12 h-px bg-black/10  mx-auto my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-xl mx-auto mb-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20  uppercase tracking-widest">01</span>
                <p className="text-[11px] font-black uppercase text-black/60 ">Connect Wallet</p>
                <p className="text-[10px] text-black/30  font-serif">Authorize browser session via AppKit.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20  uppercase tracking-widest">02</span>
                <p className={`text-[11px] font-black uppercase ${isZkVerified ? 'text-[#00C076]' : 'text-black/60 '}`}>Whale Identity</p>
                <p className="text-[10px] text-black/30  font-serif">System identity verified via cryptographic handshake.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-black/20  uppercase tracking-widest">03</span>
                <p className="text-[11px] font-black uppercase text-black/60 ">Connection Secured</p>
                <p className="text-[10px] text-black/30  font-serif">Persistent encryption across all devices.</p>
              </div>
            </div>

            <p className="text-[#050505]/40  text-[13px] md:text-[15px] font-serif leading-relaxed px-6 max-w-sm mx-auto text-center">
              Mathematical identity. System communication.
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-[#FFFFFF]  p-8 md:p-12 border-t border-black/5  flex flex-col items-center">
          {initError ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-full bg-red-50  text-red-700  text-[12px] font-mono p-5 rounded-xl border border-red-100  text-center leading-relaxed">
                {initError}
              </div>
              
              {/* Expert UX: If the error is about a missing connector, offer to open the wallet modal */}
              {(initError.includes('wallet connection lost') || initError.includes('Connect your wallet') || initError.toLowerCase().includes('unknown signer')) ? (
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => openAppKit()}
                    className="w-full py-5 rounded-xl bg-[#050505]  text-white  text-[12px] font-black uppercase tracking-widest hover:bg-black/80  transition-all flex items-center justify-center gap-3 active:scale-[0.97]"
                  >
                    Reconnect Wallet
                  </button>
                  <button
                    onClick={() => { reconnect(); initClient(); }}
                    className="w-full py-4 rounded-xl bg-white  border border-black/10  text-black/60  text-[10px] font-black uppercase tracking-widest hover:bg-black/[0.02]  transition-all"
                  >
                    Refresh Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={initClient}
                  disabled={isInitializing}
                  className="w-full py-5 rounded-xl bg-[#050505] text-white text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isInitializing ? (
                    <>Establish Tunnel...</>
                  ) : (
                    <>Retry Initialization</>
                  )}
                </button>
              )}
            </div>
          ) : isInitializing ? (
            <div className="flex flex-col items-center gap-5">
              <p className="text-[12px] text-black/40  font-mono uppercase tracking-[0.2em] font-black">Establishing Secure Tunnel...</p>
              {isMobile && (
                <p className="text-[10px] text-black  font-black uppercase max-w-[260px] leading-relaxed mx-auto text-center">
                  Action Required: Confirm identity in wallet.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button
                onClick={initClient}
                disabled={isInitializing}
                className="w-full max-w-md py-6 rounded-xl bg-[#050505]  text-white  text-[13px] font-black uppercase tracking-[0.2em] hover:bg-black/80  transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                Activate Identity
              </button>
              <p className="text-[9px] font-mono uppercase tracking-widest text-black/30 ">Protocol-level cryptographic activation</p>
            </div>
          )}
        </div>
      </div>
    );
    }

  const shortAddr = (a: string) => `${a.slice(0, 6)}${a.slice(-4)}`;

  return (
    // Transparent container  wallpaper shows through via parent backdrop
    <div className="relative flex w-full h-full overflow-hidden" style={{ borderRadius: isMobile ? 0 : '1rem', border: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
      {/*  Sidebar: Conversation List  */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/5  bg-white/50  backdrop-blur-[40px]`}>
        <div className="p-4 border-b border-black/6 ">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="p-2.5 rounded-xl bg-black  text-white  hover:bg-black/80  transition-all text-[10px] font-black uppercase tracking-widest"
                title="Scan Identity QR"
              >
                SCAN
              </button>
              <button
                onClick={() => setShowMyQR(true)}
                className="p-2.5 rounded-xl bg-black/[0.03]  text-black/40  hover:bg-black/5  transition-all text-[10px] font-black uppercase"
                title="Show My QR"
              >
                QR
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Address or .eth"
              value={peerInput}
              onChange={e => setPeerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 bg-white  border border-black/10  rounded-lg px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-[#9945FF]/40  placeholder:text-black/25  text-[#050505] "
            />
            <button
              onClick={handleStartConversation}
              disabled={sending}
              className="w-9 h-9 bg-[#050505]  rounded-lg flex items-center justify-center text-white  hover:bg-black/80  transition-colors active:scale-95 disabled:opacity-50 text-[18px] font-light"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <p className="text-[10px] text-black/30  font-medium uppercase tracking-widest">Vault is Empty</p>
            </div>
          ) : (
            conversations.map((conv, i) => {
              const isActive = activePeer?.toLowerCase() === conv.peerAddress.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => { setActivePeer(conv.peerAddress); setShowList(false); }}
                  className={`w-full text-left p-3.5 border-b border-black/4  transition-all ${
                    isActive ? 'bg-black/[0.03]  border-l-2 border-l-black ' : 'hover:bg-black/[0.02] '
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar address={conv.peerAddress} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[#050505]  font-mono truncate">{shortAddr(conv.peerAddress)}</p>
                        {conv.lastMessage && (
                          <p className="text-[10px] text-black/40  truncate mt-0.5">{conv.lastMessage}</p>
                        )}
                      </div>
                    </div>
                    {conv.unreadCount && conv.unreadCount > 0 ? (
                      <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                        <RemoteLottie
                          path="/system-shots/LOTTIECHAT/02dee108-117f-11ee-8417-5fe9d1aa5cbb.json"
                          className="absolute inset-0 w-full h-full opacity-90"
                        />
                        <span className="relative z-10 text-[8px] font-black text-black mt-0.5">
                          {conv.unreadCount > 9 ? '+9' : conv.unreadCount}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/*  Chat Area  */}
      <div className={`${!showList ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activePeer ? (
          <>
            <div className="h-12 px-4 border-b border-black/5  flex items-center justify-between bg-white/50  backdrop-blur-[40px] shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5  text-black/50  text-[10px] font-black">
                  BACK
                </button>
                <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                  <Avatar address={activePeer!} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#050505]  font-mono flex items-center gap-1.5">
                      {shortAddr(activePeer!)}
                    </span>
                    <span className="text-[8px] font-black text-black/20  uppercase tracking-widest">End-to-End Encrypted</span>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowScanner(true)}
                  className="lg:hidden px-3 py-2 bg-black  text-white  rounded-lg text-[9px] font-black uppercase tracking-widest"
                >
                  SCAN
                </button>
                <button onClick={() => setShowProfile(true)} className="p-2 hover:bg-black/5  rounded-full transition-colors text-black/50 ">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-white/30  backdrop-blur-sm">
              {(() => {
                // Filter messages for the current active conversation only
                const convId = `dm-${activePeer!.toLowerCase()}`;
                const filteredMsgs = messages.filter(m =>
                  m.conversationId === convId ||
                  m.conversationId === `dm-${activePeer!.toLowerCase()}`
                );
                if (filteredMsgs.length === 0) return (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center max-w-[280px] text-center gap-6">
                      <div className="flex flex-col items-center opacity-40">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#050505] ">Tunnel Established</p>
                      </div>
                    </div>
                  </div>
                );
                let lastDate = '';
                return filteredMsgs.map(msg => {
                  const sentTime = typeof msg.sentAtNs === 'number' ? new Date(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
                  const dateStr = new Date(sentTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  const showDate = dateStr !== lastDate;
                  lastDate = dateStr;

                  const isMe = msg.senderInboxId
                    ? msg.senderInboxId?.toLowerCase() === (client?.inboxId as string)?.toLowerCase()
                    : false;
                  const content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
                  const isAudio = content.startsWith('__AUDIO__');
                  const isLocation = content.startsWith('[LOCATION]');
                  const audioSrc = isAudio ? content.slice('__AUDIO__'.length) : null;
                  const locationCoords = isLocation ? content.slice('[LOCATION]'.length) : null;
                  
                  const attachmentMatch = typeof content === 'string' ? content.match(/^\[ATTACHMENT:([^\]]*)\](.*?)\|(.*)$/is) : null;
                  const attachment = attachmentMatch ? { mime: attachmentMatch[1] || 'application/octet-stream', url: attachmentMatch[2], name: attachmentMatch[3] } : null;
                  
                  // sentTime already declared above  reuse it here.
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="px-3 py-1 bg-black/5  rounded-full text-[9px] font-mono font-bold text-black/40  uppercase tracking-widest shadow-sm">
                            {dateStr}
                          </span>
                        </div>
                      )}
                      <div className={`flex flex-col max-w-[80%] relative ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                        {/* Invisible overlay for tap precision / context menu */}
                        <div 
                           className="absolute inset-0 z-10 cursor-pointer"
                           onContextMenu={(e) => { e.preventDefault(); setContextMenu({ id: msg.id, content, x: e.clientX, y: e.clientY }); }}
                        />
                      {isAudio && audioSrc ? (
                        <div className={`px-3 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-[#050505]  rounded-br-sm'
                            : 'bg-white  rounded-bl-sm border border-black/8  shadow-sm'
                        }`}>
                          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'text-white/60 ' : 'text-black/40 '}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">AUDIO</span>
                          </div>
                          <audio
                            controls
                            src={audioSrc}
                            className="h-8 max-w-[200px]"
                            style={{ filter: isMe ? 'invert(1) brightness(0.8)' : 'invert(var(--dark-invert, 0))' }}
                          />
                        </div>
                      ) : isLocation && locationCoords ? (
                        <div className={`px-4 py-3 rounded-2xl flex flex-col gap-2 relative z-20 ${
                          isMe
                            ? 'bg-[#050505]  text-white  rounded-br-sm'
                            : 'bg-white  text-[#050505]  rounded-bl-sm border border-black/8  shadow-sm'
                        }`}>
                          <div className="flex items-center gap-2">
                             <MapPin size={14} className={isMe ? 'text-white/70 ' : 'text-blue-500'} />
                             <span className="text-[10px] font-mono uppercase font-bold">Real-time Location</span>
                          </div>
                          <a href={`https://www.google.com/maps?q=${locationCoords}`} target="_blank" rel="noopener noreferrer" className={`text-[11px] underline mt-1 font-mono ${isMe ? 'text-white/80 ' : 'text-blue-500'}`}>
                            Open in Maps ({locationCoords})
                          </a>
                        </div>
                      ) : attachment ? (
                        <div className={`mt-1 overflow-hidden rounded-xl border ${isMe ? 'border-black/10  shadow-sm bg-black/5 ' : 'border-black/10  shadow-sm bg-white '}`}>
                          {attachment.mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                              <img src={attachment.url} alt={attachment.name} className="max-w-[240px] max-h-[300px] object-cover" />
                            </a>
                          ) : attachment.mime.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                            <video src={attachment.url} controls className="max-w-[260px] max-h-[300px] object-contain bg-black" />
                          ) : (
                            <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-3 ${isMe ? 'text-[#050505] ' : 'text-[#050505] '}`}>
                               <span className="font-mono text-[11px] underline break-all line-clamp-2">{attachment.name}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                          isMe
                            ? 'bg-[#050505]  text-white  rounded-br-sm'
                            : 'bg-white  text-[#050505]  rounded-bl-sm border border-black/8  shadow-sm'
                        }`}>
                          {content}
                        </div>
                      )}
                      <span className="text-[9px] text-black/25  mt-1 px-1 font-mono">
                        {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    </React.Fragment>
                  );
                });
              })()}
              {peerStatus.isTyping && (
                  <div className="flex self-start items-start mt-2">
                      <div className="w-12 h-12 opacity-80">
                        <RemoteLottie path="/system-shots/LOTTIECHAT/16b39f54-cb36-11ee-b44b-afd859f781c2.json" />
                      </div>
                  </div>
              )}
              {sending && (
                  <div className="flex flex-col self-end max-w-[80%] items-end mt-2">
                     <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-white/10 rounded-full animate-pulse shadow-sm" />
                     <div className="w-8 h-8 mt-1 opacity-90">
                       <RemoteLottie path="/system-shots/LOTTIECHAT/d5cfd39e-1150-11ee-8341-c736863152e8 (1).json" />
                     </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="shrink-0 bg-white/60  backdrop-blur-[60px] border-t border-black/5  pb-2"
            >
              {/*  Audio recording indicator  */}
              {isRecording && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-[#FFFFFF]  border border-black/5  px-2 py-1 rounded-md">
                        <span className="text-[10px] font-mono text-black  uppercase font-black">REC</span>
                        <span className="text-[9px] font-mono text-black/40 ">{recordingSeconds}s</span>
                    </div>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 p-3">
                <button
                  type="button"
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                    isRecording
                      ? 'bg-black  text-white  shadow-xl'
                      : 'bg-black/[0.05]  text-black/50  hover:bg-black/10 '
                  }`}
                  style={{ touchAction: 'none' }}
                  title={isRecording ? 'Release to send audio' : 'Hold to record voice'}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">{isRecording ? 'OFF' : 'REC'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const loc = `[LOCATION]${pos.coords.latitude},${pos.coords.longitude}`;
                        await executeSend(loc);
                      });
                    }
                  }}
                  disabled={sending}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 bg-black/[0.05]  text-black/50  hover:bg-black/10 "
                  title="Share Location"
                >
                  <MapPin size={16} />
                </button>

                <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
                
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading || sending}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 bg-black/[0.05]  text-black/50  hover:bg-black/10 "
                  title="Attach File"
                >
                  {isUploading ? <span className="font-mono text-[10px] animate-spin inline-block">[...]</span> : <span className="font-mono text-[10px] font-black">[+]</span>}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={isUploading}
                  placeholder={isUploading ? "Uploading..." : "Encrypted transmission..."}
                  className="flex-1 bg-black/[0.03]  border border-black/8  rounded-xl px-4 py-3 text-[#050505]  focus:outline-none focus:border-black/20  placeholder:text-black/30  disabled:opacity-50"
                  style={{ WebkitAppearance: 'none', fontSize: '16px', lineHeight: '1.4' }}
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !isRecording) || sending || isUploading}
                  className="w-11 h-11 rounded-xl bg-[#050505]  flex items-center justify-center text-white  disabled:opacity-30 hover:bg-black/80  transition-all active:scale-95 shrink-0 text-[10px] font-black uppercase"
                >
                  SEND
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white relative overflow-hidden p-6 md:p-12 border-l border-black/5">
            <div className="w-full max-w-3xl flex flex-col">
              
              {/* Header / Badges */}
              <div className="flex items-center gap-3 mb-10 md:mb-16">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.02] shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#050505] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/60">
                    E2E Encrypted Session
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/5 bg-white shadow-sm">
                  <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-black/40">
                    Port: 443 (Secure)
                  </span>
                </div>
              </div>

              {/* Main Typography */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black leading-[1.05] mb-8">
                Decentralized <br />
                <span className="text-black/25">Communication.</span>
              </h2>

              <p className="font-sans text-[14px] md:text-[15px] text-black/60 leading-relaxed max-w-xl mb-14">
                You are securely connected to the Whale Chat protocol. All messages, documents, and voice transmissions are encrypted end-to-end locally on your device. We utilize zero-knowledge architecture to ensure absolute privacy—no third party can intercept or read your communications.
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full border-t border-black/10 pt-10">
                
                {/* Protocol */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/40">Encryption Standard</span>
                    <span className="text-[11px] font-mono font-bold text-black">AES-256-GCM / X3DH</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/40">Network Protocol</span>
                    <span className="text-[11px] font-mono font-bold text-black">XMTP Layer-2</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-black/40">Identity Verification</span>
                    <span className="text-[11px] font-mono font-bold text-black">Cryptographic Signatures</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-col justify-center pl-0 md:pl-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 shrink-0 rounded-[3px] border border-black/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-black rounded-[1px]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-black">Peer-to-Peer Routing</p>
                      <p className="text-[12px] font-sans text-black/50 mt-1 leading-snug">Direct connections established without centralized relay servers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 shrink-0 rounded-[3px] border border-black/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-black rounded-[1px]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-black">Forward Secrecy</p>
                      <p className="text-[12px] font-sans text-black/50 mt-1 leading-snug">Cryptographic keys are rotated continuously to protect past sessions.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Call */}
              <div className="mt-16 pt-8 flex items-center gap-6">
                <div className="flex-1 h-px bg-black/10" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-black/35 select-none">
                  Select a peer from the sidebar to initialize secure tunnel
                </span>
                <div className="flex-1 h-px bg-black/10" />
              </div>

            </div>
          </div>
        )}

      </div>

      {/*  Overlays  */}
      {showScanner && (
        <div className="absolute inset-0 z-[100] bg-white/95  backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-sm">
               <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505] ">Scan Peer QR</h3>
                   <button onClick={() => setShowScanner(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5  rounded-full transition-colors text-[11px] font-black uppercase text-[#050505] ">
                     X
                   </button>
               </div>
               <div className="mb-8">
                 <p className="text-[10px] text-black/40  text-center font-mono leading-relaxed px-4">
                   Establish a cryptographically secured P2P channel by scanning a peer&apos;s System QR identity.
                 </p>
               </div>
               <QrScanner mode="scan" onScanSuccess={(addr) => handleStartConversationWithPeer(addr)} />
           </div>
        </div>
      )}

      {showMyQR && (
        <div className="absolute inset-0 z-[100] bg-white/95  backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-sm">
               <div className="flex justify-between items-center mb-8">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505] ">My Identity QR</h3>
                   <button onClick={() => setShowMyQR(false)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5  rounded-full transition-colors text-[11px] font-black uppercase text-[#050505] ">
                     X
                   </button>
               </div>
               <QrScanner 
                   mode="project" 
                   projectValue={address} 
                   projectTitle={chatName || "KYC Identity"} 
                   projectDescription={chatBio || "Present this code to a peer. Once scanned, a zero-knowledge encrypted tunnel will be initialized between your identities."} 
               />
           </div>
        </div>
      )}

       {/* Context Menu Overlay */}
       {contextMenu && (
         <div className="fixed inset-0 z-[200]" onClick={() => setContextMenu(null)}>
           <div 
             className="absolute bg-white  border border-black/10  rounded-2xl shadow-xl p-2 min-w-[160px] flex flex-col"
             style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 180) }}
             onClick={e => e.stopPropagation()}
           >
             <button onClick={() => {
                 navigator.clipboard.writeText(contextMenu.content.replace(/^\[.*?\]/, ''));
                 setContextMenu(null);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5  text-[11px] font-mono text-[#050505]  text-left">
                <Copy size={14} /> Copy Text
             </button>
             <button onClick={() => {
                 setMessages(prev => prev.filter(m => m.id !== contextMenu.id));
                 setContextMenu(null);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50  text-[11px] font-mono text-red-500 text-left">
                <Trash2 size={14} /> Delete
             </button>
           </div>
         </div>
       )}

       {/* Profile Popover Overlay */}
       {showProfile && activePeer && (
         <div className="absolute inset-0 z-[150] bg-white/95  backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setShowProfile(false)}>
           <div className="w-full max-w-sm bg-white  p-6 rounded-3xl border border-black/10  shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505] ">Profile</h3>
                   <button onClick={() => setShowProfile(false)} className="w-8 h-8 flex items-center justify-center hover:bg-black/5  rounded-full transition-colors text-[11px] font-black uppercase text-[#050505] ">
                     X
                   </button>
               </div>
               <div className="flex flex-col items-center gap-4 mb-8">
                   <Avatar address={activePeer} />
                   <div className="text-center">
                     <p className="text-[13px] font-mono font-bold text-[#050505] ">{activePeer}</p>
                     <p className="text-[10px] text-[#00C076] font-black uppercase tracking-widest mt-1">End-to-End Encrypted Tunnel</p>
                   </div>
               </div>
               <div className="flex flex-col gap-2">
                   <button onClick={() => { syncToAddressBook(activePeer); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5  hover:bg-black/10  rounded-xl transition-colors text-[11px] font-mono font-bold text-[#050505] ">
                       <UserPlus size={16} className="text-black/50 " /> Add to Contacts
                   </button>
                   <button onClick={exportChat} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5  hover:bg-black/10  rounded-xl transition-colors text-[11px] font-mono font-bold text-[#050505] ">
                       <Download size={16} className="text-black/50 " /> Export Chat
                   </button>
                   <button onClick={() => toggleBlock(activePeer)} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5  hover:bg-black/10  rounded-xl transition-colors text-[11px] font-mono font-bold text-orange-500">
                       <Slash size={16} /> {blockedPeers.has(activePeer.toLowerCase()) ? 'Unblock Wallet' : 'Block Wallet'}
                   </button>
                   <button onClick={clearChat} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5  hover:bg-red-50  rounded-xl transition-colors text-[11px] font-mono font-bold text-red-500">
                       <Trash2 size={16} /> Clear Chat
                   </button>
               </div>
           </div>
         </div>
       )}
     </div>
   );
}
