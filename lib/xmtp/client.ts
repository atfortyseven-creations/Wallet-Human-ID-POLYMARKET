/**
 * XMTP E2E Encrypted Chat Client
 *
 * Wraps @xmtp/browser-sdk v5.3.0 for system wallet-to-wallet encrypted messaging.
 *
 * v5.3.0 Signer interface (mandatory):
 *   type          : "EOA" | "SCW"
 *   getIdentifier : () => Promise<{ identifier: string; identifierKind: "Ethereum" }>
 *   signMessage   : (message: string) => Promise<Uint8Array>    string ONLY
 *
 * v5.3.0 Key API changes vs v5.2:
 *   - conversations.newDm(inboxId)             takes inboxId string
 *   - conversations.newDmWithIdentifier(id)    takes Identifier object   USE THIS
 *   - DecodedMessage: senderInboxId, sentAtNs (BigInt ns), content (decoded)
 *   - Dm.peerInboxId()                         async, returns inboxId string
 *   - conversations.sync() required before list/stream
 *
 */

'use client';

import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = Buffer;
}

import { Client, type XmtpEnv } from '@xmtp/browser-sdk';

//  Type definitions matching browser-sdk v5.3.0 exactly 
type IdentifierKind = 'Ethereum';
export interface XmtpIdentifier {
  identifier: string;
  identifierKind: IdentifierKind;
}

const XMTP_ENV: XmtpEnv =
  (process.env.NEXT_PUBLIC_XMTP_ENV as XmtpEnv) ?? 'production';

//  Singleton client registry (one client per lowercase address) 
const clientRegistry = new Map<string, Client>();

// InboxId → Ethereum address cache (populated during message stream/fetch)
const inboxIdToAddressCache = new Map<string, string>();

//  Hex string → Uint8Array 
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error('[XMTP] Malformed hex signature');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

//  BigInt nanoseconds → Date 
export function nsToDate(ns: bigint | undefined | null): Date {
  if (ns == null) return new Date();
  try {
    return new Date(Number(BigInt(String(ns)) / 1_000_000n));
  } catch {
    return new Date();
  }
}

/**
 * Resolve inboxId → Ethereum address using the XMTP network.
 * Results are cached to avoid repeated network calls.
 */
export async function resolveInboxIdToAddress(inboxId: string): Promise<string | null> {
  if (!inboxId) return null;
  const cached = inboxIdToAddressCache.get(inboxId.toLowerCase());
  if (cached) return cached;

  try {
    // getLatestInboxState is available on Client static or instance
    const states = await (Client as any).getInboxStates?.([inboxId], XMTP_ENV)
      ?? await (Client as any).inboxStateFromInboxIds?.([inboxId], XMTP_ENV);

    if (states && states[0]) {
      const state = states[0];
      const identifiers: any[] = state.identifiers ?? state.accountIdentifiers ?? [];
      for (const id of identifiers) {
        if (id?.identifierKind === 'Ethereum' && id?.identifier) {
          const addr = id.identifier.toLowerCase();
          inboxIdToAddressCache.set(inboxId.toLowerCase(), addr);
          return addr;
        }
      }
      // Fallback: check accountAddresses array
      const addrs: string[] = state.accountAddresses ?? state.addresses ?? [];
      if (addrs.length > 0) {
        const addr = addrs[0].toLowerCase();
        inboxIdToAddressCache.set(inboxId.toLowerCase(), addr);
        return addr;
      }
    }
  } catch (e) {
    // Silently fail — not all installations expose this
  }

  return null;
}

/**
 * Populate inboxIdToAddressCache by scanning all DM member data.
 * Call once after client init to warm up the cache.
 */
export async function warmInboxIdCache(client: Client): Promise<void> {
  try {
    await client.conversations.sync();
    const dms: any[] = await client.conversations.listDms();
    for (const dm of dms) {
      try {
        const rawMembers = (dm as any).members;
        const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);
        for (const m of members) {
          const inboxId: string = m.inboxId ?? '';
          const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
          if (inboxId && addrs.length > 0) {
            inboxIdToAddressCache.set(inboxId.toLowerCase(), addrs[0].toLowerCase());
          }
        }
      } catch {}
    }
  } catch (e) {
    console.warn('[XMTP] warmInboxIdCache failed:', e);
  }
}

/**
 * Build an XMTP v5.3.0-compatible signer from a wagmi/viem EOA wallet client.
 *
 * CRITICAL v5.3.0 changes:
 *  - signMessage receives string ONLY (no Uint8Array) and must return Uint8Array
 *  - getIdentifier returns { identifier: checksumAddress, identifierKind: "Ethereum" }
 */
function buildXmtpSigner(wagmiSigner: {
  getAddress: () => Promise<string>;
  signMessage: (message: string | Uint8Array) => Promise<string>;
}) {
  return {
    type: 'EOA' as const,

    // getIdentifier: async function returning the exact Identifier shape
    getIdentifier: async (): Promise<XmtpIdentifier> => {
      let address = await wagmiSigner.getAddress();
      try {
        const { getAddress } = await import('viem');
        address = getAddress(address);
      } catch {}
      return {
        identifier: address,
        identifierKind: 'Ethereum' as IdentifierKind,
      };
    },

    // v5.3.0: signMessage receives string only, must return Uint8Array
    signMessage: async (message: string): Promise<Uint8Array> => {
      const hexSig = await wagmiSigner.signMessage(message);
      return hexToBytes(hexSig);
    },
  };
}

/**
 * Initialize or retrieve a cached XMTP client for a wallet address.
 * If a client already exists in the registry (IndexedDB-backed),
 * it is returned immediately without re-prompting the user to sign.
 */
export async function getXMTPClient(
  wagmiSigner: {
    getAddress: () => Promise<string>;
    signMessage: (message: string | Uint8Array) => Promise<string>;
  }
): Promise<Client> {
  const address = (await wagmiSigner.getAddress()).toLowerCase();

  if (clientRegistry.has(address)) {
    return clientRegistry.get(address)!;
  }

  //  Use Standard Wallet Signer 
  const signer = buildXmtpSigner(wagmiSigner);

  //  Retrieve or Generate Local DB Encryption Key 
  // Passing this key prevents XMTP from prompting a signature on every reload
  const storageKey = `whale_xmtp_db_key_${address}`;
  let dbKeyHex = localStorage.getItem(storageKey);
  if (!dbKeyHex) {
    const keyBytes = new Uint8Array(32);
    crypto.getRandomValues(keyBytes);
    dbKeyHex = Buffer.from(keyBytes).toString('hex');
    localStorage.setItem(storageKey, dbKeyHex);
  }
  const dbEncryptionKey = new Uint8Array(Buffer.from(dbKeyHex, 'hex'));

  let client: Client;
  try {
    // Client.create(signer, options)  v5.3.0 signature
    client = await Client.create(signer, { env: XMTP_ENV, dbEncryptionKey });
  } catch (err: any) {
    const errorMsg = err?.message || '';
    if (
      errorMsg.includes('already registered 10/10 installations') ||
      errorMsg.includes('Cannot register a new installation')
    ) {
      const match = errorMsg.match(/InboxID\s+([a-fA-F0-9]+)\s+has/i) || errorMsg.match(/InboxID\s+([a-fA-F0-9]+)/i) || errorMsg.match(/InboxID\s*\n*\s*([a-fA-F0-9]+)/i);
      const inboxId = match ? match[1] : null;
      if (inboxId) {
        throw new Error(`XMTP_LIMIT_REACHED:${inboxId}`);
      }
      throw new Error(`XMTP_LIMIT_REACHED`);
    }
    throw err;
  }

  clientRegistry.set(address, client);

  // Warm up the inboxId → address cache in the background
  warmInboxIdCache(client).catch(() => {});

  return client;
}

/**
 * Revokes all previous installations for a given Inbox ID to fix the 10/10 limit error.
 */
export async function revokeXMTPInstallations(
  wagmiSigner: {
    getAddress: () => Promise<string>;
    signMessage: (message: string | Uint8Array) => Promise<string>;
  },
  inboxId: string
): Promise<void> {
  const signer = buildXmtpSigner(wagmiSigner);
  const states = await (Client as any).inboxStateFromInboxIds([inboxId], XMTP_ENV);
  if (states && states[0] && states[0].installations) {
    const installationsToRevoke = states[0].installations.map((i: any) => i.bytes);
    if (installationsToRevoke.length > 0) {
      await (Client as any).revokeInstallations(signer as any, inboxId, installationsToRevoke, XMTP_ENV);
    }
  }
}

/** Remove a client from the registry (call on wallet disconnect) */
export function destroyXMTPClient(address: string): void {
  clientRegistry.delete(address.toLowerCase());
}

/**
 * Check if a given Ethereum address has an active XMTP identity.
 * v5.3.0: Client.canMessage returns Map<string, boolean>.
 * 
 * CRITICAL FIX: We try multiple casing variants because the Map key can be
 * checksummed or lowercase depending on the XMTP network response.
 */
export async function canReceiveMessages(
  _client: Client,
  address: string,
): Promise<boolean> {
  try {
    const identifier: XmtpIdentifier = {
      identifier: address,
      identifierKind: 'Ethereum',
    };

    const result = await Client.canMessage([identifier], XMTP_ENV);

    if (result instanceof Map) {
      // Try all casing variants
      const lower = address.toLowerCase();
      for (const [key, val] of result.entries()) {
        if (key.toLowerCase() === lower) return !!val;
      }
      return false;
    }

    if (result && typeof result === 'object') {
      const lower = address.toLowerCase();
      for (const key of Object.keys(result as object)) {
        if (key.toLowerCase() === lower) return !!(result as any)[key];
      }
      return false;
    }

    return false;
  } catch (err) {
    console.warn('[XMTP] canReceiveMessages error:', err);
    // On error, ASSUME they can receive — let newDmWithIdentifier handle it
    // This prevents all messages from going to the offline queue on network blips
    return true;
  }
}

/**
 * Get or create a DM with a peer and return its conversation ID.
 * v5.3.0 FIX: use newDmWithIdentifier()  newDm() takes inboxId, NOT Identifier.
 */
export async function getDmId(client: Client, peerAddress: string): Promise<string> {
  const identifier: XmtpIdentifier = {
    identifier: peerAddress,
    identifierKind: 'Ethereum',
  };
  const dm = await client.conversations.newDmWithIdentifier(identifier);
  return dm.id;
}

/**
 * Send an end-to-end encrypted message to a wallet address.
 * v5.3.0 FIX: use newDmWithIdentifier() which accepts an Identifier object.
 * After sending, syncs the conversation to confirm delivery.
 */
export async function sendMessage(
  client: Client,
  toAddress: string,
  content: string,
): Promise<void> {
  const identifier: XmtpIdentifier = {
    identifier: toAddress,
    identifierKind: 'Ethereum',
  };

  let lastErr: any;
  let shouldQueueOffline = false;

  for (let i = 0; i < 3; i++) {
    try {
      // Always try direct XMTP send first (newDmWithIdentifier handles
      // both "already exists" and "create new" cases atomically)
      const dm = await client.conversations.newDmWithIdentifier(identifier);
      await dm.send(content);
      // Sync after send to confirm delivery is committed to the network
      try { await dm.sync(); } catch {}
      return;
    } catch (sendErr: any) {
      const errMsg = (sendErr?.message || '').toLowerCase();

      if (errMsg.includes('group is inactive') || errMsg.includes('inactive')) {
        console.warn('[XMTP] Group is inactive, attempting to recreate DM...');
        try {
          await client.conversations.sync();
          const dm = await client.conversations.newDmWithIdentifier(identifier);
          await dm.send(content);
          return;
        } catch (recreateErr) {
          lastErr = recreateErr;
        }
      } else if (
        errMsg.includes('not on xmtp') ||
        errMsg.includes('no inbox') ||
        errMsg.includes('identity not found') ||
        errMsg.includes('recipient') ||
        errMsg.includes('not found')
      ) {
        console.warn('[XMTP] Recipient not on XMTP, queuing offline:', toAddress);
        shouldQueueOffline = true;
        break; // Stop retries, fall through to queue
      } else {
        lastErr = sendErr;
      }

      if (!shouldQueueOffline && i < 2) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // exponential backoff
      }
    }
  }

  if (lastErr && !shouldQueueOffline) {
    throw lastErr;
  }

  // Fallback: queue offline if recipient is not yet on XMTP
  const senderAddr: string =
    (client as any).accountAddress ??
    (client as any).address ??
    (client as any).inboxId ??
    'unknown';

  const res = await fetch('/api/chat/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: senderAddr,
      recipient: toAddress,
      content,
    }),
  });
  if (!res.ok) {
    throw new Error('[XMTP Offline Queue] Failed to queue offline message');
  }
}

/**
 * List all DM conversations.
 * v5.3.0: Must sync() first, then listDms().
 */
export async function listConversations(client: Client): Promise<any[]> {
  await client.conversations.sync();
  return client.conversations.listDms();
}

/**
 * Extract the peer Ethereum address from a DM conversation object.
 * Checks members array first, then peerInboxId resolution, with cache.
 */
async function extractPeerAddress(dm: any, selfInboxId: string): Promise<string | null> {
  try {
    const rawMembers = (dm as any).members;
    const members: any[] = typeof rawMembers === 'function' ? await rawMembers() : (rawMembers ?? []);

    // Populate cache while we're here
    for (const m of members) {
      const inboxId: string = m.inboxId ?? '';
      const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
      if (inboxId && addrs.length > 0) {
        inboxIdToAddressCache.set(inboxId.toLowerCase(), addrs[0].toLowerCase());
      }
    }

    // Find the peer (not self)
    for (const m of members) {
      if (m.inboxId?.toLowerCase() === selfInboxId?.toLowerCase()) continue;
      const addrs: string[] = m.accountAddresses ?? m.addresses ?? [];
      if (addrs.length > 0) return addrs[0].toLowerCase();
    }
  } catch {}

  // Fallback: peerInboxId → cache lookup
  try {
    const rawPeerInboxId = (dm as any).peerInboxId;
    const peerInboxId: string = typeof rawPeerInboxId === 'function'
      ? await rawPeerInboxId()
      : (rawPeerInboxId ?? '');
    if (peerInboxId) {
      const cached = inboxIdToAddressCache.get(peerInboxId.toLowerCase());
      if (cached) return cached;
      // Try network resolution
      const resolved = await resolveInboxIdToAddress(peerInboxId);
      if (resolved) return resolved;
    }
  } catch {}

  return null;
}

/**
 * Retrieve message history for a specific peer conversation.
 *
 * FIX v4 — Simplified + more robust:
 * 1. Sync all conversations from the network
 * 2. List DMs and find the one matching the peer address
 * 3. Sync that specific DM to get latest messages
 * 4. Return messages
 *
 * The key improvement: we now use extractPeerAddress() which properly
 * resolves both accountAddresses and inboxId-based lookups with caching.
 */
export async function getMessages(client: Client, peerAddress: string): Promise<any[]> {
  const selfInboxId = (client as any).inboxId ?? '';
  const normalizedPeer = peerAddress.toLowerCase();

  //  Step 1: Global sync — CRITICAL for receiver discovery 
  try {
    await client.conversations.sync();
  } catch (e) {
    console.warn('[XMTP] conversations.sync() failed:', e);
  }

  //  Step 2: Find the DM for this peer
  try {
    const dms = await client.conversations.listDms();

    let targetDm: any = null;

    for (const dm of dms) {
      try {
        const peerAddr = await extractPeerAddress(dm, selfInboxId);
        if (peerAddr && peerAddr.toLowerCase() === normalizedPeer) {
          targetDm = dm;
          break;
        }
      } catch {}
    }

    if (targetDm) {
      // Individual DM sync — pulls latest messages for this specific conversation
      try { await targetDm.sync(); } catch {}
      const msgs = await targetDm.messages();
      return msgs ?? [];
    }
  } catch (e) {
    console.warn('[XMTP] DM search failed:', e);
  }

  //  Step 3: Fallback — newDmWithIdentifier (creates/reuses, sender path) 
  try {
    const identifier: XmtpIdentifier = {
      identifier: peerAddress,
      identifierKind: 'Ethereum',
    };
    const dm = await client.conversations.newDmWithIdentifier(identifier);
    try { await dm.sync(); } catch {}
    const msgs = await dm.messages();
    return msgs ?? [];
  } catch (e) {
    console.warn('[XMTP] newDmWithIdentifier fallback failed:', e);
    return [];
  }
}

/**
 * Discover all DMs from the network and return new peer addresses
 * not yet present in the known set. Used by WhaleChat global sync loop.
 */
export async function discoverNewPeers(
  client: Client,
  selfAddress: string,
  knownPeers: Set<string>,
): Promise<string[]> {
  try {
    const selfInboxId = (client as any).inboxId ?? '';
    await client.conversations.sync();
    const dms: any[] = await client.conversations.listDms();
    const newPeers: string[] = [];
    const selfNorm = selfAddress.toLowerCase();

    for (const dm of dms) {
      try {
        const peerAddr = await extractPeerAddress(dm, selfInboxId);
        if (
          peerAddr &&
          /^0x[a-fA-F0-9]{40}$/i.test(peerAddr) &&
          peerAddr !== selfNorm &&
          !knownPeers.has(peerAddr)
        ) {
          newPeers.push(peerAddr);
          knownPeers.add(peerAddr);
        }
      } catch {}
    }
    return newPeers;
  } catch (e) {
    console.warn('[XMTP] discoverNewPeers failed:', e);
    return [];
  }
}

/** Async generator streaming all incoming messages in real time with AbortSignal support */
export async function* streamMessages(client: Client, signal?: AbortSignal) {
  // Sync before streaming to ensure we have the latest state
  try { await client.conversations.sync(); } catch {}

  const stream = await client.conversations.streamAllMessages();

  let onAbort: (() => void) | undefined;
  if (signal) {
    onAbort = () => {
      try {
        if (typeof (stream as any).return === 'function') {
          (stream as any).return();
        }
      } catch {}
    };
    signal.addEventListener('abort', onAbort);
  }

  try {
    for await (const message of stream as any) {
      if (signal?.aborted) break;
      yield message;
    }
  } finally {
    if (signal && onAbort) {
      signal.removeEventListener('abort', onAbort);
    }
    try {
      if (typeof (stream as any).return === 'function') {
        (stream as any).return();
      }
    } catch {}
  }
}

/**
 * Given a senderInboxId from a streamed/fetched message, resolve
 * the Ethereum address of the sender using the cache or network.
 */
export async function resolveSenderAddress(senderInboxId: string): Promise<string | null> {
  if (!senderInboxId) return null;
  const cached = inboxIdToAddressCache.get(senderInboxId.toLowerCase());
  if (cached) return cached;
  return resolveInboxIdToAddress(senderInboxId);
}
