'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWalletClient, useSignMessage, useDisconnect, useReconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { QrCode, X, ChevronLeft, Menu, Settings, LogOut, ArrowLeft, UserX, UserCheck, Download, Trash2, UserPlus, User, MoreVertical, ExternalLink, Smartphone, Phone, Video, PhoneOff, VideoOff, Mic, MicOff, MonitorOff } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { useAztec, type AztecAddress } from '@/context/AztecContext';
import { useAztecNative } from '@/context/AztecNativeContext';
// NOTE: QDs state is sourced from AztecNativeContext (DB polling) — no local store needed.

// ─── iOS / Android detection ───────────────────────────────────────────────
function getDeviceOS(): 'ios' | 'android' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

// ─── WalletConnect deep-link extractor ─────────────────────────────────────
// Reads the active WalletConnect v2 session from localStorage and returns
// the wallet's universal link / native scheme so we can open it on iOS.
function getWalletConnectDeepLink(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    // Reown/WalletConnect v2 stores sessions under this key prefix
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('wc@2:client') || k.startsWith('wc@2:core') || k.includes('walletconnect')
    );
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        // Try to find peerMetadata.redirect.universal or peerMetadata.redirect.native
        const sessions = data?.value ?? data;
        const entries = Array.isArray(sessions) ? sessions : Object.values(sessions ?? {});
        for (const entry of entries) {
          const peer = entry?.peer?.metadata ?? entry?.peerMetadata;
          const redirect = peer?.redirect;
          if (redirect?.universal) return redirect.universal;
          if (redirect?.native) return redirect.native;
        }
      } catch {}
    }
    // Fallback: try AppKit's stored session
    const appkitSessions = localStorage.getItem('@reown/appkit-sessions') ||
                           localStorage.getItem('WALLETCONNECT_DEEPLINK_CHOICE');
    if (appkitSessions) {
      try {
        const parsed = JSON.parse(appkitSessions);
        return parsed?.href || parsed?.universal || parsed?.native || null;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

// ─── iOS-safe wallet opener ─────────────────────────────────────────────────
// On iOS, we MUST open the wallet app via location.href (not window.open)
// because WKWebView blocks window.open for deep links outside user gesture.
function openWalletOnIOS(deepLink: string | null): void {
  const uri = deepLink || 'metamask://'; // fallback to MetaMask scheme
  // Using location.href preserves iOS user gesture and allows wallet to return
  window.location.href = uri;
}

import SidebarNavigation from '@/components/chat/SidebarNavigation';
import MessageEngine from '@/components/chat/MessageEngine';
import ChatInput from '@/components/chat/ChatInput';
import AdvancedSettingsModal from '@/components/chat/AdvancedSettingsModal';

// Real ENS resolution via Ethereum mainnet — zero mocks
const ENS_PROVIDER = new ethers.JsonRpcProvider('https://cloudflare-eth.com');

async function resolveENSName(address: string): Promise<string> {
  try {
    const name = await ENS_PROVIDER.lookupAddress(address);
    return name || `${address.slice(0, 6)}...${address.slice(-4)}`;
  } catch {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

function resolveZKName(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
import AttestationEngine from '@/components/terminal/AttestationEngine';
import { QrScanner } from '@/components/terminal/QrScanner';
import { QRCodeSVG } from 'qrcode.react';


import type { RenderableMessage, Reaction } from '@/components/chat/MessageEngine';
import type { ChatSettings } from '@/components/chat/AdvancedSettingsModal';
import { DEFAULT_SETTINGS } from '@/components/chat/AdvancedSettingsModal';

import {
  getXMTPClient,
  sendMessage as xmtpSend,
  getMessages,
  streamMessages,
  nsToDate,
  revokeXMTPInstallations,
  resolveSenderAddress,
  discoverNewPeers,
} from '@/lib/xmtp/client';

//  Types 

interface Conversation {
  peerAddress: string;
  displayName: string;
  folder: string;
  lastMessage?: string;
  unread: number;
}

//  Contact/Block helpers 

function getBlockedList(): string[] {
  try { return JSON.parse(localStorage.getItem('system_blocked') || '[]'); } catch { return []; }
}
function setBlockedList(list: string[]) {
  localStorage.setItem('system_blocked', JSON.stringify(list));
}
function getContacts(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('system_contacts') || '{}'); } catch { return {}; }
}
function setContacts(contacts: Record<string, string>) {
  localStorage.setItem('system_contacts', JSON.stringify(contacts));
}
function exportChat(messages: RenderableMessage[], peerAddress: string) {
  const lines = messages.map(m => {
    const date = new Date(m.sentAt).toLocaleString();
    const sender = m.isMine ? 'Me' : peerAddress.slice(0, 8) + '...';
    return `[${date}] ${sender}: ${m.content}`;
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whale-chat-${peerAddress.slice(0, 8)}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

//  Auto-destruct helpers 

const DESTRUCT_MS: Record<string, number | null> = {
  off: null, '1m': 60_000, '1h': 3_600_000, '24h': 86_400_000, '7d': 604_800_000,
};

function buildDestructsAt(preset: ChatSettings['autoDestruct']): number | undefined {
  const ms = DESTRUCT_MS[preset];
  return ms ? Date.now() + ms : undefined;
}

//  Default Settings 
// Imported from AdvancedSettingsModal

//  Persist settings to localStorage 

function loadSettings(): ChatSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('system_chat_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: ChatSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('system_chat_settings', JSON.stringify(s));
}

//  Persist conversations to localStorage 

function loadConversations(selfAddress: string): Conversation[] {
  if (typeof window === 'undefined' || !selfAddress) return [];
  try {
    const rawWhale = localStorage.getItem(`whale_chat_convs_${selfAddress.toLowerCase()}`);
    const rawSystem = localStorage.getItem(`system_chat_convs_${selfAddress.toLowerCase()}`);
    let convs: Conversation[] = [];
    if (rawWhale) convs = [...convs, ...JSON.parse(rawWhale)];
    if (rawSystem) convs = [...convs, ...JSON.parse(rawSystem)];
    
    const unique = new Map<string, Conversation>();
    for (const c of convs) {
      if (!unique.has(c.peerAddress)) {
        unique.set(c.peerAddress, c);
      } else {
        const existing = unique.get(c.peerAddress)!;
        if (c.lastMessage && !existing.lastMessage) {
          unique.set(c.peerAddress, c);
        }
      }
    }
    return Array.from(unique.values());
  } catch {}
  return [];
}

function saveConversations(selfAddress: string, convs: Conversation[]) {
  if (typeof window === 'undefined' || !selfAddress) return;
  localStorage.setItem(`whale_chat_convs_${selfAddress.toLowerCase()}`, JSON.stringify(convs));
  localStorage.removeItem(`system_chat_convs_${selfAddress.toLowerCase()}`);
}

//  XMTP message → RenderableMessage 

/**
 * CRITICAL FIX v2: Correctly maps XMTP v5.3.0 DecodedMessage to RenderableMessage.
 *
 * Previous bug: any message whose content JSON contained "synced" or "cursor" was
 * silently dropped as a sync log. This silently discarded real user messages.
 *
 * Fix: only drop messages that are explicitly internal XMTP protocol messages,
 * identified by their contentType.typeId (group_updated, group_membership_change, etc.)
 */
function xmtpToRenderable(msg: any, selfInboxId: string): RenderableMessage {
  // Safely extract content - may be a string, object, or null in v5.3.0
  const rawContent = msg.content;
  let content: string;

  if (typeof rawContent === 'string') {
    // Plain text message — the normal case for user-to-user chats
    content = rawContent;
  } else if (rawContent != null) {
    // Codec-decoded objects arrive as structured objects.
    // Only mark as SYNC_LOG if the contentType explicitly identifies it as internal.
    const typeId = msg.contentType?.typeId ?? '';
    const isInternalProtocol =
      typeId === 'group_updated' ||
      typeId === 'group_membership_change' ||
      typeId === 'membership_change' ||
      typeId === 'key_package' ||
      typeId === 'commit';

    if (isInternalProtocol) {
      content = '[XMTP_SYNC_LOG]';
    } else {
      // Non-string, non-internal: stringify it (e.g. attachment, reaction codecs)
      try {
        content = JSON.stringify(rawContent);
      } catch {
        content = msg.fallback || '[Encrypted Content]';
      }
    }
  } else {
    // Null/undefined content: use fallback or mark as encrypted
    content = msg.fallback || '[Encrypted Content]';
  }

  const sentAt = msg.sentAtNs ? Number(nsToDate(msg.sentAtNs)) : Date.now();
  // CRITICAL FIX: use case-insensitive comparison — XMTP inboxIds may differ in casing
  // between the local client and the network-returned senderInboxId.
  const isMine = selfInboxId
    ? (msg.senderInboxId ?? '').toLowerCase() === selfInboxId.toLowerCase()
    : false;

  return {
    id: msg.id ?? `msg-${sentAt}-${Math.random().toString(36).slice(2)}`,
    senderAddress: msg.senderInboxId ?? '',
    content,
    sentAt,
    isMine,
    isPinned: false,
    isDestructing: false,
    reactions: [],
  };
}


// ─── Lottie helper (CDN, no extra npm dep) ──────────────────────────────────
function LottieInline({
  animId,
  size = 32,
  className = '',
  loop = true,
}: {
  animId: string;
  size?: number;
  className?: string;
  loop?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const animRef = React.useRef<any>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const init = () => {
      if (animRef.current) return;
      const lottie = (window as any).lottie;
      if (!lottie) return;
      animRef.current = lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop,
        autoplay: true,
        path: `https://lottie.host/${animId}/lottie.json`,
      });
    };
    if ((window as any).lottie) { init(); return; }
    const script = document.getElementById('lottie-cdn') as HTMLScriptElement | null;
    if (!script) {
      const s = document.createElement('script');
      s.id = 'lottie-cdn';
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    } else {
      script.addEventListener('load', init, { once: true });
    }
    return () => { animRef.current?.destroy(); animRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animId]);
  return <div ref={ref} style={{ width: size, height: size }} className={className} />;
}

// [AUDIO REMOVED] playMessageSound is permanently silenced.
function playMessageSound() { /* no-op */ }

//  SystemChat (Orchestrator) 

export default function SystemChat({ onReturnToGate }: { onReturnToGate?: () => void }) {
  const { address, isConnected, isLocalSystemWallet, connector, isSystemHandshake, needsWalletReconnect, isChecking } = useAccount();
  const { open: openAppKit } = useAppKit();
  const { data: walletClient } = useWalletClient();
  const { privateKey: storePrivateKey } = useWalletStore();
  const { disconnect } = useDisconnect();
  const { reconnect } = useReconnect();
  const { signMessageAsync } = useSignMessage();
  const { nuclearDisconnect } = useSystemSignOut();
  const { spendQDs } = useAztecNative();

  // walletClientRef: keeps a stable ref to the latest walletClient so the
  // XMTP signer can always access the current client even after async awaits.
  const walletClientRef = useRef<any>(walletClient);
  useEffect(() => { walletClientRef.current = walletClient; }, [walletClient]);

  // Detect OS once on mount — used for platform-specific UX hints in the UI
  const [deviceOS] = useState<'ios' | 'android' | 'other'>(() =>
    typeof window !== 'undefined' ? getDeviceOS() : 'other'
  );

  // Zombie session recovery: wallet connected but wagmi connector lost (common after mobile deep-link)
  useEffect(() => {
    if (isConnected && !connector && !isSystemHandshake && !isLocalSystemWallet) {
        console.warn('[SystemChat] Zombie session detected — attempting silent reconnection.');
        reconnect();
    }
  }, [isConnected, connector, isSystemHandshake, isLocalSystemWallet, reconnect]);

  const handleFullDisconnect = () => {
    toast.success('Session disconnected.');
    nuclearDisconnect();
  };

  //  Metadata Hydration Engine (Reactions, Pins, Deletions, Replies) 
  const hydrateMessages = useCallback((msgs: RenderableMessage[]) => {
    if (!address) return msgs;
    const normAddr = address.toLowerCase();

    let deletedIds: string[] = [];
    let pinnedIdsList: string[] = [];
    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      if (delRaw) deletedIds = JSON.parse(delRaw);
    } catch {}
    try {
      const pinRaw = localStorage.getItem(`whale_chat_pins_${normAddr}`);
      if (pinRaw) pinnedIdsList = JSON.parse(pinRaw);
    } catch {}

    const deletedSet = new Set(deletedIds);
    const pinnedSet = new Set(pinnedIdsList);

    return msgs
      .filter(m => !deletedSet.has(m.id))
      .map(m => {
        let content = m.content;
        let replyToId = m.replyToId;
        const replyMatch = typeof content === 'string' ? content.match(/^\[REPLY:([^\]]+)\](.*)$/s) : null;
        if (replyMatch) {
          replyToId = replyMatch[1];
          content = replyMatch[2];
        }

        let reactions = m.reactions || [];
        try {
          const rxRaw = localStorage.getItem(`whale_chat_reactions_${normAddr}_${m.id}`);
          if (rxRaw) reactions = JSON.parse(rxRaw);
        } catch {}

        return {
          ...m,
          content,
          replyToId,
          isPinned: pinnedSet.has(m.id),
          reactions,
        };
      });
  }, [address]);

  //  Settings (persisted) 
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setSettings(loadSettings()); }, []);
  const handleSettingsChange = (s: ChatSettings) => { setSettings(s); saveSettings(s); };

  //  UI State 
  const [showSettings, setShowSettings] = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  const [scannerTab, setScannerTab]     = useState<'scan' | 'my-qr'>('scan');
  const [activeFolder, setActiveFolder] = useState('all');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showPeerMenu, setShowPeerMenu] = useState(false);
  const [blockedList, setBlockedListState] = useState<string[]>([]);
  const [contacts, setContactsState] = useState<Record<string, string>>({});
  
  // Group Chat State (Internal)
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  // Load blocked + contacts on mount
  useEffect(() => {
    setBlockedListState(getBlockedList());
    setContactsState(getContacts());
  }, []);

  //  Conversations & Messages 
  const [conversationsState, setConversationsState] = useState<Conversation[]>([]);
  const setConversations = useCallback((val: Conversation[] | ((prev: Conversation[]) => Conversation[])) => {
    setConversationsState((prev: Conversation[]) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (address) {
        localStorage.setItem(`whale_chat_convs_${address.toLowerCase()}`, JSON.stringify(next));
      }
      return next;
    });
  }, [address]);

  const conversations = conversationsState;

  useEffect(() => {
    if (address) {
      try {
        const saved = JSON.parse(localStorage.getItem(`whale_chat_convs_${address.toLowerCase()}`) || '[]');
        setConversationsState(saved);
      } catch {}
    } else {
      setConversationsState([]);
    }
  }, [address]);

  const [activeConv, setActiveConv]       = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<RenderableMessage[]>([]);
  const [replyingTo, setReplyingTo]       = useState<{ id: string; preview: string } | undefined>();
  const [pinnedIds, setPinnedIds]         = useState<Set<string>>(new Set());
  const [newPeer, setNewPeer]             = useState('');
  const [sending, setSending]             = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [xmtpReady, setXmtpReady]        = useState(false);
  const [xmtpError, setXmtpError]        = useState<string | null>(null);
  const [xmtpInitializing, setXmtpInitializing] = useState(false);
  const xmtpInitLock = useRef(false); // prevent concurrent inits

  const bottomRef  = useRef<HTMLDivElement>(null);
  const xmtpClient = useRef<any>(null);
  
  const activeConvRef = useRef<Conversation | null>(null);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // ─── WebRTC Native Call State ─────────────────────────────────────────────
  type CallState = 'idle' | 'calling' | 'receiving' | 'connected' | 'ended';
  const [callState, setCallState]       = useState<CallState>('idle');
  const [callType, setCallType]         = useState<'audio' | 'video'>('video');
  const [callMuted, setCallMuted]       = useState(false);
  const [callVideoOff, setCallVideoOff] = useState(false);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnRef    = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callSignalBuffer = useRef<string[]>([]); // buffer incoming ICE before remoteDesc

  // Stop all tracks + close peer connection cleanly
  const stopCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    peerConnRef.current?.close();
    peerConnRef.current = null;
    callSignalBuffer.current = [];
    setCallState('idle');
    setCallMuted(false);
    setCallVideoOff(false);
  }, []);

  // Toggle mute on local audio track
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setCallMuted(m => !m);
  }, []);

  // Toggle video on local video track
  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCallVideoOff(v => !v);
  }, []);

  // Build RTCPeerConnection with Google STUN
  const buildPeer = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    return pc;
  }, []);

  // Initiate an outgoing call (Caller side)
  const handleStartCall = useCallback(async (type: 'audio' | 'video') => {
    if (!activeConv || callState !== 'idle') return;
    if (!xmtpReady || !xmtpClient.current) {
      toast.error('Activa Whale Chat primero para llamar.');
      return;
    }
    // QD gate: 0.5 QDs per call
    const paid = await spendQDs(0.5, type === 'video' ? 'Encrypted Video Call' : 'Encrypted Audio Call');
    if (!paid) {
      toast.error('QDs insuficientes', { description: 'Necesitas 0.5 QDs para iniciar una llamada encriptada.' });
      return;
    }

    setCallType(type);
    setCallState('calling');

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const pc = buildPeer();
      peerConnRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = async (e) => {
        if (e.candidate && xmtpClient.current) {
          const msg = JSON.stringify({ type: 'ICE', candidate: e.candidate.toJSON(), callType: type });
          await xmtpSend(xmtpClient.current, activeConvRef.current!.peerAddress, `[CALL_SIGNAL]${msg}`, address ?? undefined);
        }
      };

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
        setCallState('connected');
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const offerMsg = JSON.stringify({ type: 'OFFER', sdp: offer.sdp, callType: type });
      await xmtpSend(xmtpClient.current, activeConvRef.current!.peerAddress, `[CALL_SIGNAL]${offerMsg}`, address ?? undefined);
      toast.success('Llamada enviada — esperando respuesta…');
    } catch (err: any) {
      console.error('[WebRTC] Call failed:', err);
      toast.error('No se pudo iniciar la llamada', { description: err?.message });
      stopCall();
    }
  }, [activeConv, callState, xmtpReady, spendQDs, buildPeer, stopCall, address]);

  // Handle incoming call signals over XMTP
  const handleIncomingCallSignal = useCallback(async (raw: string, senderAddress?: string) => {
    if (!raw.startsWith('[CALL_SIGNAL]')) return;
    const payload = raw.slice('[CALL_SIGNAL]'.length);
    let msg: any;
    try { msg = JSON.parse(payload); } catch { return; }

    if (msg.type === 'OFFER') {
      if (senderAddress) {
        // ── Anti-Bypass Hardening: Verify Ledger Payment ──
        try {
          const res = await fetch(`/api/aztec/transactions?address=${senderAddress}`);
          const data = await res.json();
          const hasPaid = data.transactions?.some((t: any) => 
            t.type === 'SPEND' && 
            t.amount === 0.5 && 
            (Date.now() - new Date(t.createdAt).getTime()) < 120_000 // Paid in the last 2 minutes
          );
          
          if (!hasPaid) {
            console.warn('[WebRTC Security] Call rejected. Sender bypassed client-side payment execution.');
            return;
          }
        } catch (err) {
          console.error('Failed to verify caller payment:', err);
          return;
        }
      }

      setCallType(msg.callType ?? 'video');
      setCallState('receiving');
      // Store offer so user can accept
      callSignalBuffer.current = [payload];
    }

    if (msg.type === 'ANSWER' && peerConnRef.current) {
      await peerConnRef.current.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
      // Drain buffered ICE
      for (const ice of callSignalBuffer.current) {
        try {
          const iceMsg = JSON.parse(ice);
          if (iceMsg.type === 'ICE') await peerConnRef.current.addIceCandidate(iceMsg.candidate);
        } catch {}
      }
      callSignalBuffer.current = [];
    }

    if (msg.type === 'ICE') {
      if (peerConnRef.current?.remoteDescription) {
        await peerConnRef.current.addIceCandidate(msg.candidate);
      } else {
        callSignalBuffer.current.push(payload);
      }
    }

    if (msg.type === 'HANGUP') {
      stopCall();
      toast('La otra parte ha colgado la llamada.');
    }
  }, [stopCall]);

  // Accept incoming call (Callee side)
  const handleAcceptCall = useCallback(async () => {
    if (callState !== 'receiving' || !activeConv) return;
    const offerRaw = callSignalBuffer.current[0];
    if (!offerRaw) return;
    let offerMsg: any;
    try { offerMsg = JSON.parse(offerRaw); } catch { return; }

    const paid = await spendQDs(0.5, callType === 'video' ? 'Encrypted Video Call' : 'Encrypted Audio Call');
    if (!paid) {
      toast.error('QDs insuficientes para contestar la llamada.');
      stopCall();
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const pc = buildPeer();
      peerConnRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicecandidate = async (e) => {
        if (e.candidate && xmtpClient.current) {
          const msg = JSON.stringify({ type: 'ICE', candidate: e.candidate.toJSON() });
          await xmtpSend(xmtpClient.current, activeConvRef.current!.peerAddress, `[CALL_SIGNAL]${msg}`, address ?? undefined);
        }
      };

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setCallState('connected');
      };

      await pc.setRemoteDescription({ type: 'offer', sdp: offerMsg.sdp });
      // Drain buffered ICE from OFFER phase
      for (const raw of callSignalBuffer.current.slice(1)) {
        try {
          const iceMsg = JSON.parse(raw);
          if (iceMsg.type === 'ICE') await pc.addIceCandidate(iceMsg.candidate);
        } catch {}
      }
      callSignalBuffer.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const answerMsg = JSON.stringify({ type: 'ANSWER', sdp: answer.sdp });
      await xmtpSend(xmtpClient.current, activeConvRef.current!.peerAddress, `[CALL_SIGNAL]${answerMsg}`, address ?? undefined);
    } catch (err: any) {
      console.error('[WebRTC] Accept failed:', err);
      toast.error('Error al contestar', { description: err?.message });
      stopCall();
    }
  }, [callState, callType, activeConv, spendQDs, buildPeer, stopCall, address]);

  // Hang up and notify peer
  const handleHangUp = useCallback(async () => {
    if (xmtpClient.current && activeConvRef.current) {
      try {
        await xmtpSend(xmtpClient.current, activeConvRef.current.peerAddress, '[CALL_SIGNAL]{"type":"HANGUP"}', address ?? undefined);
      } catch {}
    }
    stopCall();
  }, [stopCall, address]);

  // Intercept incoming messages to detect call signals
  const processIncomingForCall = useCallback((content: string) => {
    if (content.startsWith('[CALL_SIGNAL]')) {
      handleIncomingCallSignal(content);
      return true; // consumed
    }
    return false;
  }, [handleIncomingCallSignal]);

  // Cleanup WebRTC on unmount
  useEffect(() => () => stopCall(), [stopCall]);

  // Local typing state — true while the user is actively typing in ChatInput
  const [isTyping, setIsTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTypingChange = React.useCallback((typing: boolean) => {
    setIsTyping(typing);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  }, []);

  const settingsRef = useRef<ChatSettings>(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Load conversations on mount / address change
  useEffect(() => {
    if (address) {
      setConversations(loadConversations(address));
    } else {
      setConversations([]);
    }
    setActiveConv(null);
    setMessages([]);
  }, [address]);

  // Open conversation from universal scan (wallet QR) - Polling to guarantee instant "butter" feel
  useEffect(() => {
    if (!address || typeof sessionStorage === 'undefined') return;
    const interval = setInterval(() => {
      const peer = sessionStorage.getItem('whale_scan_peer');
      if (peer && /^0x[a-fA-F0-9]{40}$/.test(peer)) {
        sessionStorage.removeItem('whale_scan_peer');
        const displayName = peer.slice(0, 6) + '...' + peer.slice(-4);
        setActiveConv({ peerAddress: peer, displayName, folder: 'inbox', unread: 0 });
        toast.success('Wallet scanned — chat opened');
      }
    }, 500);
    return () => clearInterval(interval);
  }, [address]);

  // Save conversations on change
  useEffect(() => {
    if (address && conversations.length > 0) {
      saveConversations(address, conversations);
    }
  }, [conversations, address]);

  //  Auto-scroll & Mobile Keyboard Stability 
  useEffect(() => {
    // Use rAF to throttle scroll — prevents layout thrash on mobile when
    // keyboard opens/closes rapidly (can cause O(n) re-renders on window resize otherwise)
    let rafId: number | null = null;
    const doScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const container = bottomRef.current?.parentElement;
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
        }
      });
    };
    doScroll();
    // ONLY listen to visualViewport (keyboard open/close), NOT window resize
    // Window resize fires on every orientation change + soft keyboard + scroll on mobile
    // causing cascading re-renders. visualViewport is precise and low-noise.
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', doScroll, { passive: true });
    }
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', doScroll);
      }
    };
  }, [messages]);

  //  Self-destruct ticker 
  useEffect(() => {
    const id = setInterval(() => {
      setMessages(prev => {
        const next = prev.filter(m => !m.destructsAt || m.destructsAt > Date.now());
        return next.length !== prev.length ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  //  Apply screenshot protection 
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if ((settings as any).screenshotProtection) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
  }, [(settings as any).screenshotProtection]);

  //  XMTP Client Init 
  const initXmtpClient = useCallback(async (isManual = false) => {
    if (!isConnected || !address) return;
    if (xmtpReady) return; // Already initialized
    if (xmtpInitLock.current) return; // Already in progress

    const hasLocalWallet = isLocalSystemWallet && storePrivateKey;
    const existingSeed = typeof localStorage !== 'undefined' ? localStorage.getItem(`whale_chat_seed_${address.toLowerCase()}`) : null;
    const canSignLocally = hasLocalWallet || existingSeed;

    if (isSystemHandshake && !connector && !canSignLocally) {
      setXmtpError('Chat and Identity require end-to-end encryption. Please Connect Wallet to sign.');
      return;
    }

    // Wait for walletClient (mobile deep-link returns often need a moment)
    // We don't strictly fail if it's missing, because we can fallback to signMessageAsync
    if (!hasLocalWallet && !walletClientRef.current) {
      setXmtpInitializing(true);
      let waited = 0;
      const MAX_WAIT = isManual ? 4000 : 8000;
      const INTERVAL = 300;
      while (!walletClientRef.current && waited < MAX_WAIT) {
        await new Promise(r => setTimeout(r, INTERVAL));
        waited += INTERVAL;
      }
      if (!walletClientRef.current) {
        console.warn('[SystemChat] walletClient not hydrated, will attempt fallback to signMessageAsync');
      }
    }

    xmtpInitLock.current = true;
    setXmtpError(null);
    setXmtpInitializing(true);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(1.5, attempts)));

        let signer: any;
        if (canSignLocally) {
          // ── Path A: Local private-key wallet or Synced Mobile Seed (no external signing needed) ──
          const ethersWallet = new ethers.Wallet(storePrivateKey || existingSeed!);
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              return ethersWallet.signMessage(msg);
            },
          };
        } else {
          // ── Path B: External wallet (MetaMask / WalletConnect) ─────────────
          // Key rules for maximum cross-platform compatibility:
          // 1. Use walletClientRef.current (stable ref) so we always have the
          //    rehydrated client even after an iOS/Android app-switch.
          // 2. Do NOT pass `account` — let WalletConnect use its own connected
          //    account. Explicit account passing causes casing mismatches on
          //    mobile WalletConnect sessions that silently reject the request.
          // 3. After signing on mobile, wait 250ms before returning the sig to
          //    XMTP. When returning from the wallet app on iOS/Android, the
          //    WebSocket to the XMTP relay re-establishes ~100-300ms after focus.
          //    Without this gap, Client.create() can fail with a network error
          //    even though the signature itself was valid.
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              const isMobile = typeof navigator !== 'undefined' &&
                /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

              let rpcAttempts = 0;
              const maxRpcAttempts = 3;
              while (rpcAttempts < maxRpcAttempts) {
                const startTime = Date.now();
                try {
                  // Primary: Wagmi hook (Integrated with AppKit iOS deep-linking)
                  if (signMessageAsync) {
                    if (isMobile) {
                      setTimeout(() => openWalletOnIOS(getWalletConnectDeepLink()), 50);
                    }
                    const sig = await signMessageAsync({
                      message: typeof msg === 'string' ? msg : { raw: msg } as any
                    });
                    // Post-signing reconnection grace period for mobile
                    if (isMobile) await new Promise(r => setTimeout(r, 400));
                    return sig;
                  }

                  // Fallback: viem walletClient (if wagmi hook is unavailable)
                  const wc = walletClientRef.current;
                  if (wc?.signMessage) {
                    if (isMobile) {
                      setTimeout(() => openWalletOnIOS(getWalletConnectDeepLink()), 50);
                    }
                    const sig = await wc.signMessage({
                      message: typeof msg === 'string' ? msg : { raw: msg as unknown as `0x${string}` },
                    });
                    if (isMobile) await new Promise(r => setTimeout(r, 400));
                    return sig;
                  }
                  throw new Error('Wallet connection missing');
                } catch (sigErr: any) {
                  const duration = Date.now() - startTime;
                  rpcAttempts++;
                  const errMsg = (sigErr?.message || '').toLowerCase();
                  
                  if (errMsg.includes('reject') || errMsg.includes('deny') || errMsg.includes('user denied')) {
                    throw new Error('Firma rechazada. Pulsa el botón para reintentar.');
                  }

                  // If it failed instantly (e.g. dead socket), wait a bit and retry 
                  // It doesn't spam the user because the deep-link popup never had time to open.
                  if (duration < 1500 && rpcAttempts < maxRpcAttempts) {
                    console.warn(`[XMTP] WalletConnect dead socket detected (${duration}ms), retrying...`);
                    await new Promise(r => setTimeout(r, 1500));
                    continue;
                  }
                  
                  // Any true RPC timeout from Wagmi (user took too long)
                  throw new Error('Timeout de WalletConnect. Pulsa "Reconectar Billetera" o vuelve a intentarlo.');
                }
              }
              throw new Error('Timeout de WalletConnect.');
            },
          };
        }


        const clientPromise = getXMTPClient(signer);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout. Please check your network and try again.')), 60000)
        );
        const client = await Promise.race([clientPromise, timeoutPromise]);
        xmtpClient.current = client;
        xmtpInitLock.current = false;
        setXmtpInitializing(false);
        setXmtpReady(true);
        
        // Identity Mint logic for WalletConnect wallets
        // CRITICAL FIX: Use the same derive-address + airdrop flow as the portfolio.
        // The mintIdentity endpoint wrote to the raw EVM address, but the portfolio
        // queries balance by the Aztec-derived address (SHA-256 of EVM address).
        const isWalletConnect = connector?.id?.toLowerCase().includes('walletconnect');
        if (isWalletConnect || !isLocalSystemWallet) {
            const mintKey = `qds_identity_mint_${address}`;
            if (typeof localStorage !== 'undefined' && !localStorage.getItem(mintKey)) {
                try {
                    // Step 1: Derive the canonical Aztec address for this EVM wallet
                    const deriveRes = await fetch('/api/aztec/derive-address', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ seed: address })
                    });
                    if (deriveRes.ok) {
                        const { aztecAddress: derivedAztecAddr } = await deriveRes.json();
                        // Step 2: Airdrop to the derived Aztec address (same as portfolio tab)
                        const airdropRes = await fetch('/api/aztec/airdrop', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address: derivedAztecAddr })
                        });
                        const airdropData = await airdropRes.json();
                        if (airdropData.success) {
                            localStorage.setItem(mintKey, 'true');
                            toast.success('✅ Aztec Identity Active: 10 QDs received!', { 
                                description: 'Transaction confirmed on Aztec Testnet.',
                                duration: 8000,
                                action: airdropData.explorerUrl ? {
                                    label: 'View on AztecScan',
                                    onClick: () => window.open(airdropData.explorerUrl, '_blank')
                                } : undefined
                            });
                        } else if (airdropData.message?.includes('Already received')) {
                            localStorage.setItem(mintKey, 'true');
                        }
                    }
                } catch (e) {
                    console.error('Identity Airdrop Failed:', e);
                }
            }
        }
        
        return; // Success
      } catch (e: any) {
        attempts++;
        const msg = (e?.message || '').toLowerCase();
        
        if (msg.includes('xmtp_limit_reached')) {
          const [, inboxId] = (e.message as string).split(':');
          xmtpInitLock.current = false;
          setXmtpInitializing(false);
          setXmtpError(`XMTP_LIMIT_REACHED:${inboxId || ''}`);
          return;
        }

        // If user actively rejected, don't retry
        if (msg.includes('reject') || msg.includes('deny') || msg.includes('user denied')) {
          xmtpInitLock.current = false;
          setXmtpInitializing(false);
          setXmtpError('Firma rechazada. Pulsa el botón de abajo y aprueba en tu wallet.');
          return;
        }

        // WalletConnect RPC error — give actionable instructions
        if (msg.includes('wallet') || msg.includes('rpc') || msg.includes('tardó') || msg.includes('respond')) {
          xmtpInitLock.current = false;
          setXmtpInitializing(false);
          setXmtpError(e?.message ?? 'Error de conexión con tu wallet. Abre MetaMask, asegúrate de que está en la red correcta y pulsa Reintentar.');
          return;
        }
        if (attempts >= maxAttempts) {
          xmtpInitLock.current = false;
          setXmtpInitializing(false);
          setXmtpError(e?.message ?? 'Connection failed. Please tap below to retry.');
        } else {
          console.warn(`[XMTP] Init attempt ${attempts} failed, retrying...`, e);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, walletClient, address, isLocalSystemWallet, storePrivateKey, xmtpReady, connector, isSystemHandshake]);

  const handleRevokeSessions = async (inboxId: string) => {
    if (!walletClientRef.current) return;
    try {
      setXmtpInitializing(true);
      setXmtpError(null);
      const signer = {
        getAddress: async () => address as string,
        signMessage: async (msg: string | Uint8Array) => {
          const sig = await walletClientRef.current.signMessage({
            // No explicit account — let WalletConnect use its own session account
            message: typeof msg === 'string' ? msg : { raw: msg as unknown as `0x${string}` },
          });
          return sig;
        },
      };
      await revokeXMTPInstallations(signer as any, inboxId);
      toast.success('Sesiones antiguas revocadas. Iniciando nueva sesión...');
      initXmtpClient(true);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al revocar', { description: err?.message });
      setXmtpInitializing(false);
      setXmtpError(`XMTP_LIMIT_REACHED:${inboxId}`);
    }
  };

  // Auto-init XMTP — ONLY for safe, local signers.
  // [CRITICAL FIX] External wallets (MetaMask injected, WalletConnect) require a
  // signature prompt to init XMTP. Calling this automatically when `isConnected`
  // fires causes the OS-level "This site is trying to open another app" dialog
  // to appear immediately and repeatedly (deep-link loop).
  // Rule: auto-init ONLY when we can sign WITHOUT an external popup:
  //   - isLocalSystemWallet + storePrivateKey  → in-memory ethers wallet, no popup
  //   - existingSeed from QR handshake         → in-memory ethers wallet, no popup
  // For connector-based wallets (MetaMask/WC), the user must click "Connect to Whale Chat".
  useEffect(() => {
    if (!isConnected || !address) return;

    const hasLocalWallet = isLocalSystemWallet && storePrivateKey;
    const existingSeed = typeof localStorage !== 'undefined' && address
      ? localStorage.getItem(`whale_chat_seed_${address.toLowerCase()}`)
      : null;

    if (needsWalletReconnect && !existingSeed) return;

    initXmtpClient(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isLocalSystemWallet, storePrivateKey, needsWalletReconnect, connector]);

  // Disabled auto-trigger on walletClient to prevent WalletConnect deep link loops on desktop.
  // Users must click "Retry Connection" or wait for a deliberate manual action.
  useEffect(() => {
    // Intentionally empty. Manual action required.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletClient, needsWalletReconnect]);

  useEffect(() => {
    if (!xmtpInitializing) return;
    // Don't time out QR/handshake-only sessions — they physically cannot complete XMTP init
    // without a local signer. Timing them out just produces false red errors.
    if (isSystemHandshake && !connector && !(isLocalSystemWallet && storePrivateKey)) return;
    const timeoutId = setTimeout(() => {
      if (!xmtpClient.current) {
        xmtpInitLock.current = false;
        setXmtpInitializing(false);
        setXmtpError((prev) => prev ?? 'Connection timed out. Please reconnect your wallet and retry.');
      }
    }, 45000);
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmtpInitializing, xmtpReady, isSystemHandshake, connector, isLocalSystemWallet, storePrivateKey]);

  // ── Mobile-ONLY visibilitychange re-init ──────────────────────────────────
  // When a user returns from the wallet app (iOS/Android) after approving the
  // XMTP signature, the page becomes visible again. We trigger a re-init ONLY
  // on mobile to recover from the app-switch state. On desktop this is a no-op
  // to prevent the deep-link bombardment that plagued earlier versions.
  useEffect(() => {
    const isMobile = typeof navigator !== 'undefined' &&
      /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    if (!isMobile) return; // Desktop: never auto-trigger from visibility

    const handler = () => {
      if (document.visibilityState === 'visible') {
        // Only retry if XMTP is NOT ready and we are not already initializing
        if (!xmtpReady && !xmtpInitLock.current && xmtpInitializing) {
          console.log('[SystemChat] Mobile returned from wallet app — retrying XMTP init');
          xmtpInitLock.current = false;
          initXmtpClient(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmtpReady, xmtpInitializing]);

  // ── Consume Offline Messages ──
  useEffect(() => {
    if (!xmtpReady || !address) return;
    const consumeOffline = async () => {
      try {
        const res = await fetch('/api/chat/queue/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        if (!res.ok) return;

        const { messages: offlineMsgs } = await res.json();
        if (!offlineMsgs || offlineMsgs.length === 0) return;

        console.log('[XMTP Offline Queue] Consumed', offlineMsgs.length, 'message(s)');

        // BUG FIX: Batch all rendered messages into ONE setState call
        // instead of calling setMessages N times (N re-renders + layout thrash)
        const rendered: RenderableMessage[] = offlineMsgs.map((oMsg: any) => ({
          id: `offline-${oMsg.id}`,
          senderAddress: oMsg.sender,
          content: oMsg.content,
          sentAt: new Date(oMsg.timestamp).getTime(),
          isMine: false,
          isPinned: false,
          isDestructing: false,
          reactions: [],
        }));

        // Inject into active message list (deduplicated)
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const fresh = rendered.filter(r => !existingIds.has(r.id));
          if (fresh.length === 0) return prev;
          return [...prev, ...fresh].sort((a, b) => a.sentAt - b.sentAt);
        });

        // Update conversation list with unread counts (batched)
        setConversations(prev => {
          let next = [...prev];
          for (const oMsg of offlineMsgs) {
            const senderNorm = (oMsg.sender as string).toLowerCase();
            // Only treat as a conversation if it looks like an Ethereum address
            if (!/^0x[a-fA-F0-9]{40}$/.test(senderNorm)) continue;

            const idx = next.findIndex(c => c.peerAddress.toLowerCase() === senderNorm);
            if (idx !== -1) {
              next[idx] = {
                ...next[idx],
                unread: next[idx].unread + 1,
                lastMessage: (oMsg.content as string).slice(0, 30),
              };
            } else {
              next.push({
                peerAddress: oMsg.sender,
                displayName: resolveZKName(oMsg.sender),
                folder: 'all',
                unread: 1,
                lastMessage: (oMsg.content as string).slice(0, 30),
              });
            }
          }
          return next;
        });

        // [AUDIO REMOVED] notification sound disabled.
      } catch (e) {
        console.error('[XMTP Offline Queue] Error consuming offline queue:', e);
      }
    };
    consumeOffline();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmtpReady, address]);

  // ── Proactive Conversation Discovery ──────────────────────────────────────
  // Periodically sync all DMs from the network and surface new peer conversations.
  // This ensures that if user A sends a message to user B, user B sees the
  // conversation appear in their sidebar even without a live stream event.
  // Also imports the discoverNewPeers utility for this purpose.
  useEffect(() => {
    if (!xmtpReady || !xmtpClient.current || !address) return;

    const knownPeers = new Set<string>(
      conversations.map(c => c.peerAddress.toLowerCase())
    );

    const runDiscovery = async () => {
      try {
        const newAddresses: string[] = await discoverNewPeers(
          xmtpClient.current,
          address,
          knownPeers,
        );
        if (newAddresses.length === 0) return;

        console.log('[XMTP Discovery] Found', newAddresses.length, 'new conversation(s)');

        setConversations(prev => {
          let next = [...prev];
          for (const peerAddr of newAddresses) {
            const norm = peerAddr.toLowerCase();
            const alreadyExists = next.some(c => c.peerAddress.toLowerCase() === norm);
            if (!alreadyExists) {
              next = [...next, {
                peerAddress: peerAddr,
                displayName: resolveZKName(peerAddr),
                folder: 'all',
                unread: 1,
                lastMessage: undefined,
              }];
            }
          }
          return next;
        });
      } catch (e) {
        console.warn('[XMTP Discovery] Failed:', e);
      }
    };

    // Run immediately on mount and then every 30 seconds
    runDiscovery();
    const discoveryInterval = setInterval(runDiscovery, 30000);

    return () => clearInterval(discoveryInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmtpReady, address]);

  useEffect(() => {
    if (!xmtpReady || !xmtpClient.current) return;
    
    let cancelled = false;
    const abortController = new AbortController();
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';
    let retryDelay = 2000;

    const startStream = async () => {
      while (!cancelled) {
        try {
          const gen = streamMessages(xmtpClient.current, abortController.signal);
          for await (const msg of gen) {
            if (cancelled) break;
            
            // Reset backoff delay on successful message
            retryDelay = 2000;
            
            const rendered = xmtpToRenderable(msg, selfInboxId);

            // Only drop explicitly-marked internal XMTP protocol messages.
            // Do NOT filter by content text — real messages may contain any words.
            if (rendered.content === '[XMTP_SYNC_LOG]') continue;

            // ─── WebRTC Call Signal Intercept ──────────────────────────────────────────
            // If this message is a call signal from a peer, route it to the WebRTC
            // state machine and do NOT render it in the chat log.
            if (rendered.content.startsWith('[CALL_SIGNAL]') && !rendered.isMine) {
              // Wait, we need msgConvPeer early here, but we can resolve it quickly
              let earlyConvPeer = msg.conversation?.peerAddress?.toLowerCase() || '';
              if (!earlyConvPeer && msg.senderInboxId && msg.senderInboxId !== selfInboxId) {
                  try {
                      const res = await resolveSenderAddress(msg.senderInboxId);
                      if (res) earlyConvPeer = res.toLowerCase();
                  } catch {}
              }
              handleIncomingCallSignal(rendered.content, earlyConvPeer);
              continue;
            }
            // Also skip our own call signals from appearing as chat messages
            if (rendered.content.startsWith('[CALL_SIGNAL]')) continue;
            // ─────────────────────────────────────────────────────────────

            const hydratedList = hydrateMessages([rendered]);
            if (hydratedList.length === 0) continue;
            const hydrated = hydratedList[0];

            const fromPeer = msg.senderInboxId !== selfInboxId;
            
            // --- Peer address resolution (critical for DM matching) ---
            // v5.3.0: msg.conversation may not have peerAddress set directly.
            // We resolve via members array first, then via inboxId cache.
            let msgConvPeer = msg.conversation?.peerAddress?.toLowerCase() || '';

            if (!msgConvPeer) {
              // Strategy 1: scan members for the non-self address if conversation exists
              if (msg.conversation) {
                try {
                  const rawMembers = msg.conversation.members;
                  const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
                  const selfNorm = address?.toLowerCase() ?? '';
                  for (const m of members) {
                    const peer = (m.accountAddresses ?? m.addresses ?? []).find((a: string) => a.toLowerCase() !== selfNorm);
                    if (peer) {
                      msgConvPeer = peer.toLowerCase();
                      msg.conversation.peerAddress = peer;
                      break;
                    }
                  }
                } catch {}
              }

              // Strategy 2: resolve senderInboxId → Ethereum address via cache/network
              // This works even if msg.conversation is undefined, as long as it's from a peer.
              if (!msgConvPeer && fromPeer && msg.senderInboxId) {
                try {
                  const resolved = await resolveSenderAddress(msg.senderInboxId);
                  if (resolved) {
                    msgConvPeer = resolved.toLowerCase();
                    if (msg.conversation) msg.conversation.peerAddress = resolved;
                  }
                } catch {}
              }
            }

            const currentActivePeer = activeConvRef.current?.peerAddress.toLowerCase();
            const belongsToActive = msgConvPeer
              ? msgConvPeer === currentActivePeer
              : !!currentActivePeer; // No peer resolved: show in current conv if any

            if (belongsToActive) {
              setMessages(prev => {
                if (prev.some(m => m.id === hydrated.id)) return prev;
                if (!fromPeer) {
                  // Replace optimistic message on send confirmation
                  const optIndex = prev.findIndex(m => m.id.startsWith('opt-') && m.content.trim() === hydrated.content.trim());
                  if (optIndex !== -1) {
                    const next = [...prev];
                    next[optIndex] = hydrated;
                    return next.sort((a, b) => a.sentAt - b.sentAt);
                  }
                }
                return [...prev, hydrated].sort((a, b) => a.sentAt - b.sentAt);
              });
              setConversations(prev => prev.map(c => 
                c.peerAddress.toLowerCase() === currentActivePeer 
                  ? { ...c, lastMessage: hydrated.content.slice(0, 30) } 
                  : c
              ));
            } else if (fromPeer && msgConvPeer) {
              // Message from a peer for a DIFFERENT conversation (not currently active)
              setConversations(prev => {
                 const exists = prev.some(c => c.peerAddress.toLowerCase() === msgConvPeer);
                 if (exists) {
                   return prev.map(c => 
                     c.peerAddress.toLowerCase() === msgConvPeer 
                       ? { ...c, unread: c.unread + 1, lastMessage: hydrated.content.slice(0, 30) } 
                       : c
                   );
                 } else {
                   // New conversation discovered via stream!
                   const newPeerAddr = msg.conversation?.peerAddress || msgConvPeer;
                   return [...prev, {
                      peerAddress: newPeerAddr,
                      displayName: resolveZKName(newPeerAddr),
                      folder: 'all',
                      unread: 1,
                      lastMessage: hydrated.content.slice(0, 30)
                   }];
                 }
              });
            }
          }
        } catch (e) {
          console.warn('[Chat] global stream disconnected/failed (network switch/timeout):', e);
          if (cancelled) break;
          // Wait and retry stream connection with exponential backoff
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      }
    };

    startStream();

    return () => { 
      cancelled = true; 
      abortController.abort();
    };
  }, [xmtpReady]);

  //  Load messages when conversation changes 
  useEffect(() => {
    if (!xmtpClient.current || !activeConv) { setMessages([]); return; }

    let cancelled = false;
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    let isFetching = false;
    const fetchHistorical = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const raw = await getMessages(xmtpClient.current, activeConv.peerAddress);
        if (cancelled) return;
        const rendered = raw
          .map((m: any) => xmtpToRenderable(m, selfInboxId))
          // Only filter explicitly-marked internal XMTP protocol messages.
          // xmtpToRenderable identifies these via contentType.typeId (not text matching)
          .filter((m: any) => m.content !== '[XMTP_SYNC_LOG]' && !m.content.startsWith('[CALL_SIGNAL]'))
        const hydrated = hydrateMessages(rendered);
        
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('opt-'));
          const renderedIds = new Set(hydrated.map(r => r.id));
          // Strip tags like [REPLY:...] from optimistic to match hydrated if needed, but since optimistic.content is raw, we match exactly.
          const hydratedContents = new Set(hydrated.map(h => h.content.trim()));
          
          // Only keep optimistic messages if they aren't already represented by a real hydrated message from the network.
          // Also filter out any optimistic message older than 45 seconds to prevent permanent ghost messages.
          const now = Date.now();
          const survivingOptimistic = optimistic.filter(o => 
            !renderedIds.has(o.id) && 
            !hydratedContents.has(o.content.trim()) &&
            (now - o.sentAt < 45000)
          );
          
          return [...hydrated, ...survivingOptimistic].sort((a, b) => a.sentAt - b.sentAt);
        });
      } catch (e) {
        console.warn('[Chat] load messages failed:', e);
      } finally {
        isFetching = false;
      }
    };

    fetchHistorical();

    // Fallback polling for the active conversation
    const pollId = setInterval(fetchHistorical, 5000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.peerAddress, xmtpReady]);

  //  Send via XMTP 
  const sendXmtp = useCallback(async (content: string) => {
    if (!xmtpClient.current || !activeConv) return;
    
    // Spend 0.01 QDs to use Whale Chat
    const paid = await spendQDs(0.01, "Whale Chat message");
    if (!paid) {
      toast.error("Insufficient QDs", { description: "You need 0.01 QDs to send a message." });
      return;
    }

    setSending(true);
    const selfInboxId = (xmtpClient.current as any).inboxId ?? '';

    const finalContent = replyingTo ? `[REPLY:${replyingTo.id}]${content}` : content;

    // Optimistic update
    const optimistic: RenderableMessage = {
      id: `opt-${Date.now()}`,
      senderAddress: selfInboxId,
      content,
      sentAt: Date.now(),
      isMine: true,
      isPinned: false,
      isDestructing: !!settings.autoDestruct && settings.autoDestruct !== 'off',
      destructsAt: buildDestructsAt(settings.autoDestruct),
      reactions: [],
      replyToId: replyingTo?.id,
    };

    setMessages(prev => [...prev, optimistic]);
    setReplyingTo(undefined);
    
    // Update last message locally
    setConversations(prev => prev.map(c => 
      c.peerAddress.toLowerCase() === activeConv.peerAddress.toLowerCase() 
        ? { ...c, lastMessage: content.slice(0, 30) } 
        : c
    ));

    try {
      const sendPromise = xmtpSend(xmtpClient.current, activeConv.peerAddress, finalContent, address ?? undefined);
      const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('El mensaje tardó demasiado en enviarse (posible problema de red 5G)')), 45000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      // Mark as sent (remove optimistic tag)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, readAt: undefined } : m));
    } catch (e: any) {
      // On failure, keep the message but mark it as failed so the user knows what happened
      const errString = e?.message || String(e);
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, failed: true, error: errString } : m));
      console.error('[Chat] send failed:', e);
      const msg = e?.message?.toLowerCase() || '';
      if (msg.includes('network') || msg.includes('recipient') || msg.includes('not found')) {
         toast.error('Destinatario Inactivo', { description: 'La wallet de destino no ha activado Whale Chat. No puede recibir mensajes aún.' });
      } else {
         toast.error('Error de Envío', { description: e?.message || 'Hubo un problema al enviar el mensaje de forma segura.' });
      }
    } finally {
      setSending(false);
    }
  }, [activeConv, replyingTo, settings.autoDestruct]);

  //  Emoji / Voice / File senders 
  const handleSendText  = (text: string) => sendXmtp(text);
  const handleSendEmoji = (emoji: string) => sendXmtp(emoji);

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
      toast.error('Attachment failed', { description: err.message });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVoice = async (blob: Blob, dur: number) => {
    const payload = await uploadAttachment(blob, `voice-${Date.now()}.webm`);
    if (payload) await sendXmtp(payload);
  };

  const handleSendFile = async (file: File) => {
    const payload = await uploadAttachment(file, file.name);
    if (payload) await sendXmtp(payload);
  };

  //  Reactions / Pin / Delete / Reply 
  const handleReact = (messageId: string, emoji: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      const reactions: Reaction[] = existing
        ? m.reactions.map(r => r.emoji === emoji
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r)
        : [...m.reactions, { emoji, count: 1, reacted: true }];
      
      const nextReactions = reactions.filter(r => r.count > 0);

      try {
        localStorage.setItem(`whale_chat_reactions_${normAddr}_${messageId}`, JSON.stringify(nextReactions));
      } catch {}

      return { ...m, reactions: nextReactions };
    }));
  };

  const handlePin = (messageId: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const nextPinned = !m.isPinned;

      try {
        const pinRaw = localStorage.getItem(`whale_chat_pins_${normAddr}`);
        let pins: string[] = pinRaw ? JSON.parse(pinRaw) : [];
        if (nextPinned) {
          if (!pins.includes(messageId)) pins.push(messageId);
        } else {
          pins = pins.filter(id => id !== messageId);
        }
        localStorage.setItem(`whale_chat_pins_${normAddr}`, JSON.stringify(pins));
      } catch {}

      return { ...m, isPinned: nextPinned };
    }));
  };

  const handleDelete = (messageId: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();

    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      const deleted: string[] = delRaw ? JSON.parse(delRaw) : [];
      if (!deleted.includes(messageId)) {
        deleted.push(messageId);
        localStorage.setItem(`whale_chat_deleted_${normAddr}`, JSON.stringify(deleted));
      }
    } catch {}

    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleReply  = (messageId: string) => {
    const target = messages.find(m => m.id === messageId);
    if (target) setReplyingTo({ id: messageId, preview: target.content.slice(0, 60) });
  };

  //  Peer management actions 
  const toggleBlock = (peerAddr: string) => {
    const norm = peerAddr.toLowerCase();
    const current = getBlockedList();
    const isBlocked = current.includes(norm);
    const next = isBlocked ? current.filter(a => a !== norm) : [...current, norm];
    setBlockedList(next);
    setBlockedListState(next);
    toast.success(isBlocked ? 'User unblocked.' : 'User blocked. Messages filtered.');
  };

  const addToContacts = (peerAddr: string) => {
    const alias = prompt(`Save alias for ${peerAddr.slice(0, 10)}...`, peerAddr.slice(0, 6) + '...' + peerAddr.slice(-4));
    if (!alias) return;
    const updated = { ...getContacts(), [peerAddr.toLowerCase()]: alias };
    setContacts(updated);
    setContactsState(updated);
    // Update displayName in conversation list
    setConversations(prev => prev.map(c =>
      c.peerAddress.toLowerCase() === peerAddr.toLowerCase() ? { ...c, displayName: alias } : c
    ));
    if (activeConv?.peerAddress.toLowerCase() === peerAddr.toLowerCase()) {
      setActiveConv(prev => prev ? { ...prev, displayName: alias } : null);
    }
    toast.success(`Saved as "${alias}"`);
  };

  const clearChat = (peerAddr: string) => {
    if (!address) return;
    const normAddr = address.toLowerCase();
    // Mark all current messages as deleted
    const currentIds = messages.map(m => m.id);
    try {
      const delRaw = localStorage.getItem(`whale_chat_deleted_${normAddr}`);
      const deleted: string[] = delRaw ? JSON.parse(delRaw) : [];
      const combined = Array.from(new Set([...deleted, ...currentIds]));
      localStorage.setItem(`whale_chat_deleted_${normAddr}`, JSON.stringify(combined));
    } catch {}
    setMessages([]);
    toast.success('Chat cleared locally.');
  };

  const deleteConversation = (peerAddr: string) => {
    clearChat(peerAddr);
    setConversations(prev => prev.filter(c => c.peerAddress.toLowerCase() !== peerAddr.toLowerCase()));
    setActiveConv(null);
    setShowPeerMenu(false);
    toast.success('Conversation removed.');
  };

  //  Start new conversation 
  const startConversation = (addressOverride?: string) => {
    const raw = (addressOverride ?? newPeer).trim();
    if (!raw) return;
    if (!raw.startsWith('0x') || raw.length !== 42) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }

    // CRITICAL FIX: always store EIP-55 checksummed address.
    // XMTP v5.3.0 uses the identifier string as a case-sensitive key.
    // If we store a lowercase address, getMessages / sendMessage will
    // produce an identifier that does NOT match the peer's XMTP inbox,
    // so messages appear to send but the peer never receives them.
    let addr = raw;
    try {
      // viem's getAddress() is synchronous for standard EOA addresses
      const { getAddress } = require('viem');
      addr = getAddress(raw);
    } catch {
      // If viem unavailable keep raw — checksumAddress in client.ts will fix it on send
    }

    const contactAlias = contacts[addr.toLowerCase()];
    const conv: Conversation = {
      peerAddress: addr,
      displayName: contactAlias || addr.slice(0, 6) + '...' + addr.slice(-4),
      folder: 'all',
      unread: 0,
    };

    const existing = conversations.find(c => c.peerAddress.toLowerCase() === addr.toLowerCase());
    const targetConv = existing || conv;

    if (!existing) {
      setConversations(prev => [conv, ...prev]);
    }

    setActiveConv(targetConv);
    setNewPeer('');
  };

  // Filter blocked peers from conversation list incoming messages
  const filteredConvs = (activeFolder === 'all' ? conversations : conversations.filter(c => c.folder === activeFolder))
    .filter(c => !blockedList.includes(c.peerAddress.toLowerCase()));

  //  Theme-driven background is handled via CSS variables in globals.css 

  // ── Session-restoration spinner ────────────────────────────────────────────
  // useSystemAccount reads localStorage/sessionStorage in a useEffect (client-only).
  // While that check is still in-flight we must NOT flash a "connect wallet" screen
  // — especially on mobile where HL users have a valid system_session_v2 token.
  if (isChecking) {
    return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-black/10 border-t-black/50 rounded-full animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/30">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center p-6">
        <div className="max-w-xs w-full flex flex-col items-center gap-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/40 leading-relaxed">
            Connect your wallet to access Whale Chat.
          </p>
          <button
            type="button"
            onClick={() => { window.location.href = '/'; }}
            className="w-full py-4 rounded-xl bg-[#050505] text-white font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all active:scale-[0.98]"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (needsWalletReconnect) {
    const existingSeed = typeof localStorage !== 'undefined' && address ? localStorage.getItem(`whale_chat_seed_${address.toLowerCase()}`) : null;
    if (!existingSeed) {
      return (
      <div className="flex flex-1 w-full h-full bg-white items-center justify-center p-6">
        <div className="max-w-sm w-full flex flex-col items-center gap-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/40 leading-relaxed">
            Connect your wallet in this browser to activate end-to-end encrypted Whale Chat.
          </p>
          {/* On mobile, openAppKit() may silently fail for Humanity Ledger users.
              We offer both options: AppKit modal AND a page refresh which re-runs
              the session-restoration logic and detects the HL system_session_v2 token. */}
          <button
            type="button"
            onClick={() => openAppKit()}
            className="w-full py-4 rounded-xl bg-[#050505] text-white font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all active:scale-[0.98]"
          >
            Connect Wallet
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-transparent border border-black/15 text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 transition-all active:scale-[0.98]"
          >
            Already logged in? Refresh
          </button>
        </div>
      </div>
    );
    }
  }

  //  Render 

  // ─── Video Call Overlay ─────────────────────────────────────────────────────
  const VideoCallOverlay = callState !== 'idle' ? (
    <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center" style={{ backdropFilter: 'blur(24px)' }}>
      {/* Remote video (fills background) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${
          callState !== 'connected' ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-500`}
      />

      {/* Status overlay when not yet connected */}
      {callState !== 'connected' && (
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="font-mono text-3xl font-black text-white">
              {activeConv?.displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <p className="font-mono text-white font-black text-lg uppercase tracking-widest">
              {activeConv?.displayName}
            </p>
            <p className="font-mono text-white/40 text-xs uppercase tracking-widest mt-1">
              {callState === 'calling' ? '🔐 Llamando… cifrado E2EE' :
               callState === 'receiving' ? '📲 Llamada entrante' : 'Conectando…'}
            </p>
          </div>
          {callState === 'receiving' && (
            <div className="flex gap-4">
              <button
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30"
              >
                <Phone size={24} className="text-white" />
              </button>
              <button
                onClick={handleHangUp}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-all shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Local video (picture-in-picture) */}
      {callType === 'video' && (
        <div className="absolute bottom-28 right-6 w-40 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-5 z-20">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
            callMuted ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }`}
          title={callMuted ? 'Activar micrófono' : 'Silenciar'}
        >
          {callMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
              callVideoOff ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            title={callVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
          >
            {callVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        )}
        <button
          onClick={handleHangUp}
          className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-all shadow-xl shadow-red-600/40"
          title="Colgar"
        >
          <PhoneOff size={24} className="text-white" />
        </button>
      </div>

      {/* QD cost badge */}
      <div className="absolute top-6 left-6 bg-black/50 border border-white/10 px-3 py-1.5 rounded-full">
        <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest">🔐 E2EE · 0.5 QD/llamada</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full h-full flex-1 flex text-black overflow-hidden chat-theme-wrapper bg-white relative" data-chat-theme={settings.theme} data-privacy={settings.privacyMode} onClick={() => showPeerMenu && setShowPeerMenu(false)}>
      {VideoCallOverlay}

      {/* Settings overlay removed permanently for now */}
      {/* Scanner overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md relative shadow-2xl border border-black/10 flex flex-col items-center">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-black/50 hover:text-black z-10">
              <X size={20} />
            </button>
            <h3 className="font-mono text-lg font-bold mb-4 uppercase tracking-widest text-center">Wallet QR</h3>
            
            <div className="flex bg-black/[0.04] p-1 rounded-xl w-full mb-6 relative">
              <button
                onClick={() => setScannerTab('scan')}
                className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  scannerTab === 'scan' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black/80'
                }`}
              >
                Scan QR
              </button>
              <button
                onClick={() => setScannerTab('my-qr')}
                className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  scannerTab === 'my-qr' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black/80'
                }`}
              >
                My QR
              </button>
            </div>

            {scannerTab === 'scan' ? (
              <div className="w-full">
                <QrScanner 
                  mode="scan" 
                  onScanSuccess={(scannedAddr) => {
                    setShowScanner(false);
                    startConversation(scannedAddr);
                  }} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="p-6 bg-white rounded-3xl border border-black/10 shadow-xl">
                  {address ? (
                    <QRCodeSVG
                      value={address}
                      size={220}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-black/5 rounded-2xl">
                      <p className="text-[10px] font-mono text-black/40">No wallet connected</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">Your Wallet Address</p>
                  <p className="font-mono text-[11px] font-bold text-black break-all max-w-[250px]">{address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex md:hidden">
          <div className="bg-white w-[240px] h-full shadow-2xl flex flex-col relative border-r border-black/10">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 text-black/50 hover:text-black z-50 p-1 bg-black/5 rounded-full"
            >
              <X size={16} />
            </button>
            <SidebarNavigation
              activeFolder={activeFolder}
              onSelectFolder={(folder) => {
                setActiveFolder(folder);
                setShowMobileSidebar(false);
              }}
              onOpenSettings={() => {
                setShowSettings(true);
                setShowMobileSidebar(false);
              }}
            />
          </div>
          <div className="flex-1" onClick={() => setShowMobileSidebar(false)} />
        </div>
      )}

      {/* 1  Folders Rail */}
      <div className="hidden md:flex">
        <SidebarNavigation
          activeFolder={activeFolder}
          onSelectFolder={setActiveFolder}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {/* 2  Conversation List */}
      <div data-sidebar className={`w-full md:w-[280px] border-r border-black/8 flex-col shrink-0 bg-white ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-black/6 space-y-3 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <div className="flex items-center gap-2">
              {onReturnToGate && (
                <button
                  onClick={onReturnToGate}
                  title="Back to wallet selector"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/[0.04] border border-black/10 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-black hover:bg-black/[0.08] transition-all"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.04] border border-black/10 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-black hover:bg-black/[0.08] transition-all"
              >
                <Menu size={16} />
                <span>{activeFolder === 'all' ? 'All Chats' : 'Secret ZK'}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFullDisconnect}
                title="Disconnect session"
                className="p-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-500 hover:bg-rose-100 transition-all"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              data-chat-input
              type="text"
              value={newPeer}
              onChange={e => setNewPeer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startConversation()}
              placeholder="0x address"
              style={{ fontSize: '16px', touchAction: 'manipulation' }}
              className="flex-1 min-w-0 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 font-mono text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
            />
            <button
              onClick={() => setShowScanner(true)}
              className="px-3 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-black hover:bg-black/10 transition-all shrink-0 flex items-center justify-center"
              title="Scan QR Code"
            >
              <QrCode size={18} />
            </button>
            <button
              onClick={() => startConversation()}
              className="px-3 py-2.5 rounded-xl bg-black text-white hover:bg-black/80 font-bold text-[16px] transition-all shrink-0 flex items-center justify-center"
              title="Add Address"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-black/25 font-mono text-[10px] px-4 text-center">
              Add a wallet address or scan a QR to start a conversation
            </div>
          )}
          {filteredConvs.map(conv => (
            <button
              key={conv.peerAddress}
              onClick={() => {
                // Clear unread on click
                setConversations(prev => prev.map(c => 
                  c.peerAddress === conv.peerAddress ? { ...c, unread: 0 } : c
                ));
                setActiveConv(conv);
              }}
              className={`w-full text-left px-4 py-4 border-b border-black/4 transition-all ${
                activeConv?.peerAddress.toLowerCase() === conv.peerAddress.toLowerCase()
                  ? 'bg-black/[0.04] border-l-2 border-l-black'
                  : 'hover:bg-black/[0.02] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/8 border border-black/10 flex items-center justify-center shrink-0 font-mono text-[13px] font-bold text-black">
                  {conv.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-mono text-[13px] font-bold text-black truncate">{conv.displayName}</p>
                  <p className="font-mono text-[10px] text-black/35 truncate mt-0.5">{conv.lastMessage ?? 'E2EE encrypted'}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="relative shrink-0 flex items-center justify-center" style={{ width: 32, height: 32 }}>
                    <LottieInline animId="02dee108-117f-11ee-8417-5fe9d1aa5cbb" size={32} loop={false} />
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-black text-black">
                      {conv.unread > 9 ? '+9' : conv.unread}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white shadow-sm overflow-hidden relative border-l border-gray-100">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/6 bg-white shrink-0 pt-[calc(1rem+env(safe-area-inset-top))] relative">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-2 -ml-3 text-black/50 hover:text-black transition-colors rounded-full hover:bg-black/5">
                  <ChevronLeft size={24} />
                </button>
                <div className="w-9 h-9 rounded-full bg-[#00C076]/10 border border-[#00C076]/20 flex items-center justify-center font-mono text-[13px] font-bold text-[#00C076] shrink-0">
                  {activeConv.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[13px] font-bold text-black break-all leading-tight">{activeConv.peerAddress}</p>
                  <p className={`font-mono text-[10px] font-bold mt-1 uppercase tracking-widest flex items-center gap-1.5 ${isTyping || sending || isUploading ? 'text-[#00C076]' : !isConnected ? 'text-red-500' : 'text-[#00C076]'}`}>
                    {blockedList.includes(activeConv.peerAddress.toLowerCase()) ? <span className="text-red-400">BLOCKED</span> :
                     !isConnected ? <> <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> OFFLINE </> :
                     xmtpError ? <span className="text-red-500">HANDSHAKE FAILED</span> :
                     !xmtpReady ? <span className="text-amber-500">{xmtpInitializing ? 'ACTIVATING...' : 'AWAITING HANDSHAKE...'}</span> :
                     isTyping || sending || isUploading ? (
                       <span className="flex items-center gap-1">
                         <LottieInline animId="16b39f54-cb36-11ee-b44b-afd859f781c2" size={22} />
                         <span>ESCRIBIENDO...</span>
                       </span>
                     ) : 
                     <> <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]"></div> ONLINE • ENCRYPTED </>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Audio Call — 0.5 QDs */}
                <button
                  onClick={() => handleStartCall('audio')}
                  disabled={callState !== 'idle' || !xmtpReady}
                  className="w-9 h-9 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/50 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Llamada de voz encriptada (0.5 QDs)"
                >
                  <Phone size={16} />
                </button>
                {/* Video Call — 0.5 QDs */}
                <button
                  onClick={() => handleStartCall('video')}
                  disabled={callState !== 'idle' || !xmtpReady}
                  className="w-9 h-9 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/50 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Videollamada encriptada (0.5 QDs)"
                >
                  <Video size={16} />
                </button>
                <button
                  onClick={() => setShowPeerMenu(p => !p)}
                  className="w-9 h-9 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/[0.07] transition-all"
                  title="Peer options"
                >
                  <MoreVertical size={17} />
                </button>
              </div>

              {/* Peer Profile Dropdown */}
              {showPeerMenu && (
                <div className="absolute right-4 top-full mt-2 z-[200] bg-white border border-black/8 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.13)] w-[230px] flex flex-col py-2 overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Address badge */}
                  <div className="px-4 py-3 border-b border-black/6 mb-1">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/30 mb-0.5">Wallet Address</p>
                    <p className="font-mono text-[11px] font-bold text-black break-all">{activeConv.peerAddress.slice(0,10)}...{activeConv.peerAddress.slice(-6)}</p>
                  </div>
                  {[
                    { icon: UserPlus, label: contacts[activeConv.peerAddress.toLowerCase()] ? 'Edit Contact' : 'Add to Contacts', action: () => { addToContacts(activeConv.peerAddress); setShowPeerMenu(false); } },
                    { icon: Download, label: 'Export Chat', action: () => { exportChat(messages, activeConv.peerAddress); setShowPeerMenu(false); toast.success('Chat exported.'); } },
                    { icon: Trash2, label: 'Clear Chat', action: () => { clearChat(activeConv.peerAddress); setShowPeerMenu(false); } },
                    { icon: blockedList.includes(activeConv.peerAddress.toLowerCase()) ? UserCheck : UserX, label: blockedList.includes(activeConv.peerAddress.toLowerCase()) ? 'Unblock User' : 'Block User', action: () => { toggleBlock(activeConv.peerAddress); setShowPeerMenu(false); }, warn: true },
                    { icon: X, label: 'Delete Conversation', action: () => deleteConversation(activeConv.peerAddress), danger: true },
                  ].map(({ icon: Icon, label, action, warn, danger }) => (
                    <button key={label} onClick={action} className={`flex items-center gap-3 px-4 py-2.5 text-[12px] font-mono transition-all ${
                      danger ? 'text-red-500 hover:bg-red-50' : warn ? 'text-amber-600 hover:bg-amber-50' : 'text-black/60 hover:bg-black/[0.04] hover:text-black'
                    }`}>
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0">
                <MessageEngine
                  messages={messages}
                  onReact={handleReact}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  bottomRef={bottomRef}
                  settings={settings}
                />
                {/* XMTP activation banner — compact, non-blocking */}
                {!xmtpReady && (
                  <div className="border-t border-black/6 bg-white shrink-0">
                    {xmtpInitializing ? (
                      <div className="flex items-center gap-3 px-5 py-3">
                        <div className="w-5 h-5 border-2 border-black/10 border-t-black/50 rounded-full animate-spin shrink-0" />
                        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest">
                          Activando buzón cifrado…
                        </p>
                      </div>
                    ) : xmtpError?.startsWith('XMTP_LIMIT_REACHED:') ? (
                      <div className="flex flex-col gap-2 px-5 py-4">
                        <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                          Límite de sesiones alcanzado
                        </p>
                        <p className="text-[9px] font-mono text-black/50 leading-relaxed">
                          Haz clic abajo para liberar sesiones antiguas y continuar.
                        </p>
                        <button
                          onClick={() => handleRevokeSessions(xmtpError.split(':')[1])}
                          className="px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/30 font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-500/20 transition-all active:scale-95"
                        >
                          Limpiar Sesiones Antiguas
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
                        {xmtpError && xmtpError !== 'NEEDS_MANUAL_INIT' && (
                          <p className="text-[9px] font-mono text-rose-500 flex-1 min-w-0 truncate">{xmtpError}</p>
                        )}
                        {!xmtpError && (
                          <p className="text-[10px] font-mono text-black/40 flex-1 min-w-0">
                            Activa el cifrado para enviar mensajes
                          </p>
                        )}
                        {(xmtpError?.toLowerCase().includes('wallet') || xmtpError?.toLowerCase().includes('reconnect')) && (
                          <button
                            type="button"
                            onClick={() => openAppKit()}
                            className="px-3 py-1.5 bg-white border border-black/15 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black/[0.03] transition-all active:scale-95 shrink-0"
                          >
                            Reconectar
                          </button>
                        )}
                        <button
                          onClick={() => { setXmtpError(null); initXmtpClient(true); }}
                          className="px-4 py-1.5 bg-black text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-all active:scale-95 shrink-0"
                        >
                          {xmtpError ? 'Reintentar' : 'Activar Chat'}
                        </button>
                        {deviceOS === 'ios' && (
                          <button
                            type="button"
                            onClick={() => openWalletOnIOS(getWalletConnectDeepLink())}
                            className="px-3 py-1.5 bg-white border border-black/15 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black/[0.03] transition-all active:scale-95 shrink-0"
                          >
                            Abrir Wallet
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* ChatInput — always visible, disabled while XMTP not ready */}
                <ChatInput
                  onSendText={handleSendText}
                  onSendVoice={handleSendVoice}
                  onSendFile={handleSendFile}
                  onSendEmoji={handleSendEmoji}
                  onTyping={handleTypingChange}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(undefined)}
                  autoDestruct={settings.autoDestruct}
                  onAutoDestructChange={(val) => handleSettingsChange({ ...settings, autoDestruct: val })}
                  disabled={!xmtpReady || sending || isUploading}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-black/20 font-mono text-sm space-y-2">
            <p>Selecciona o inicia una conversación segura.</p>
          </div>
        )}
      </div>
    </div>
  );
}

