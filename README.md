# Humanity Ledger

The Humanity Ledger is a privacy-first ecosystem designed for secure communications and asset provenance. This repository houses the front-end interface and Web2 infrastructure for the protocol.

## Current Status (Beta Prototype)
Humanity Ledger is currently in active development as a **Web2 Prototype**. 

**Important Notice for Reviewers:**
- **Authentication**: Currently uses standard SIWE (Sign-In with Ethereum) over Web2 infrastructure. Zero-knowledge authentication is currently simulated (HMAC-SHA256).
- **Storage**: State is currently persisted in PostgreSQL.
- **Aztec L2 / Noir**: True on-chain private state execution via Aztec Network and Noir circuits is on our immediate roadmap, but is **not yet connected** in this repository. 
- **Whale Chat**: Our encrypted messaging application utilizes XMTP and WebRTC for peer-to-peer communication.

Please see `docs/STATUS.md` for a complete breakdown of what is live and what is simulated.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Deployment**: Vercel
- **Database**: PostgreSQL
- **Web3 Integration**: WalletConnect / SIWE
- **Typography**: IBM Plex Sans & IBM Plex Mono

## Getting Started

1. Clone the repository
2. Run `npm install` or `pnpm install`
3. Configure your `.env.local` based on `.env.example`
4. Run `npm run dev` to start the development server

## License
MIT License. See [LICENSE](LICENSE) for details.
