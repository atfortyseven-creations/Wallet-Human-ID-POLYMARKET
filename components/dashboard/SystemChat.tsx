'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWalletClient, useSignMessage, useDisconnect, useReconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useSystemAccount as useAccount } from '@/hooks/useSystemAccount';
import { useWalletStore } from '@/lib/store/wallet-store';
import { ethers } from 'ethers';
import { QrCode, X, ChevronLeft, Menu, Settings, LogOut, ArrowLeft, UserX, UserCheck, Download, Trash2, UserPlus, User, MoreVertical, ExternalLink, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemSignOut } from '@/hooks/useSystemSignOut';

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
import AttestationEngine from '@/components/dashboard/AttestationEngine';
import { QrScanner } from '@/components/dashboard/QrScanner';
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
    const raw = localStorage.getItem(`system_chat_convs_${selfAddress.toLowerCase()}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveConversations(selfAddress: string, convs: Conversation[]) {
  if (typeof window === 'undefined' || !selfAddress) return;
  localStorage.setItem(`system_chat_convs_${selfAddress.toLowerCase()}`, JSON.stringify(convs));
}

//  XMTP message  RenderableMessage 

function xmtpToRenderable(msg: any, selfInboxId: string): RenderableMessage {
  const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
  const sentAt = msg.sentAtNs ? Number(nsToDate(msg.sentAtNs)) : Date.now();
  const isMine = msg.senderInboxId === selfInboxId;
  return {
    id: msg.id ?? String(sentAt),
    senderAddress: msg.senderInboxId ?? '',
    content,
    sentAt,
    isMine,
    isPinned: false,
    isDestructing: false,
    reactions: [],
  };
}

// Typing Indicator — XMTP v2 has no native protocol for this.
// Real implementation deferred to XMTP v3 MLS. No simulation.
function useTypingIndicator(_peerAddress: string | undefined): false {
  return false;
}

//  Sound helper 

function playMessageSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

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

  const walletClientRef = useRef<any>(walletClient);
  useEffect(() => { walletClientRef.current = walletClient; }, [walletClient]);

  // ── iOS-specific state ──────────────────────────────────────────────────
  const [deviceOS] = useState<'ios' | 'android' | 'other'>(() =>
    typeof window !== 'undefined' ? getDeviceOS() : 'other'
  );
  // When XMTP fires a sign request on iOS we surface a manual "Open Wallet" button
  const [iosSignPending, setIosSignPending] = useState(false);
  const [wcDeepLink, setWcDeepLink] = useState<string | null>(null);
  // Resolve deep link once wallet is connected
  useEffect(() => {
    if (isConnected && deviceOS === 'ios') {
      setWcDeepLink(getWalletConnectDeepLink());
    }
  }, [isConnected, deviceOS, walletClient]);

  // MASTER RECOVERY: If wallet is connected but connector is missing (common on mobile redirects)
  useEffect(() => {
    if (isConnected && !connector && !isSystemHandshake && !isLocalSystemWallet) {
        console.warn('[SystemChat] Zombie session detected  attempting silent reconnection.');
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

  const peerIsTyping = useTypingIndicator(activeConv?.peerAddress);

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

  // Open conversation from universal scan (wallet QR)
  useEffect(() => {
    if (!address || typeof sessionStorage === 'undefined') return;
    const peer = sessionStorage.getItem('whale_scan_peer');
    if (!peer || !/^0x[a-fA-F0-9]{40}$/.test(peer)) return;
    sessionStorage.removeItem('whale_scan_peer');
    const displayName = peer.slice(0, 6) + '...' + peer.slice(-4);
    setActiveConv({ peerAddress: peer, displayName, folder: 'inbox', unread: 0 });
    toast.success('Wallet scanned — chat opened');
  }, [address]);

  // Save conversations on change
  useEffect(() => {
    if (address && conversations.length > 0) {
      saveConversations(address, conversations);
    }
  }, [conversations, address]);

  //  Auto-scroll & Mobile Keyboard Stability 
  useEffect(() => {
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    };
    
    // Initial scroll when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Handle viewport changes (mobile keyboard open/close)
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [messages]);

  //  Self-destruct ticker 
  useEffect(() => {
    const id = setInterval(() => {
      setMessages(prev => prev.filter(m => !m.destructsAt || m.destructsAt > Date.now()));
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

    if (isSystemHandshake && !connector && !hasLocalWallet) {
      if (isManual) {
        setXmtpError('Connect your wallet in this browser to activate encrypted chat.');
      }
      return;
    }

    // Wait for walletClient (mobile deep-link returns often need 10–15s)
    if (!hasLocalWallet && !walletClientRef.current) {
      setXmtpInitializing(true);
      let waited = 0;
      const MAX_WAIT = isManual ? 10000 : 15000;
      const INTERVAL = 300;
      while (!walletClientRef.current && waited < MAX_WAIT) {
        await new Promise(r => setTimeout(r, INTERVAL));
        waited += INTERVAL;
      }
      if (!walletClientRef.current) {
        xmtpInitLock.current = false;
        setXmtpInitializing(false);
        setXmtpError('Wallet not responding. Please reconnect your wallet and try again.');
        if (isManual) {
          toast.error('Wallet Not Ready', { description: 'Disconnect and reconnect your wallet, then try again.' });
        }
        return;
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
        if (hasLocalWallet) {
          // ── Path A: Local private-key wallet (no external signing needed) ──
          const ethersWallet = new ethers.Wallet(storePrivateKey);
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              return ethersWallet.signMessage(msg);
            },
          };
        } else {
          // ── Path B: External wallet (MetaMask / WalletConnect) ─────────────
          // CRITICAL iOS FIX: On iOS Chrome/Safari, signMessageAsync() from the
          // wagmi hook loses the "user gesture" context after the first async
          // await, causing WebKit to silently block the WalletConnect deep-link
          // that would open the user's wallet app for signing.
          //
          // Fix 1: Use walletClient.signMessage() DIRECTLY from the ref — viem's
          //         WalletClient uses a lower-level transport path that bypasses
          //         the hook's React event-binding issue.
          // Fix 2: On iOS, set iosSignPending=true BEFORE the sign call so the
          //         UI shows an "Open Wallet" button the user can tap manually,
          //         which restores a fresh user gesture context and triggers the
          //         WalletConnect redirect natively.
          signer = {
            getAddress: async () => address,
            signMessage: async (msg: string | Uint8Array) => {
              const currentDeviceOS = getDeviceOS();

              // ── iOS: show manual wallet-open UI ───────────────────────────
              if (currentDeviceOS === 'ios' && !isLocalSystemWallet) {
                setIosSignPending(true);
                // Refresh deep link in case it was resolved after mount
                const link = getWalletConnectDeepLink();
                setWcDeepLink(link);
              }

              try {
                // Try walletClient.signMessage() first (viem direct path — better iOS compat)
                const wc = walletClientRef.current;
                if (wc?.signMessage) {
                  const sig = await wc.signMessage({
                    account: address as `0x${string}`,
                    message: typeof msg === 'string' ? msg : { raw: msg as unknown as `0x${string}` },
                  });
                  setIosSignPending(false);
                  return sig;
                }

                // Fallback: wagmi hook (works on Android + PC always)
                const sig = await signMessageAsync({
                  message: typeof msg === 'string' ? msg : { raw: msg } as any
                });
                setIosSignPending(false);
                return sig;
              } catch (sigErr: any) {
                setIosSignPending(false);
                const errMsg = (sigErr?.message || '').toLowerCase();
                if (errMsg.includes('connector') || errMsg.includes('not connected') || errMsg.includes('signmessage')) {
                  throw new Error('Wallet did not respond to signature. Please reconnect your wallet.');
                }
                throw sigErr;
              }
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
        return; // Success
      } catch (e: any) {
        attempts++;
        const msg = (e?.message || '').toLowerCase();
        // If user actively rejected, don't retry
        if (msg.includes('reject') || msg.includes('deny') || msg.includes('user denied')) {
          xmtpInitLock.current = false;
          setXmtpInitializing(false);
          setXmtpError('Signature rejected. Please tap the button below and approve in your wallet.');
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

  // Auto-init on mount
  useEffect(() => {
    if (needsWalletReconnect) return;
    initXmtpClient(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isLocalSystemWallet, storePrivateKey, needsWalletReconnect]);

  // Key fix: watch walletClient  when it goes from null  available, auto-trigger init
  useEffect(() => {
    if (needsWalletReconnect) return;
    if (walletClient && isConnected && !xmtpReady && !xmtpInitLock.current) {
      initXmtpClient(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletClient, needsWalletReconnect]);

  // UI safety: never leave handshake spinner running forever
  useEffect(() => {
    if (!xmtpInitializing) return;
    const timeoutId = setTimeout(() => {
      if (!xmtpReady) {
        xmtpInitLock.current = false;
        setXmtpInitializing(false);
        setXmtpError((prev) => prev ?? 'Connection timed out. Please reconnect your wallet and retry.');
      }
    }, 45000);
    return () => clearTimeout(timeoutId);
  }, [xmtpInitializing, xmtpReady]);

  // ── Retry XMTP init when user returns from wallet app (iOS/Android deep-link) ──
  // This is the core iOS fix: when the user switches from Chrome back to their
  // wallet app to sign, then returns to Chrome, we detect the app-foreground event
  // and immediately retry the XMTP init. The walletClient re-hydrates on return.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // If iosSignPending: user just returned from wallet, clear the pending state
      // and let the in-flight initXmtpClient complete (the signer.signMessage
      // promise will resolve because walletClient re-hydrated on focus).
      if (iosSignPending) {
        setIosSignPending(false);
        return;
      }
      if (needsWalletReconnect || !isConnected || xmtpReady) return;
      if (walletClientRef.current && !xmtpInitLock.current) {
        initXmtpClient(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, xmtpReady, needsWalletReconnect, iosSignPending]);

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

        // Play notification sound
        playMessageSound();
      } catch (e) {
        console.error('[XMTP Offline Queue] Error consuming offline queue:', e);
      }
    };
    consumeOffline();
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
            if (typeof rendered.content === 'string' && rendered.content.includes('initiatedByInboxId')) {
               continue;
            }
            const hydratedList = hydrateMessages([rendered]);
            if (hydratedList.length === 0) continue;
            const hydrated = hydratedList[0];

            const fromPeer = msg.senderInboxId !== selfInboxId;
            
            let msgConvPeer = msg.conversation?.peerAddress?.toLowerCase() || '';
            if (!msgConvPeer && msg.conversation) {
              try {
                const rawMembers = msg.conversation.members;
                const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
                const selfNorm = address?.toLowerCase() ?? '';
                for (const m of members) {
                  const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
                  const peer = addrs.find((a: string) => a.toLowerCase() !== selfNorm);
                  if (peer) {
                    msgConvPeer = peer.toLowerCase();
                    msg.conversation.peerAddress = peer;
                    break;
                  }
                }
              } catch (e) {}
            }

            const currentActivePeer = activeConvRef.current?.peerAddress.toLowerCase();
            const belongsToActive = (msgConvPeer === currentActivePeer) || (!msgConvPeer && currentActivePeer);

            if (belongsToActive) {
              if (fromPeer && (settingsRef.current as any).soundEnabled !== false) playMessageSound();
              setMessages(prev => {
                if (prev.some(m => m.id === hydrated.id)) return prev;
                if (!fromPeer) {
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
            } else if (fromPeer) {
              setConversations(prev => {
                 if (!msgConvPeer) return prev;
                 const exists = prev.some(c => c.peerAddress.toLowerCase() === msgConvPeer);
                 if (exists) {
                   return prev.map(c => 
                     c.peerAddress.toLowerCase() === msgConvPeer 
                       ? { ...c, unread: c.unread + 1, lastMessage: hydrated.content.slice(0, 30) } 
                       : c
                   );
                 } else {
                   const newPeerAddr = msg.conversation.peerAddress || msgConvPeer;
                   return [...prev, {
                      peerAddress: newPeerAddr,
                      displayName: resolveZKName(newPeerAddr),
                      folder: 'all',
                      unread: 1,
                      lastMessage: hydrated.content.slice(0, 30)
                   }];
                 }
              });
              if ((settingsRef.current as any).soundEnabled !== false) playMessageSound();
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
          .filter((m: any) => !(typeof m.content === 'string' && m.content.includes('initiatedByInboxId')))
        const hydrated = hydrateMessages(rendered);
        
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('opt-'));
          const renderedIds = new Set(hydrated.map(r => r.id));
          // Strip tags like [REPLY:...] from optimistic to match hydrated if needed, but since optimistic.content is raw, we match exactly.
          const hydratedContents = new Set(hydrated.map(h => h.content.trim()));
          
          // Only keep optimistic messages if they aren't already represented by a real hydrated message from the network.
          // Also filter out any optimistic message older than 15 seconds to prevent permanent ghost messages.
          const now = Date.now();
          const survivingOptimistic = optimistic.filter(o => 
            !renderedIds.has(o.id) && 
            !hydratedContents.has(o.content.trim()) &&
            (now - o.sentAt < 15000)
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
      const sendPromise = xmtpSend(xmtpClient.current, activeConv.peerAddress, finalContent);
      const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('El mensaje tardó demasiado en enviarse (posible problema de red 5G)')), 45000)
      );
      await Promise.race([sendPromise, timeoutPromise]);
      // Mark as sent (remove optimistic tag)
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, readAt: undefined } : m));
    } catch (e: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
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
    const addr = (addressOverride ?? newPeer).trim();
    if (!addr) return;
    if (!addr.startsWith('0x') || addr.length !== 42) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
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

  //  Render 
  return (
    <div className="w-full h-full flex-1 flex text-black overflow-hidden chat-theme-wrapper bg-white relative" data-chat-theme={settings.theme} data-privacy={settings.privacyMode} onClick={() => showPeerMenu && setShowPeerMenu(false)}>

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
              className="flex-1 min-w-0 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] font-mono text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
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
                  <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3  Chat Area */}
      <div className={`flex-1 flex-col min-w-0 bg-white ${activeConv ? 'flex' : 'hidden md:flex'}`}>
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
                  <p className={`font-mono text-[10px] font-bold mt-1 uppercase tracking-widest flex items-center gap-1.5 ${sending || isUploading || peerIsTyping ? 'text-[#00C076]' : !isConnected ? 'text-red-500' : 'text-[#00C076]'}`}>
                    {blockedList.includes(activeConv.peerAddress.toLowerCase()) ? <span className="text-red-400">BLOCKED</span> :
                     !isConnected ? <> <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> OFFLINE </> :
                     !xmtpReady ? <span className="text-amber-500">AWAITING HANDSHAKE...</span> :
                     sending || isUploading || peerIsTyping ? <> <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"></div> ESCRIBIENDO... </> : 
                     <> <div className="w-1.5 h-1.5 rounded-full bg-[#00C076]"></div> ONLINE • ENCRYPTED </>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                {!xmtpReady ? (
                  <div className="p-5 border-t border-black/6 bg-white flex flex-col items-center justify-center gap-3 shrink-0">
                    {/* ── iOS Signature Pending State ─────────────────────────────── */}
                    {iosSignPending ? (
                      <div className="flex flex-col items-center gap-4 text-center max-w-sm w-full">
                        {/* Animated iOS indicator */}
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-black/10 border-t-black animate-spin" />
                          <Smartphone size={22} className="text-black/60" />
                        </div>
                        <div>
                          <p className="text-[12px] font-mono font-black text-black uppercase tracking-widest">
                            Firma Pendiente en tu Wallet
                          </p>
                          <p className="text-[9px] font-mono text-black/50 uppercase tracking-widest mt-1">
                            Tu wallet necesita tu aprobación para continuar
                          </p>
                        </div>
                        {/* Primary action: open wallet via deep link */}
                        <button
                          type="button"
                          onClick={() => openWalletOnIOS(wcDeepLink)}
                          className="w-full px-6 py-4 bg-black text-white font-mono text-[12px] font-black uppercase tracking-widest rounded-[14px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                        >
                          <ExternalLink size={16} />
                          Abrir Wallet para Firmar
                        </button>
                        {/* Reconnect fallback */}
                        <button
                          type="button"
                          onClick={() => openAppKit()}
                          className="w-full px-6 py-2.5 bg-white border border-black/15 text-black/60 font-mono text-[10px] font-bold uppercase tracking-widest rounded-[14px] hover:bg-black/[0.03] transition-all active:scale-95"
                        >
                          Cambiar Wallet
                        </button>
                        <p className="text-[8px] font-mono text-black/30 uppercase tracking-widest text-center leading-relaxed">
                          Después de firmar, regresa a Chrome y el chat se activará automáticamente.
                        </p>
                      </div>
                    ) : xmtpInitializing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
                        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest text-center">
                          {deviceOS === 'ios' ? 'Estableciendo canal seguro...' : 'Activating secure inbox'}
                        </p>
                        {/* On iOS we show a passive "check wallet app" hint */}
                        {deviceOS === 'ios' && (
                          <p className="text-[8px] font-mono text-black/30 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                            Si tu wallet no reacciona, toca "Abrir Wallet" a continuación o ábrela manualmente.
                          </p>
                        )}
                        {deviceOS === 'ios' && (
                          <button
                            type="button"
                            onClick={() => openWalletOnIOS(wcDeepLink)}
                            className="mt-1 px-5 py-2.5 bg-black text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-[14px] flex items-center gap-2 shadow-md active:scale-95 transition-all"
                          >
                            <ExternalLink size={13} />
                            Abrir Wallet
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {xmtpError && (
                          <p className="text-[10px] font-mono text-rose-500 text-center leading-relaxed max-w-xs">{xmtpError}</p>
                        )}
                        {!xmtpError && (
                          <div className="flex flex-col items-center gap-4 text-center max-w-sm mt-2 mb-4">
                            <p className="text-[11px] font-mono font-bold text-black uppercase tracking-widest leading-relaxed">
                              Activación de Protocolo E2EE
                            </p>
                            <p className="text-[9px] font-mono text-black/60 uppercase tracking-widest leading-relaxed">
                              El nodo requiere <strong className="text-black">DOS FIRMAS CRIPTOGRÁFICAS</strong> en tu wallet para establecer el canal seguro:
                            </p>
                            <ul className="text-[9px] font-mono text-black/50 uppercase tracking-widest leading-relaxed text-left space-y-2 border-l-2 border-black/10 pl-3">
                              <li>1. <strong className="text-black">Creación de Identidad:</strong> Genera tus llaves cuánticas.</li>
                              <li>2. <strong className="text-black">Autorización de Sesión:</strong> Permite enviar mensajes sin firmar cada uno.</li>
                            </ul>
                            <p className="text-[8px] font-mono text-[#00C076] font-bold uppercase tracking-widest bg-[#00C076]/10 px-3 py-1 rounded">
                              Estas firmas no consumen gas (0 fees).
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2 w-full max-w-xs">
                          {(xmtpError?.toLowerCase().includes('wallet') || xmtpError?.toLowerCase().includes('reconnect')) && (
                            <button
                              type="button"
                              onClick={() => openAppKit()}
                              className="w-full px-6 py-3 bg-white border border-black/15 text-black font-mono text-[11px] font-bold uppercase tracking-widest rounded-[14px] hover:bg-black/[0.03] transition-all active:scale-95"
                            >
                              Reconnect Wallet
                            </button>
                          )}
                          <button
                            onClick={() => { setXmtpError(null); initXmtpClient(true); }}
                            className="w-full px-6 py-3 bg-[#050505] text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-[14px] hover:bg-black/80 transition-all shadow-md active:scale-95"
                          >
                            {xmtpError ? 'Retry Connection' : 'Activate Secure Chat'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <ChatInput
                    onSendText={handleSendText}
                    onSendVoice={handleSendVoice}
                    onSendFile={handleSendFile}
                    onSendEmoji={handleSendEmoji}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(undefined)}
                    autoDestruct={settings.autoDestruct}
                    onAutoDestructChange={(val) => handleSettingsChange({ ...settings, autoDestruct: val })}
                    disabled={sending || isUploading}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-black/20 font-mono text-sm space-y-2">
            <p>Select or start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
