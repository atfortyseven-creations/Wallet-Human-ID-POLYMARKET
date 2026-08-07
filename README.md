# WhaleChat — Private P2P Communications on Aztec V5

> End-to-end encrypted voice, video, and text between Aztec wallets.
> No signaling server sees your content. No central authority can censor your calls.
> Built on Aztec Alpha V5 Testnet.

---

## What This Is

WhaleChat is a WebRTC-based communication protocol that uses the Aztec Network for identity verification and XMTP for censorship-resistant signaling. Two wallets can establish a direct, encrypted voice/video call without any server ever seeing the call content or metadata.

**The problem it solves:** Today, every "private" messaging app routes your calls through a central server that issues session tokens, validates identities, and can censor or surveil. WhaleChat replaces the central authority with cryptographic identity — your Aztec wallet *is* your identity, proven by a Schnorr signature on the Grumpkin curve.

---

## Architecture

```
+-----------------------------------------------------+
|                   CALLER (Browser)                  |
|  PXE (private) -> Aztec identity proof              |
|  XMTP signaling -> encrypted offer to receiver     |
|  PeerJS -> direct WebRTC stream after handshake    |
+----------------------+------------------------------+
                       | Direct P2P (WebRTC)
                       | No server in the media path
+----------------------v------------------------------+
|                  RECEIVER (Browser)                 |
|  XMTP -> receives encrypted signaling              |
|  Aztec PXE -> verifies caller identity             |
|  PeerJS -> answers with local media stream         |
+-----------------------------------------------------+
```

**Stack:**

| Layer | Technology |
|-------|-----------|
| Identity | Aztec Wallet (Schnorr/Grumpkin) |
| Signaling | XMTP (wallet-to-wallet E2E encrypted) |
| Media Transport | WebRTC via PeerJS |
| Private State | Aztec PXE (client-side proving, Alpha V5) |
| Privacy | PXE siloing — cross-session contamination is mathematically prevented |
| Frontend | Next.js 15 / TypeScript |
| Backend | Prisma + PostgreSQL (user registry only, no message content) |

---

## Current Status: Alpha

Running on **Aztec Alpha V5 Testnet** (`https://v5.testnet.rpc.aztec-labs.com`).

**What works today:**
- Wallet-to-wallet text messaging via XMTP (E2E encrypted)
- Voice calls (WebRTC, P2P, no media server)
- Video calls (WebRTC, P2P, no media server)
- Aztec identity verification via PXE
- PXE siloing per contract address
- iOS + Android browser support (with fallback getUserMedia constraints)
- Voice message recording (MP4/WebM with MIME detection)

**Known limitations (honest):**
- Alpha network — not intended for production-scale deployment
- WebRTC NAT traversal depends on STUN/TURN availability
- PXE is client-side: first load requires ~2-4s for WASM initialization
- Single developer maintainer — response time on issues may vary

---

## Aztec Integration

```typescript
// PXE initialization — siloed per contract address
const pxe = await getSiloedPXE(AZTEC_NODE_URL, contractAddress);

// Identity: wallet address IS the peer identity
const peerId = derivePeerId(walletAddress); // deterministic, no registration needed

// Signaling: XMTP wallet-to-wallet (no server reads this)
await xmtpClient.sendMessage(receiverAddress, `__CALL_OFFER__:${myPeerId}:audio`);
```

The full Noir contract source is in `/circuits` and `/noir-projects`.

---

## Run Locally

```bash
git clone https://github.com/humanityledger/Humanity-Ledger
cd Humanity-Ledger
npm install
cp .env.example .env  # fill in your keys
npm run dev
```

**Required environment variables:**
```env
NEXT_PUBLIC_AZTEC_NODE_URL=https://v5.testnet.rpc.aztec-labs.com
AZTEC_PXE_URL=http://127.0.0.1:18080
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your WalletConnect project ID>
DATABASE_URL=<PostgreSQL connection string>
XMTP_ENV=production
```

**Live demo:** https://humanidfi.com

---

## Repository Structure

```
/circuits          - Noir ZK circuits (identity proofs)
/noir-projects     - Aztec-native Noir smart contracts
/contracts         - Solidity L1 portal contracts
/components        - React components (WhaleChat, identity, etc.)
/hooks             - Custom hooks (useSecureCamera, usePXE, etc.)
/lib/aztec         - Aztec.js integration layer
/lib/xmtp          - XMTP client and messaging layer
/pages/api         - Next.js API routes (registry, auth)
/prisma            - Database schema
```

---

## Technical Notes

**Why PeerJS + XMTP instead of a signaling server?**
Traditional WebRTC requires a signaling server to exchange SDP offers/answers. We replaced this with XMTP messages — the offer is just a wallet-to-wallet encrypted message. The server never sees it, never stores it, and cannot block it.

**Why Aztec for identity?**
XMTP uses ECDSA on secp256k1 for wallet verification. Aztec adds a second layer: Schnorr proofs on Grumpkin that can encode private attributes without revealing the wallet address. This enables verifiable anonymous communication.

**WebRTC on mobile browsers:**
Safari (iOS) and Android WebViews impose strict constraints on getUserMedia. We implement a two-tier fallback: advanced constraints first (echoCancellation, 60fps), then basic {audio: true, video: true} if the device rejects them.

---

## Network Configuration

| Parameter | Value |
|-----------|-------|
| Testnet Node | https://v5.testnet.rpc.aztec-labs.com |
| Explorer | https://testnet.aztecscan.xyz |
| SponsoredFPC | 0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7 |
| Aztec.js | v5.0.0 |

---

## License

MIT — open source, fully public.
**Stefan Antonio Cirisanu** — Core Developer & Solo Founder
Contact: atfortyseven2@gmail.com
LinkedIn: https://www.linkedin.com/in/stefan-antonio-cirisanu-40116140b/

*Built in public on Aztec Alpha V5. Contributions and technical feedback welcome.*
