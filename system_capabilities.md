# SYSTEM CAPABILITIES COLLECTION (LedgerChat)

Below are the detailed architecture and current capabilities of the Ledger Chat system to date. The system operates as an elite P2P communication protocol native to Aztec V5, with a strong emphasis on cryptographic privacy and minimal metadata leakage.

## 1. AUTHENTICATION AND SECURITY SYSTEM
*   **Identity Provisioning:** Users authenticate by generating a Schnorr signature on the Grumpkin curve via the Aztec PXE.
*   **PXE Siloing:** The private execution environment guarantees mathematical isolation between sessions, ensuring no module can cross-read private variables.

## 2. REAL-TIME SIGNALING ENGINE
*   **XMTP Integration:** Replaces traditional WebRTC signaling servers with wallet-to-wallet E2E encrypted MLS messaging.
*   **Decentralized Handshake:** Call offers and SDP answers are pushed directly to the recipient's wallet address using deterministic PeerID derivation.

## 3. ADVANCED MEDIA TRANSPORT
*   **Direct P2P WebRTC:** Once signaling completes, media streams directly between peers without server routing.
*   **Mobile Heuristics:** Advanced fallback patterns for strict `getUserMedia` constraints on iOS Safari and Android WebViews to guarantee camera/mic connection.

## 4. AZTEC INTEGRATION
*   **Alpha V5 Ready:** The protocol actively leverages client-side proving on the Aztec Mainnet Testnet.
*   **Noir Smart Contracts:** Core identity attestations are codified in Noir circuits.

## 5. REFINED UX/UI AND IMMERSION
*   **Elite Aesthetics:** High-contrast minimal interfaces designed to not distract from the primary cryptographic utility.
*   **Terminal Interface:** The `/terminal` route provides direct access to the communication fabric.

**Agent Summary:** The system is fully operational as a deep-tech Aztec Native P2P protocol. It's a "High Fidelity" technical implementation focused on cryptographic privacy and zero-server signaling.
