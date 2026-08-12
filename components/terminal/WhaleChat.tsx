"use client";
import { MoreVertical, MapPin, Copy, Trash2, UserPlus, Download, Slash, Settings, Clock } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Video, VideoOff, Phone, PhoneOff, Mic, MicOff, Volume2, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
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

export const formatMessagePreview = (content: string): string => {
  if (typeof content !== 'string') return 'Message';
  let cleanContent = content;
  
  // Recursively unwrap replies
  while (cleanContent.startsWith('__REPLY__')) {
    const parts = cleanContent.split('__::');
    if (parts.length >= 2) {
      cleanContent = parts.slice(1).join('__::');
    } else {
      break;
    }
  }

  // Handle system messages and metadata
  if (cleanContent.startsWith('__CALL_OFFER__:')) {
    return cleanContent.includes(':video') ? '📹 Video Call' : '📞 Voice Call';
  }
  if (cleanContent.startsWith('__AUDIO__')) return '🎙️ Voice Note';
  if (cleanContent.startsWith('[LOCATION]')) return '📍 Location';
  if (cleanContent.startsWith('[ATTACHMENT')) return '📎 Attachment';
  if (cleanContent.startsWith('[GIF]')) return '🖼️ GIF';
  if (cleanContent.startsWith('__PIN__') || cleanContent.startsWith('__REVOKE__') || cleanContent.startsWith('__READ__')) {
    return 'System Message';
  }

  return cleanContent;
};

export const parseMessageText = (text: string, isMe: boolean) => {
  if (typeof text !== 'string') return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className={`underline break-all ${isMe ? 'text-white' : 'text-blue-500 hover:text-blue-600'}`}>
          {part}
        </a>
      );
    }
    const boldParts = part.split(/\*\*(.*?)\*\*/g);
    const parsedBold = boldParts.map((bp, j) => j % 2 === 1 ? <strong key={`b-${i}-${j}`}>{bp}</strong> : bp);
    return <React.Fragment key={i}>{parsedBold}</React.Fragment>;
  });
};

const CustomAudioPlayer = ({ src, isMe }: { src: string, isMe: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = () => setProgress(audio.currentTime);
          audio.currentTime = 0;
          setDuration(audio.duration);
        };
      } else {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => { setIsPlaying(false); setProgress(0); };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const formatTime = (t: number) => {
    if (isNaN(t) || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 p-1 ${isMe ? 'text-white' : 'text-gray-800'}`} onClick={e => e.stopPropagation()}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center shrink-0">
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        )}
      </button>
      <div className="flex flex-col flex-1 gap-1 min-w-[120px]">
        <input 
          type="range" 
          min={0} max={duration || 100} 
          value={progress} 
          onChange={handleSeek} 
          onClick={e => e.stopPropagation()}
          className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-current [&::-webkit-slider-thumb]:rounded-full"
        />
        <div className="flex justify-between items-center text-[10px] font-mono opacity-70">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <button onClick={cycleSpeed} className="w-8 h-8 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono opacity-80 hover:opacity-100 bg-black/5 rounded-full">
        {playbackRate}x
      </button>
    </div>
  );
};

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
  const { spendQDs, balance, aztecAddress, refresh: refreshBalance } = aztecNative;
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
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null); // Phase 2: Message Quoting
  const [reactionMenu, setReactionMenu] = useState<string | null>(null); // Phase 2: Emoji Reactions
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null); // Phase 3: Pinned
  const [burnTimer, setBurnTimer] = useState<number | null>(null); // Phase 3: Self-Destruct TTL
  const [messages, setMessages] = useState<any[]>([]);

  // Phase 3: Self-Destruct Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev => {
        const next = prev.filter(m => !m.burnAtNs || m.burnAtNs > now);
        return next.length !== prev.length ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
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
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [blockedPeers, setBlockedPeers] = useState<Set<string>>(new Set());

  const [contextMenu, setContextMenu] = useState<{ id: string, content: string, x: number, y: number } | null>(null);

  // ─── Phase 4: Ecosystem Features ─────────────────────────────────────────────
  const [archivedPeers, setArchivedPeers] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false); // toggle archived section
  const [sidebarMenu, setSidebarMenu] = useState<{ peer: string; x: number; y: number } | null>(null); // right-click on sidebar
  const [editingMsg, setEditingMsg] = useState<{ id: string; content: string } | null>(null); // inline edit state
  const [showClearConfirm, setShowClearConfirm] = useState(false); // clear chat confirmation

  // ─── Phase 5: Secret Chat & Integrations ──────────────────────────────────────
  const [isSecretChat, setIsSecretChat] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showWalletTransfer, setShowWalletTransfer] = useState(false);
  // Phase 5: Poll creator form state (hoisted to satisfy React rules of hooks)
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  // Phase 5: Wallet transfer form state
  const [transferAmount, setTransferAmount] = useState('');
  const [transferSending, setTransferSending] = useState(false);

  // ─── Hito 4: Search, Forward, GIF, Scheduled ──────────────────────────────
  const [searchQuery, setSearchQuery] = useState(''); // in-chat search
  const [showSearch, setShowSearch] = useState(false); // search bar toggle
  const [searchIndex, setSearchIndex] = useState(0); // current match index
  const [forwardMsg, setForwardMsg] = useState<any | null>(null); // message to forward
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null); // scheduled send time
  const [showGifPicker, setShowGifPicker] = useState(false); // GIF picker
  const [gifSearch, setGifSearch] = useState('trending'); // GIF search query
  const [gifResults, setGifResults] = useState<string[]>([]); // GIF URLs
  const [linkPreview, setLinkPreview] = useState<{ url: string, title: string, description: string, image?: string } | null>(null);

  // ─── WebRTC Call State Machine ───────────────────────────────────────────────
  // States: idle → calling (outgoing) → ringing (incoming) → active → idle
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  // [ANDROID FIX] peerInstanceRef — always holds the current peer, avoids stale closures
  // in answerCall/startCall which are async and can capture stale state.
  const peerInstanceRef = useRef<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const myPeerIdRef = useRef<string>(''); // [ANDROID FIX] ref mirrors state for async safety
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
  // [ARCH-FIX] Pending PeerJS connection queued by peer.on('call') — used by answerCall()
  const pendingConnectionRef = useRef<any>(null);
  // Caller stores the remotePeerId — now derived deterministically, not from XMTP
  const remotePeerIdRef = useRef<string>('');
  // Caller stores the call type sent to peer
  const callTypeRef = useRef<'audio'|'video'>('audio');
  // isCalling: true if we INITIATED the call (to know whether to call or answer)
  const isCallerRef = useRef<boolean>(false);

  // [ARCH-FIX] Deterministic PeerID derivation — mirrors the logic in PeerJS initialization.
  // Both caller and receiver can compute each other's PeerID from the wallet address alone.
  // This eliminates the need for XMTP to carry the PeerID in CALL_ANSWER.
  const derivePeerId = useCallback((walletAddress: string): string => {
    return `whale${walletAddress.slice(2, 12).toLowerCase()}`;
  }, []);
  // Mute / Camera state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  
  // ── Telegram/WhatsApp Parity States ──
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'disconnected'>('good');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [activeCamera, setActiveCamera] = useState<'user' | 'environment'>('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  // Call Duration State
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const callDurationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auditor Fixes: Refs
  const isComponentMountedRef = useRef(true);
  const callTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      // Auditor Fix: Stop rogue timeouts and active streams on unmount
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    };
  }, []);

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
    // Phase 5: Request push notifications
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (address) {
      try {
        const a = localStorage.getItem(`whale_archived_${address}`);
        if (a) setArchivedPeers(new Set(JSON.parse(a)));
      } catch {}
    }
  }, [address]);

  // Phase 5: Reset Secret Chat and Polls when changing peer
  useEffect(() => {
    setIsSecretChat(false);
    setShowPollCreator(false);
    setShowWalletTransfer(false);
  }, [activePeer]);

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

  // Phase 4: clearChat — shows confirmation modal first
  const clearChat = () => {
    setShowProfile(false);
    setShowClearConfirm(true);
  };

  const executeClearChat = () => {
    if (!activePeer || !address) return;
    const dmId = `dm-${activePeer.toLowerCase()}`;
    const clearTs = Date.now();
    localStorage.setItem(`whale_cleared_${address}_${activePeer.toLowerCase()}`, clearTs.toString());
    setMessages(prev => prev.filter(m => m.conversationId !== dmId));
    setShowClearConfirm(false);
    toast.success('✅ Chat cleared.');
  };

  // Phase 4: Archive/Unarchive a conversation (persisted to localStorage)
  const toggleArchive = (peer: string) => {
    setArchivedPeers(prev => {
      const next = new Set(prev);
      if (next.has(peer.toLowerCase())) {
        next.delete(peer.toLowerCase());
        toast.success('Chat unarchived.');
      } else {
        next.add(peer.toLowerCase());
        toast.success('Chat archived.');
      }
      try { localStorage.setItem(`whale_archived_${address}`, JSON.stringify([...next])); } catch {}
      return next;
    });
    setSidebarMenu(null);
  };

  // Phase 4: Delete conversation from sidebar entirely (local only)
  const deleteConversation = (peer: string) => {
    setConversations(prev => prev.filter(c => c.peerAddress.toLowerCase() !== peer.toLowerCase()));
    const dmId = `dm-${peer.toLowerCase()}`;
    setMessages(prev => prev.filter(m => m.conversationId !== dmId));
    if (activePeer?.toLowerCase() === peer.toLowerCase()) setActivePeer(null);
    setSidebarMenu(null);
    toast.success('Conversation removed.');
  };

  // Phase 4: Submit edited message — sends XMTP signal __EDIT__id__::newContent
  const submitEditMessage = async () => {
    if (!editingMsg || !editingMsg.content.trim()) return;
    const signal = `__EDIT__${editingMsg.id}__::${editingMsg.content.trim()}`;
    // Optimistic local update
    setMessages(prev => prev.map(m => m.id === editingMsg.id ? { ...m, content: editingMsg.content.trim(), edited: true } : m));
    setEditingMsg(null);
    // Persist signal over XMTP so peer sees the edit too
    if (executeSendRef.current) await executeSendRef.current(signal);
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
  // [CALL FIX] We MUST use a deterministic, stable PeerID based on the wallet address.
  // The Reverse-Dial architecture requires the CALLER to know the receiver's PeerID
  // WITHOUT an XMTP round-trip. derivePeerId(address) gives us that stable ID.
  // Using a random ID would make startCall's derivePeerId() useless — the IDs would
  // never match and WebRTC would always fail to connect.
  useEffect(() => {
    if (!address || peerInstance) return;
    import('peerjs').then(({ default: Peer }) => {
      // ─── DETERMINISTIC PEERID — CRITICAL FOR REVERSE-DIAL ARCHITECTURE ───
      // Both peers derive each other's ID from the wallet address alone.
      // This means: Caller computes derivePeerId(activePeer) → dials the receiver.
      // No XMTP signaling of PeerID needed. Connection is instantaneous.
      const stablePeerId = derivePeerId(address);
      const peer = new Peer(stablePeerId, {
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
        console.log('[WhaleChat:PeerJS] Open with dynamic ID:', id);
        setMyPeerId(id);
      });

      // ─── Universal Incoming Call Handler ─────────────────────────────────
      // With the deterministic architecture, EITHER party can receive an incoming
      // PeerJS connection. The Caller dials the receiver directly, so the receiver
      // gets peer.on('call') in 'ringing' state BEFORE they have a localStream.
      // In that case, save the connection in pendingConnectionRef so answerCall()
      // can answer it after obtaining the stream (user-gesture on Android).
      peer.on('call', (connection) => {
        console.log('[WhaleChat:PeerJS] Incoming PeerJS connection from:', connection.peer, '| callState:', callStateRef.current);
        
        if (callStateRef.current === 'ringing') {
          // Receiver gets the call before clicking Answer — store it for answerCall()
          console.log('[WhaleChat:PeerJS] Storing pending connection for answerCall()');
          pendingConnectionRef.current = connection;
        } else if (
          (callStateRef.current === 'calling' || callStateRef.current === 'connecting')
          && localStreamRef.current
        ) {
          // Caller gets a reverse-dial from receiver — answer immediately
          connection.answer(localStreamRef.current!);
          setActiveConnection(connection);
          setCallState('active');
          if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
          connection.on('stream', (rStream: MediaStream) => {
            console.log('[WhaleChat:PeerJS] Got remote stream — ACTIVE');
            setRemoteStream(rStream);
            setCallState('active');
            stopRingtone();
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
            if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = rStream; remoteAudioRef.current.play().catch(() => {}); }
          });
          connection.on('close', () => performEndCallRef.current());
          connection.on('error', () => performEndCallRef.current());
        } else {
          console.warn('[Call] Received peer.on(call) in unexpected state:', callStateRef.current, '— rejecting.');
          connection.close();
        }
      });
      peer.on('error', (err) => {
        console.warn('[WhaleChat:PeerJS] Error:', err.type, err.message);
      });
      peer.on('disconnected', () => {
        console.warn('[WhaleChat:PeerJS] Disconnected — attempting reconnect...');
        try { peer.reconnect(); } catch {}
      });
      setPeerInstance(peer);
      peerInstanceRef.current = peer; // [ANDROID FIX] sync ref immediately
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // [ANDROID FIX] Keep peerInstanceRef and myPeerIdRef in sync with state
  useEffect(() => { peerInstanceRef.current = peerInstance; }, [peerInstance]);
  useEffect(() => { myPeerIdRef.current = myPeerId; }, [myPeerId]);

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

    // ── CALL_OFFER: Peer is calling us (XMTP notification only — ring the device) ─
    // [ARCH-FIX] XMTP CALL_OFFER is now only a ring notification.
    // The actual WebRTC connection is initiated by the caller directly via PeerJS WebSocket.
    // The receiver's peer.on('call') will fire immediately from PeerJS, independent of XMTP latency.
    if (content.startsWith('__CALL_OFFER__:')) {
      processedSignalIds.current.add(lastMsg.id);
      const parts = content.split(':');
      const callerPeerId = parts[1];
      const offerCallType: 'audio'|'video' = (parts[2] as any) || 'audio';
      
      // ─── REVERSE-DIAL ARCHITECTURE ─────────────────────────────────────────
      // We must save the Caller's dynamic PeerID so that when the user clicks
      // "Answer", we know who to initiate the WebRTC connection back to.
      if (callerPeerId) {
        remotePeerIdRef.current = callerPeerId;
      }

      if (callStateRef.current === 'idle') {
        setCallType(offerCallType);
        isCallerRef.current = false;
        setCallState('ringing');
        startRingtone();
      }
      console.log('[WhaleChat:Signal] CALL_OFFER received, callerPeerId:', callerPeerId, 'type:', offerCallType);
    }

    // ── CALL_ANSWER signal from receiver (kept for compatibility / fallback logging) ─
    // [ARCH-FIX] The caller NO LONGER waits for CALL_ANSWER to dial.
    // The caller already called peerInstance.call() immediately in startCall().
    // This signal is kept for potential future use (e.g., logging, compatibility with
    // older clients) but does NOT trigger any WebRTC action in the new architecture.
    if (content.startsWith('__CALL_ANSWER__:')) {
      processedSignalIds.current.add(lastMsg.id);
      console.log('[WhaleChat:Signal] CALL_ANSWER (ack) received — WebRTC already initiated directly.');
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

  // ─── WebRTC Advanced Telemetry & Telegram-Parity Visuals ─────────────────
  
  // Audio Visualizer for Audio Calls
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (callState === 'active' && remoteStream && callTypeRef.current === 'audio') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        // Connect stream to analyser (do NOT connect to destination to avoid echo, <audio> plays it)
        const source = ctx.createMediaStreamSource(remoteStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const updateLevel = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) sum += dataArrayRef.current[i];
          const avg = sum / bufferLength;
          setAudioLevel(avg);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (e) {
        console.warn("[WhaleChat:AudioViz] AudioContext error:", e);
      }
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(()=>{});
        audioContextRef.current = null;
      }
    };
  }, [callState, remoteStream]);

  // Network Quality Monitor
  useEffect(() => {
    if (callState !== 'active' || !activeConnectionRef.current) {
      setNetworkQuality('good');
      return;
    }
    const interval = setInterval(async () => {
      try {
        const peerConn = activeConnectionRef.current?.peerConnection;
        if (!peerConn) return;
        const stats = await peerConn.getStats();
        let isPoor = false;
        stats.forEach((report: any) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            if (report.currentRoundTripTime > 0.4) isPoor = true; // > 400ms latency
          }
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            if (report.packetsReceived > 0) {
              const fractionLost = report.packetsLost / report.packetsReceived;
              if (fractionLost > 0.05) isPoor = true; // > 5% packet loss
            }
          }
        });
        setNetworkQuality(isPoor ? 'poor' : 'good');
      } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [callState]);

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
    if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
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
    setIsCallMinimized(false); // [AUDIT FIX] Always reset minimized state so next call starts full-screen
    setIsScreenSharing(false); // [AUDIT FIX] Reset screen sharing state
    setAudioLevel(0);          // [AUDIT FIX] Reset audio visualizer level
    setNetworkQuality('good'); // [AUDIT FIX] Reset network quality indicator
    isCallerRef.current = false;
    remotePeerIdRef.current = '';
    // [CALL FIX] Clear any stored pending connection to prevent stale state across calls
    if (pendingConnectionRef.current) {
      try { pendingConnectionRef.current.close(); } catch {}
      pendingConnectionRef.current = null;
    }
    if (myVideoRef.current) myVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = null; }
  }, []);

  // ─── startCall: Initiates an outgoing call ───────────────────────────────────
  // ANDROID FIX: This function MUST be called directly from a user-gesture handler
  // (onClick). Android Chrome enforces that getUserMedia() is only callable from
  // a trusted user-gesture context. Any async indirection breaks this.
  // CRITICAL: We do NOT await anything before getUserMedia, otherwise
  // Android WebViews will strip the transient user-activation token.
  const startCall = async (type: 'audio' | 'video') => {
    if (!peerInstance || !activePeer) return;

    // [ARCH-FIX] Derive receiver PeerID deterministically — no XMTP round-trip needed
    const receiverPeerId = derivePeerId(activePeer);
    console.log('[Call:ARCH-FIX] Derived receiver PeerID:', receiverPeerId, 'for address:', activePeer);

    let stream: MediaStream | null = null;
    try {
      // ─── ROBUST SINGLE-CALL WEBRTC (Android Fix) ─────────────────────────
      // We must NEVER use nested try-catch fallbacks for getUserMedia on Android.
      // If the first request fails, the transient user-activation token is lost,
      // and all subsequent fallbacks will automatically throw NotAllowedError.
      // Therefore, we make exactly ONE robust request with minimal safe constraints.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video' ? { facingMode: 'user' } : false,
      });

      // Prevent state inconsistency if unmounted while waiting for permissions
      if (!isComponentMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      setLocalStream(stream);
      setCallType(type);
      callTypeRef.current = type;
      isCallerRef.current = true;
      remotePeerIdRef.current = receiverPeerId;
      setCallState('calling');
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      // ─── DETERMINISTIC CALL ARCHITECTURE (Caller Side) ────────────────────
      // With deterministic PeerIDs, the Caller dials the receiver DIRECTLY using
      // derivePeerId(activePeer). We also send CALL_OFFER via XMTP so the receiver's
      // UI shows the ringing screen. The CALL_OFFER carries the caller's stable PeerID.
      const myStablePeerId = derivePeerId(address!);
      executeSend(`__CALL_OFFER__:${myStablePeerId}:${type}`).catch(() => {});

      // Directly dial the receiver via PeerJS — no XMTP round-trip needed
      const livePeerForStart = peerInstanceRef.current;
      if (livePeerForStart && !livePeerForStart.destroyed) {
        const outConn = livePeerForStart.call(receiverPeerId, stream, {
          metadata: { callType: type }
        });
        if (outConn) {
          setActiveConnection(outConn);
          outConn.on('stream', (rStream: MediaStream) => {
            console.log('[Call:PeerJS] Caller received remote stream — ACTIVE');
            setRemoteStream(rStream);
            setCallState('active');
            stopRingtone();
            if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = rStream;
              remoteAudioRef.current.play().catch(err => console.warn('[Audio] play() blocked:', err));
            }
          });
          outConn.on('close', () => performEndCallRef.current());
          outConn.on('error', () => performEndCallRef.current());
        }
      }
      toast.success('Ringing...');

      // Caller timeout: if no stream arrives in 60s, clean up
      callTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current === 'calling') {
          toast.error('No answer — call timed out.');
          performEndCallRef.current();
        }
      }, 60000);

    } catch (e: any) {
      if (stream) { try { stream.getTracks().forEach(t => t.stop()); } catch {} }
      setLocalStream(null);
      setCallState('idle');
      isCallerRef.current = false;
      const errName = e?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        toast.error('Mic/Camera access denied. If allowed in OS, check Chrome Site Settings or open outside of in-app browsers (Telegram/Twitter).', { duration: 6000 });
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        toast.error('No microphone or camera found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        toast.error('Camera/Microphone is in use by another app. Please close it.', { duration: 6000 });
      } else {
        toast.error(`Call failed: ${e?.message || 'Unknown error'}`);
      }
      console.error('[Call] getUserMedia error:', e);
    }
  };

  // ─── answerCall: Receiver accepts incoming call ──────────────────────────────
  // ANDROID FIX: Called directly from the "Answer" onClick — preserves user-gesture
  // context required by Android Chrome for getUserMedia.
  const answerCall = async () => {
    stopRingtone();
    // [ANDROID FIX] Use callStateRef.current instead of the stale React state closure.
    if (callStateRef.current !== 'ringing') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Your browser does not support media access. Please use Chrome.');
      return;
    }

    let stream: MediaStream | null = null;
    try {
      // ─── ROBUST SINGLE-CALL WEBRTC (Android Fix) ─────────────────────────
      // We must NEVER use nested try-catch fallbacks for getUserMedia on Android.
      // If the first request fails, the transient user-activation token is lost,
      // and all subsequent fallbacks will automatically throw NotAllowedError.
      // Therefore, we make exactly ONE robust request with minimal safe constraints.
      // [ANDROID FIX] We use callTypeRef.current to avoid stale closures.
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callTypeRef.current === 'video' ? { facingMode: 'user' } : false,
      });
      // Prevent state inconsistency if unmounted while waiting for permissions
      if (!isComponentMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      setLocalStream(stream);
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      // ── AUDIO AUTOPLAY UNLOCK ─────────────────────────────────────────────────
      // Browsers require a user-gesture (the 'Answer' button click) to allow autoplay.
      // Create a silent AudioContext with the gesture to unlock audio on iOS/Android.
      try {
        const unlockCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const silentBuf = unlockCtx.createBuffer(1, 1, 22050);
        const src = unlockCtx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(unlockCtx.destination);
        src.start(0);
        await unlockCtx.resume();
        unlockCtx.close();
      } catch { /* ignore — best effort */ }

      setCallState('connecting');
      toast.success('Answering call...');

      // ─── DETERMINISTIC ANSWER ARCHITECTURE ────────────────────────────────
      // PRIMARY PATH: If the Caller dialed us directly (deterministic architecture),
      // peer.on('call') already stored the pending connection in pendingConnectionRef.
      // We answer THAT connection with our stream — no outbound call needed.
      //
      // FALLBACK PATH: If pendingConnectionRef is empty (e.g., old session, XMTP-only),
      // we make an outbound call to the Caller's deterministic PeerID.
      const pendingConn = pendingConnectionRef.current;

      if (pendingConn) {
        console.log('[Call:answerCall] Answering stored pending connection from Caller');
        pendingConnectionRef.current = null;
        pendingConn.answer(stream);
        setActiveConnection(pendingConn);
        pendingConn.on('stream', (rStream: MediaStream) => {
          console.log('[Call:PeerJS] Receiver got remote stream — ACTIVE');
          setRemoteStream(rStream);
          setCallState('active');
          stopRingtone();
          if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = rStream;
            remoteAudioRef.current.play().catch(err => console.warn('[Audio] play() blocked:', err));
          }
        });
        pendingConn.on('close', () => performEndCallRef.current());
        pendingConn.on('error', () => performEndCallRef.current());
      } else {
        // FALLBACK: Outbound call to Caller's deterministic PeerID
        console.log('[Call:answerCall] No pending connection — falling back to outbound dial');
        const targetPeerId = remotePeerIdRef.current || derivePeerId(activePeer!);
        const livePeer = peerInstanceRef.current;
        if (!livePeer || livePeer.destroyed) {
          toast.error('WebRTC: Peer connection not ready. Please refresh.');
          performEndCallRef.current();
          return;
        }

        const conn = livePeer.call(targetPeerId, stream, {
          metadata: { callType: callTypeRef.current }
        });
        if (!conn) {
          toast.error('WebRTC: Failed to initiate connection.');
          performEndCallRef.current();
          return;
        }
        
        setActiveConnection(conn);
        conn.on('stream', (rStream: MediaStream) => {
          console.log('[Call:PeerJS] Receiver got remote stream (fallback) — ACTIVE');
          setRemoteStream(rStream);
          setCallState('active');
          if (callTimeoutRef.current) { clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; }
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rStream;
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = rStream;
            remoteAudioRef.current.play().catch(err => console.warn('[Audio] play() blocked:', err));
          }
        });
        conn.on('close', () => performEndCallRef.current());
        conn.on('error', () => performEndCallRef.current());
      }

      // Send CALL_ANSWER as status update for chat UI
      const myStableId = derivePeerId(address!);
      executeSend(`__CALL_ANSWER__:${myStableId}`).catch(() => {});

      // Failsafe: if remote stream does not arrive within 20s, abort
      callTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current === 'connecting') {
          toast.error('Call timed out — no media stream received.');
          performEndCallRef.current();
        }
      }, 20000);

    } catch (e: any) {
      if (stream) { try { stream.getTracks().forEach(t => t.stop()); } catch {} }
      setLocalStream(null);
      setCallState('idle');
      
      // Tell the caller immediately that we couldn't answer due to hardware/permission failure
      executeSend('__CALL_DECLINE__').catch(() => {});

      const errName = e?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        toast.error('Mic/Camera access denied. If allowed in OS, check Chrome Site Settings or open outside of in-app browsers (Telegram/Twitter).', { duration: 6000 });
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        toast.error('No microphone or camera found on this device.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        toast.error('Camera/Microphone is in use by another app. Please close it.', { duration: 6000 });
      } else {
        toast.error(`Failed to answer call: ${e?.message || 'Unknown error'}`);
      }
      console.error('[Call] answerCall error:', e);
    }
  };

  // ─── declineCall: Receiver declines ─────────────────────────────────────────
  const declineCall = useCallback(async () => {
    try {
      if (executeSendRef.current) await executeSendRef.current('__CALL_DECLINE__');
    } catch {}
    performEndCall();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performEndCall]);

  // ─── endCall: Either party hangs up ─────────────────────────────────────────
  const endCall = useCallback(async () => {
    try {
      if (executeSendRef.current) await executeSendRef.current('__CALL_HANGUP__');
    } catch {}
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

  // ─── Hardware Media Routing (replaceTrack) ──────────────────────────────────
  const switchCamera = async () => {
    if (!localStreamRef.current || !activeConnectionRef.current) return;
    const newFacingMode = activeCamera === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } },
        audio: false
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      
      const peerConn = activeConnectionRef.current.peerConnection;
      if (!peerConn) return;
      const sender = peerConn.getSenders().find((s: any) => s.track?.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
        localStreamRef.current.removeTrack(oldVideoTrack);
        localStreamRef.current.addTrack(newVideoTrack);
        oldVideoTrack.stop();
        setActiveCamera(newFacingMode);
        setIsScreenSharing(false);
      }
    } catch (e) {
      toast.error('Rear camera not found or access denied.');
      // Fallback if exact fails
      try {
         const newStream = await navigator.mediaDevices.getUserMedia({
           video: { facingMode: newFacingMode }, audio: false
         });
         const newVideoTrack = newStream.getVideoTracks()[0];
         const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
         const peerConn = activeConnectionRef.current.peerConnection;
         const sender = peerConn.getSenders().find((s: any) => s.track?.kind === 'video');
         if (sender) {
           await sender.replaceTrack(newVideoTrack);
           localStreamRef.current.removeTrack(oldVideoTrack);
           localStreamRef.current.addTrack(newVideoTrack);
           oldVideoTrack.stop();
           setActiveCamera(newFacingMode);
           setIsScreenSharing(false);
         }
      } catch (err) {}
    }
  };

  const toggleScreenShare = async () => {
    if (!localStreamRef.current || !activeConnectionRef.current) return;
    try {
      if (isScreenSharing) {
        // Switch back to camera
        const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: activeCamera } });
        const newVideoTrack = newStream.getVideoTracks()[0];
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        const peerConn = activeConnectionRef.current.peerConnection;
        const sender = peerConn.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
          localStreamRef.current.removeTrack(oldVideoTrack);
          localStreamRef.current.addTrack(newVideoTrack);
          oldVideoTrack.stop();
          setIsScreenSharing(false);
        }
      } else {
        // Start screen share
        if (!navigator.mediaDevices.getDisplayMedia) {
          toast.error('Screen sharing is not supported on this device/browser.');
          return;
        }
        const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        
        newVideoTrack.onended = async () => {
          if (!isComponentMountedRef.current) return;
          // User clicked "Stop sharing" via the browser's native UI
          // Directly switch back to the user's camera to avoid stale closure issues
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: activeCamera } });
            const fallbackTrack = fallbackStream.getVideoTracks()[0];
            const pc = activeConnectionRef.current?.peerConnection;
            const s = pc?.getSenders().find((s: any) => s.track?.kind === 'video');
            if (s && localStreamRef.current) {
              await s.replaceTrack(fallbackTrack);
              localStreamRef.current.removeTrack(newVideoTrack);
              localStreamRef.current.addTrack(fallbackTrack);
              setIsScreenSharing(false);
            }
          } catch (err) {
            console.error('Failed to revert to camera after screen share stopped', err);
          }
        };

        const peerConn = activeConnectionRef.current.peerConnection;
        const sender = peerConn.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
          localStreamRef.current.removeTrack(oldVideoTrack);
          localStreamRef.current.addTrack(newVideoTrack);
          oldVideoTrack.stop();
          setIsScreenSharing(true);
        }
      }
    } catch (e) {
      toast.error('Screen sharing cancelled or unsupported.');
    }
  };

  //  Voice Recording: Hold-to-Record 
  const startRecording = useCallback(async () => {
    if (isRecording || !activePeer) return;
    try {
      let stream: MediaStream;
      try {
        // [iOS FIX] Safari requires explicit constraint hints to enable microphone.
        // echoCancellation and noiseSuppression are critical for call quality on iPhone.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
            channelCount: 1,
          }
        });
      } catch (initialErr) {
        console.warn('[Voice] Initial getUserMedia failed, trying fallback...', initialErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
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

          // Phase 2: Intercept Reactions
          if (typeof content === 'string' && content.startsWith('__REACT__')) {
            const parts = content.split('__::');
            if (parts.length >= 2) {
              const targetId = parts[0].replace('__REACT__', '');
              const emoji = parts.slice(1).join('__::');
              const sender = msg.senderInboxId || 'unknown';
              
              setMessages(prev => prev.map(m => {
                if (m.id === targetId) {
                  const reactions = m.reactions || {};
                  const users = reactions[emoji] || [];
                  if (!users.includes(sender)) {
                    return { ...m, reactions: { ...reactions, [emoji]: [...users, sender] } };
                  }
                }
                return m;
              }));
            }
            continue; // Skip rendering this as a chat bubble
          }
          
          // Phase 2: Intercept Read Receipts
          if (typeof content === 'string' && content.startsWith('__READ__')) {
            const readId = content.replace('__READ__', '');
            setMessages(prev => prev.map(m => m.id === readId ? { ...m, status: 'read' } : m));
            continue;
          }

          // Phase 3: Intercept Pins & Revokes
          if (typeof content === 'string' && content.startsWith('__PIN__')) {
            setPinnedMessageId(content.replace('__PIN__', ''));
            continue;
          }
          if (typeof content === 'string' && content.startsWith('__REVOKE__')) {
            const revokeId = content.replace('__REVOKE__', '');
            setMessages(prev => prev.filter(m => m.id !== revokeId));
            continue;
          }

          // Phase 5: Intercept VOTE signals
          if (typeof content === 'string' && content.startsWith('__VOTE__')) {
            const parts = content.replace('__VOTE__', '').split('__::');
            if (parts.length >= 2) {
              const targetPollId = parts[0];
              const optionIndex = parseInt(parts[1], 10);
              const sender = msg.senderInboxId || 'peer';
              setMessages(prev => prev.map(m => {
                if (m.id === targetPollId && m.content.startsWith('__POLL__')) {
                  // A vote mutates the poll's state array
                  const pollData = m.pollVotes || {}; // { [user]: optionIndex }
                  return { ...m, pollVotes: { ...pollData, [sender]: optionIndex } };
                }
                return m;
              }));
            }
            continue;
          }

          // Phase 4: Intercept __EDIT__ — remote peer edited a message
          if (typeof content === 'string' && content.startsWith('__EDIT__')) {
            const editParts = content.replace('__EDIT__', '').split('__::');
            if (editParts.length >= 2) {
              const editTargetId = editParts[0];
              const editNewContent = editParts.slice(1).join('__::');
              setMessages(prev => prev.map(m =>
                m.id === editTargetId ? { ...m, content: editNewContent, edited: true } : m
              ));
            }
            continue;
          }

          let mappedContent = content || msg.fallback || 'Encrypted Data';
          let burnAtNs: number | undefined = undefined;

          // Phase 3: Intercept Self-Destruct
          if (typeof mappedContent === 'string' && mappedContent.startsWith('__BURN_')) {
            const parts = mappedContent.split('__::');
            if (parts.length >= 2) {
              const seconds = parseInt(parts[0].replace('__BURN_', ''), 10);
              mappedContent = parts.slice(1).join('__::');
              burnAtNs = sentAtNs + (seconds * 1000);
            }
          }

          // Phase 5: Intercept Payment Signals for Auto-Sync
          if (typeof mappedContent === 'string' && mappedContent.startsWith('__PAYMENT__')) {
            // Reconcile balance from server because the sender just transferred QDs to our address
            refreshBalance().catch(() => {});
          }

          const mappedMsg = {
            id: realId,
            senderInboxId: msg.senderInboxId ?? '',
            content: mappedContent,
            burnAtNs,
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
              if (fromPeer && !content.startsWith('__')) {
                // We are focused on this chat, so send a read receipt!
                if (!document.hidden) {
                  sendMessage(client, msgConvPeer, `__READ__${realId}`, address).catch(e => console.warn('Failed to send read receipt', e));
                } else {
                  // Phase 5: Push Notifications when app is hidden
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification(`WhaleChat: ${shortAddr(msgConvPeer)}`, {
                      body: formatMessagePreview(content),
                      icon: '/favicon.ico'
                    });
                  }
                }
              }
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
            if (fromPeer && !content.startsWith('__')) {
              // Phase 5: Push Notifications when receiving a message in background chat
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`WhaleChat: ${shortAddr(msgConvPeer || 'Unknown')}`, {
                  body: formatMessagePreview(content),
                  icon: '/favicon.ico'
                });
              }
            }
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
        let raw = await getMessages(client, activePeer);
        if (cancelled) return;
        
        const clearTs = parseInt(localStorage.getItem(`whale_cleared_${address}_${activePeer.toLowerCase()}`) || '0', 10);
        if (clearTs > 0) {
          raw = raw.filter((m: any) => m.sentAtNs > clearTs);
        }
        
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
        
        const rawMappedMsgs = raw
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

        const combined = [...rawMappedMsgs, ...pendingServer].sort((a, b) => a.sentAtNs - b.sentAtNs);
        const mappedMsgs: any[] = [];
        const reactions: Record<string, Record<string, string[]>> = {};
        const readReceipts = new Set<string>();
        const revokedIds = new Set<string>();
        let latestPinnedId: string | null = null;
        let lastPeerMsgId: string | null = null;

        for (const m of combined) {
          const content = m.content;
          if (typeof content === 'string' && content.startsWith('__REACT__')) {
            const parts = content.split('__::');
            if (parts.length >= 2) {
              const targetId = parts[0].replace('__REACT__', '');
              const emoji = parts.slice(1).join('__::');
              const sender = m.senderInboxId || 'unknown';
              if (!reactions[targetId]) reactions[targetId] = {};
              if (!reactions[targetId][emoji]) reactions[targetId][emoji] = [];
              if (!reactions[targetId][emoji].includes(sender)) reactions[targetId][emoji].push(sender);
            }
          } else if (typeof content === 'string' && content.startsWith('__READ__')) {
            const readId = content.replace('__READ__', '');
            readReceipts.add(readId);
          } else if (typeof content === 'string' && content.startsWith('__PIN__')) {
            latestPinnedId = content.replace('__PIN__', '');
          } else if (typeof content === 'string' && content.startsWith('__REVOKE__')) {
            revokedIds.add(content.replace('__REVOKE__', ''));
          } else if (typeof content === 'string' && !content.startsWith('__CALL_')) {
             if (m.senderInboxId?.toLowerCase() === activePeer.toLowerCase()) {
               lastPeerMsgId = m.id;
             }
             if (content.startsWith('__BURN_')) {
               const parts = content.split('__::');
               if (parts.length >= 2) {
                 const seconds = parseInt(parts[0].replace('__BURN_', ''), 10);
                 m.content = parts.slice(1).join('__::');
                 m.burnAtNs = m.sentAtNs + (seconds * 1000);
               }
             }
             mappedMsgs.push(m);
          } else {
             mappedMsgs.push(m);
          }
        }

        if (latestPinnedId) setPinnedMessageId(latestPinnedId);

        // Apply metadata to actual messages
        const processedMsgs = mappedMsgs.filter(m => !revokedIds.has(m.id) && (!m.burnAtNs || m.burnAtNs > Date.now()));
        for (const m of processedMsgs) {
          if (reactions[m.id]) m.reactions = reactions[m.id];
          if (readReceipts.has(m.id)) m.status = 'read';
        }

        // Auto-send read receipt if there is an unread message from the peer
        if (lastPeerMsgId) {
          const receiptKey = `whale_receipt_${address.toLowerCase()}_${activePeer.toLowerCase()}`;
          if (localStorage.getItem(receiptKey) !== lastPeerMsgId) {
            localStorage.setItem(receiptKey, lastPeerMsgId);
            sendMessage(client, activePeer, `__READ__${lastPeerMsgId}`, address).catch(e => console.warn('Failed to send read receipt', e));
          }
        }

        // ── POLL MERGE WITH FULL DEDUPLICATION ───────────────────────────────
        // Register all newly fetched real IDs in confirmedMsgIds so the stream
        // cannot double-insert them when the echo arrives after the poll.
        processedMsgs.forEach((m: any) => confirmedMsgIds.current.add(m.id));
        
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
          const newConfirmed = processedMsgs.filter(m => !existingIds.has(m.id));
          
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
    
    const isReaction = content.startsWith('__REACT__');
    const isVote = content.startsWith('__VOTE__');
    const isSystemSignal = content.startsWith('__CALL_') || isReaction || isVote;
    if (!isSystemSignal && sending) return;

    if (!isSystemSignal) setSending(true);
    
    // Phase 2: Message Quoting
    let finalContent = content;
    if (replyingTo && !isSystemSignal) {
      finalContent = `__REPLY__${replyingTo.id}__::${content}`;
      setReplyingTo(null);
    }

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
      // [BALANCE FIX] After spending, force a refresh from DB so the balance counter
      // reflects the real server-side balance, not just the optimistic local deduction.
      spendQDs(0.0001, 'Whale Chat message').then(() => {
        refreshBalance().catch(() => {}); // Reconcile balance with DB after spend
      }).catch((e: any) => console.warn('[WhaleChat] QD deduction failed (non-blocking):', e));
    }

    if (address) {
        localStorage.removeItem(`whale_draft_${address.toLowerCase()}_${activePeer.toLowerCase()}`);
    }

    const optimisticId = `optimistic-${Date.now()}`;

    try {
      if (!isReaction) {
        // ─── OPTIMISTIC INSERT ────────────────────────────────────────────────────
        // Register the content in the map BEFORE inserting, so the stream echo
        // can find and replace this optimistic message atomically when it arrives.
        optimisticContentMap.current.set(content, optimisticId);

        const optimisticMsg = {
          id: optimisticId,
          senderInboxId: client?.inboxId || '',
          content: finalContent,
          sentAtNs: Date.now(),
          conversationId: `dm-${activePeer.toLowerCase()}`
        };
        setMessages(prev => [...prev, optimisticMsg].sort((a, b) => a.sentAtNs - b.sentAtNs));

        // Clear typing indicator immediately
        stopTypingSignal();
      } else {
        // Phase 2: Optimistic Reaction Insert
        const parts = finalContent.split('__::');
        if (parts.length >= 2) {
          const targetId = parts[0].replace('__REACT__', '');
          const emoji = parts.slice(1).join('__::');
          const sender = client?.inboxId || 'me';
          setMessages(prev => prev.map(m => {
            if (m.id === targetId) {
              const reactions = m.reactions || {};
              const users = reactions[emoji] || [];
              if (!users.includes(sender)) {
                return { ...m, reactions: { ...reactions, [emoji]: [...users, sender] } };
              }
            }
            return m;
          }));
        }
      }

      // [AUDIO REMOVED] send ping disabled.
      
      // Always attempt to send directly via XMTP.
      // sendMessage() handles canReceive checks, retries with backoff,
      // and graceful offline queue internally — no need to pre-check here.
      if (isOffline) {
        const outboxKey = `whale_outbox_${address.toLowerCase()}`;
        const existing = JSON.parse(localStorage.getItem(outboxKey) || '[]');
        existing.push(finalContent);
        localStorage.setItem(outboxKey, JSON.stringify(existing));
        toast.info("You are offline. Message queued to outbox.");
      } else {
        try {
          await sendMessage(client, activePeer, finalContent, address);
        } catch (err) {
          console.error('[WhaleChat] Message send failed:', err);
          toast.error("Failed to send message");
        }
      }

      if (!isReaction) {
        // UPDATE LOCAL ADDRESS BOOK
        setConversations(prev => {
          const updated = prev.find(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase())
            ? prev.map(c => c.peerAddress.toLowerCase() === activePeer.toLowerCase() ? { ...c, lastMessage: finalContent, lastAt: new Date() } : c)
            : [{ peerAddress: activePeer, lastMessage: finalContent, lastAt: new Date() }, ...prev];
          persistToLocal(updated);
          return updated;
        });
      }
      return;

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

  // ─── Hito 4: Link Preview Detection ─────────────────────────────────────
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Detect link in input and fetch preview metadata
  const detectLinkPreview = useCallback(async (text: string) => {
    const match = text.match(urlRegex);
    if (!match) { setLinkPreview(null); return; }
    const url = match[0];
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setLinkPreview({ url, title: data.title || url, description: data.description || '', image: data.image });
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    if (!inputText.trim()) { setLinkPreview(null); return; }
    const t = setTimeout(() => detectLinkPreview(inputText), 800);
    return () => clearTimeout(t);
  }, [inputText, detectLinkPreview]);

  // ─── Hito 4: GIF Search (Tenor public API) ────────────────────────────────
  const searchGifs = useCallback(async (q: string) => {
    if (!q.trim()) { setGifResults([]); return; }
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=AIzaSyAyimkuYQYF_FXVALexPubfQgShfu7Md68&limit=20&media_filter=gif`);
      if (!res.ok) return;
      const data = await res.json();
      const urls = (data.results || []).map((r: any) => r.media_formats?.gif?.url || r.media_formats?.tinygif?.url).filter(Boolean);
      setGifResults(urls);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchGifs(gifSearch), 500);
    return () => clearTimeout(t);
  }, [gifSearch, searchGifs]);

  // ─── Hito 4: Scheduled Messages ──────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size limit (~1MB safe for XMTP encoded as Base64)
    if (file.size > 1024 * 1024) {
      toast.error('File exceeds 1MB limit for P2P messaging.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const msg = `[ATTACHMENT:${file.type || 'application/octet-stream'}]${base64data}|${file.name}`;
        executeSend(msg);
        setIsUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error('Failed to attach file.');
      setIsUploading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    let txt = inputText.trim();
    if (replyingTo) {
      txt = `__REPLY__${replyingTo.id}__::${txt}`;
      setReplyingTo(null);
    }
    if (isSecretChat) {
      txt = `__BURN_15__::${txt}`;
    } else if (burnTimer) {
      txt = `__BURN_${burnTimer}__::${txt}`;
      setBurnTimer(null);
    }
    setInputText('');
    setLinkPreview(null);
    if (scheduledAt) {
      const delayMs = scheduledAt.getTime() - Date.now();
      setScheduledAt(null);
      if (delayMs > 0) {
        setTimeout(() => executeSendRef.current?.(txt), delayMs);
        // Show a local optimistic placeholder for the scheduled message
        const schedId = `sched_${Date.now()}`;
        setMessages(prev => [...prev, {
          id: schedId,
          senderInboxId: client?.inboxId ?? '',
          content: txt,
          sentAtNs: scheduledAt.getTime(),
          conversationId: `dm-${activePeer?.toLowerCase()}`,
          status: 'scheduled',
        }]);
        return;
      }
    }
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
      ...bgStyle,
      fontFamily,
    }}>
      {/*  Sidebar: Conversation List — fixed width, full height  */}
      <div className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-72 flex-col border-r border-black/10 bg-white/60 backdrop-blur-xl shrink-0 h-full overflow-hidden`}>
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
          {conversations.length > 0 && archivedPeers.size > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="w-full text-left p-3.5 border-b border-white/20 bg-gray-50/50 hover:bg-gray-100/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                <span className="text-[11px] font-bold uppercase tracking-wider">Archived Chats ({archivedPeers.size})</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">{showArchived ? 'Hide' : 'Show'}</span>
            </button>
          )}
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              <p className="text-[10px] text-black/30 font-medium uppercase tracking-widest">Vault is Empty</p>
            </div>
          ) : (
            conversations.filter(conv => showArchived ? archivedPeers.has(conv.peerAddress.toLowerCase()) : !archivedPeers.has(conv.peerAddress.toLowerCase())).map((conv, i) => {
              const isActive = activePeer?.toLowerCase() === conv.peerAddress.toLowerCase();
              return (
                <div key={i} className="relative w-full overflow-hidden border-b border-white/20">
                  <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center w-20 bg-blue-500/90 text-white text-[10px] font-bold tracking-widest uppercase transition-colors" onClick={() => toggleArchive(conv.peerAddress)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mb-1"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    {archivedPeers.has(conv.peerAddress.toLowerCase()) ? 'Unarchive' : 'Archive'}
                  </div>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -80, right: 0 }}
                    dragElastic={0.1}
                    whileTap={{ cursor: "grabbing" }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -50) {
                        toggleArchive(conv.peerAddress);
                      }
                    }}
                    className="relative z-10 w-full bg-white shadow-sm"
                  >
                    <button
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSidebarMenu({ peer: conv.peerAddress, x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => { setActivePeer(conv.peerAddress); setShowList(false); }}
                      className={`w-full text-left p-3.5 transition-all ${
                        isActive ? 'bg-black/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar address={conv.peerAddress} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-[#050505]  font-mono truncate">{shortAddr(conv.peerAddress)}</p>
                            {conv.lastMessage && (
                              <p className="text-[10px] text-black/40  truncate mt-0.5">{formatMessagePreview(conv.lastMessage)}</p>
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
                  </motion.div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/*  Chat Area  */}
      <div className={`${!showList ? 'flex' : 'hidden md:flex'} relative flex-1 flex-col min-w-0 min-h-0`}>
        {activePeer ? (
          <>
            <div className="h-[68px] px-4 border-b border-black/[0.08] flex items-center justify-between bg-white shrink-0 z-10 shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-black/40 text-[10px] font-black tracking-wider mr-1">
                  ←
                </button>
                <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black text-white shadow-lg"
                      style={{ background: `hsl(${parseInt(activePeer.slice(2, 8), 16) % 360},70%,45%)` }}
                    >
                      {activePeer.slice(2, 4).toUpperCase()}
                    </div>
                    {/* Online indicator */}
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${peerStatus.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-[#050505] font-mono flex items-center gap-1.5">
                      {shortAddr(activePeer!)}
                    </span>
                    <span className={`text-[10px] font-semibold flex items-center gap-1 ${peerStatus.online ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {peerStatus.isTyping ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          typing...
                        </>
                      ) : peerStatus.online ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                          Online
                        </>
                      ) : (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
                          {peerStatus.lastSeen ? `Last seen ${new Date(peerStatus.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Offline'}
                        </>
                      )}
                    </span>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-xl" title="Available QDs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-blue-700">{balance.toFixed(2)} QD</span>
                </div>
                {/* Phase 5: Secret Chat Toggle */}
                <button
                  onClick={() => setIsSecretChat(!isSecretChat)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSecretChat ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                  title={isSecretChat ? "Secret Chat Active (Auto-Burn 15s)" : "Start Secret Chat"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </button>
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
                <button 
                  onClick={() => { setShowSearch(s => !s); setSearchQuery(''); setSearchIndex(0); }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-black/5 text-black/40'}`}
                  title="Search in chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
                <button onClick={() => setShowProfile(true)} className="w-9 h-9 hover:bg-black/5 rounded-xl flex items-center justify-center text-black/40 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* ── Active Audio Call Banner — Non-blocking, shown only when no full-screen audio overlay is desired ── */}
            {/* NOTE: audio active call is now handled by a full-screen portal below — this banner is intentionally removed */}

            {/* Hito 4: Search bar */}
            {showSearch && (() => {
              const convId = `dm-${activePeer!.toLowerCase()}`;
              const allMsgs = messages.filter(m => m.conversationId === convId);
              const matches = searchQuery.trim() ? allMsgs.filter(m => typeof m.content === 'string' && m.content.toLowerCase().includes(searchQuery.toLowerCase())) : [];
              const currentMatch = matches[searchIndex];
              const handleNavSearch = (dir: 1 | -1) => {
                setSearchIndex(i => {
                  const next = (i + dir + matches.length) % matches.length;
                  const el = document.getElementById(`msg-${matches[next]?.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return next;
                });
              };
              return (
                <div className="bg-white/90 backdrop-blur-md border-b border-black/5 px-3 py-2 flex items-center gap-2 z-20 animate-in slide-in-from-top-2 duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSearchIndex(0); }}
                    placeholder="Search in conversation..."
                    className="flex-1 bg-transparent text-[13px] font-mono text-gray-800 placeholder:text-gray-400 outline-none"
                  />
                  {matches.length > 0 && (
                    <span className="text-[11px] font-mono text-gray-500 shrink-0">{searchIndex + 1}/{matches.length}</span>
                  )}
                  {matches.length > 1 && (
                    <>
                      <button onClick={() => handleNavSearch(-1)} className="p-1 hover:bg-black/5 rounded-lg text-gray-500">↑</button>
                      <button onClick={() => handleNavSearch(1)} className="p-1 hover:bg-black/5 rounded-lg text-gray-500">↓</button>
                    </>
                  )}
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1 hover:bg-black/5 rounded-lg text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              );
            })()}

            {/* Phase 3: Pinned Message Banner */}
            {pinnedMessageId && (
              <div className="bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-black/5 transition-colors z-20" onClick={() => {
                const el = document.getElementById(`msg-${pinnedMessageId}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}>
                <div className="w-1 h-8 bg-blue-500 rounded-full" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> Pinned Message</span>
                  <span className="text-[12px] font-mono font-medium text-black/70 truncate">
                    {messages.find(m => m.id === pinnedMessageId)?.content?.replace(/__REPLY__[a-zA-Z0-9_-]+__::/, '').replace('__AUDIO__', '🎙️ Voice Note') || 'Pinned Message'}
                  </span>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setPinnedMessageId(null); 
                    executeSend(`__UNPIN__${pinnedMessageId}`); // For parity, though we just unset locally for now
                  }}
                  className="p-1.5 hover:bg-black/10 rounded-full text-black/40 transition-colors"
                >
                  X
                </button>
              </div>
            )}

            {/* Dynamic Chat Background */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 relative ${isSecretChat ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-red-950 to-black' : ''}`} style={isSecretChat ? { fontFamily, fontSize: `${fontSizePx}px` } : { ...bgStyle, fontFamily, fontSize: `${fontSizePx}px` }}>
              {/* Matrix Rain Effect Layer */}
              {chatBackground === 'matrix' && (
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,255,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              )}
              {(() => {
                // Filter messages for the current active conversation only
                const convId = `dm-${activePeer!.toLowerCase()}`;
                const filteredMsgs = messages.filter(m => {
                  if (m.conversationId !== convId && m.conversationId !== `dm-${activePeer!.toLowerCase()}`) return false;
                  if (m.burnAtNs && m.burnAtNs <= Date.now()) return false;
                  const c = typeof m.content === 'string' ? m.content : '';
                  if (c.startsWith('__CALL_ANSWER__')) return false;
                  if (c === '__CALL_DECLINE__') return false;
                  if (c === '__CALL_HANGUP__') return false;
                  if (c.startsWith('__REACT__')) return false;
                  if (c.startsWith('__PIN__')) return false;
                  if (c.startsWith('__UNPIN__')) return false;
                  if (c.startsWith('__REVOKE__')) return false;
                  if (c.startsWith('__EDIT__')) return false;
                  return true;
                });
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
                  
                  // Phase 3: Self-Destruct Visualization
                  const isBurning = !!msg.burnAtNs;
                  const secondsLeft = isBurning ? Math.max(0, Math.ceil((msg.burnAtNs - Date.now()) / 1000)) : null;

                  // Phase 2: Parse Quoting and Reactions
                  let content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
                  
                  let replyMsg = null;
                  if (typeof content === 'string' && content.startsWith('__REPLY__')) {
                    const parts = content.split('__::');
                    if (parts.length >= 2) {
                      const replyToId = parts[0].replace('__REPLY__', '');
                      content = parts.slice(1).join('__::');
                      replyMsg = messages.find(m => m.id === replyToId);
                    }
                  }

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
                          <CustomAudioPlayer src={audioSrc} isMe={isMe} />
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
                            <button type="button" onClick={() => setLightboxImg(attachment.url)} className="block p-1">
                              <img src={attachment.url} alt={attachment.name} className="max-w-[240px] max-h-[300px] object-cover rounded-xl" />
                            </button>
                          ) : attachment.mime.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                            <video src={attachment.url} controls className="max-w-[260px] max-h-[300px] object-contain bg-black" />
                          ) : (
                            <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-3 ${isMe ? 'text-white' : 'text-gray-900'}`}>
                               <span className="font-mono text-[11px] underline break-all line-clamp-2">{attachment.name}</span>
                            </a>
                          )}
                        </div>
                      ) : content.startsWith('__POLL__') ? (() => {
                          // Phase 5: Interactive Poll Bubble
                          const [, pollBody] = content.split('__POLL__');
                          const [questionPart, ...optionParts] = pollBody.split('__::');
                          const options = optionParts[0]?.split('|') ?? [];
                          const votes: Record<string, number> = msg.pollVotes || {};
                          const totalVotes = Object.keys(votes).length;
                          const myInboxId = client?.inboxId || '';
                          const myVote = votes[myInboxId] ?? -1;
                          return (
                            <div id={`msg-${msg.id}`} className={`px-4 py-3 rounded-2xl shadow-md min-w-[220px] max-w-[280px] ${isMe ? 'bg-blue-500 text-white' : 'bg-white border border-black/8 text-gray-900'}`}>
                              <div className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${isMe ? 'text-white/60' : 'text-blue-500'}`}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3zM3 7h12v2H3zM3 11h15v2H3zM3 15h9v2H3z"/></svg>
                                Poll
                              </div>
                              <p className={`text-[13px] font-bold leading-snug mb-3 ${isMe ? 'text-white' : 'text-gray-900'}`}>{questionPart}</p>
                              <div className="flex flex-col gap-2">
                                {options.map((opt: string, i: number) => {
                                  const count = Object.values(votes).filter(v => v === i).length;
                                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                  const isSelected = myVote === i;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => executeSend(`__VOTE__${msg.id}__::${i}`)}
                                      className={`relative w-full text-left rounded-xl px-3 py-2 text-[12px] font-semibold overflow-hidden transition-all border ${isSelected ? (isMe ? 'border-white/50 bg-white/20' : 'border-blue-500 bg-blue-50 text-blue-700') : (isMe ? 'border-white/20 bg-white/10 hover:bg-white/20' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800')}`}
                                    >
                                      <div className="absolute left-0 top-0 h-full bg-white/20 rounded-xl transition-all duration-500" style={{ width: `${pct}%` }} />
                                      <span className="relative z-10 flex justify-between items-center gap-2">
                                        <span>{opt}</span>
                                        {totalVotes > 0 && <span className={`font-mono text-[10px] ${isSelected ? '' : 'opacity-60'}`}>{pct}%</span>}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-white/50' : 'text-gray-400'}`}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
                            </div>
                          );
                        })() : content.startsWith('__PAYMENT__') ? (() => {
                          // Phase 5: QD Payment Receipt Bubble
                          const amount = content.replace('__PAYMENT__::', '');
                          return (
                            <div id={`msg-${msg.id}`} className={`px-4 py-3 rounded-2xl shadow-md min-w-[200px] border ${isMe ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30 text-white' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-white/70' : 'text-emerald-600'}`}>QD Transfer</span>
                              </div>
                              <p className="text-[22px] font-black font-mono">{amount} <span className="text-[14px] font-semibold opacity-80">QD</span></p>
                              <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-emerald-600/80'}`}>
                                {isMe ? `Sent to ${shortAddr(activePeer!)}` : `Received from ${shortAddr(activePeer!)}`}
                              </p>
                            </div>
                          );
                        })() : (
                        <div className="relative group" id={`msg-${msg.id}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words break-all shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden ${
                            isMe
                              ? 'bg-blue-500 text-white rounded-br-sm border border-blue-600/30'
                              : 'bg-[#F2F2F7] text-gray-900 rounded-bl-sm border border-black/5'
                          }`}>
                            {isBurning && (
                              <div className="absolute top-0 left-0 w-full h-0.5 bg-black/10">
                                <div 
                                  className="h-full bg-red-500" 
                                  style={{ width: `${(secondsLeft! / 60) * 100}%`, transition: 'width 1s linear' }} 
                                />
                              </div>
                            )}
                            {replyMsg && (
                              <div 
                                className={`mb-2 pl-2 border-l-2 text-[11px] opacity-75 line-clamp-1 cursor-pointer ${isMe ? 'border-white/40 hover:opacity-100' : 'border-black/20 hover:opacity-100'}`}
                              >
                                <strong className="uppercase tracking-wider">{replyMsg.senderInboxId?.toLowerCase() === client?.inboxId?.toLowerCase() ? 'You' : 'Peer'}: </strong>
                                {replyMsg.content ? formatMessagePreview(replyMsg.content) : '📎 Attachment'}
                              </div>
                            )}
                            {content.startsWith('[GIF]') ? (
                              <button type="button" onClick={() => setLightboxImg(content.replace('[GIF]', ''))} className="rounded-xl overflow-hidden mt-1 max-w-[200px] hover:opacity-90 transition-opacity">
                                <img src={content.replace('[GIF]', '')} alt="GIF" className="w-full h-auto object-cover" />
                              </button>
                            ) : (
                              <p className="whitespace-pre-wrap break-words break-all" style={{ fontSize: `${fontSizePx}px`, lineHeight: '1.4' }}>
                                {(() => {
                                  let text = content;
                                  if (content.startsWith('__CALL_OFFER__')) text = "📞 Initiated a Call";
                                  else if (content.startsWith('__CALL_ANSWER__')) text = "✅ Call Answered";
                                  else if (content === '__CALL_DECLINE__') text = "❌ Call Declined";
                                  else if (content === '__CALL_HANGUP__') text = "🔚 Call Ended";
                                  
                                  if (searchQuery && text.toLowerCase().includes(searchQuery.toLowerCase())) {
                                    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
                                    return parts.map((part: string, i: number) => part.toLowerCase() === searchQuery.toLowerCase() ? <span key={i} className="bg-yellow-300 text-black px-0.5 rounded-sm">{part}</span> : part);
                                  }
                                  return parseMessageText(text, isMe);
                                })()}
                                {msg.edited && <span className="text-[10px] opacity-70 ml-1.5 italic">(edited)</span>}
                              </p>
                            )}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 -ml-1 relative z-10">
                                {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                                  <button 
                                    key={emoji} 
                                    onClick={() => executeSend(`__REACT__${msg.id}__::${emoji}`)}
                                    className={`text-[12px] px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${users.includes(client?.inboxId || 'me') ? 'bg-blue-500/20 border-blue-500/30' : 'bg-black/5 hover:bg-black/10'} border shadow-sm`}
                                  >
                                    <span>{emoji}</span>
                                    {users.length > 1 && <span className="font-bold font-mono text-[10px] opacity-70">{users.length}</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Context Menu / Reply Trigger */}
                          <div className="absolute top-1/2 -translate-y-1/2 -right-16 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                            {isBurning && (
                               <span className="mr-1 text-[10px] font-mono font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded shadow-sm border border-red-100">{secondsLeft}s</span>
                            )}
                            <button
                              onClick={() => setReactionMenu(reactionMenu === msg.id ? null : msg.id)}
                              className="p-1.5 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm border border-black/5"
                              title="React"
                            >
                              <Smile size={14} />
                            </button>
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1.5 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm border border-black/5"
                              title="Reply"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            </button>
                          </div>
                          
                          {/* Emoji Picker Popover */}
                          {reactionMenu === msg.id && (
                            <div className="absolute bottom-full right-0 mb-1 z-50 shadow-2xl rounded-3xl overflow-hidden border border-black/5">
                              <EmojiPicker 
                                onEmojiClick={(e) => {
                                  executeSend(`__REACT__${msg.id}__::${e.emoji}`);
                                  setReactionMenu(null);
                                }} 
                                width={280} 
                                height={350} 
                                searchDisabled 
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`text-[9px] text-black/25 mt-1 px-1 font-mono flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && !content.startsWith('__CALL_') && (
                          <span className={`text-[12px] -mt-0.5 ${msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`}>
                            {msg.status === 'scheduled' ? <Clock size={10} className="inline ml-0.5 mb-0.5 text-orange-400" /> : msg.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
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
                <div className="flex self-end items-center gap-2 mt-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-black/5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              {/* Hito 4: Link Preview Card */}
              {linkPreview && !isRecording && (
                <div className="flex items-start gap-3 px-4 pt-2 pb-1 bg-blue-50/80 border-t border-blue-100/50 animate-in slide-in-from-bottom-2">
                  {linkPreview.image && <img src={linkPreview.image} alt="" className="w-14 h-14 object-cover rounded-xl border border-white shadow-sm shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-blue-600 truncate">{linkPreview.title}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{linkPreview.description}</p>
                    <p className="text-[10px] font-mono text-blue-400 truncate mt-0.5">{linkPreview.url}</p>
                  </div>
                  <button onClick={() => setLinkPreview(null)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}
              {/* Phase 4: Editing UI */}
              {editingMsg && (
                <div className="mx-3 mt-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-t-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Edit Message</span>
                    <input
                      type="text"
                      className="text-[13px] bg-transparent outline-none text-blue-900 w-full font-mono placeholder:text-blue-300"
                      value={editingMsg.content}
                      onChange={e => setEditingMsg({ ...editingMsg, content: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitEditMessage(); } }}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={submitEditMessage} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                    <button onClick={() => setEditingMsg(null)} className="p-1.5 text-blue-400 hover:text-blue-700"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                  </div>
                </div>
              )}
              {replyingTo && !editingMsg && (
                <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                  <div className="flex-1 pl-3 border-l-2 border-black/20 overflow-hidden">
                    <p className="text-[11px] font-bold text-gray-700">Replying to</p>
                    <p className="text-[12px] text-gray-500 truncate">{
                      replyingTo.content ? formatMessagePreview(replyingTo.content) : 'Message'
                    }</p>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-2 text-gray-400 hover:text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
              {/* Hito 4: Scheduled send indicator */}
              {scheduledAt && (
                <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-amber-50 border-t border-amber-100 animate-in slide-in-from-bottom-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                    Scheduled: {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => setScheduledAt(null)} className="text-amber-400 hover:text-amber-600 text-[10px] font-bold">Cancel</button>
                </div>
              )}
              {/* Hito 4: GIF Picker */}
              {showGifPicker && (
                <div className="bg-white/95 backdrop-blur-md border-t border-black/5 p-3 animate-in slide-in-from-bottom-4 duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px] font-black text-gray-700 uppercase tracking-wider">GIFs</span>
                    <input
                      autoFocus
                      value={gifSearch}
                      onChange={e => setGifSearch(e.target.value)}
                      placeholder="Search GIFs..."
                      className="flex-1 bg-gray-100 rounded-xl px-3 py-1.5 text-[13px] outline-none text-gray-800 placeholder:text-gray-400"
                    />
                    <button onClick={() => setShowGifPicker(false)} className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                    {gifResults.length === 0 ? (
                      <p className="col-span-3 text-center text-[12px] text-gray-400 py-4">{gifSearch ? 'No GIFs found' : 'Search for GIFs above...'}</p>
                    ) : gifResults.map((url, i) => (
                      <button key={i} onClick={() => {
                        executeSend(`[GIF]${url}`);
                        setShowGifPicker(false);
                        setGifSearch('');
                        setGifResults([]);
                      }} className="aspect-video bg-gray-100 rounded-xl overflow-hidden hover:scale-105 transition-transform">
                        <img src={url} alt="gif" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-400 text-right mt-1 font-mono">Powered by Tenor</p>
                </div>
              )}
              {replyingTo && (
                <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                  <div className="flex-1 pl-3 border-l-2 border-black/20 overflow-hidden">
                    <p className="text-[11px] font-bold text-gray-700">Replying to</p>
                    <p className="text-[12px] text-gray-500 truncate">{
                      replyingTo.content ? formatMessagePreview(replyingTo.content) : 'Message'
                    }</p>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-2 text-gray-400 hover:text-gray-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
                <input type="file" ref={fileRef} className="hidden" onChange={handleFileUpload} />
                <form onSubmit={handleSend} className="flex gap-2 p-3 items-center">
                {/* GIF Button */}
                <button
                  type="button"
                  onClick={() => setShowGifPicker(g => !g)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 font-black text-[13px] ${showGifPicker ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Send GIF"
                >GIF</button>
                <button
                  type="button"
                  onClick={() => setBurnTimer(burnTimer ? null : 60)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${burnTimer ? 'bg-red-50 text-red-500 shadow-sm border border-red-100' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Self-Destruct Timer (60s)"
                >
                  {burnTimer ? <span className="font-bold font-mono text-[11px]">{burnTimer}s</span> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>}
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 text-gray-500 shrink-0"
                  title="Attach File"
                >
                  {isUploading ? <span className="text-[12px] animate-spin">⌛</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>}
                </button>

                {/* Phase 5: Poll Creator Button */}
                <button
                  type="button"
                  onClick={() => setShowPollCreator(p => !p)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${showPollCreator ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Create Poll"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </button>

                {/* Phase 5: Wallet Send Button */}
                <button
                  type="button"
                  onClick={() => setShowWalletTransfer(w => !w)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${showWalletTransfer ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Send QD Tokens"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
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
                  <div className="flex items-center gap-1">
                    {/* Schedule Send long-press indicator */}
                    <button
                      type="button"
                      title="Schedule message"
                      onClick={() => {
                        // Set scheduled time +5min from now as default
                        const d = new Date(Date.now() + 5 * 60 * 1000);
                        setScheduledAt(d);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${scheduledAt ? 'bg-amber-400 text-white' : 'hover:bg-gray-100 text-gray-400'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                    </button>
                    <button
                      type="submit"
                      disabled={sending || isUploading}
                      className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white disabled:opacity-30 hover:bg-blue-600 transition-all shrink-0"
                    >
                      {scheduledAt
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      }
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onTouchStart={startRecording}
                    onMouseDown={startRecording}
                    onTouchEnd={stopRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
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

      {/* NOTE: remoteAudioRef lives ONLY inside the active call portal below to avoid ref conflicts */}

      {/* ── Incoming Call Banner (state: ringing) ───────────────────────────── */}
      {callState === 'ringing' && isMounted && (
        <div className="absolute inset-0 w-full h-full z-[100000] flex flex-col items-center justify-between" style={{ touchAction: 'none', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          {/* Top section */}
          <div className="flex flex-col items-center w-full pt-[max(60px,env(safe-area-inset-top,60px))] px-6">
            <p className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">
              {callTypeRef.current === 'video' ? '📹 Incoming Video Call' : '🎙️ Incoming Voice Call'}
            </p>
            <p className="text-white/30 text-[13px] font-mono mb-10">Whale Chat · End-to-end encrypted</p>

            {/* Animated avatar */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-56 h-56 rounded-full border border-emerald-400/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-44 h-44 rounded-full border border-emerald-400/15 animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }} />
              <div className="absolute w-36 h-36 rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.8s' }} />
              <div className="w-28 h-28 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_60px_rgba(52,211,153,0.3)]" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <span className="text-white text-4xl font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '🐳'}</span>
              </div>
            </div>

            <p className="text-white text-[28px] font-black tracking-tight mb-1">{activePeer ? shortAddr(activePeer) : 'Unknown Peer'}</p>
            <p className="text-emerald-400 text-[13px] font-mono animate-pulse">Ringing...</p>
          </div>

          {/* Bottom controls */}
          <div className="w-full flex items-end justify-between px-12 pb-[max(48px,env(safe-area-inset-bottom,48px))]">
            {/* Decline */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={declineCall}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_32px_rgba(239,68,68,0.4)]"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              >
                <PhoneOff size={30} className="text-white" />
              </button>
              <span className="text-white/50 text-[11px] font-medium tracking-widest uppercase">Decline</span>
            </div>

            {/* Answer */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={answerCall}
                className="w-[84px] h-[84px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_40px_rgba(52,211,153,0.5)]"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
              >
                <Phone size={36} className="text-white" />
              </button>
              <span className="text-white/50 text-[11px] font-medium tracking-widest uppercase">Answer</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Outgoing Call (state: calling — waiting for answer) ─────────────── */}
      {callState === 'calling' && isMounted && (
        <div className="absolute inset-0 w-full h-full z-[100000] flex flex-col items-center justify-between" style={{ touchAction: 'none', background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="flex flex-col items-center w-full pt-[max(60px,env(safe-area-inset-top,60px))] px-6">
            <p className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.3em] mb-2">
              {callTypeRef.current === 'video' ? '📹 Video Call' : '🎙️ Voice Call'}
            </p>
            <p className="text-white/30 text-[13px] font-mono mb-10">Whale Chat · End-to-end encrypted</p>

            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-52 h-52 rounded-full border border-blue-400/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-40 h-40 rounded-full border border-blue-400/15 animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }} />
              <div className="w-28 h-28 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_60px_rgba(99,102,241,0.35)]" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                <span className="text-white text-4xl font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '🐳'}</span>
              </div>
            </div>

            <p className="text-white text-[28px] font-black tracking-tight mb-1">{activePeer ? shortAddr(activePeer) : 'Unknown Peer'}</p>
            <p className="text-white/40 text-[13px] font-mono animate-pulse">Calling...</p>
          </div>

          <div className="w-full flex flex-col items-center pb-[max(32px,env(safe-area-inset-bottom,32px))]">
             <button
                onClick={performEndCallRef.current}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_40px_rgba(239,68,68,0.5)]"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}
              >
                <PhoneOff size={28} className="text-white" />
              </button>
          </div>
        </div>
      )}

      {/* ── Active Call Overlay — WhatsApp/Telegram parity ──────── */}
      {callState === 'active' && isMounted && (
        isCallMinimized ? createPortal(
          /* ── MINIMIZED VIEW (Floating Banner or Video PiP) ── */
          callType === 'video' ? (
             <motion.div
              drag
              dragConstraints={{ top: 0, left: 0, right: typeof window !== 'undefined' ? window.innerWidth - 120 : 0, bottom: typeof window !== 'undefined' ? window.innerHeight - 160 : 0 }}
              initial={{ x: 20, y: 80 }}
              onClick={() => setIsCallMinimized(false)}
              className="fixed z-[100000] w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer border-2 border-indigo-500/50"
            >
               <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover" />
               <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                 {formatDuration(callDurationSeconds)}
               </div>
            </motion.div>
          ) : (
            <div 
              onClick={() => setIsCallMinimized(false)}
              className="fixed top-0 left-0 w-full z-[100000] bg-emerald-500 text-white px-4 py-2 flex items-center justify-between cursor-pointer shadow-lg animate-in slide-in-from-top"
              style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 8px))' }}
            >
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="animate-pulse" />
                <span className="text-xs font-bold font-mono">Tap to return to call</span>
              </div>
              <span className="text-xs font-mono font-black">{formatDuration(callDurationSeconds)}</span>
              <audio ref={remoteAudioRef} autoPlay playsInline style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
            </div>
          ),
          document.body
        ) : (
          /* ── FULL SCREEN VIEW ── */
          <div className="absolute inset-0 w-full h-full z-[100000] bg-black flex flex-col" style={{ touchAction: 'none' }}>
            
            {/* ── BACKGROUND ── */}
            <div className="absolute inset-0">
              {callTypeRef.current === 'video' ? (
                remoteStream ? (
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ filter: networkQuality === 'poor' ? 'blur(4px)' : 'none' }} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%)' }}>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping scale-150" style={{ animationDuration: '2s' }} />
                      <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl relative z-10" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                        <span className="text-white text-4xl font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '🐳'}</span>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm font-mono uppercase tracking-widest animate-pulse">Connecting video...</p>
                  </div>
                )
              ) : (
                /* ── AUDIO CALL ── */
                <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                  <div className="relative z-10 flex flex-col items-center gap-8">
                    {/* Audio Visualizer Rings */}
                    <div className="relative flex items-center justify-center">
                      {remoteStream && (
                        <>
                          <div className="absolute rounded-full border border-indigo-400/30 transition-all duration-75" style={{ width: 140 + audioLevel * 1.5, height: 140 + audioLevel * 1.5, opacity: Math.min(1, audioLevel / 50 + 0.1) }} />
                          <div className="absolute rounded-full bg-indigo-500/10 transition-all duration-75" style={{ width: 120 + audioLevel, height: 120 + audioLevel, opacity: Math.min(1, audioLevel / 100 + 0.2) }} />
                        </>
                      )}
                      <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.4)] relative z-10" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                        <span className="text-white text-5xl font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '🐳'}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-[30px] font-black tracking-tight mb-2">{activePeer ? shortAddr(activePeer) : 'Unknown Peer'}</p>
                      {remoteStream ? (
                        <span className={`text-[13px] font-mono uppercase tracking-[0.25em] flex items-center gap-2 justify-center ${networkQuality === 'poor' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${networkQuality === 'poor' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          {networkQuality === 'poor' ? 'Poor Connection' : formatDuration(callDurationSeconds)}
                        </span>
                      ) : (
                        <span className="text-white/40 text-[13px] font-mono uppercase tracking-widest animate-pulse">Establishing audio...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── PiP LOCAL VIDEO ── */}
            {callType === 'video' && (
              <motion.div
                drag
                dragConstraints={{ top: 60, left: 20, right: 20, bottom: 120 }}
                initial={{ x: 0, y: 0 }}
                className="absolute top-[80px] right-4 z-20 cursor-grab active:cursor-grabbing"
              >
                {!isCamOff && localStream ? (
                  <div className="w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border-2 border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-black">
                    <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-28 h-40 md:w-36 md:h-52 rounded-2xl bg-black/80 border-2 border-white/20 flex items-center justify-center">
                    <VideoOff size={24} className="text-white/40" />
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Top Bar ── */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-5 pointer-events-none" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-black">{activePeer ? activePeer.slice(2, 4).toUpperCase() : '??'}</span>
                </div>
                <div>
                  <p className="text-white text-[13px] font-bold leading-none">{activePeer ? shortAddr(activePeer) : 'Peer'}</p>
                  <p className="text-white/50 text-[10px] font-mono mt-0.5">{callType === 'video' ? '📹 Video' : '🎙️ Audio'}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsCallMinimized(true)}
                className="bg-black/30 hover:bg-black/50 active:scale-95 transition-all backdrop-blur-xl rounded-full w-10 h-10 flex items-center justify-center border border-white/20 pointer-events-auto"
              >
                <div className="w-3 h-3 border-b-2 border-l-2 border-white transform -rotate-45" />
              </button>
            </div>

            {/* ── Network Alert ── */}
            {networkQuality === 'poor' && (
              <div className="absolute top-[100px] left-1/2 -translate-x-1/2 bg-amber-500/90 backdrop-blur text-white text-[11px] font-mono font-bold px-4 py-1.5 rounded-full z-20 flex items-center gap-2">
                 ⚠️ Weak Connection
              </div>
            )}

            {/* ── Expanded Controls ── */}
            <div
              className="absolute bottom-0 inset-x-0 z-30 flex flex-col gap-4 pb-8"
              style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))' }}
            >
              {/* Secondary Controls Row (Camera Flip, Screen Share) */}
              <div className="flex items-center justify-center gap-6 opacity-90 mb-2">
                 {callType === 'video' && (
                   <>
                     <button onClick={switchCamera} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                     </button>
                     <button onClick={toggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg ${isScreenSharing ? 'bg-indigo-500 text-white' : 'bg-white/10 backdrop-blur text-white hover:bg-white/20'}`}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                     </button>
                   </>
                 )}
                 {callType === 'audio' && (
                   <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/10 cursor-not-allowed opacity-50 shadow-lg">
                     <Volume2 size={20} />
                   </button>
                 )}
              </div>

              {/* Primary Controls Row */}
              <div className="flex items-center justify-center gap-8 mx-auto bg-black/40 backdrop-blur-2xl px-8 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <button
                  onClick={toggleMic}
                  className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                    isMicMuted
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                  onClick={endCall}
                  className="w-[72px] h-[72px] bg-red-500 rounded-[28px] flex items-center justify-center text-white hover:bg-red-600 active:scale-90 transition-all shadow-[0_8px_32px_rgba(239,68,68,0.6)]"
                >
                  <PhoneOff size={32} />
                </button>

                {callType === 'video' ? (
                  <button
                    onClick={toggleCamera}
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      isCamOff
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isCamOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                ) : (
                  <div className="w-[60px] h-[60px]" />
                )}
              </div>
            </div>

            <audio ref={remoteAudioRef} autoPlay playsInline style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
          </div>
        )
      )}

      </div> {/* Close Chat Area */}

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
                 setReplyingTo({ id: contextMenu.id, content: contextMenu.content });
                 setContextMenu(null);
                 setTimeout(() => inputRef.current?.focus(), 100);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-[11px] font-mono text-[#050505] text-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg> Reply
             </button>
             <button onClick={() => {
                 setForwardMsg({ id: contextMenu.id, content: contextMenu.content });
                 setContextMenu(null);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-[11px] font-mono text-[#050505] text-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></svg> Forward
             </button>
             <button onClick={() => {
                 executeSend(`__PIN__${contextMenu.id}`);
                 setContextMenu(null);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-[11px] font-mono text-[#050505] text-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> Pin Message
             </button>
             <button onClick={() => {
                 setMessages(prev => prev.filter(m => m.id !== contextMenu.id));
                 executeSend(`__REVOKE__${contextMenu.id}`);
                 setContextMenu(null);
             }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-[11px] font-mono text-red-500 text-left">
                <Trash2 size={14} /> Delete for everyone
             </button>
           </div>
         </div>,
         document.body
       )}

        {/* Hito 4: Forward Message Modal */}
        {forwardMsg && (
          <div className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm flex items-end justify-center" onClick={() => setForwardMsg(null)}>
            <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-black uppercase tracking-widest text-gray-800">Forward to...</h3>
                <button onClick={() => setForwardMsg(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
              </div>
              <div className="bg-gray-50 rounded-xl border border-black/5 px-3 py-2 mb-3">
                <p className="text-[11px] font-mono text-gray-500 truncate">{forwardMsg.content ? formatMessagePreview(forwardMsg.content) : 'Message'}</p>
              </div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {conversations.map(conv => (
                  <button key={conv.peerAddress} onClick={() => {
                    const content = forwardMsg.content ? formatMessagePreview(forwardMsg.content) : 'Message';
                    const currentPeer = activePeer;
                    setActivePeer(conv.peerAddress);
                    setTimeout(() => { executeSendRef.current?.(`[Forwarded] ${content}`); setActivePeer(currentPeer); }, 300);
                    setForwardMsg(null);
                  }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left">
                    <Avatar address={conv.peerAddress} />
                    <span className="text-[12px] font-mono text-gray-700 truncate">{conv.peerAddress.slice(0, 8)}...{conv.peerAddress.slice(-4)}</span>
                  </button>
                ))}
                {conversations.length === 0 && <p className="text-center text-[12px] text-gray-400 py-6">No conversations yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Profile Popover Overlay — fixed + portal so it escapes overflow:hidden containers */}
       {showProfile && activePeer && isMounted && createPortal(
         <div className="fixed inset-0 z-[99999] bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowProfile(false)}>
           <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-black/10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[13px] font-black uppercase tracking-[0.25em] text-[#050505]">Profile</h3>
                   <button onClick={() => setShowProfile(false)} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[11px] font-black uppercase text-[#050505]">
                     ✕
                   </button>
               </div>
               <div className="flex flex-col items-center gap-4 mb-8">
                   <div
                     className="w-20 h-20 rounded-full flex items-center justify-center text-[24px] font-black text-white shadow-lg"
                     style={{ background: `hsl(${parseInt(activePeer.slice(2, 8), 16) % 360},70%,45%)` }}
                   >
                     {activePeer.slice(2, 4).toUpperCase()}
                   </div>
                   <div className="text-center">
                     <p className="text-[13px] font-mono font-bold text-[#050505] break-all">{activePeer}</p>
                     <p className="text-[12px] text-blue-500 font-medium mt-1">End to End Encrypted</p>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                   <button onClick={() => { syncToAddressBook(activePeer); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5 hover:bg-black/10 rounded-xl transition-colors text-[11px] font-mono font-bold text-[#050505]">
                       <UserPlus size={16} className="text-black/50" /> Add to Contacts
                   </button>
                   <button onClick={exportChat} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5 hover:bg-black/10 rounded-xl transition-colors text-[11px] font-mono font-bold text-[#050505]">
                       <Download size={16} className="text-black/50" /> Export Chat
                   </button>
                   <button onClick={() => toggleBlock(activePeer)} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5 hover:bg-black/10 rounded-xl transition-colors text-[11px] font-mono font-bold text-orange-500">
                       <Slash size={16} /> {blockedPeers.has(activePeer.toLowerCase()) ? 'Unblock Wallet' : 'Block Wallet'}
                   </button>
                   <button onClick={clearChat} className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/5 hover:bg-red-50 rounded-xl transition-colors text-[11px] font-mono font-bold text-red-500">
                       <Trash2 size={16} /> Clear Chat
                   </button>
               </div>
           </div>
         </div>,
         document.body
       )}

       {/* Phase 2: Immersive Lightbox Modal */}
       {lightboxImg && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all"
            onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <img 
            src={lightboxImg} 
            alt="Fullscreen" 
            className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300 select-none"
            onClick={(e) => e.stopPropagation()} 
          />
          <a 
            href={lightboxImg} 
            download="WhaleChat_Media" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full backdrop-blur-md text-[13px] font-bold font-mono transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Original
          </a>
        </div>,
        document.body
       )}

       {/* Phase 4: Clear Chat Confirmation Modal */}
       {showClearConfirm && (
         <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
           <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
               <Trash2 size={28} />
             </div>
             <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-2">Clear Chat?</h3>
             <p className="text-[13px] text-gray-500 mb-6 px-4">
               Are you sure you want to clear this conversation? This will remove all messages from your device.
             </p>
             <div className="flex items-center gap-3 w-full">
               <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-[13px] font-bold text-gray-700 transition-colors">
                 Cancel
               </button>
               <button onClick={executeClearChat} className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors shadow-lg shadow-red-500/30">
                 Clear Chat
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Phase 4: Sidebar Context Menu */}
       {sidebarMenu && typeof document !== 'undefined' && createPortal(
         <div className="fixed inset-0 z-[200]" onClick={() => setSidebarMenu(null)} onContextMenu={(e) => { e.preventDefault(); setSidebarMenu(null); }}>
           <div 
             className="absolute bg-white border border-black/10 rounded-2xl shadow-xl p-2 min-w-[160px] flex flex-col animate-in fade-in zoom-in-95 duration-150"
             style={{ 
               top: Math.min(sidebarMenu.y, window.innerHeight - 150), 
               left: Math.min(sidebarMenu.x, window.innerWidth - 180) 
             }}
             onClick={e => e.stopPropagation()}
           >
             <button onClick={() => toggleArchive(sidebarMenu.peer)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-[11px] font-mono text-[#050505] text-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> 
                {archivedPeers.has(sidebarMenu.peer.toLowerCase()) ? 'Unarchive' : 'Archive'}
             </button>
             <button onClick={() => deleteConversation(sidebarMenu.peer)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-[11px] font-mono text-red-500 text-left mt-1">
                <Trash2 size={14} /> Delete Chat
             </button>
           </div>
         </div>,
         document.body
       )}

       {/* Phase 5: Poll Creator Modal */}
       {showPollCreator && (
           <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-[16px] font-black tracking-tight text-gray-900">Create Poll</h3>
                 <button onClick={() => { setShowPollCreator(false); setPollQuestion(''); setPollOptions(['', '']); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">✕</button>
               </div>
               <input
                 type="text"
                 placeholder="Ask a question..."
                 value={pollQuestion}
                 onChange={e => setPollQuestion(e.target.value)}
                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
               />
               <div className="flex flex-col gap-2">
                 {pollOptions.map((opt, i) => (
                   <div key={i} className="flex gap-2 items-center">
                     <input
                       type="text"
                       placeholder={`Option ${i + 1}`}
                       value={opt}
                       onChange={e => setPollOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))}
                       className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                     />
                     {pollOptions.length > 2 && (
                       <button onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 text-[12px] font-black">✕</button>
                     )}
                   </div>
                 ))}
                 {pollOptions.length < 5 && (
                   <button onClick={() => setPollOptions(prev => [...prev, ''])} className="text-indigo-500 text-[12px] font-bold hover:underline text-left">+ Add option</button>
                 )}
               </div>
               <button
                 onClick={() => {
                   const validOpts = pollOptions.filter(o => o.trim());
                   if (!pollQuestion.trim() || validOpts.length < 2) return;
                   const pollId = `poll_${Date.now()}`;
                   const payload = `__POLL__${pollId}__::${pollQuestion.trim()}__::${validOpts.join('|')}`;
                   executeSend(payload);
                   setShowPollCreator(false);
                   setPollQuestion('');
                   setPollOptions(['', '']);
                 }}
                 className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/30 transition-colors"
               >
                 Send Poll
               </button>
             </div>
           </div>
       )}

       {/* Phase 5: Wallet QD Transfer Modal */}
       {showWalletTransfer && (
           <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-[16px] font-black tracking-tight text-gray-900">Send QD Tokens</h3>
                   <p className="text-[11px] text-gray-400 font-mono mt-0.5">Balance: {balance.toFixed(4)} QD</p>
                 </div>
                 <button onClick={() => { setShowWalletTransfer(false); setTransferAmount(''); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">✕</button>
               </div>
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center self-center shadow-lg shadow-emerald-500/30">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
               </div>
               <p className="text-[12px] text-gray-500 text-center font-mono">To: {shortAddr(activePeer!)}</p>
               <input
                 type="number"
                 placeholder="Amount in QD..."
                 value={transferAmount}
                 onChange={e => setTransferAmount(e.target.value)}
                 min="0.01"
                 step="0.01"
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[18px] font-black text-center focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 font-mono"
               />
               <button
                 disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > balance || transferSending}
                 onClick={async () => {
                   const parsed = parseFloat(transferAmount);
                   if (isNaN(parsed) || parsed <= 0 || parsed > balance) return;
                   setTransferSending(true);
                   try {
                     await spendQDs(parsed, `Transfer to ${shortAddr(activePeer!)}`);
                     executeSend(`__PAYMENT__::${parsed}`);
                     toast.success(`Sent ${parsed} QD to ${shortAddr(activePeer!)}!`);
                     setShowWalletTransfer(false);
                     setTransferAmount('');
                   } catch {
                     toast.error('Transfer failed. Please try again.');
                   } finally {
                     setTransferSending(false);
                   }
                 }}
                 className="w-full py-3.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:opacity-90 text-white text-[13px] font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 {transferSending ? 'Processing...' : `Send ${transferAmount || '0'} QD`}
               </button>
             </div>
           </div>
       )}

      </div>
    </TuringShieldGate>
  );
}
