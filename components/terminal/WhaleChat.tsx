"use client";
import { MoreVertical, MapPin, Copy, Trash2, UserPlus, Download, Slash, Settings } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Video, VideoOff, Phone, PhoneOff, Mic, MicOff, Volume2, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import type Peer from 'peerjs';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useSignMessage, useReconnect } from 'wagmi';
import { sendViaOnion, registerAsRelay } from '@/lib/onion/OnionRouter';
import { useAppKit } from '@reown/appkit/react';
import { getXMTPClient, canReceiveMessages, sendMessage, getMessages, destroyXMTPClient, nsToDate, discoverNewPeers, streamMessages, resolveSenderAddress, extractPeerAddress } from '@/lib/xmtp/client';
import { QrScanner } from '@/components/terminal/QrScanner';
import { TuringShieldGate } from '@/components/auth/TuringShieldGate';
import type { Client } from '@xmtp/browser-sdk';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useWalletStore } from '@/lib/store/wallet-store';
import { useAztec } from '@/context/AztecContext';
import { useAztecNative } from '@/context/AztecNativeContext';
import { toast } from 'sonner';


const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });




// NOTE: QDs state is sourced from AztecNativeContext (DB polling) — no local store needed.


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

const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';



export function WhaleChat({ forceAutoInit = false }: WhaleChatProps) {
  const { address, isConnected, isSystemHandshake, isChecking, connector, isZkVerified, isLocalSystemWallet } = useSystemAccount();
  // Email-authenticated users have address like 'email_user@gmail.com' — they have no wallet signer
  // so XMTP is not available. We detect this and route them to server-relay messaging.
  const isEmailUser = typeof address === 'string' && (address as string).startsWith('email_');
  const { signMessageAsync } = useSignMessage();
  const { reconnect } = useReconnect();
  const { open: openAppKit } = useAppKit();

  // [PHASE 2 - SILOING] Consume the sandboxed PXE context for Chat Operations
  // This strictly isolates Chat from the Portfolio state to prevent cross-contamination.
  const { getSiloedPXE } = useAztec();
  const aztecNative = useAztecNative();
  const { spendQDs, balance, aztecAddress } = aztecNative;
  const chatContractAddress = { toString: () => '0xCHAT_CONTRACT_ADDRESS_PLACEHOLDER' } as any;
  const siloedPxe = getSiloedPXE ? getSiloedPXE(chatContractAddress) : null;
  const { 
    chatName, 
    chatBio, 
    soundEffects,
    chatBackground,
    chatBackgroundCustomUrl,
    bubbleStyle,
    accentColor,
    chatFont,
    textSize,
    setSettingsOpen
  } = useSettingsStore();

  const bgStyle = React.useMemo((): React.CSSProperties => {
    switch (chatBackground) {
      case 'amoled': return { background: '#ffffff' };
      case 'holographic':
        return {
          background: 'linear-gradient(135deg, rgba(240,249,255,1) 0%, rgba(224,231,255,1) 100%)',
        };
      case 'matrix': return { background: '#f8fafc' };
      case 'gradient': return { background: 'linear-gradient(to bottom right, #ffffff, #f1f5f9)' };
      case 'custom': return chatBackgroundCustomUrl ? { backgroundImage: `url(${chatBackgroundCustomUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#ffffff' };
      default: return { background: '#ffffff' };
    }
  }, [chatBackground, chatBackgroundCustomUrl]);

  const FONT_MAP: Record<string, string> = {
    'inter': '"Inter", sans-serif',
    'mono': '"JetBrains Mono", monospace',
    'comic': '"Comic Sans MS", "Comic Sans", cursive',
    'serif': '"Merriweather", serif',
    'dyslexic': '"OpenDyslexic", sans-serif'
  };
  const fontFamily = FONT_MAP[chatFont || 'inter'] || FONT_MAP['inter'];
  const fontSizePx = (textSize || 2) * 2 + 6;

  // MASTER RECOVERY: If wallet is connected but connector is missing (zombie session after mobile deep-link)
  // Run a retry loop instead of a single instant attempt — the WalletConnect relay
  // needs time to re-establish after the user returns from the wallet app.
  useEffect(() => {
    if (isConnected && address) {
      registerAsRelay(address, window.location.origin).catch(console.error);
    }
    
    if (!isConnected || connector || isSystemHandshake) return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < 3 && !cancelled; i++) {
        await new Promise(r => setTimeout(r, 800 + i * 600)); // 800ms, 1400ms, 2000ms
        if (cancelled) break;
        try {
          reconnect();
          // Zombie-session recovery dispatched (attempt ${i + 1})
          return;
        } catch (e) {
          console.warn(`[WhaleChat] Reconnect attempt ${i + 1} failed:`, e);
        }
      }
    })();
    return () => { cancelled = true; };
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

  // ─── WebRTC Call State Machine ───────────────────────────────────────────────
  // States: idle → calling (outgoing) → ringing (incoming) → active → idle
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  // 'idle' | 'calling' | 'ringing' | 'connecting' | 'active'
  const [callState, _setCallState] = useState<'idle'|'calling'|'ringing'|'connecting'|'active'>('idle');
  const callStateRef = useRef<'idle'|'calling'|'ringing'|'connecting'|'active'>('idle');
  const setCallState = useCallback((s: 'idle'|'calling'|'ringing'|'connecting'|'active') => {
    callStateRef.current = s;
    _setCallState(s);
  }, []);

  const [callType, setCallType] = useState<'audio'|'video'|null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, _setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // WeakSet to track answered PeerJS calls — avoids mutating MediaConnection type
  const answeredCallsRef = useRef<WeakSet<object>>(new WeakSet());
  const setLocalStream = useCallback((s: MediaStream | null) => {
    localStreamRef.current = s;
    _setLocalStream(s);
  }, []);
  
  // The PeerJS MediaConnection object (from peerInstance.call() or Peer.on('call'))
  const [activeConnection, setActiveConnection] = useState<any>(null);
  // Caller stores the remotePeerId extracted from CALL_ANSWER signal
  const remotePeerIdRef = useRef<string>('');
  // Caller stores the call type sent to peer
  const callTypeRef = useRef<'audio'|'video'>('audio');
  // isCalling: true if we INITIATED the call (to know whether to call or answer)
  const isCallerRef = useRef<boolean>(false);
  // Mute / Camera state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  // Call Duration State
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const callDurationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ringtone state
  const ringtoneRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // ─── Backward compat shims so existing JSX works unchanged ──────────────────
  const callActive = callState === 'active' || callState === 'calling' || callState === 'connecting';
  const incomingCall = callState === 'ringing';

  // Emoji State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Offline Queue State
  const [isOffline, setIsOffline] = useState(false);


  useEffect(() => {
    try {
      const b = localStorage.getItem('whale_blocked');
      if (b) setBlockedPeers(new Set(JSON.parse(b)));
    } catch {}
  }, []);

  // ─── Call Timer Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (callState === 'active') {
      setCallDurationSeconds(0);
      callDurationTimerRef.current = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current);
        callDurationTimerRef.current = null;
      }
      if (callState === 'idle') {
        setCallDurationSeconds(0);
      }
    }
    return () => {
      if (callDurationTimerRef.current) {
        clearInterval(callDurationTimerRef.current);
        callDurationTimerRef.current = null;
      }
    };
  }, [callState]);

  const formatDuration = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
  // Always-fresh ref to executeSend — avoids stale closure in event listeners
  const executeSendRef = useRef<((content: string) => Promise<void>) | null>(null);

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
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages]);

  // MASTER-FIX: Auto-scroll on resize (keyboard open/close) to maintain stability
  useEffect(() => {
    if (typeof window === 'undefined' || !isMobile) return;
    const handleResize = () => {
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.parentElement;
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
        }
      }
      
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    // Also track visualViewport if available for more precision
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
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

  // [QUANTUM WEBSOCKET RESURRECTION] iOS Safari suspends WebSocket connections when the
  // user switches to their wallet app to sign. When they return, XMTP stream may be dead.
  // We listen for the ClientFortress wakeup signal and force a conversations.sync() 
  // to resurrect the stream without requiring a full page reload.
  useEffect(() => {
    if (!client || !address) return;
    let resurrecting = false;
    const handleWakeup = async () => {
      if (resurrecting || document.visibilityState !== 'visible') return;
      resurrecting = true;
      try {
        await client.conversations.sync();
      } catch (e) {
        console.warn('[WhaleChat:Quantum] Sync failed, stream may self-recover:', e);
      } finally {
        resurrecting = false;
      }
    };
    window.addEventListener('quantum_wakeup_signal', handleWakeup);
    document.addEventListener('visibilitychange', handleWakeup);
    return () => {
      window.removeEventListener('quantum_wakeup_signal', handleWakeup);
      document.removeEventListener('visibilitychange', handleWakeup);
    };
  }, [client, address]);

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
              const res = await fetch(`/api/chat/telemetry?peer=${activePeer}&self=${address}`, { cache: 'no-store' });
              if (!res.ok) return;
              const data = await res.json();
              if (isMounted) setPeerStatus(data);
          } catch {}
      };

      pollPeer();
      const interval = setInterval(pollPeer, 3000);
      return () => { isMounted = false; clearInterval(interval); };
  }, [activePeer, address]);


  // Detect Offline Status & Process Queue
  // Uses executeSendRef to avoid stale closure — safe for production at scale
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      // Flush the outbox — uses ref to always get the latest executeSend fn
      if (address) {
        const outboxKey = `whale_outbox_${address.toLowerCase()}`;
        const queueStr = localStorage.getItem(outboxKey);
        if (queueStr) {
          try {
            const queue: string[] = JSON.parse(queueStr);
            if (queue.length > 0) {
              localStorage.removeItem(outboxKey);
              toast.info(`📤 Back online — sending ${queue.length} queued message${queue.length > 1 ? 's' : ''}...`);
              for (const msgContent of queue) {
                if (executeSendRef.current) {
                  await executeSendRef.current(msgContent);
                  await new Promise(r => setTimeout(r, 300)); // throttle to avoid XMTP rate limit
                }
              }
              toast.success('✅ All queued messages delivered.');
            }
          } catch (e) {
            console.warn('[Outbox] Failed to flush queue:', e);
          }
        }
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('📶 No internet connection. Messages will be queued.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]); // address is the only real dep — executeSend accessed via ref

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


  // ─── Ringtone Generator ──────────────────────────────────────────────────────
  const ringtoneCtxRef = useRef<AudioContext | null>(null);
  
  const startRingtone = useCallback(() => {
    let ctx: AudioContext | null = null;
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ringtoneCtxRef.current = ctx;
    } catch { return () => {}; }
    let stopped = false;
    const playRing = () => {
      if (stopped || !ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.setValueAtTime(380, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    };
    playRing();
    const id = setInterval(playRing, 2000);
    ringtoneRef.current = id;
    return () => { stopped = true; clearInterval(id); ctx?.close(); };
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
      ringtoneRef.current = null;
    }
    if (ringtoneCtxRef.current) {
      ringtoneCtxRef.current.close().catch(() => {});
      ringtoneCtxRef.current = null;
    }
  }, []);

  // ─── PeerJS Initialisation ───────────────────────────────────────────────────
  // Uses a deterministic peer ID derived from the wallet address for stable routing.
  useEffect(() => {
    if (!address || peerInstance) return;
    import('peerjs').then(({ default: Peer }) => {
      // ID must be alphanumeric only for PeerJS cloud server
      const stableId = `whale${address.slice(2, 12).toLowerCase()}`;
      const peer = new Peer(stableId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:openrelay.metered.ca:80' },
            { 
              urls: 'turn:openrelay.metered.ca:80', 
              username: 'openrelayproject', 
              credential: 'openrelayproject' 
            },
            { 
              urls: 'turn:openrelay.metered.ca:443', 
              username: 'openrelayproject', 
              credential: 'openrelayproject' 
            },
            { 
              urls: 'turn:openrelay.metered.ca:443?transport=tcp', 
              username: 'openrelayproject', 
              credential: 'openrelayproject' 
            }
          ],
          sdpSemantics: 'unified-plan',
          iceTransportPolicy: 'all' as RTCIceTransportPolicy,
        },
      });
      peer.on('open', (id) => {
        console.log('[WhaleChat:PeerJS] Open with ID:', id);
        setMyPeerId(id);
      });
      // ── Incoming call handler (receiver side only) ──────────────────────────
      // This fires when the CALLER executes peerInstance.call(ourPeerId, stream)
      peer.on('call', (connection) => {
        console.log('[WhaleChat:PeerJS] Incoming call connection:', connection.peer);
        setActiveConnection(connection);
        
        // [AUDIT FIX] If we already answered this call (receiver sent __CALL_ANSWER__ + got local stream),
        // answer the PeerJS connection immediately with our stored local stream.
        // Guard with _answered flag to prevent duplicate handlers if this fires twice.
        if ((callStateRef.current === 'connecting' || callStateRef.current === 'active') && localStreamRef.current) {
           if (!answeredCallsRef.current.has(connection)) {
             answeredCallsRef.current.add(connection);
             connection.answer(localStreamRef.current);
             connection.on('stream', (rStream: MediaStream) => {
               console.log('[WhaleChat:PeerJS] Receiver got remote stream — call now ACTIVE');
               setRemoteStream(rStream);
               setCallState('active');
               stopRingtone();
               if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
               if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = rStream; remoteAudioRef.current.play().catch(() => {}); }
             });
             connection.on('close', () => performEndCallRef.current());
             connection.on('error', () => performEndCallRef.current());
           }
           return;
        }

        // Otherwise, determine type and start ringing
        const callTypeFromMeta: 'audio'|'video' = connection.metadata?.callType || 'audio';
        setCallType(callTypeFromMeta);
        isCallerRef.current = false;
        setCallState('ringing');
        startRingtone();
      });
      peer.on('error', (err) => {
        console.warn('[WhaleChat:PeerJS] Error:', err.type, err.message);
        // ID taken means another tab is open — fall back to random ID
        if (err.type === 'unavailable-id') {
          const fallback = new Peer();
          fallback.on('open', (id) => setMyPeerId(id));
          fallback.on('call', (connection) => {
            setActiveConnection(connection);
            const t: 'audio'|'video' = connection.metadata?.callType || 'audio';
            setCallType(t);
            isCallerRef.current = false;
            setCallState('ringing');
            startRingtone();
          });
          setPeerInstance(fallback);
          return;
        }
      });
      peer.on('disconnected', () => {
        console.warn('[WhaleChat:PeerJS] Disconnected — attempting reconnect...');
        try { peer.reconnect(); } catch {}
      });
      setPeerInstance(peer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Cleanup PeerJS on unmount
  useEffect(() => {
    return () => {
      if (peerInstance && !peerInstance.destroyed) {
        try { peerInstance.destroy(); } catch {}
      }
      stopRingtone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerInstance]);

  // ─── XMTP Signaling Listener ─────────────────────────────────────────────────
  // Monitors XMTP messages for call control signals.
  // Protocol:
  //   CALL_OFFER:<callerPeerId>:<callType>   — caller announces intent + its PeerID
  //   CALL_ANSWER:<receiverPeerId>           — receiver sends back its PeerID
  //   CALL_DECLINE                           — receiver declines
  //   CALL_HANGUP                            — either party ends the call
  // NOTE: performEndCallRef is wired below after performEndCall is defined.
  const performEndCallRef = useRef<() => void>(() => {});
  const processedSignalIds = useRef<Set<string>>(new Set());
  // AUDIT FIX: Prune processedSignalIds set to avoid unbounded memory growth.
  // Keep only the last 200 IDs to prevent memory leak over long sessions.
  const pruneSignalIds = useCallback(() => {
    if (processedSignalIds.current.size > 200) {
      const arr = Array.from(processedSignalIds.current);
      processedSignalIds.current = new Set(arr.slice(arr.length - 100));
    }
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.content || !lastMsg.id) return;
    if (processedSignalIds.current.has(lastMsg.id)) return;
    const isMine = lastMsg.senderInboxId?.toLowerCase() === (client?.inboxId as string)?.toLowerCase();
    if (isMine) return; // ignore our own signals
    const content: string = typeof lastMsg.content === 'string' ? lastMsg.content : '';

    // ── CALL_OFFER: Peer is calling us ──────────────────────────────────────────
    if (content.startsWith('__CALL_OFFER__:')) {
      processedSignalIds.current.add(lastMsg.id);
      const parts = content.split(':');
      const callerPeerId = parts[1] || '';
      const offerCallType: 'audio'|'video' = (parts[2] as any) || 'audio';
      if (!callerPeerId) return;
      // AUDIT FIX: Validate that the sender is the current active peer
      // This prevents anyone sending __CALL_OFFER__ from triggering the call UI
      const senderInbox = lastMsg.senderInboxId?.toLowerCase() || '';
      const expectedPeer = activePeerRef.current?.toLowerCase() || '';
      if (expectedPeer && !senderInbox.includes(expectedPeer.slice(2, 10))) {
        console.warn('[WhaleChat:Signal] CALL_OFFER from unexpected sender, ignoring');
        return;
      }
      remotePeerIdRef.current = callerPeerId;
      setCallType(offerCallType);
      isCallerRef.current = false;
      // AUDIT FIX: Use callStateRef for immediate state check, not stale closure
      if (callStateRef.current === 'idle') {
        setCallState('ringing');
        startRingtone();
      }
      console.log('[WhaleChat:Signal] CALL_OFFER received from PeerID:', callerPeerId, 'type:', offerCallType);
    }

    // ── CALL_ANSWER: Our callee accepted — now we initiate the WebRTC call ──────
    // AUDIT FIX: Use callStateRef (not stale closure callState) to check current state
    if (content.startsWith('__CALL_ANSWER__:') && isCallerRef.current && callStateRef.current === 'calling') {
      processedSignalIds.current.add(lastMsg.id);
      const receiverPeerId = content.split(':')[1] || '';
      if (!receiverPeerId || !peerInstance || !localStreamRef.current) return;
      console.log('[WhaleChat:Signal] CALL_ANSWER received. Calling receiver PeerID:', receiverPeerId);
      // Now the CALLER connects the actual WebRTC media to the receiver
      const conn = peerInstance.call(receiverPeerId, localStreamRef.current, {
        metadata: { callType: callTypeRef.current },
      });
      if (!conn) { toast.error('WebRTC: Could not initiate connection.'); return; }
      setActiveConnection(conn);
      conn.on('stream', (rStream: MediaStream) => {
        console.log('[WhaleChat:PeerJS] Caller received remote stream');
        setRemoteStream(rStream);
        setCallState('active');
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
        if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = rStream; remoteAudioRef.current.play().catch(() => {}); }
      });
      conn.on('close', () => { console.log('[WhaleChat:PeerJS] Connection closed'); performEndCallRef.current(); });
      conn.on('error', (e: any) => { console.error('[WhaleChat:PeerJS] Connection error:', e); performEndCallRef.current(); });
    }

    // ── CALL_DECLINE: Callee declined ──────────────────────────────────────────
    if (content === '__CALL_DECLINE__') {
      processedSignalIds.current.add(lastMsg.id);
      if (callState !== 'idle') {
        performEndCallRef.current();
        toast('📵 Call declined.');
      }
    }

    // ── CALL_HANGUP: Remote party hung up ─────────────────────────────────────
    if (content === '__CALL_HANGUP__') {
      processedSignalIds.current.add(lastMsg.id);
      if (callState !== 'idle') {
        performEndCallRef.current();
        toast('📵 Call ended by peer.');
      }
    }
    // AUDIT FIX: Prune signal IDs to prevent memory leak
    pruneSignalIds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ─── WebRTC DOM Binding for Mobile (iOS/Android) ───────────────────────────
  // Ensure video elements receive the stream once React actually mounts them
  useEffect(() => {
    if (myVideoRef.current && localStream && myVideoRef.current.srcObject !== localStream) {
      myVideoRef.current.srcObject = localStream;
    }
  }, [callState, localStream, isCamOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && remoteVideoRef.current.srcObject !== remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream && remoteAudioRef.current.srcObject !== remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
    }
  }, [callState, remoteStream]);

  // ─── performEndCall: Universal cleanup ── uses refs to avoid stale closures ──
  // AUDIT FIX: All mutable values accessed via refs, not closure captures.
  // This ensures that when called from async contexts (timeouts, PeerJS events),
  // we always clean up the CURRENT stream/connection, not a stale captured one.
  const activeConnectionRef = useRef<any>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  // Keep refs in sync with state
  useEffect(() => { activeConnectionRef.current = activeConnection; }, [activeConnection]);
  useEffect(() => { remoteStreamRef.current = remoteStream; }, [remoteStream]);

  const performEndCall = useCallback(() => {
    stopRingtone();
    // Use refs — never captured closure values
    const ls = localStreamRef.current;
    const rs = remoteStreamRef.current;
    const ac = activeConnectionRef.current;
    if (ls) { try { ls.getTracks().forEach(t => t.stop()); } catch {} }
    if (rs) { try { rs.getTracks().forEach(t => t.stop()); } catch {} }
    if (ac) { try { ac.close(); } catch {} }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveConnection(null);
    setCallState('idle');
    setCallType(null);
    setIsMicMuted(false);
    setIsCamOff(false);
    isCallerRef.current = false;
    remotePeerIdRef.current = '';
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = null; }
  // stopRingtone and setters are stable refs, safe to include
  }, [stopRingtone, setLocalStream, setCallState]);
  // Wire the always-fresh ref — avoids stale closure in the XMTP signal listener above
  performEndCallRef.current = performEndCall;

  // ─── startCall: Initiate outgoing call ──────────────────────────────────────
  const startCall = async (type: 'audio'|'video') => {
    if (callState !== 'idle') {
      toast.error('A call is already in progress.');
      return;
    }
    if (!peerInstance || !activePeer) {
      toast.error('Chat connection not ready. Please wait and try again.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Your browser does not support media access. Please use Chrome or Firefox.');
      return;
    }
    let stream: MediaStream | null = null;
    try {
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 60 }, facingMode: 'user' } : false,
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setCallType(type);
      callTypeRef.current = type;
      isCallerRef.current = true;
      setCallState('calling');
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      // Signal to peer: we are calling + share our PeerID and call type
      await executeSend(`__CALL_OFFER__:${myPeerId}:${type}`);
      toast.success('📡 Ringing peer...');

      // Caller timeout: if no CALL_ANSWER in 60s, clean up
      setTimeout(() => {
        if (callStateRef.current === 'calling') {
          toast.error('No answer — call timed out.');
          performEndCallRef.current();
        }
      }, 60000);
    } catch (e: any) {
      // AUDIT FIX: Always stop any acquired stream tracks on error
      if (stream) { try { stream.getTracks().forEach(t => t.stop()); } catch {} }
      setLocalStream(null);
      setCallState('idle');
      isCallerRef.current = false;
      const errName = e?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        toast.error('🎙️ Microphone/Camera access denied. Please enable permissions in your browser settings.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        toast.error('🎙️ No microphone or camera found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        toast.error('🎙️ Camera/Microphone is in use by another app. Please close it.');
      } else {
        toast.error(`Call failed: ${e?.message || 'Unknown error'}`);
      }
      console.error('[Call] getUserMedia error:', e);
    }
  };

  // ─── answerCall: Receiver accepts incoming call ──────────────────────────────
  const answerCall = async () => {
    stopRingtone();
    if (callState !== 'ringing') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Your browser does not support media access. Please use Chrome or Firefox.');
      return;
    }
    let stream: MediaStream | null = null;
    try {
      const isVideo = callType === 'video';
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 60 }, facingMode: 'user' } : false,
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      // AUDIT FIX: Only register stream handler if NOT already done via peer.on('call')
      // Check activeConnection at this moment (may have arrived via peer.on('call') already)
      const existingConn = activeConnectionRef.current;
      if (existingConn) {
        // Guard: only answer if not already answered to prevent duplicate handlers
        if (!(existingConn as any)._answered) {
          (existingConn as any)._answered = true;
          existingConn.answer(stream);
          existingConn.on('stream', (rStream: MediaStream) => {
            console.log('[WhaleChat:PeerJS] Receiver got remote stream (answerCall path)');
            setRemoteStream(rStream);
            setCallState('active');
            toast.success('✅ Call connected.');
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
            if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = rStream; remoteAudioRef.current.play().catch(() => {}); }
          });
          existingConn.on('close', () => performEndCallRef.current());
          existingConn.on('error', () => performEndCallRef.current());
        }
      }

      // Transition to 'connecting' — peer.on('call') handler will complete it
      setCallState('connecting');
      toast.success('📡 Answering call...');

      // Send our PeerID back to the caller
      await executeSend(`__CALL_ANSWER__:${myPeerId}`);

      // Failsafe: if stream doesn't arrive within 20s, clean up
      setTimeout(() => {
        if (callStateRef.current === 'connecting') {
          toast.error('Call timed out — no media stream received.');
          performEndCallRef.current();
        }
      }, 15000);

    } catch (e: any) {
      setCallState('idle');
      const errName = e?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        toast.error('🎙️ Microphone/Camera access denied. Please enable permissions in your browser settings.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        toast.error('🎙️ No microphone or camera found on this device.');
      } else {
        toast.error(`Failed to answer call: ${e?.message || 'Unknown error'}`);
      }
      console.error('[Call] answerCall error:', e);
    }
  };

  // ─── declineCall: Receiver declines ─────────────────────────────────────────
  const declineCall = useCallback(async () => {
    stopRingtone();
    setCallState('idle');
    setActiveConnection(null);
    setCallType(null);
    try { await executeSend('__CALL_DECLINE__'); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopRingtone]);

  // ─── endCall: Either party hangs up ─────────────────────────────────────────
  const endCall = useCallback(async () => {
    try { await executeSend('__CALL_HANGUP__'); } catch {}
    performEndCall();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performEndCall]);

  // ─── toggleMic ───────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const nextMuted = !isMicMuted;
    localStream.getAudioTracks().forEach(t => { t.enabled = !nextMuted; });
    setIsMicMuted(nextMuted);
  }, [localStream, isMicMuted]);

  // ─── toggleCamera ────────────────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const nextOff = !isCamOff;
    localStream.getVideoTracks().forEach(t => { t.enabled = !nextOff; });
    setIsCamOff(nextOff);
  }, [localStream, isCamOff]);

  //  Voice Recording: Hold-to-Record 
  const startRecording = useCallback(async () => {
    if (isRecording || !activePeer) return;
    try {
      // [iOS FIX] Safari requires explicit constraint hints to enable microphone.
      // echoCancellation and noiseSuppression are critical for call quality on iPhone.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        }
      });
      // [iOS FIX] Safari does NOT support audio/webm or audio/webm;codecs=opus.
      // It only supports audio/mp4 (AAC). We must check in correct priority order.
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
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
                await sendMessage(client, activePeer, audioMsg, address); 
                // Voice: P2P Audio transmission successful.
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
          const res = await fetch(`/api/chat/contacts?address=${address}`, { headers: authHeader, cache: 'no-store' });
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
          const pRes = await fetch(`/api/chat/pending?address=${address}`, { headers: authHeader, cache: 'no-store' });
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
              let finalMsg = msg;
              if (typeof msg !== 'string') {
                  const hex = Array.from(msg as Uint8Array).map((b: number) => b.toString(16).padStart(2, '0')).join('');
                  finalMsg = ('0x' + hex) as any;
              }
              return await signMessageAsync({ message: finalMsg as any });
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
            // [ATOMIC INDEXING] Log session event (once per session)
            const chatLogKey = `provenance_chat_${address}_${new Date().toDateString()}`;
            if (!localStorage.getItem(chatLogKey)) {
                localStorage.setItem(chatLogKey, '1');
                fetch('/api/provenance/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ type: 'WHALE_CHAT_SYNC', details: { address } })
                }).catch(() => {});
            }
        }
        await loadConversations();
        
        // Identity Mint logic for WalletConnect wallets
        const isWalletConnect = connector?.id?.toLowerCase().includes('walletconnect');
        if (isWalletConnect || !isLocalSystemWallet) {
            const mintKey = `qds_identity_mint_${address}`;
            if (typeof localStorage !== 'undefined' && !localStorage.getItem(mintKey)) {
                // ✅ OPTIMISTIC LOCK: mark as attempted BEFORE the API call.
                localStorage.setItem(mintKey, 'true');
                try {
                    // Step 1: Use the Aztec address from Context if available, else derive it deterministically
                    let targetAztecAddress = aztecAddress;
                    if (!targetAztecAddress) {
                        const deriveRes = await fetch('/api/aztec/derive-address', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ evmAddress: address })
                        });
                        const deriveData = await deriveRes.json();
                        if (deriveData.success) {
                            targetAztecAddress = deriveData.aztecAddress;
                        }
                    }
                    
                    if (targetAztecAddress) {
                        // Step 2: Trigger the airdrop script explicitly via the API route
                        const airdropRes = await fetch('/api/aztec/airdrop', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address: targetAztecAddress, amount: 10 })
                        });
                        const airdropData = await airdropRes.json();
                        if (airdropData.success) {
                            // Only show the welcome toast on the very first successful claim
                            toast.success('⚡ Aztec Identity Active: 10 QDs received!', { 
                                description: 'Transaction confirmed on Aztec Testnet.',
                                duration: 8000,
                                action: airdropData.explorerUrl ? {
                                    label: 'View on AztecScan',
                                    onClick: () => window.open(airdropData.explorerUrl, '_blank')
                                } : undefined
                            });
                        }
                        // On any other response (Already received, error, etc.):
                        // the optimistic lock above already prevents the next attempt.
                    }
                } catch (e) {
                    console.error('Identity Airdrop Failed:', e);
                    // Do NOT remove the localStorage key on error — the lock stays.
                    // If the claim truly failed on-chain, the user can claim via the
                    // AztecAirdropCalendar (monthly claim UI) instead.
                }
            }
        }

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
            setInitError('Whale Network module failed to load. Please check your network connection and reload the terminal.');
          } else if (errorMsg.includes('No active wallet') || errorMsg.includes('connector') || errorMsg.includes('signMessage') || errorMsg.toLowerCase().includes('unknown signer')) {
            if (isSystemHandshake) {
               setInitError('Whale identity not yet synchronized from desktop. Please keep this browser open while the desktop terminal finishes the handshake.');
            } else {
               setInitError('Active wallet connection lost or not detected. Please ensure your wallet app is open and connected directly to this browser.');
            }
          } else if (errorMsg.includes('WASM') || errorMsg.includes('wasm')) {
            setInitError('Cryptographic Engine Failure. Hardware architecture error or restricted browser security settings.');
          } else {
            setInitError(`Whale Network handshake failure: ${errorMsg.slice(0, 80) || 'Unknown Protocol Error'}. Please retry.`);
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
    // Aggressive Auto-Init: Trigger for all connected users including mobile.
    // Skip email users — they don't have a wallet signer for XMTP.
    if (isConnected && address && !isEmailUser && !client && !initInFlight.current && !initError) {
      initClient();
    }
  }, [isConnected, address, isEmailUser, client, initError, initClient, forceAutoInit]);

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
    // Self-healing stream loop: if GroupInactive kills the stream, restart it with backoff.
    (async () => {
      let streamRestarts = 0;
      while (!cancelled) {
        try {
        const gen = streamMessages(client);
        for await (const msg of gen as any) {
          if (cancelled) break;
          
          const fromPeer = msg.senderInboxId !== selfInboxId;
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          const sentAtNs = nsToDate(msg.sentAtNs ?? msg.sentAt).getTime();
          const currentActivePeer = activePeerRef.current?.toLowerCase();
          
          let resolvedPeerAddr = msg.conversation?.peerAddress?.toLowerCase() || '';
          if (!resolvedPeerAddr) {
            if (fromPeer) {
              const senderAddr = await resolveSenderAddress(msg.senderInboxId);
              resolvedPeerAddr = senderAddr?.toLowerCase() || '';
            } else if (msg.conversation) {
              const dmPeer = await extractPeerAddress(msg.conversation, selfInboxId);
              resolvedPeerAddr = dmPeer?.toLowerCase() || '';
            }
          }
          const msgConvPeer = resolvedPeerAddr;
          const realId = msg.id ?? `real-${sentAtNs}-${Math.random()}`;

          // ── ABSOLUTE DEDUPLICATION GATE ──────────────────────────────────────
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

          const belongsToActive = !!msgConvPeer && (msgConvPeer === currentActivePeer);

          if (belongsToActive) {

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
                // within a 30-second window (handles slow networks and retry delays)
                const optIdx = prev.findIndex(
                  m => m.id.startsWith('optimistic-') &&
                       m.content === content &&
                       Math.abs(m.sentAtNs - sentAtNs) < 30_000
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
          } else {
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
                  peerAddress: msgConvPeer,
                  lastMessage: content.slice(0, 30),
                  lastAt: new Date()
                }, ...prev];
              }
              persistToLocal(updated);
              return updated;
            });
          }
        }
      } catch (e: any) {
          const errMsg = (e?.message || String(e) || '').toLowerCase();
          // GroupInactive = stale MLS epoch. Silently re-sync and restart stream.
          const isGroupInactive = (
            errMsg.includes('group is inactive') ||
            errMsg.includes('groupinactive') ||
            errMsg.includes('group_inactive') ||
            errMsg.includes('inactive group')
          );
          if (isGroupInactive && streamRestarts < 5 && !cancelled) {
            streamRestarts++;
            const backoffMs = Math.min(1000 * Math.pow(1.5, streamRestarts), 15000);
            console.info(`[Chat] MLS GroupInactive — re-sync + stream restart #${streamRestarts} in ${backoffMs}ms`);
            try { await client.conversations.sync(); } catch {}
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue; // restart the while loop → restart stream
          } else if (!cancelled) {
            console.warn('[Chat] global stream failed:', e);
          }
          break; // exit while loop for non-recoverable errors
        }
      } // end while
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
          const pRes = await fetch(`/api/chat/pending?address=${address}`, { 
            cache: 'no-store',
            headers: { 'x-web3-address': address || '' }
          });
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
               
               // CONSUME pending messages where we are the RECIPIENT:
               // This clears them from the server queue so they are marked as delivered.
               // Only delete messages addressed TO us — we must not delete messages we sent.
               const incomingIds = pData.pending
                 .filter((p: any) => p.recipient.toLowerCase() === address?.toLowerCase())
                 .map((p: any) => p.id);
               
               if (incomingIds.length > 0) {
                 fetch(`/api/chat/pending?address=${address}`, {
                   method: 'DELETE',
                   headers: { 'x-web3-address': address || '' }
                 }).catch(err => console.warn('[PendingConsume] Failed to clear delivered messages:', err));
               }
            }
          }
        } catch (e) { console.error('Failed to fetch pending messages', e); }
        
        const mappedMsgs = raw
          .map((m: any) => {
            const content = typeof m.content === 'string' ? m.content : (m.content ? JSON.stringify(m.content) : m.fallback || 'Encrypted Data');
            return {
              id: m.id,
              senderInboxId: m.senderInboxId,
              content: content,
              sentAtNs: nsToDate(m.sentAtNs ?? m.sentAt).getTime(),
              conversationId: `dm-${activePeer.toLowerCase()}`
            };
          })
          .filter((m: any) => {
             if (typeof m.content === 'string') {
                 const lc = m.content.toLowerCase();
                 if (lc.includes('initiatedbyinboxid')) return false;
                 if (lc.includes('from cursor')) return false;
                 if (lc.includes('group is inactive') || lc.includes('groupinactive')) return false;
                 if (lc.includes('synced') || lc.includes('originator_id') || lc.includes('sequence_id')) return false;
             }
             return true;
          });
        // ── POLL MERGE WITH FULL DEDUPLICATION ───────────────────────────────
        // Register all newly fetched real IDs in confirmedMsgIds so the stream
        // cannot double-insert them when the echo arrives after the poll.
        mappedMsgs.forEach((m: any) => confirmedMsgIds.current.add(m.id));
        pendingServer.forEach((p: any) => confirmedMsgIds.current.add(p.id));

        // ─────────────────────────────────────────────────────────────────────
        // CRITICAL FIX: PURELY ADDITIVE MERGE
        // We NEVER replace the message list — we only add messages not yet present.
        // This prevents poll failures (empty array from XMTP) from wiping optimistic
        // messages or stream-received messages that haven't been confirmed yet.
        // ─────────────────────────────────────────────────────────────────────
        setMessages(prev => {
          const activeId = `dm-${activePeer.toLowerCase()}`;
          
          // Build a set of all IDs currently in state for O(1) lookup
          const existingIds = new Set(prev.map(m => m.id));
          
          // Only add messages we haven't seen before (truly new from poll)
          const newConfirmed = [...mappedMsgs, ...pendingServer].filter(m => !existingIds.has(m.id));
          
          // ── KEY GUARD ──────────────────────────────────────────────────────
          // If the poll returned NOTHING new, return prev UNCHANGED.
          // This is what prevents an empty XMTP response from wiping all messages.
          // ──────────────────────────────────────────────────────────────────
          if (newConfirmed.length === 0) return prev;
          
          // For each NEW confirmed message, find and remove its optimistic twin
          const optimisticToRemove = new Set<string>();
          for (const confirmed of newConfirmed) {
            // Strategy 1: exact match via optimisticContentMap (fastest)
            const knownOptId = optimisticContentMap.current.get(confirmed.content);
            if (knownOptId && existingIds.has(knownOptId)) {
              optimisticToRemove.add(knownOptId);
              optimisticContentMap.current.delete(confirmed.content);
            } else {
              // Strategy 2: content + time window match (handles encoding edge cases)
              const twin = prev.find(
                m => m.id.startsWith('optimistic-') &&
                     m.conversationId === activeId &&
                     m.content === confirmed.content &&
                     Math.abs(m.sentAtNs - confirmed.sentAtNs) < 30_000
              );
              if (twin) optimisticToRemove.add(twin.id);
            }
          }
          
          // Drop only the replaced optimistic twins, keep everything else
          const base = prev.filter(m => !optimisticToRemove.has(m.id));
          return [...base, ...newConfirmed].sort((a, b) => a.sentAtNs - b.sentAtNs);
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
    if (!client || !activePeer || !content.trim() || !address) return;
    
    const isSystemSignal = content.startsWith('__CALL_');
    if (!isSystemSignal && sending) return;

    if (!isSystemSignal) setSending(true);

    // --- QD DEDUCTION LOGIC ---
    // [FIX] Only gate on QDs if the user has an Aztec identity connected.
    // If aztecAddress is null (user hasn't claimed yet), balance = 0 is expected
    // and we should NOT block messaging — they can claim their identity later.
    // The tiny 0.0001 QD cost per message is essentially free and serves as
    // spam prevention only for users who already have an identity.
    const { aztecAddress: userAztecAddr } = aztecNative;
    if (!isSystemSignal && !isLocalSystemWallet && userAztecAddr) {
      // Only enforce QD balance if the user has a loaded Aztec identity
      if (balance < 0.0001) {
        toast.error("Insufficient QDs to send message.", { description: "Top up via the Aztec Identity tab." });
        setSending(false);
        return;
      }
      // Deduct QDs — fire-and-forget, message always sends regardless of QD API result
      spendQDs(0.0001, 'Whale Chat message').catch((e: any) => console.warn('[WhaleChat] QD deduction failed (non-blocking):', e));
    }

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

      // [AUDIO REMOVED] send ping disabled.
      
      // Always attempt to send directly via XMTP.
      // sendMessage() handles canReceive checks, retries with backoff,
      // and graceful offline queue internally — no need to pre-check here.
      if (isOffline) {
        const outboxKey = `whale_outbox_${address.toLowerCase()}`;
        const existing = JSON.parse(localStorage.getItem(outboxKey) || '[]');
        existing.push(content);
        localStorage.setItem(outboxKey, JSON.stringify(existing));
        toast.info("You are offline. Message queued to outbox.");
      } else {
        try {
          await sendMessage(client, activePeer, content, address);
        } catch (err) {
          console.error('[WhaleChat] Message send failed:', err);
          toast.error("Failed to send message");
        }
      }

      // UPDATE LOCAL ADDRESS BOOK
      setConversations(prev => {
        const updated = prev.find(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase())
          ? prev.map(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase() ? { ...c, lastMessage: content, lastAt: new Date() } : c)
          : [{ peerAddress: activePeer, lastMessage: content, lastAt: new Date() }, ...prev];
        persistToLocal(updated);
        return updated;
      });

    } catch (err: any) {
      // On failure, keep the message but mark it as failed so the user knows what happened
      optimisticContentMap.current.delete(content);
      const errString = err?.message || String(err);
      setMessages(prev => prev.map(m => 
        m.id === optimisticId 
          ? { ...m, failed: true, error: errString } 
          : m
      ));
      console.error('[Chat] executeSend failed:', err);
    } finally {
      if (!isSystemSignal) setSending(false);
    }
  };

  // Wire the always-fresh ref — this is read by the offline outbox flush event listener
  // Using a ref avoids stale closures across render cycles (production-critical for scale)
  executeSendRef.current = executeSend;

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

  // [AUDIO REMOVED] playAudioPing is permanently silenced.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playAudioPing = (_type: 'send' | 'receive') => { /* no-op */ };

  const [prevMsgCount, setPrevMsgCount] = useState<number>(0);
  useEffect(() => {
    setPrevMsgCount(messages.length);
  }, [messages.length]);

  if (!isConnected) {
    return (
      <TuringShieldGate>
      <div className="flex-1 flex flex-col items-center justify-start h-full bg-white p-6 pt-12 gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <h3 className="text-[28px] font-black tracking-tight text-black relative z-10">Sovereign Chat</h3>
        <p className="text-[14px] font-medium text-[#555] text-center max-w-sm leading-relaxed relative z-10 px-4">
          Establish an end to end encrypted connection. Your keys never leave your device.
        </p>
        <button 
          onClick={() => openAppKit()} 
          className="relative z-10 h-[56px] px-8 bg-black hover:bg-black/85 text-white rounded-2xl text-[14px] font-bold tracking-wide active:scale-[0.98] transition-all shadow-lg shadow-black/20 flex items-center justify-center"
        >
          Connect Identity
        </button>
      </div>
      </TuringShieldGate>
    );
  }

  //  Email User — dedicated relay-based chat (no XMTP wallet signer needed) 
  if (isEmailUser) {
    const emailLabel = (address as string).replace('email_', '');
    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center p-6 gap-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-md bg-white border border-[#EBEBEB] shadow-2xl rounded-3xl p-10 flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div className="text-center">
            <h2 className="text-[22px] font-black tracking-tight text-black mb-2">Email Account Active</h2>
            <p className="text-[12px] text-[#666] leading-relaxed">You are logged in as <span className="font-bold text-black">{emailLabel}</span>.</p>
          </div>
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-[12px] font-semibold text-amber-800 leading-relaxed">
              Whale Chat uses end to end encrypted wallet keys. To access encrypted messaging, connect a Web3 wallet.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
            <span className="text-[13px] font-mono font-bold text-blue-700">{balance.toFixed(2)} QDs available</span>
          </div>
          <button
            onClick={() => openAppKit()}
            className="w-full h-[52px] bg-black text-white rounded-2xl font-bold text-[14px] tracking-wide active:scale-[0.98] transition-all shadow-lg shadow-black/20"
          >
            Connect Wallet for Chat
          </button>
        </div>
      </div>
    );
  }

  //  Loading / Auto-init state 
  if (!client) {
    return (
      <TuringShieldGate>
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-start p-6 pt-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-white border border-[#EBEBEB] shadow-2xl rounded-3xl p-10 flex flex-col items-center">
          
          <div className="w-20 h-20 rounded-full border border-[#EBEBEB] bg-white flex items-center justify-center shadow-sm mb-8">
            {isInitializing ? (
              <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            )}
          </div>

          <h2 className="text-[28px] font-black tracking-tight text-black mb-3 text-center">
            Zero Knowledge <br /> <span className="text-black/30">Transport.</span>
          </h2>
          
          <p className="text-[14px] font-medium text-[#555] text-center leading-[1.6] mb-10 max-w-[280px]">
            {isInitializing ? "Deriving session keys and verifying hardware enclave..." : "Activate your cryptographic identity to access the sovereign network."}
          </p>

          {initError ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-full bg-red-50 text-red-700 text-[13px] font-medium p-4 rounded-xl border border-red-100 text-center leading-relaxed">
                {initError}
              </div>
              
              {(initError.includes('wallet connection lost') || initError.includes('Connect your wallet') || initError.toLowerCase().includes('unknown signer')) ? (
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={() => openAppKit()} className="w-full h-[56px] bg-black text-white rounded-2xl font-bold tracking-wide active:scale-[0.98] transition-all">
                    Reconnect Wallet
                  </button>
                  <button onClick={() => { reconnect(); initClient(); }} className="w-full h-[56px] bg-white border border-[#EBEBEB] text-black rounded-2xl font-bold tracking-wide active:scale-[0.98] transition-all">
                    Refresh Session
                  </button>
                </div>
              ) : (
                <button onClick={initClient} disabled={isInitializing} className="w-full h-[56px] bg-black text-white rounded-2xl font-bold tracking-wide active:scale-[0.98] transition-all disabled:opacity-50">
                  Try Again
                </button>
              )}
            </div>
          ) : !isInitializing ? (
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={initClient}
                className="w-full h-[56px] bg-black hover:bg-black/85 text-white rounded-2xl font-bold text-[14px] tracking-wide active:scale-[0.98] transition-all shadow-lg shadow-black/20"
              >
                Activate Identity
              </button>
              <p className="text-[9px] font-mono uppercase tracking-widest text-black/30 text-center">Protocol-level cryptographic activation</p>
            </div>
          ) : (
            isMobile && (
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-600 mt-6 text-center animate-pulse">
                Confirm signature in wallet
              </p>
            )
          )}
        </div>
      </div>
      </TuringShieldGate>
    );
  }

  return (
    <TuringShieldGate>
    {/* Solid white container — two-panel layout: sidebar (left) + chat (right) */}
      <div className={`relative flex flex-row flex-1 min-h-0 w-full overflow-hidden shadow-sm ${(showScanner || showMyQR || showProfile) ? 'overflow-visible' : ''}`} style={{ 
      borderRadius: isMobile ? 0 : '0',
      background: '#ffffff',
    }}>
      {/*  Sidebar: Conversation List — fixed width, full height  */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/10 bg-white shrink-0 h-full overflow-hidden`}>
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-[12px] font-medium"
                title="Scan QR"
              >
                Scan QR
              </button>
              <button
                onClick={() => setShowMyQR(true)}
                className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all text-[12px] font-medium"
                title="Show My QR"
              >
                My QR
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-xl" title="Available QDs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-blue-700">{balance.toFixed(2)} QD</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Address or .eth"
              value={peerInput}
              onChange={e => setPeerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartConversation()}
              className="flex-1 bg-gray-50 border-none rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400 text-gray-900"
            />
            <button
              onClick={handleStartConversation}
              disabled={sending}
              className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors active:scale-95 disabled:opacity-50 text-[18px]"
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
                  className={`w-full text-left p-3.5 border-b border-white/20 transition-all ${
                    isActive ? 'bg-white/60 shadow-sm' : 'hover:bg-white/40'
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
                        <div className="absolute inset-0 w-full h-full opacity-90 bg-black/5 rounded-full" />
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
      <div className={`${!showList ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 min-h-0`}>
        {activePeer ? (
          <>
            <div className="h-[68px] px-4 border-b border-black/[0.08] flex items-center justify-between bg-white shrink-0 z-10 shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-black/40 text-[10px] font-black tracking-wider mr-1">
                  ←
                </button>
                <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                  <div className="relative">
                    <Avatar address={activePeer!} />
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-[#050505] font-mono flex items-center gap-1.5">
                      {shortAddr(activePeer!)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                      End-to-end encrypted
                    </span>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-xl" title="Available QDs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-blue-700">{balance.toFixed(2)} QD</span>
                </div>
                <button
                  onClick={() => startCall('audio')}
                  className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 transition-colors"
                  title="Audio Call"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => startCall('video')}
                  className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 transition-colors"
                  title="Video Call"
                >
                  <Video size={16} />
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="lg:hidden w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 transition-colors text-[11px] font-black"
                >
                  QR
                </button>
                <button onClick={() => setShowProfile(true)} className="w-9 h-9 hover:bg-black/5 rounded-xl flex items-center justify-center text-black/40 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Dynamic Chat Background */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 relative" style={{ ...bgStyle, fontFamily, fontSize: `${fontSizePx}px` }}>
              {/* Matrix Rain Effect Layer */}
              {chatBackground === 'matrix' && (
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              )}
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
                        <p className="text-[12px] font-medium text-gray-400">No messages yet. Start the conversation!</p>
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
                      <div 
                        className={`flex flex-col max-w-[80%] relative ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ id: msg.id, content, x: e.clientX, y: e.clientY }); }}
                      >
                      {isAudio && audioSrc ? (
                        <div className={`px-3 py-2.5 rounded-2xl ${
                          isMe
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white  rounded-bl-sm border border-black/8  shadow-sm'
                        }`}>
                          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'text-white/60 ' : 'text-black/40 '}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">AUDIO</span>
                          </div>
                          <audio
                            controls
                            src={audioSrc}
                            playsInline
                            preload="metadata"
                            className="h-8 max-w-[200px]"
                            style={{ filter: isMe ? 'invert(1) brightness(0.8)' : 'invert(var(--dark-invert, 0))' }}
                          />
                        </div>
                      ) : isLocation && locationCoords ? (
                        <div className={`px-4 py-3 rounded-2xl flex flex-col gap-2 relative z-20 shadow-sm ${
                          isMe
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
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
                        <div className={`mt-1 overflow-hidden rounded-xl border shadow-sm ${isMe ? 'border-transparent bg-black' : 'border-transparent bg-white'}`}>
                          {attachment.mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                              <img src={attachment.url} alt={attachment.name} className="max-w-[240px] max-h-[300px] object-cover" />
                            </a>
                          ) : attachment.mime.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                            <video src={attachment.url} controls className="max-w-[260px] max-h-[300px] object-contain bg-black" />
                          ) : (
                            <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-3 ${isMe ? 'text-white' : 'text-gray-900'}`}>
                               <span className="font-mono text-[11px] underline break-all line-clamp-2">{attachment.name}</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          isMe
                            ? 'bg-blue-500 text-white rounded-br-sm border border-blue-600/30'
                            : 'bg-[#F2F2F7] text-gray-900 rounded-bl-sm border border-black/5'
                        }`}>
                          {content.startsWith('__CALL_OFFER__') ? "📞 Initiated a Call" : content}
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
                  <div className="flex self-start items-start mt-2 ml-4">
                      <div className="px-4 py-3 bg-white/70 backdrop-blur-md rounded-2xl rounded-bl-sm border border-white shadow-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                  </div>
              )}
              {sending && (
                  <div className="flex flex-col self-end max-w-[80%] items-end mt-2">
                     <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-white/10 rounded-full animate-pulse shadow-sm" />
                       <div className="w-full h-full rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="shrink-0 bg-white/80 backdrop-blur-xl border-t border-black/10 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]"
              style={{ paddingBottom: `max(8px, env(safe-area-inset-bottom, 0px))` }}
            >
              {/*  Offline Banner  */}
              {isOffline && (
                <div className="flex items-center gap-2 px-4 pt-2 pb-1 bg-gray-950/5 border-b border-black/5">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-600 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse inline-block" />
                    OFFLINE — Messages queued to outbox
                  </span>
                </div>
              )}
              {/*  Audio recording indicator  */}
              {isRecording && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[12px] font-medium">{recordingSeconds}s</span>
                    </div>
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2 p-3 items-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 text-gray-500 shrink-0"
                  title="Attach File"
                >
                  {isUploading ? <span className="text-[12px] animate-spin">⌛</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={isUploading}
                  placeholder={isUploading ? "Uploading..." : "Type a message..."}
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400 disabled:opacity-50 text-[15px]"
                />
                
                {inputText.trim() ? (
                  <button
                    type="submit"
                    disabled={sending || isUploading}
                    className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white disabled:opacity-30 hover:bg-blue-600 transition-all shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    onPointerLeave={stopRecording}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isRecording ? 'bg-red-500 text-white shadow-md scale-110' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/30 backdrop-blur-lg relative overflow-hidden p-6 md:p-12 border-l border-white/40">
            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-full flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-700">
              
              {/* Whale Logo */}
              <div className="w-40 h-40 mb-8 rounded-full bg-white/50 backdrop-blur-xl shadow-2xl border border-white flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
                <img src="/official-whale-monochrome.png" alt="Whale Network" className="w-24 h-24 object-contain opacity-90 drop-shadow-md" style={{ filter: 'invert(var(--dark-invert, 0))' }} />
              </div>

              {/* Main Typography */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
                WHALE CHAT
              </h1>
              <h2 className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-blue-500 mb-8">
                The Native Web3 Social Network
              </h2>

              {/* Marketing Banner */}
              <div className="w-full bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-xl mb-12 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Global Release</span>
                </div>
                <p className="text-2xl font-black text-gray-800 tracking-tight mb-2">01 / 01 / 2027</p>
                <div className="flex items-center justify-center gap-4 text-gray-400 mt-4">
                   <span className="text-[12px] font-medium border border-gray-200/50 bg-white/50 px-3 py-1 rounded-full">App Store</span>
                   <span className="text-[12px] font-medium border border-gray-200/50 bg-white/50 px-3 py-1 rounded-full">Google Play</span>
                </div>
              </div>

              {/* Action Call */}
              <div className="w-full px-8 py-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                <span className="text-[14px] font-medium text-gray-600 flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Select a wallet to initialize an encrypted tunnel
                </span>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* Hidden audio element for audio-only calls - iOS WebKit Safe (no display:none) */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />

      {/* ── Incoming Call Banner (state: ringing) ───────────────────────────── */}
      {callState === 'ringing' && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 w-[100dvw] h-[100dvh] z-[100000] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500" style={{ touchAction: 'none' }}>
          <div className="flex flex-col items-center gap-10 mt-[-10dvh]">
            {/* Avatar + pulse ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping scale-150" style={{ animationDuration: '2s' }} />
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30 relative z-10">
                <Phone size={56} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-sm font-mono uppercase tracking-[0.3em] mb-3">
                {callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
              </p>
              <p className="text-white text-3xl font-black tracking-tight">
                {activePeer ? shortAddr(activePeer) : 'Peer'}
              </p>
            </div>
            <div className="flex items-center gap-12 mt-4">
              {/* Decline */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={declineCall}
                  className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-500/40"
                >
                  <PhoneOff size={32} />
                </button>
                <span className="text-white/60 text-xs font-mono uppercase tracking-widest">Decline</span>
              </div>
              {/* Answer */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={answerCall}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-400 active:scale-95 transition-all shadow-2xl shadow-green-500/50 animate-pulse"
                >
                  <Phone size={40} className="animate-bounce" />
                </button>
                <span className="text-white/60 text-xs font-mono uppercase tracking-widest">Answer</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Outgoing Call (state: calling — waiting for answer) ─────────────── */}
      {callState === 'calling' && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 w-[100dvw] h-[100dvh] z-[100000] bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-400" style={{ touchAction: 'none' }}>
          <div className="flex flex-col items-center gap-8 mt-[-10dvh]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping scale-150" style={{ animationDuration: '2s' }} />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 relative z-10">
                <Phone size={48} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs font-mono uppercase tracking-[0.3em] mb-2">Calling...</p>
              <p className="text-white text-xl font-black tracking-tight">
                {activePeer ? shortAddr(activePeer) : 'Peer'}
              </p>
              <p className="text-white/30 text-xs mt-1 font-mono">Waiting for answer</p>
            </div>
            {localStream && callType === 'video' && (
              <div className="w-36 h-48 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-500/40"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Connecting Overlay (state: connecting — receiver answered, waiting for WebRTC stream) ── */}
      {callState === 'connecting' && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 w-[100dvw] h-[100dvh] z-[100000] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-400" style={{ touchAction: 'none' }}>
          <div className="flex flex-col items-center gap-8 mt-[-10dvh]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150" style={{ animationDuration: '1.5s' }} />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative z-10">
                <Phone size={48} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs font-mono uppercase tracking-[0.3em] mb-2">Connecting...</p>
              <p className="text-white text-xl font-black tracking-tight">
                {activePeer ? shortAddr(activePeer) : 'Peer'}
              </p>
              <p className="text-white/30 text-xs mt-1 font-mono animate-pulse">Establishing secure media stream</p>
            </div>
            {localStream && callType === 'video' && (
              <div className="w-36 h-48 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-500/40"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Active Call Overlay — Full Screen Premium UI ──────────────────── */}
      {callState === 'active' && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 w-[100dvw] h-[100dvh] z-[100000] bg-black flex flex-col" style={{ touchAction: 'none' }}>

          {/* ── Remote Video / Audio — covers full viewport ─────────────────── */}
          <div className="absolute inset-0">
            {callType === 'video' ? (
              remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ background: '#000' }}
                />
              ) : (
                /* Waiting for remote video — dark background with animated ring */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 to-black gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-white/5 animate-ping scale-150" style={{ animationDuration: '2s' }} />
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/40">
                      <Video size={40} />
                    </div>
                  </div>
                  <p className="text-white/40 text-sm font-mono uppercase tracking-widest animate-pulse">Waiting for camera...</p>
                </div>
              )
            ) : (
              /* Audio-only — gradient background with big avatar */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0e1230] to-[#0a0a1a] gap-8">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  {/* Pulsing rings for active audio */}
                  <div className="relative">
                    {remoteStream && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping scale-125" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping scale-150" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }} />
                      </>
                    )}
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-indigo-500/30 relative z-10">
                      <span className="text-white text-5xl font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '??'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-2xl font-black tracking-tight mb-1">{activePeer ? shortAddr(activePeer) : 'Peer'}</p>
                    {remoteStream ? (
                      <span className="text-emerald-400 text-xs font-mono uppercase tracking-[0.3em] flex items-center gap-1.5 justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Audio Connected • {formatDuration(callDurationSeconds)}
                      </span>
                    ) : (
                      <span className="text-yellow-400/70 text-xs font-mono uppercase tracking-widest animate-pulse">Establishing audio...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Top bar: caller info + timer ─────────────────────────────────── */}
          <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 pt-safe" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '??'}</span>
              </div>
              <div>
                <p className="text-white text-[13px] font-bold leading-none">{activePeer ? shortAddr(activePeer) : 'Peer'}</p>
                <p className="text-white/40 text-[10px] font-mono mt-0.5">{callType === 'video' ? '📹 Video Call' : '🎙️ Audio Call'}</p>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/10 flex items-center justify-center min-w-[80px]">
              <span className="text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                {remoteStream ? `● LIVE | ${formatDuration(callDurationSeconds)}` : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* ── PiP: local camera (video calls only) — larger, top-right ──────── */}
          {callType === 'video' && (
            <div className="absolute top-20 right-4 z-20" style={{ top: 'max(80px, calc(env(safe-area-inset-top, 0px) + 68px))' }}>
              {!isCamOff && localStream ? (
                <div className="w-36 h-52 md:w-48 md:h-64 rounded-3xl overflow-hidden border-2 border-white/25 shadow-2xl bg-black">
                  <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-52 md:w-48 md:h-64 rounded-3xl bg-gray-900/80 border-2 border-white/10 flex items-center justify-center backdrop-blur">
                  <div className="flex flex-col items-center gap-2 text-white/20">
                    <VideoOff size={24} />
                    <p className="text-[9px] font-mono uppercase">Cam Off</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Floating Controls Bar ─────────────────────────────────────────── */}
          <div
            className="absolute bottom-0 inset-x-0 z-10"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
          >
            <div className="mx-4 mb-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl px-6 py-4 flex items-center justify-center gap-5 shadow-2xl">

              {/* Mic toggle */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={toggleMic}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                    isMicMuted
                      ? 'bg-red-500/90 text-white shadow-red-500/30'
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  }`}
                >
                  {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <span className="text-white/40 text-[9px] font-mono uppercase tracking-wider">{isMicMuted ? 'Unmute' : 'Mute'}</span>
              </div>

              {/* Camera toggle (video calls) */}
              {callType === 'video' && (
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      isCamOff
                        ? 'bg-red-500/90 text-white shadow-red-500/30'
                        : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    }`}
                  >
                    {isCamOff ? <VideoOff size={22} /> : <Video size={22} />}
                  </button>
                  <span className="text-white/40 text-[9px] font-mono uppercase tracking-wider">{isCamOff ? 'Camera' : 'Camera'}</span>
                </div>
              )}

              {/* END CALL — prominently larger */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={endCall}
                  className="w-20 h-14 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 active:scale-90 transition-all shadow-xl shadow-red-500/40"
                >
                  <PhoneOff size={26} />
                </button>
                <span className="text-red-400/70 text-[9px] font-mono uppercase tracking-wider">End</span>
              </div>

              {/* Speaker / volume indicator */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60">
                  <Volume2 size={22} />
                </div>
                <span className="text-white/40 text-[9px] font-mono uppercase tracking-wider">Speaker</span>
              </div>

            </div>
          </div>

          {/* Hidden audio element for remote audio in all call modes */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
        </div>,
        document.body
      )}

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
                   projectDescription={chatBio || "Present this code to a peer. Once scanned, you can start messaging securely."} 
               />
           </div>
        </div>
      )}

       {/* Context Menu Overlay */}
       {contextMenu && typeof document !== 'undefined' && createPortal(
         <div className="fixed inset-0 z-[200]" onClick={() => setContextMenu(null)}>
           <div 
             className="absolute bg-white  border border-black/10  rounded-2xl shadow-xl p-2 min-w-[160px] flex flex-col"
             style={{ 
               top: Math.min(contextMenu.y / (typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).zoom || '1') : 1), window.innerHeight - 150), 
               left: Math.min(contextMenu.x / (typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).zoom || '1') : 1), window.innerWidth - 180) 
             }}
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
         </div>,
         document.body
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
                     <p className="text-[12px] text-blue-500 font-medium mt-1">End to End Encrypted</p>
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
    </TuringShieldGate>
  );
}
