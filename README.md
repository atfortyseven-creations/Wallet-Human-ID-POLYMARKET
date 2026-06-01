# Humanity Ledger

A Web3 Wallet interface built to support advanced privacy networks, with a core focus on **Aztec Network** integration. The application provides a seamless user experience for managing digital assets, performing private transactions, and interacting with decentralized applications (dApps).

## Aztec Network Integration

This repository is optimized to work with the Aztec Network ecosystem, leveraging its privacy-preserving architecture.

### Key Components

1.  **Noir Circuits & Smart Contracts:** The protocol logic is designed to be compiled in Noir (Aztec's Rust-based DSL). This allows for the generation of Zero-Knowledge proofs that enforce state transitions without revealing user data.
2.  **Honk & UltraPlonk Proving Backends:** The application supports WebAssembly (WASM) proof generation directly in the browser, allowing users to generate ZK proofs client-side for maximum privacy and low latency.
3.  **Private Execution Environment (PXE):** The system relies on the Aztec PXE to run entirely on the client side. It maintains the user's private note database, manages key derivations, and syncs with the L2 RPC to fetch encrypted logs, ensuring that private keys never leave the browser environment.
4.  **Public/Private Composability:** The interface is built to handle cross-domain calls between the private execution context and public state contracts (e.g., L2 AMMs).

## System Architecture

The application is built using modern web standards:

- **Frontend:** React and Next.js (App Router) for server-side rendering and optimized client delivery.
- **Authentication:** WalletConnect and Wagmi for standard Web3 wallet connections.
- **Styling:** Tailwind CSS for responsive design across Desktop, iOS, and Android platforms.
- **Database:** Prisma ORM for relational data management and indexing.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- PostgreSQL (if running the indexer locally)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/humanityledger/Humanity-Ledger.git
   cd Humanity-Ledger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Copy `.env.example` to `.env` and fill in your RPC URLs and database connection strings.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions from the community, especially regarding Aztec Network integrations and ZK-circuit optimizations. 

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AztecIntegration`).
3. Commit your changes (`git commit -m 'feat: add Noir circuit support'`).
4. Push to the branch (`git push origin feature/AztecIntegration`).
5. Open a Pull Request.

## Security

If you discover a security vulnerability within this project, please report it directly to the maintainers via email rather than opening a public issue. We take security seriously and will address any reports promptly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
