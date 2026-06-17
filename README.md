# Whale Network

Whale Network is an advanced Web3 ecosystem and decentralized terminal designed for secure identity management, asset tracking, and private zero-knowledge interactions. The architecture integrates cross-device synchronization with deep blockchain analytics.

## System Architecture

The platform operates on a modular, 12-component terminal interface built to handle extensive real-time data and cryptographic operations without compromising performance.

### 1. Terminal Modules
The ecosystem is divided into twelve dedicated functional areas:
- **Dashboard**: Unified tracking of global on-chain metrics and user portfolio.
- **Studio**: Digital asset provenance and registration interface.
- **Markets**: Institutional-grade tracking for token metrics, market cap, and live pricing.
- **Roadmap**: Interactive visualization of protocol development phases.
- **Identity**: Zero-knowledge passport system utilizing Aztec network infrastructure.
- **Token**: Utility and subscription tier management.
- **Map**: Visual representation of global node distribution and connectivity.
- **Chat**: Encrypted peer-to-peer communication layer (XMTP integration).
- **Portfolio**: Detailed breakdown of holding allocations across EVM networks.
- **Community**: Access to governance and support forums.
- **Status**: Live network health and block latency monitoring.
- **Privacy**: Transparent review of session routing and cryptographic handshakes.

### 2. Cryptographic Synchronization
Whale Network implements a highly secure, out-of-band device linking protocol. By scanning a QR code, the mobile application establishes an ephemeral X25519 Elliptic Curve Diffie-Hellman (ECDH) handshake with the desktop terminal. This allows seamless session transfers and cryptographic signing delegation without exposing private keys over the network.

### 3. Zero-Knowledge Integration
The application interfaces directly with the Aztec Network Local Private Execution Environment (PXE). 
- **Identity Management**: Users generate zero-knowledge proofs client-side to verify their identity and execute actions without revealing underlying data.
- **Claim Processing**: The system supports secure token claims and airdrops through strictly validated cryptographic signatures.

### 4. Local Vaults and EVM Support
- **Native Vaults**: System-level password protection for local encrypted key storage.
- **Multi-Chain Connectivity**: Full integration with Wagmi and Viem to support standard Web3 wallet connections across Ethereum, Polygon, and Base.

## Technical Stack

- **Frontend**: Next.js 15 (App Router), React, and Tailwind CSS.
- **State Management**: React hooks paired with Zustand for global and wallet state.
- **Database**: PostgreSQL database indexed and managed via Prisma ORM.
- **Web3 Integrations**: WalletConnect, Wagmi, Viem, and Aztec SDKs.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/whalenetwork/whale-wallet.git
   cd whale-wallet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and provide your specific RPC URLs and database connection strings.

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Security

If you discover a security vulnerability within this project, please report it directly to the maintainers rather than opening a public issue. We adhere to strict security protocols and will address any vulnerabilities immediately.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
