# WhaleChat: Private WebRTC Signaling Protocol on Aztec

## Abstract

WhaleChat is a peer-to-peer communication protocol that replaces traditional WebRTC signaling servers with wallet-to-wallet encrypted messages via XMTP, and uses Aztec Network zero-knowledge proofs for identity verification. This document describes the technical architecture, cryptographic primitives, and design tradeoffs of the system.

---

## 1. Problem Statement

WebRTC enables direct peer-to-peer media (voice/video) between browsers. However, WebRTC requires a *signaling* step to exchange Session Description Protocol (SDP) offers and Interactive Connectivity Establishment (ICE) candidates before the direct connection is established.

Traditionally, this signaling step requires a central server. This creates three failure modes:
1. **Censorship:** The server operator can block specific wallets or conversations.
2. **Surveillance:** The server operator learns who calls whom (metadata), even if media is E2E encrypted.
3. **Single point of failure:** Server downtime = no calls.

---

## 2. Solution Architecture

### 2.1 Signaling via XMTP

We replace the signaling server with XMTP (Extensible Message Transport Protocol) messages. XMTP is a decentralized, wallet-to-wallet messaging protocol that uses MLS (Messaging Layer Security) for E2E encryption.

A call offer becomes:
```
XMTP message from callerWallet to receiverWallet:
"__CALL_OFFER__:<peerID>:<callType>"
```

No server ever sees this message. XMTP nodes relay it without decrypting it.

### 2.2 PeerID Derivation

PeerIDs are derived deterministically from wallet addresses:
```typescript
const derivePeerId = (address: string): string =>
  `aztec-${address.toLowerCase().slice(2, 18)}`;
```

This means the caller can initiate the PeerJS connection *immediately* without a round-trip to XMTP. The XMTP message serves as a push notification to wake the receiver's UI.

### 2.3 Identity via Aztec PXE

Aztec Network's Private Execution Environment runs client-side (WASM in the browser). It holds the user's private keys and generates Schnorr signatures on the Grumpkin elliptic curve.

Each chat session is bound to a specific contract address, and the PXE is siloed per-address:
```typescript
const pxe = await getSiloedPXE(aztecNodeUrl, contractAddress);
// Mathematical guarantee: pxe.contractA cannot read notes of pxe.contractB
```

This ensures that a malicious frontend module cannot cross-read private state from another module.

### 2.4 Media Flow

```
[SIGNALING PHASE — via XMTP]
Caller  -->  XMTP message "__CALL_OFFER__:peerID:audio"  -->  Receiver
Caller  <--  XMTP message "__CALL_ANSWER__:peerID"       <--  Receiver

[MEDIA PHASE — direct P2P via PeerJS/WebRTC]
Caller  <====================== Direct WebRTC Stream ==================>  Receiver
        (no server in this path — ICE/STUN for NAT traversal only)
```

---

## 3. Noir Contract: Identity Attestation

The Aztec smart contract (written in Noir) stores the mapping of wallet addresses to verified identities. It uses Aztec's private state model (UTXO notes) to ensure that identity lookups do not reveal which wallets are communicating.

Contract source: `/noir-projects/` and `/circuits/`

Network: Aztec Alpha V5 (`https://v5.testnet.rpc.aztec-labs.com`)  
SponsoredFPC: `0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7`

---

## 4. Mobile Browser Constraints

Mobile browsers (Safari on iOS, Chrome on Android) impose strict requirements on `getUserMedia`. We found that overly-specific constraints (`frameRate: 60`, `noiseSuppression: true`) cause `NotAllowedError` on many Android devices and WebViews, even when the user has granted permissions.

**Solution: Two-tier constraint fallback**
```typescript
try {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 60 }, facingMode: 'user' } : false,
  });
} catch (initialErr) {
  // Fallback: basic constraints that all devices support
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: isVideo ? { facingMode: 'user' } : false,
  });
}
```

This fix was validated on: iOS Safari 18, Android Chrome 126, Twitter WebView (Android).

---

## 5. Known Limitations and Open Questions

1. **NAT Traversal:** PeerJS uses STUN for NAT traversal. In strict enterprise NAT environments, TURN relay may be needed. We currently use PeerJS cloud STUN. Production deployment should use self-hosted TURN (e.g., coturn).

2. **XMTP Latency:** XMTP message delivery is typically <500ms but is not guaranteed. We mitigate this by having the caller initiate the PeerJS connection *before* the XMTP message is confirmed delivered — the XMTP message is a notification, not a prerequisite.

3. **PXE Cold Start:** The Barretenberg WASM prover takes ~2-4 seconds to initialize on first load. We preload it on app mount to avoid blocking the call flow.

4. **V4 ? V5 Migration:** We are currently in the process of verifying all Noir circuits against Aztec V5 APIs. Some circuit APIs changed between 4.x and 5.x (notably: `getRegisteredAccounts()` is now `getCompleteAddress()`). A detailed migration post is forthcoming.

---

## 6. Deployment

Production: Railway (Docker)
Build: `npm run build:railway` (runs `prisma migrate deploy` before Next.js build)
Live: https://humanidfi.com

---

## License

MIT. Open source. Public domain contributions welcome.

Stefan Antonio Cirisanu — atfortyseven2@gmail.com
