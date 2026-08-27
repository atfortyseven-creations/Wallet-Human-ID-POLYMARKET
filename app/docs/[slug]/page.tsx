import { notFound } from "next/navigation";
import { DocsShell, DocH1, DocH2, DocH3, DocP, DocTable, DocCallout, DocOrderedList, DocTag } from "@/components/docs/DocsShell";
import { ALL_DOC_SLUGS } from "@/components/docs/DocsData";

export function generateStaticParams() {
  return ALL_DOC_SLUGS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const doc = ALL_DOC_SLUGS.find((d) => d.slug === resolvedParams.slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.label} — Humanity Ledger Docs`,
    description: `In-depth technical documentation for ${doc.label} on the Humanity Ledger privacy protocol built on Aztec L2.`,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const docInfo = ALL_DOC_SLUGS.find((d) => d.slug === slug);
  if (!docInfo) notFound();

  const getContent = () => {
    switch (slug) {

      // ─────────────────────────────────────────────────────────────────────────
      // OVERVIEW
      // ─────────────────────────────────────────────────────────────────────────
      case "overview":
        return (
          <>
            <DocTag>Overview</DocTag>
            <DocH1>What Humanity Ledger Does</DocH1>
            <DocP>
              Humanity Ledger is a privacy-first decentralized ecosystem engineered from first principles on the Aztec Network Layer 2. Rather than retrofitting privacy onto an existing public chain, Humanity Ledger treats confidentiality as a non-negotiable protocol invariant — every byte of user data is encrypted before it ever leaves the device, and mathematical proofs replace data disclosure at every interaction boundary.
            </DocP>
            <DocP>
              The protocol provides three integrated product layers: <strong>LedgerChat</strong> (end-to-end encrypted communications), <strong>Studio Provenance</strong> (privacy-preserving real-world asset registration), and the <strong>Portfolio Terminal</strong> (local-first cross-chain portfolio tracking). Each layer shares the same cryptographic identity substrate — your Aztec private keypair — eliminating the fragmented identity model that plagues conventional Web3 applications.
            </DocP>

            <DocH2>The Privacy-Native Computing Model</DocH2>
            <DocP>
              Traditional blockchains operate under a radical transparency assumption: all state changes are public, all participants can audit all data. Ethereum&apos;s model, while powerful for trustless execution, exposes user addresses, balances, transaction histories, and smart-contract inputs to anyone running a node. This model is fundamentally incompatible with financial privacy and human rights at the infrastructure layer.
            </DocP>
            <DocP>
              Humanity Ledger inverts this assumption. The default state of every note, every message, and every identity assertion is <em>encrypted</em>. Public disclosure is opt-in, not opt-out. The cryptographic machinery that enforces this inversion is the Aztec Network&apos;s Private Execution Environment (PXE) — a sandboxed local runtime that executes private functions, generates zero-knowledge proofs, and submits only the proof (never the witness inputs) to the global state.
            </DocP>

            <DocCallout title="Foundational Guarantee" type="note">
              Humanity Ledger is mathematically incapable of accessing your data. Your encryption keys never leave your browser. The server infrastructure receives only cryptographic proofs of correct execution — inputs, balances, and identity attributes remain entirely local.
            </DocCallout>

            <DocH2>System Architecture Overview</DocH2>
            <DocTable
              headers={["Layer", "Technology", "Responsibility", "Runs Where"]}
              rows={[
                ["L1 Settlement", "Ethereum Mainnet", "Final state anchoring, fraud proofs", "Ethereum validators"],
                ["L2 Rollup", "Aztec Network (Honk/Noir)", "Private state execution, proof aggregation", "Aztec sequencers"],
                ["Local Proving", "Barretenberg WASM", "Client-side zk-SNARK generation", "Browser Web Workers"],
                ["Identity", "Grumpkin curve keypairs", "Account abstraction, note ownership", "Secure device storage"],
                ["Messaging", "XMTP + AES-256-GCM", "E2E encrypted peer-to-peer comms", "XMTP nodes (ciphertexts only)"],
                ["Storage", "Encrypted Aztec Notes", "Private UTXO state persistence", "Aztec global state tree"],
                ["Settings", "PXE Engine (AES-GCM)", "Local user preferences vault", "Browser IndexedDB"],
              ]}
            />

            <DocH2>The Three Protocol Pillars</DocH2>
            <DocOrderedList
              items={[
                {
                  title: "Ledger Chat — Encrypted Communication Layer",
                  desc: "A full-featured encrypted messaging system where cryptographic identities replace phone numbers and IP addresses. Messages are encrypted locally using AES-256-GCM derived from an ECDH handshake, routed through the XMTP peer-to-peer network as opaque ciphertexts. The relay network sees only encrypted blobs — never plaintext, never metadata. Ghost Mode enables a ZK-backed auto-responder that preserves liveness without revealing activity.",
                },
                {
                  title: "Studio Provenance — Real-World Asset Registry",
                  desc: "A cryptographic provenance registry that anchors the existence and lineage of physical and digital assets on-chain. Ownership assertions are stored as encrypted Aztec notes — only the commitment (a hash) is public. Ownership transfers are proven via zero-knowledge circuits without disclosing valuation or counterparty identity. The registry supports multi-party attestation for institutional-grade provenance chains.",
                },
                {
                  title: "Portfolio Terminal — Local-First Financial Dashboard",
                  desc: "A unified portfolio view that aggregates multi-chain balances, NFT holdings, and DeFi positions entirely within the user's browser. Data is fetched directly from RPC endpoints, never proxied through Humanity Ledger servers. Balances are optionally encrypted in the PXE settings engine. Block explorers observe nothing — the terminal holds no server-side user session.",
                },
              ]}
            />

            <DocH2>Why Aztec Network?</DocH2>
            <DocP>
              The Aztec Network is the world&apos;s only production-deployed privacy-preserving Layer 2 blockchain with native account abstraction. It is built on the Noir domain-specific language for zero-knowledge circuit authoring and uses the Honk proof system (an ultra-plonk variant) for highly efficient proof generation. Unlike EVM-compatible ZK rollups (zkSync Era, Polygon zkEVM) which target computation scalability, Aztec&apos;s primary design objective is <em>data confidentiality at the consensus layer</em>.
            </DocP>
            <DocP>
              Humanity Ledger chose Aztec because it is the only L2 stack that provides: (1) client-side proof generation natively within the browser, (2) a private UTXO note model that prevents balance enumeration, (3) a programmable account abstraction that decouples signing mechanism from execution, and (4) a Noir-based constraint system that compiles to safe, auditable arithmetic circuits.
            </DocP>

            <DocCallout title="Protocol Status" type="note">
              Humanity Ledger is currently deployed on the Aztec Alpha Testnet (v5). Mainnet deployment is planned to coincide with Aztec Network&apos;s canonical mainnet launch. All cryptographic primitives used in production are identical between testnet and mainnet — only sequencer trust assumptions differ.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // WHY PRIVACY
      // ─────────────────────────────────────────────────────────────────────────
      case "why-privacy":
        return (
          <>
            <DocTag>Overview</DocTag>
            <DocH1>Why Privacy Matters</DocH1>
            <DocP>
              Privacy is not a luxury feature or a compliance checkbox — it is a fundamental precondition for human autonomy, economic freedom, and political liberty. When financial infrastructure operates under radical transparency, the consequences are severe and systematic: financial surveillance enables political persecution, chilling effects on dissent, targeted exploitation by adversarial actors, and the erosion of negotiating power between asymmetrically informed parties.
            </DocP>

            <DocH2>The Surveillance Economy of Public Blockchains</DocH2>
            <DocP>
              Public blockchains like Ethereum were designed with an explicit transparency assumption: all state is public, all transactions are auditable, all actors are pseudonymous. Pseudonymity, however, is not privacy. On-chain analysis firms — Chainalysis, Elliptic, Nansen, Arkham Intelligence — have developed industrial-scale graph analysis algorithms capable of de-anonymizing Ethereum addresses with high confidence using: (1) deposit address clustering, (2) peel chain analysis, (3) off-chain data correlation (exchange KYC, social media handles), and (4) dust attacks to link wallet clusters.
            </DocP>
            <DocP>
              The result is a paradox: a trustless, decentralized financial system that is simultaneously more surveilled than traditional banking. A Swiss bank account does not broadcast your balance and transaction history to every node on the internet. A Bitcoin UTXO does.
            </DocP>

            <DocH2>The Human Rights Dimension</DocH2>
            <DocP>
              Financial privacy is explicitly recognized as a component of the right to privacy under Article 12 of the Universal Declaration of Human Rights and Article 8 of the European Convention on Human Rights. For populations living under authoritarian regimes, financial transparency is not merely inconvenient — it is existentially dangerous. A political activist whose wallet is linked to opposition funding faces asset seizure, blacklisting, or detention. A whistleblower who accepts payment in public cryptocurrency is trivially identifiable.
            </DocP>
            <DocCallout title="The Humanity Ledger Position" type="note">
              We hold that financial privacy is a prerequisite of political freedom. A payment system that cannot protect its users from surveillance cannot serve as infrastructure for human liberation. Humanity Ledger is engineered so that privacy is the default, not the exception — and is mathematically enforced rather than policy-promised.
            </DocCallout>

            <DocH2>Zero-Knowledge as the Only Viable Solution</DocH2>
            <DocP>
              Historically, privacy-preserving blockchains have relied on one of three approaches: mixing services (Tornado Cash, Wasabi Wallet), trusted execution environments (TEEs, Intel SGX), or cryptographic privacy protocols (Zcash, Monero). Mixing services have been sanctioned by OFAC, breaking the compliance narrative. TEEs rely on trusting hardware manufacturers and are vulnerable to side-channel attacks. Monero uses ring signatures which inflate transaction size and are susceptible to statistical analysis under certain conditions.
            </DocP>
            <DocP>
              Zero-knowledge proofs represent the fourth and most rigorous approach: privacy is enforced by mathematics rather than policy, hardware, or obfuscation. A ZK proof guarantees that a statement is true without revealing the evidence for that statement. This is not probabilistic — it is either computationally infeasible (in the case of computational soundness) or information-theoretically impossible (in the case of perfect soundness) for a verifier to extract private information from the proof transcript.
            </DocP>
            <DocTable
              headers={["Approach", "Privacy Model", "Regulatory Risk", "Computational Cost"]}
              rows={[
                ["Mixing Services", "Probabilistic", "High (OFAC)", "Low"],
                ["TEEs", "Trust Hardware", "Medium", "Low"],
                ["Ring Signatures (Monero)", "Statistical", "High", "Medium"],
                ["zk-SNARKs (Aztec)", "Mathematical", "Low", "High (client-side)"],
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // QUICKSTART
      // ─────────────────────────────────────────────────────────────────────────
      case "quickstart":
        return (
          <>
            <DocTag>Getting Started</DocTag>
            <DocH1>Quickstart Guide</DocH1>
            <DocP>
              This guide walks you through connecting to Humanity Ledger for the first time, from wallet connection to your first encrypted interaction. The entire onboarding process takes approximately 3 minutes and requires no server-side account creation — your identity is derived entirely from your cryptographic keys.
            </DocP>

            <DocH2>Prerequisites</DocH2>
            <DocOrderedList
              items={[
                { title: "An Ethereum-compatible wallet", desc: "MetaMask, Coinbase Wallet, or any EIP-1193 compatible browser extension. WalletConnect v2 is supported for mobile wallets." },
                { title: "A modern browser", desc: "Chrome 90+, Firefox 88+, Safari 15+, or Brave. WebAssembly (WASM) and the Web Crypto API must be enabled — they are by default in all modern browsers." },
                { title: "Sepolia ETH (for testnet)", desc: "Small amounts of Sepolia ETH are required to pay for Aztec testnet transactions. Free faucets are available at sepoliafaucet.com." },
              ]}
            />

            <DocH2>Step 1 — Connect Your Wallet</DocH2>
            <DocP>
              Navigate to humanidfi.com and click the &quot;Connect Wallet&quot; button in the top-right navigation. The protocol supports Sign-In With Ethereum (SIWE) — it does not use OAuth, passwords, or email addresses. Your Ethereum address is the root of your identity graph.
            </DocP>
            <DocP>
              Upon connection, your browser will be asked to sign a SIWE message. This signature is used only to authenticate your session — it does not authorize any on-chain transaction. The signed message contains a nonce, your address, the current timestamp, and the requesting domain, preventing replay attacks.
            </DocP>

            <DocH2>Step 2 — Initialize Your Aztec Identity</DocH2>
            <DocP>
              After SIWE authentication, Humanity Ledger derives your Aztec identity from your Ethereum keypair using a deterministic key derivation function (KDF). Specifically, the PXE engine requests a structured ECDSA signature from your wallet over a fixed domain-separation string, then hashes the signature output using Poseidon2 to produce your Aztec account&apos;s private scalar on the Grumpkin curve.
            </DocP>
            <DocCallout title="Key Security" type="warning">
              Your Aztec private key is derived deterministically from your Ethereum key. It is never stored on any server. If you clear your browser&apos;s local storage, your Aztec key can be re-derived by signing the same derivation message with your Ethereum wallet. However, any funds stored in Aztec notes can only be recovered if the derivation path is correct — always confirm the domain before signing.
            </DocCallout>

            <DocH2>Step 3 — Explore the Protocol</DocH2>
            <DocP>
              With your identity initialized, you have access to the full protocol surface: Ledger Chat (navigate to /chat), Studio Provenance (/studio), and the Portfolio Terminal (/portfolio). Each module reads your encrypted state from the Aztec network and decrypts it locally using your derived keys — no server ever sees plaintext.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // CONNECT WALLET
      // ─────────────────────────────────────────────────────────────────────────
      case "connect-wallet":
        return (
          <>
            <DocTag>Getting Started</DocTag>
            <DocH1>Connect Your Wallet</DocH1>
            <DocP>
              Humanity Ledger uses Sign-In With Ethereum (EIP-4361) as its sole authentication mechanism. There are no passwords, no email addresses, and no centralized identity provider. Your Ethereum private key is the root of your access control hierarchy.
            </DocP>

            <DocH2>Supported Wallets</DocH2>
            <DocTable
              headers={["Wallet", "Connection Method", "Mobile Support", "Notes"]}
              rows={[
                ["MetaMask", "Browser extension, EIP-1193", "Yes (via deep link)", "Most tested"],
                ["Coinbase Wallet", "Browser extension, WalletConnect v2", "Yes", "MPC key backup supported"],
                ["WalletConnect v2", "QR code / deep link", "Yes (primary)", "All WC2-compatible wallets"],
                ["Ledger / Trezor", "Hardware, via MetaMask bridge", "No", "Recommended for high-value accounts"],
                ["Rainbow Wallet", "WalletConnect v2", "Yes", "Social recovery supported"],
                ["Trust Wallet", "WalletConnect v2", "Yes", "BNB chain compatible"],
              ]}
            />

            <DocH2>The SIWE Authentication Flow</DocH2>
            <DocP>
              Sign-In With Ethereum (SIWE) is an EIP-4361 standard that defines a structured plaintext message format for authenticating Ethereum accounts to web applications. The flow proceeds as follows:
            </DocP>
            <DocOrderedList
              items={[
                { title: "Nonce Request", desc: "The client requests a unique nonce from the Humanity Ledger API. This nonce is cryptographically random (256 bits of entropy) and expires after 5 minutes." },
                { title: "Message Construction", desc: "The client constructs an EIP-4361 message containing the domain, URI, version, chain ID, nonce, issuance time, and an expiration time." },
                { title: "User Signature", desc: "The wallet presents the structured message to the user for explicit approval. The user signs with their Ethereum private key using personal_sign (EIP-191)." },
                { title: "Server Verification", desc: "The API verifies the signature using ecrecover, confirms the recovered address matches the claimed address, validates the nonce, and issues a short-lived session token." },
                { title: "Session Management", desc: "The session token is stored as an HttpOnly, Secure, SameSite=Strict cookie. It expires after 24 hours of inactivity." },
              ]}
            />

            <DocCallout title="Zero Server-Side Identity" type="note">
              Humanity Ledger does not store passwords, email addresses, or personal information on its servers. The only server-side data associated with your session is your Ethereum address (a public identifier) and an encrypted activity log for analytics. Your cryptographic keys never touch our servers.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // AZTEC IDENTITY
      // ─────────────────────────────────────────────────────────────────────────
      case "aztec-identity":
        return (
          <>
            <DocTag>Getting Started</DocTag>
            <DocH1>Create Your Aztec Identity</DocH1>
            <DocP>
              An Aztec identity is fundamentally different from an Ethereum account. On Ethereum, your identity is a 20-byte address derived from the public key, and all your transactions are trivially linkable. On Aztec, your account is an encrypted state machine — a smart contract that owns private notes, with authorization logic defined in a Noir circuit.
            </DocP>

            <DocH2>Aztec Account Architecture</DocH2>
            <DocP>
              Every Aztec account consists of three cryptographic components: a <strong>signing key</strong> (used to authorize transactions), a <strong>nullifier key</strong> (used to spend notes), and a <strong>incoming viewing key</strong> (used to decrypt incoming notes). These are derived from a single master secret using domain-separated hash functions, ensuring that compromise of one key does not compromise the others.
            </DocP>
            <DocTable
              headers={["Key Type", "Curve", "Purpose", "Exposure Risk"]}
              rows={[
                ["Signing Key (sk)", "Grumpkin (BN254 scalar field)", "Authorize outgoing txns", "Medium — exposed per txn"],
                ["Nullifier Key (nk)", "Grumpkin", "Spend (nullify) owned notes", "High — must be kept secret"],
                ["Incoming Viewing Key (ivk)", "Grumpkin", "Decrypt incoming notes", "Low — can be shared selectively"],
                ["Outgoing Viewing Key (ovk)", "Grumpkin", "Audit your own outgoing txns", "Low — for personal audit"],
              ]}
            />

            <DocH2>Key Derivation from Ethereum</DocH2>
            <DocP>
              Humanity Ledger derives your Aztec identity deterministically from your Ethereum wallet. The derivation process uses the wallet&apos;s signing capability as an entropy source, without ever transmitting the private key:
            </DocP>
            <DocOrderedList
              items={[
                { title: "Sign derivation message", desc: 'The wallet signs the string "Humanity Ledger: Derive Aztec Identity v1.0" using personal_sign. The output is a 65-byte ECDSA signature.' },
                { title: "Hash to scalar", desc: "The signature bytes are hashed using Poseidon2 (a ZK-friendly hash function over the BN254 scalar field) to produce a 254-bit scalar — your Aztec master secret." },
                { title: "Key expansion", desc: "From the master secret, HD derivation (analogous to BIP32 but over Grumpkin) produces the four child keys: signing key, nullifier key, incoming viewing key, and outgoing viewing key." },
                { title: "Account contract deployment", desc: "On first use, a lightweight account contract is deployed to Aztec L2 at a deterministic address derived from your signing key. This contract enforces your authorization logic." },
              ]}
            />

            <DocCallout title="Recovery" type="warning">
              Since your Aztec identity is derived from your Ethereum key, losing access to your Ethereum wallet means losing access to your Aztec account. There is no seed phrase recovery separate from your Ethereum wallet. Always maintain secure backups of your Ethereum wallet seed phrase.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // ZK PROOFS
      // ─────────────────────────────────────────────────────────────────────────
      case "zk-proofs":
        return (
          <>
            <DocTag>Core Concepts</DocTag>
            <DocH1>Zero-Knowledge Proofs</DocH1>
            <DocP>
              A Zero-Knowledge Proof (ZKP) is a cryptographic protocol in which one party (the prover) can convince another party (the verifier) that a statement is true, without revealing any information beyond the truth of the statement itself. The concept was introduced by Goldwasser, Micali, and Rackoff in their seminal 1985 paper &quot;The Knowledge Complexity of Interactive Proof Systems.&quot;
            </DocP>

            <DocH2>The Three Properties of ZKPs</DocH2>
            <DocOrderedList
              items={[
                { title: "Completeness", desc: "If the statement is true, an honest prover can convince an honest verifier. Formally: for every valid witness w satisfying the relation R(x, w), the prover can produce an accepting proof with probability 1." },
                { title: "Soundness", desc: "If the statement is false, no cheating prover can convince the verifier (except with negligible probability). This is parameterized by the soundness error ε, which for modern SNARKs is at most 2^-128." },
                { title: "Zero-Knowledge", desc: "The proof reveals nothing about the witness beyond the truth of the statement. Formally, there exists a polynomial-time simulator that produces transcripts indistinguishable from real proof transcripts without knowing the witness." },
              ]}
            />

            <DocH2>From Interactive to Non-Interactive: SNARKs</DocH2>
            <DocP>
              Interactive ZKPs require multiple rounds of challenge-response between prover and verifier — impractical for blockchain applications. The Fiat-Shamir heuristic transforms any interactive protocol into a non-interactive one by replacing the verifier&apos;s random challenges with a cryptographic hash of the transcript. This produces a zk-SNARK: a Succinct Non-Interactive Argument of Knowledge.
            </DocP>
            <DocTable
              headers={["Property", "Description", "Aztec / Humanity Ledger"]}
              rows={[
                ["Succinct", "Proof size is sublinear in circuit complexity", "~2KB proofs regardless of circuit depth"],
                ["Non-Interactive", "Single message from prover to verifier", "One ZK tx per action, no rounds"],
                ["Argument", "Computationally sound (not information-theoretically)", "128-bit security level"],
                ["Knowledge", "Prover knows a valid witness", "Enforced by Noir compiler soundness"],
              ]}
            />

            <DocH2>Honk: Aztec&apos;s Proof System</DocH2>
            <DocP>
              Humanity Ledger uses the Honk proof system, developed by Aztec Labs. Honk is an ultra-plonk variant that replaces the trusted setup with a universal structured reference string (SRS) and uses the sumcheck protocol to reduce the verification cost to O(log n) field operations. Key technical characteristics:
            </DocP>
            <DocOrderedList
              items={[
                { title: "Curve: BN254 (alt_bn128)", desc: "A pairing-friendly elliptic curve with a 254-bit scalar field. BN254 is supported natively by Ethereum's precompiles (EIP-196, EIP-197), enabling cheap on-chain verification." },
                { title: "Polynomial commitment: KZG10", desc: "Kate-Zaverucha-Goldberg polynomial commitments allow succinct polynomial opening proofs — the polynomial evaluation at any point can be proven with a single group element." },
                { title: "Arithmetization: Plonkish", desc: "Circuits are expressed as a system of polynomial constraints over the scalar field. Honk uses custom gates (lookup tables, range checks) to reduce constraint count for common operations." },
                { title: "Proof size: ~2 KB", desc: "A single Honk proof is approximately 2 kilobytes, regardless of circuit depth up to ~2^20 gates. Verification costs approximately 400,000 gas on Ethereum." },
              ]}
            />

            <DocH2>Client-Side Proving via Barretenberg WASM</DocH2>
            <DocP>
              All proof generation in Humanity Ledger happens inside the user&apos;s browser, powered by Barretenberg compiled to WebAssembly. Barretenberg is Aztec Labs&apos; native proving backend, implemented in C++ and optimized for multi-threaded execution using SharedArrayBuffer and Web Workers. The typical proving time for a Humanity Ledger identity proof is 1–4 seconds on modern hardware.
            </DocP>
            <DocCallout title="No Trusted Prover" type="note">
              Because proofs are generated on-device, your private inputs (account balance, note values, identity attributes) are never transmitted to a remote proving service. This is the critical architectural difference between Aztec-based privacy and TEE-based or server-side proving approaches.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // UTXO MODEL
      // ─────────────────────────────────────────────────────────────────────────
      case "utxo-model":
        return (
          <>
            <DocTag>Core Concepts</DocTag>
            <DocH1>UTXO & Private Notes</DocH1>
            <DocP>
              Aztec, and by extension Humanity Ledger, uses an extended Unspent Transaction Output (UTXO) model to represent private state. Unlike Ethereum&apos;s account-based model where balances are stored as mutable storage slots in a global state trie, Aztec state consists of immutable <strong>notes</strong> stored in an append-only Merkle tree. Spending a note means consuming it (proving it exists and is unspent via a nullifier) and creating new output notes.
            </DocP>

            <DocH2>The Anatomy of an Aztec Note</DocH2>
            <DocP>
              A note is a data structure containing the private state that an account owns. Conceptually, it is similar to a Bitcoin UTXO but with a richer type system and mandatory encryption. Each note has the following structure:
            </DocP>
            <DocTable
              headers={["Field", "Type", "Description"]}
              rows={[
                ["nonce", "Field", "Domain-separation nonce preventing note commitment collisions"],
                ["owner", "AztecAddress", "Grumpkin public key of the note owner"],
                ["value", "Field", "Private value stored in the note (e.g., token amount)"],
                ["asset_id", "Field", "Contract address of the associated token contract"],
                ["randomness", "Field", "Random scalar ensuring commitment hiding"],
                ["commitment", "Field", "Poseidon2 hash of all note fields — stored in the state tree"],
              ]}
            />

            <DocH2>Note Commitments and the State Tree</DocH2>
            <DocP>
              When a note is created, its commitment (a Poseidon2 hash of its fields) is inserted into Aztec&apos;s global note hash tree — a Sparse Merkle Tree of depth 32, supporting up to 2^32 notes. The commitment is public (anyone can see it in the tree), but it is computationally infeasible to reverse the hash and recover the note fields without the owner&apos;s decryption key.
            </DocP>
            <DocP>
              The note content is separately encrypted using the owner&apos;s incoming viewing key (an AES-256-GCM symmetric key derived from an ECDH exchange over Grumpkin) and stored in an append-only encrypted note log. The PXE scans this log for notes addressed to the local account, decrypts them, and stores them in the local note store (IndexedDB).
            </DocP>

            <DocH2>Spending Notes: Nullifiers</DocH2>
            <DocP>
              To spend a note, the spender must produce a <strong>nullifier</strong> — a deterministic, unpredictable identifier derived from the note commitment and the spender&apos;s nullifier key. The nullifier is published on-chain when the note is consumed. If a nullifier already exists in the nullifier tree, the note cannot be double-spent.
            </DocP>
            <DocCallout title="Key Insight" type="note">
              The nullifier tree links spending to note existence without revealing which note was spent. An observer can confirm that some note was nullified (preventing double-spend), but cannot determine which note — because the nullifier computation involves the private nullifier key that only the note owner possesses.
            </DocCallout>

            <DocH2>Comparison to Account-Based Model</DocH2>
            <DocTable
              headers={["Property", "Account-Based (Ethereum)", "Note-Based (Aztec)"]}
              rows={[
                ["State mutability", "Mutable storage slots", "Immutable notes (append-only)"],
                ["Balance visibility", "Public (any node can read)", "Encrypted (only owner can decrypt)"],
                ["Double-spend prevention", "Nonce per account", "Nullifier per note"],
                ["Parallel txns", "Sequential (nonce ordering)", "Parallel (independent notes)"],
                ["Privacy", "None by default", "Full by default"],
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // PXE
      // ─────────────────────────────────────────────────────────────────────────
      case "pxe":
        return (
          <>
            <DocTag>Core Concepts</DocTag>
            <DocH1>Private Execution Environment (PXE)</DocH1>
            <DocP>
              The Private Execution Environment (PXE) is the cornerstone of Aztec&apos;s client-side privacy model, and by extension, the execution substrate for all Humanity Ledger operations. The PXE is a sandboxed local runtime that runs either in-browser (WASM) or as a standalone Node.js process, responsible for: note decryption, witness generation, proof creation, transaction construction, and state synchronization.
            </DocP>

            <DocH2>PXE Responsibilities</DocH2>
            <DocOrderedList
              items={[
                { title: "Note Discovery and Decryption", desc: "The PXE continuously scans the Aztec network's encrypted note logs for notes addressed to the local account. When a matching note is found (detected via the incoming viewing key), it is decrypted and stored in the local note store." },
                { title: "Witness Generation", desc: "When executing a private function, the PXE constructs the execution witness — all private inputs required by the Noir circuit. This includes note values, private keys, and Merkle membership proofs for notes being consumed." },
                { title: "ZK Proof Generation", desc: "The PXE calls the Barretenberg proving backend (via WASM) to generate a zk-SNARK over the execution trace. The proof attests to correct function execution without revealing the witness." },
                { title: "Transaction Construction", desc: "The PXE bundles the proof, public inputs, and new note commitments into a signed transaction object that can be submitted to the Aztec sequencer." },
                { title: "State Synchronization", desc: "The PXE maintains a local copy of the Aztec note hash tree (Merkle tree) and nullifier set, necessary for constructing Merkle membership proofs for note consumption." },
              ]}
            />

            <DocH2>Humanity Ledger&apos;s PXE Settings Engine</DocH2>
            <DocP>
              Humanity Ledger extends the base PXE with a proprietary Settings Engine (SettingsEnginePXE) — a reactive, AES-256-GCM encrypted local vault that stores all user preferences. The Settings Engine provides the following guarantees:
            </DocP>
            <DocTable
              headers={["Property", "Implementation", "Security Level"]}
              rows={[
                ["Encryption at rest", "AES-256-GCM with random IV per write", "256-bit symmetric"],
                ["Key derivation", "PBKDF2-SHA256, 100K iterations over wallet address", "~70 bits effective against offline attack"],
                ["Storage backend", "Browser IndexedDB", "Origin-isolated by browser sandboxing"],
                ["Reactive subscriptions", "Custom EventEmitter over IDB change events", "Low-latency, no polling"],
                ["Schema migration", "Versioned migration system (v1→v2→...)", "Backward compatible"],
                ["Debounced writes", "250ms debounce on all mutations", "Prevents write amplification"],
              ]}
            />

            <DocH2>PXE Network Topology</DocH2>
            <DocP>
              The PXE connects to an Aztec Node via JSON-RPC. In Humanity Ledger&apos;s production configuration, this node is operated by Aztec Labs (testnet) or a decentralized set of node operators (mainnet). The PXE is designed to work with any Aztec-compatible node — users can self-host a node and point the PXE to their own endpoint for maximum sovereignty.
            </DocP>
            <DocCallout title="Trust Model" type="note">
              The Aztec Node the PXE connects to is semi-trusted: it provides data (note logs, block headers) but cannot modify the local state or access private keys. If the node is compromised, an attacker can serve stale or incorrect state — but cannot forge proofs or steal funds. Connecting to a self-hosted node eliminates even this trust assumption.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // NULLIFIERS
      // ─────────────────────────────────────────────────────────────────────────
      case "nullifiers":
        return (
          <>
            <DocTag>Core Concepts</DocTag>
            <DocH1>Nullifiers & Double-Spend Prevention</DocH1>
            <DocP>
              Nullifiers are the cryptographic mechanism by which Aztec prevents double-spending of private notes without revealing which note was spent. They are the privacy-preserving analogue of the sequential nonce used in account-based blockchains, but with a fundamentally different security model: each nullifier is cryptographically tied to a specific note and a specific key, making them one-time use and unlinkable to the note commitment without the nullifier key.
            </DocP>

            <DocH2>Nullifier Computation</DocH2>
            <DocP>
              A nullifier is computed as a Poseidon2 hash of three components: the note commitment, the nullifier key (a private key known only to the note owner), and the contract address. Formally:
            </DocP>
            <DocP>
              <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-sm">nullifier = Poseidon2(commitment, nullifier_key, contract_address)</code>
            </DocP>
            <DocP>
              Because the nullifier key is private, an observer who knows the commitment cannot compute the expected nullifier. They can observe that a nullifier was published (and therefore some note was spent), but cannot link the nullifier back to the specific commitment — providing unlinkability between note creation and consumption.
            </DocP>

            <DocH2>The Nullifier Tree</DocH2>
            <DocP>
              Aztec maintains a global <strong>Nullifier Tree</strong> — a Sparse Merkle Tree where each leaf represents a nullifier hash. When a transaction consumes a note, it publishes the corresponding nullifier. The sequencer verifies that the nullifier is not already present in the tree (preventing double-spend), then inserts it. The non-membership proof required to demonstrate the nullifier is fresh is generated by the PXE and included in the transaction&apos;s kernel circuit.
            </DocP>
            <DocTable
              headers={["Component", "Type", "Security Property"]}
              rows={[
                ["Nullifier Tree", "Sparse Merkle Tree (depth 32)", "Collision-resistant (Poseidon2)"],
                ["Non-membership proof", "Merkle exclusion proof", "Soundness: cannot forge absence"],
                ["Nullifier computation", "Poseidon2(commitment, nk, contract)", "Hiding: unlinkable to commitment"],
                ["Binding", "Included in kernel circuit", "Cannot spend without valid nullifier key"],
              ]}
            />

            <DocH2>The Kernel Circuit</DocH2>
            <DocP>
              The kernel circuit is the Noir circuit that enforces the note consumption rules. It verifies: (1) the note commitment exists in the note hash tree (Merkle membership), (2) the nullifier is correctly computed from the note commitment and the prover&apos;s nullifier key, (3) the nullifier does not already exist in the nullifier tree (non-membership proof), and (4) the prover&apos;s nullifier key is authorized by the account contract. All of this is proven inside a zk-SNARK, making the entire spending protocol zero-knowledge.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // STUDIO PROVENANCE
      // ─────────────────────────────────────────────────────────────────────────
      case "studio-provenance":
        return (
          <>
            <DocTag>Products</DocTag>
            <DocH1>Studio Provenance</DocH1>
            <DocP>
              Studio Provenance is Humanity Ledger&apos;s cryptographic asset registry — a protocol for anchoring the existence, lineage, and ownership of real-world and digital assets on-chain with privacy-preserving guarantees. It solves the fundamental challenge of asset provenance: how do you prove an asset existed at a specific time, with a specific set of attributes, without revealing confidential valuation or ownership information?
            </DocP>

            <DocH2>The Provenance Problem</DocH2>
            <DocP>
              Traditional provenance systems (art authentication certificates, vehicle history reports, supply chain records) rely on centralized custodians that are corruptible, fragile, and opaque. Even blockchain-based NFTs solve only partial provenance: the token&apos;s on-chain history is public, but the metadata (which proves the asset&apos;s attributes) is typically stored on centralized IPFS pinning services or proprietary APIs.
            </DocP>
            <DocP>
              Studio Provenance uses ZK cryptography to separate the <em>existence proof</em> (public, on-chain, permanent) from the <em>attribute disclosure</em> (selective, privacy-preserving, controlled by the owner). The asset&apos;s commitment is public and immutable; the valuation, ownership chain, and sensitive metadata are encrypted.
            </DocP>

            <DocH2>Provenance Record Structure</DocH2>
            <DocTable
              headers={["Field", "Visibility", "Description"]}
              rows={[
                ["asset_id", "Public", "Unique identifier derived from asset fingerprint"],
                ["timestamp", "Public", "L2 block timestamp of registration"],
                ["commitment", "Public", "Poseidon2 hash of all private fields"],
                ["owner_address", "Private (owner only)", "Aztec address of current owner"],
                ["valuation", "Private (owner only)", "Asset value at time of registration"],
                ["metadata_hash", "Public", "Hash of off-chain metadata document"],
                ["attestors", "Selective disclosure", "List of third-party attestors"],
              ]}
            />

            <DocH2>Ownership Transfer Protocol</DocH2>
            <DocP>
              Transferring a provenance record is analogous to spending a note and creating a new one. The current owner generates a ZK proof that they own the note (knowledge of the nullifier key), nullifies the existing ownership note, and creates a new ownership note addressed to the recipient. The transfer is recorded on-chain as a nullifier/commitment pair — proving the transfer occurred without revealing the parties involved or the consideration paid.
            </DocP>
            <DocCallout title="Institutional Use Cases" type="note">
              Studio Provenance is designed for high-value asset categories: fine art (Humanities Provenance Standard), real estate title transfer, intellectual property licensing, supply chain milestone recording, and cross-border document authentication. Enterprise integrations are available via the Humanity Ledger B2B API.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // Ledger Chat
      // ─────────────────────────────────────────────────────────────────────────
      case "ledger-chat":
        return (
          <>
            <DocTag>Products</DocTag>
            <DocH1>LedgerChat</DocH1>
            <DocP>
              Ledger Chat is a full-featured, end-to-end encrypted communications system built natively on top of Aztec identities. It replaces the conventional paradigm of phone number or email-based messaging with cryptographic keys, providing metadata-resistant, surveillance-proof communication for high-value interactions.
            </DocP>

            <DocH2>Cryptographic Architecture</DocH2>
            <DocP>
              Ledger Chat uses a layered encryption model. At the transport layer, messages are routed through the XMTP (Extensible Message Transport Protocol) network — a decentralized peer-to-peer relay network for Ethereum-addressed messaging. At the application layer, messages are encrypted using AES-256-GCM before submission to XMTP, using keys derived from an ECDH handshake over the Grumpkin curve.
            </DocP>
            <DocTable
              headers={["Layer", "Protocol", "What Network Sees"]}
              rows={[
                ["Identity", "Aztec Grumpkin keypair", "Public key only"],
                ["Transport", "XMTP peer-to-peer relay", "Encrypted blob + recipient address"],
                ["Encryption", "AES-256-GCM", "Nothing (ciphertext)"],
                ["Key Agreement", "ECDH over Grumpkin", "Nothing (shared secret is local)"],
                ["Metadata", "WebRTC for P2P, XMTP for relay", "Relay sees sender/recipient only"],
              ]}
            />

            <DocH2>Ghost Mode</DocH2>
            <DocP>
              Ghost Mode is a ZK-backed auto-responder that maintains the appearance of online presence without revealing actual activity. When enabled, the PXE Settings Engine activates a pre-programmed response template that is sent automatically to incoming messages. The prover generates a ZK proof that the response was sent by the account holder without the holder being actively online — preserving plausible deniability.
            </DocP>

            <DocH2>Burn-on-Read & Auto-Delete Timers</DocH2>
            <DocP>
              Ledger Chat supports ephemeral message modes backed by the PXE Settings Engine. Burn-on-Read messages are flagged with a cryptographic marker that instructs the recipient&apos;s PXE to nullify the note immediately upon decryption. Auto-Delete Timers schedule nullification of notes after a configurable time window (1 hour to 7 days), enforced by the local PXE timer subsystem.
            </DocP>

            <DocH2>Privacy Engine Settings</DocH2>
            <DocOrderedList
              items={[
                { title: "Ghost Mode", desc: "Activates ZK-authenticated auto-replies. Keeps session alive without revealing your actual presence." },
                { title: "Onion Routing (Tor Integration)", desc: "Routes WebRTC signaling through configurable Tor hops (1–5) to mask IP address. Adds 50–200ms latency depending on hop count." },
                { title: "Metadata Stealth", desc: "Suppresses typing indicators, read receipts, and online status signals. XMTP relay cannot determine session activity." },
                { title: "Smart Macros", desc: "Pre-programmed ZK-signed responses to keyword triggers. Useful for automated acknowledgment without manual intervention." },
                { title: "Defi Tools Integration", desc: "Inline DeFi transaction requests within chat — ZK-signed payment requests that can be fulfilled without leaving the conversation interface." },
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // PORTFOLIO TERMINAL
      // ─────────────────────────────────────────────────────────────────────────
      case "portfolio-terminal":
        return (
          <>
            <DocTag>Products</DocTag>
            <DocH1>Portfolio Terminal</DocH1>
            <DocP>
              The Portfolio Terminal is a local-first, privacy-preserving financial dashboard that aggregates multi-chain asset balances, DeFi positions, NFT holdings, and transaction history — all computed on-device, with no data ever transmitted to Humanity Ledger servers.
            </DocP>

            <DocH2>Data Architecture</DocH2>
            <DocP>
              The Portfolio Terminal queries blockchain data via direct RPC connections to public or user-specified Ethereum and L2 nodes. There is no Humanity Ledger-operated data proxy. The client application makes RPC calls directly from the browser using ethers.js or viem, processes the responses locally, and renders the aggregated view — the server never sees which addresses are being queried.
            </DocP>
            <DocTable
              headers={["Chain", "Data Source", "RPC Method", "Privacy Level"]}
              rows={[
                ["Ethereum Mainnet", "Public RPC / user-supplied", "eth_getBalance, eth_call", "IP revealed to RPC provider"],
                ["Aztec L2", "Aztec Node via PXE", "aztec_getPrivateBalance", "Fully private (encrypted notes)"],
                ["Polygon", "Public RPC", "eth_getBalance", "IP revealed"],
                ["Arbitrum", "Public RPC", "eth_getBalance", "IP revealed"],
                ["Base", "Public RPC", "eth_getBalance", "IP revealed"],
              ]}
            />

            <DocH2>Aztec Private Balance Reading</DocH2>
            <DocP>
              Reading Aztec balances is fundamentally different from reading EVM balances. Because Aztec balances are stored as encrypted notes rather than storage slots, the Portfolio Terminal uses the local PXE to scan the note log, decrypt owned notes, and sum their values. This process is entirely local — the Aztec Node provides encrypted note data, but cannot derive the balance without the account&apos;s viewing key.
            </DocP>

            <DocCallout title="Privacy Enhancement" type="note">
              For maximum privacy on public EVM chains, configure the Portfolio Terminal to use a local Ethereum node (e.g., Nethermind or Geth running on your machine) or a privacy-focused RPC provider like Infura Private (with your API key stored locally). This prevents the public RPC provider from associating your address queries with your IP address.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // PRIVACY MODEL
      // ─────────────────────────────────────────────────────────────────────────
      case "privacy-model":
        return (
          <>
            <DocTag>Privacy & Security</DocTag>
            <DocH1>Privacy Model</DocH1>
            <DocP>
              The Humanity Ledger privacy model is built on a defense-in-depth hierarchy of cryptographic guarantees, architectural constraints, and operational policies. Privacy is not a product feature that can be toggled off — it is a protocol invariant enforced at multiple layers simultaneously.
            </DocP>

            <DocH2>Layer 1: Cryptographic Privacy (Strongest)</DocH2>
            <DocP>
              At the cryptographic layer, privacy is enforced by the mathematical properties of the ZK proof system. The soundness of the Honk/Plonk proof system guarantees that no prover can construct a valid proof without a valid witness — meaning the network cannot be tricked into accepting invalid state transitions. The zero-knowledge property guarantees that the proof reveals nothing beyond the truth of the statement. These guarantees hold under the security assumptions of the BN254 elliptic curve and the random oracle model for hash functions — assumptions that have been battle-tested for over a decade.
            </DocP>

            <DocH2>Layer 2: Architectural Privacy (Strong)</DocH2>
            <DocP>
              At the architectural layer, the PXE design ensures that private inputs never leave the user&apos;s device. Witnesses are constructed locally, proofs are generated locally, and only the proof (not the witness) is transmitted to the sequencer. The sequencer can verify proof validity but learns nothing about the private inputs. This is analogous to a bank verifying that a signed check is valid without knowing the account balance.
            </DocP>

            <DocH2>Layer 3: Transport Privacy (Moderate)</DocH2>
            <DocP>
              At the transport layer, Humanity Ledger uses TLS 1.3 for all server communications and recommends Tor/VPN usage for maximum IP privacy. The XMTP messaging layer provides metadata resistance — the relay network sees only ciphertexts and recipient addresses. However, network-level adversaries observing traffic patterns may be able to correlate activity timing with on-chain events. This is a known limitation of synchronous protocols.
            </DocP>

            <DocH2>Privacy Threat Model by Actor</DocH2>
            <DocTable
              headers={["Adversary", "Can Observe", "Cannot Observe", "Mitigation"]}
              rows={[
                ["Aztec Sequencer", "Nullifiers, commitments, proof validity", "Note values, ownership, tx intent", "ZK proofs, encrypted notes"],
                ["XMTP Relay", "Sender/recipient addresses, timing", "Message content, note data", "AES-256-GCM before relay submission"],
                ["ISP / Network Observer", "Connection to Aztec node, timing", "ZK witness, note values", "Tor integration, VPN"],
                ["Humanity Ledger Servers", "SIWE session (address, timestamp)", "Keys, balances, messages, identity", "PXE local execution, no key escrow"],
                ["On-chain Analyst", "Nullifiers, commitments, proof hashes", "Value, sender, recipient, intent", "ZK note model, no cleartext state"],
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // THREAT MODEL
      // ─────────────────────────────────────────────────────────────────────────
      case "threat-model":
        return (
          <>
            <DocTag>Privacy & Security</DocTag>
            <DocH1>Threat Model</DocH1>
            <DocP>
              A threat model is a structured analysis of who might attack a system, what their capabilities are, and what mitigations are in place. Humanity Ledger has been designed with an adversarial mindset — we assume the worst about the capabilities of potential attackers and design defenses accordingly.
            </DocP>

            <DocH2>Threat Actor Categories</DocH2>
            <DocOrderedList
              items={[
                { title: "Nation-State Adversary", desc: "A government-level adversary with authority to subpoena infrastructure providers, compel key disclosure, conduct traffic analysis, and deploy zero-day exploits. Mitigation: Mathematical ZK guarantees that resist legal compulsion; no server-side private keys to subpoena; optional Tor integration against traffic analysis." },
                { title: "Industrial Blockchain Analyst", desc: "Commercial analytics firms (Chainalysis, Elliptic) with advanced graph analysis, heuristic clustering, and exchange data access. Mitigation: Encrypted UTXO notes prevent balance enumeration; nullifiers are unlinkable to commitments; no reuse of addresses across sessions." },
                { title: "Malicious Aztec Sequencer", desc: "A compromised or malicious Aztec sequencer that attempts to censor transactions or include invalid state. Mitigation: ZK proofs are verifiable by any party — an invalid proof cannot pass verification; censored transactions can be resubmitted via alternate sequencers." },
                { title: "Browser / Device Compromise", desc: "An attacker who gains control of the user's browser or device can access the local PXE state and private keys. Mitigation: Hardware wallets move key material off-device; PXE settings are encrypted at rest; browser extensions must be audited." },
                { title: "Social Engineering", desc: "Phishing attacks targeting the SIWE signature derivation flow to extract a signed message over a malicious domain. Mitigation: SIWE messages are domain-bound; always verify the domain shown in the signing prompt; Humanity Ledger never asks for raw private key disclosure." },
              ]}
            />

            <DocH2>Out-of-Scope Threats</DocH2>
            <DocP>
              Humanity Ledger does not protect against: (1) physical access to an unlocked device with an active session, (2) compromised browser extensions with access to page content, (3) supply chain attacks on the Humanity Ledger front-end (mitigated by Subresource Integrity headers and self-hosting), or (4) bugs in the Noir circuit code or Barretenberg proving backend (mitigated by third-party audits).
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // TRANSACTION LIFECYCLE
      // ─────────────────────────────────────────────────────────────────────────
      case "transaction-lifecycle":
        return (
          <>
            <DocTag>Privacy & Security</DocTag>
            <DocH1>Transaction Lifecycle</DocH1>
            <DocP>
              Understanding the lifecycle of a private transaction on Aztec is essential for building with and on Humanity Ledger. A private transaction goes through six distinct phases, from user intent to L1 settlement. Each phase has specific cryptographic requirements and trust assumptions.
            </DocP>
            <DocOrderedList
              items={[
                { title: "Phase 1 — Intent & Witness Construction", desc: "The user initiates an action in the Humanity Ledger UI. The PXE identifies the relevant notes in the local note store, fetches Merkle membership proofs from the Aztec node, and constructs the execution witness — the private inputs to the Noir circuit." },
                { title: "Phase 2 — Private Function Simulation", desc: "The PXE simulates the private function execution locally, tracing the state transitions (note consumption and creation) to verify correctness before committing proof generation resources. If simulation fails, the error is reported locally without touching the network." },
                { title: "Phase 3 — ZK Proof Generation", desc: "Barretenberg WASM generates a Honk zk-SNARK over the execution trace. This is the most compute-intensive phase (1–4 seconds on modern hardware). The resulting proof is approximately 2 KB and attests to correct execution without revealing the witness." },
                { title: "Phase 4 — Transaction Submission", desc: "The PXE bundles the proof, public inputs (new note commitments, nullifiers to be created), and encrypted note logs into a signed transaction. This transaction is submitted to the Aztec sequencer via JSON-RPC." },
                { title: "Phase 5 — Sequencer Processing & Block Inclusion", desc: "The Aztec sequencer verifies the proof, checks nullifier non-membership (double-spend prevention), includes the transaction in the next L2 block, and broadcasts the block to the P2P network. The sequencer also generates a rollup proof aggregating all transactions in the block." },
                { title: "Phase 6 — L1 Settlement", desc: "Periodically, the Aztec rollup contract on Ethereum verifies the rollup proof and updates the L1 state root. This provides final settlement guarantees — a transaction settled on L1 cannot be reversed even by a malicious Aztec sequencer." },
              ]}
            />

            <DocH2>Transaction Finality</DocH2>
            <DocTable
              headers={["Finality Level", "Time", "Guarantee"]}
              rows={[
                ["Soft (Sequencer Inclusion)", "~1-2 seconds", "Sequencer-dependent; reversible if sequencer is malicious"],
                ["L2 Finality (Block Confirmation)", "~12 seconds", "P2P network consensus; very high confidence"],
                ["L1 Settlement (Ethereum Root)", "~15-30 minutes", "Absolute finality; Ethereum PoS security"],
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // AZTEC L2
      // ─────────────────────────────────────────────────────────────────────────
      case "aztec-l2":
        return (
          <>
            <DocTag>Aztec Network</DocTag>
            <DocH1>Aztec L2 Architecture</DocH1>
            <DocP>
              Aztec Network is a privacy-preserving Layer 2 blockchain built on Ethereum. It is the first and only production-deployed L2 with native support for private smart contract execution using zero-knowledge proofs. Humanity Ledger is built entirely on Aztec — it is not merely an application deployed to Aztec, but a deep integration that leverages every layer of the Aztec protocol stack.
            </DocP>

            <DocH2>Aztec Protocol Stack</DocH2>
            <DocTable
              headers={["Layer", "Component", "Description"]}
              rows={[
                ["Language", "Noir", "ZK circuit DSL compiled to ACIR (Abstract Circuit IR)"],
                ["Proving Backend", "Barretenberg", "C++ Honk prover; compiled to WASM for browsers"],
                ["Proof System", "Honk (Ultra-PlonK)", "Recursive SNARKs with custom gate support"],
                ["VM", "AVM (Aztec VM)", "Public function execution; EVM-compatible subset"],
                ["State Model", "Note Hash + Nullifier Trees", "Append-only Sparse Merkle Trees"],
                ["Sequencer", "Aztec Sequencer", "Collects txns, generates rollup proofs"],
                ["Settlement", "Ethereum Rollup Contract", "Verifies rollup proofs, anchors L1 state"],
              ]}
            />

            <DocH2>Public vs. Private Functions</DocH2>
            <DocP>
              Aztec smart contracts can contain both private and public functions within the same contract. Private functions execute within the user&apos;s PXE — their logic, inputs, and outputs are private by default. Public functions execute on the Aztec VM (AVM) on sequencer nodes — their inputs and outputs are public, similar to standard Ethereum transactions. A single Aztec transaction can call private functions that then enqueue calls to public functions, enabling hybrid privacy patterns.
            </DocP>

            <DocH2>Data Availability</DocH2>
            <DocP>
              Aztec uses a hybrid data availability model: note commitments and nullifiers are published to Ethereum (L1 DA) for maximum security, while encrypted note contents are published to a dedicated DA layer (currently the Aztec P2P network). This design minimizes L1 calldata costs while preserving the ability to reconstruct private state from the DA layer in case of sequencer failure.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // NOIR LANGUAGE
      // ─────────────────────────────────────────────────────────────────────────
      case "noir-language":
        return (
          <>
            <DocTag>Aztec Network</DocTag>
            <DocH1>Noir Language</DocH1>
            <DocP>
              Noir is a domain-specific language (DSL) designed by Aztec Labs for writing zero-knowledge circuits. It compiles to ACIR (Abstract Circuit Intermediate Representation) — a backend-agnostic IR that can target multiple proving backends including Barretenberg (Aztec), Plonky2 (Polygon), and others. Noir&apos;s syntax is inspired by Rust and is designed to be familiar to Web3 developers while enforcing the constraints necessary for safe circuit authoring.
            </DocP>

            <DocH2>Noir vs. Solidity: Key Differences</DocH2>
            <DocTable
              headers={["Property", "Solidity", "Noir"]}
              rows={[
                ["Execution environment", "EVM (public, all nodes)", "PXE (private, user's device)"],
                ["Data visibility", "All state public", "Private by default"],
                ["Computation model", "Imperative state machine", "Constraint satisfaction over finite field"],
                ["Loops", "Arbitrary", "Must be bounded at compile time"],
                ["Recursion", "Limited (depth metering)", "Supported via recursive proofs"],
                ["Integer types", "uint8 to uint256", "u8 to u128, Field (BN254 scalar field)"],
                ["Compilation output", "EVM bytecode", "ACIR + proving key + verification key"],
              ]}
            />

            <DocH2>Writing a Noir Circuit</DocH2>
            <DocP>
              A Noir program consists of one or more functions, a main entry point, and visibility annotations. Private inputs are marked with no annotation; public inputs are marked <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-xs">pub</code>. The compiler enforces that public inputs are consistent with the circuit&apos;s constraint system at the field level.
            </DocP>

            <DocH2>Constrained Arithmetic and the Field Element</DocH2>
            <DocP>
              Noir computations occur over the BN254 scalar field (order q ≈ 2^254). All integers are implicitly field elements — overflow is handled modulo q. This means that operations like addition and multiplication are defined over the field, and range checks must be explicitly added when working with fixed-width integers. Noir provides built-in range constraint functions and assertion macros to simplify correct circuit authoring.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // FINALITY
      // ─────────────────────────────────────────────────────────────────────────
      case "finality":
        return (
          <>
            <DocTag>Aztec Network</DocTag>
            <DocH1>Transaction Finality</DocH1>
            <DocP>
              Finality refers to the point at which a transaction can no longer be reversed. In Aztec&apos;s architecture, there are multiple levels of finality corresponding to different trust assumptions, and Humanity Ledger applications must be designed with awareness of these finality levels for each use case.
            </DocP>

            <DocH2>Finality Levels</DocH2>
            <DocOrderedList
              items={[
                { title: "Proof Submission Finality (~1–2s)", desc: "The PXE has successfully submitted the transaction to the sequencer and received an acknowledgment. The sequencer has verified the ZK proof. Reversal is possible only if the sequencer is malicious or the network partitions." },
                { title: "L2 Block Finality (~12s)", desc: "The transaction has been included in an L2 block and broadcast to the P2P network. Multiple sequencers have confirmed the block. Reversal requires a network-level attack on the Aztec consensus protocol." },
                { title: "Rollup Proof Generation (~5–15min)", desc: "The Aztec sequencer has generated an aggregated rollup proof covering the block containing this transaction. The proof is ready for L1 submission." },
                { title: "L1 Settlement Finality (~15–30min)", desc: "The rollup proof has been verified by the Aztec rollup contract on Ethereum, and the L2 state root has been updated on L1. This provides full Ethereum-level security — reversal requires a 51% attack on Ethereum Proof-of-Stake, which would cost tens of billions of dollars." },
              ]}
            />

            <DocH2>Design Implications</DocH2>
            <DocP>
              For consumer applications like Ledger Chat and the Portfolio Terminal, L2 block finality (12s) is sufficient — these are low-value, low-risk interactions where sequencer-level finality provides adequate assurance. For high-value Studio Provenance transfers (six-figure asset transfers), applications should wait for L1 settlement finality (~30 minutes) before presenting the transfer as complete to users.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // API REFERENCE
      // ─────────────────────────────────────────────────────────────────────────
      case "api-reference":
        return (
          <>
            <DocTag>Reference</DocTag>
            <DocH1>API Reference</DocH1>
            <DocP>
              The Humanity Ledger API provides server-side endpoints for: authentication (SIWE), activity logging, provenance record indexing, and public registry queries. All endpoints use REST over HTTPS. Private data is never transmitted through these endpoints — they are a supplement to the on-device PXE, not a replacement.
            </DocP>

            <DocH2>Authentication Endpoints</DocH2>
            <DocTable
              headers={["Method", "Endpoint", "Description"]}
              rows={[
                ["GET", "/api/auth/nonce", "Returns a fresh SIWE nonce. Expires after 5 minutes."],
                ["POST", "/api/auth/verify", "Verifies a SIWE signature and issues a session cookie."],
                ["POST", "/api/auth/signout", "Invalidates the current session cookie."],
                ["GET", "/api/auth/session", "Returns the current session state (address, expiry)."],
              ]}
            />

            <DocH2>Registry & Provenance Endpoints</DocH2>
            <DocTable
              headers={["Method", "Endpoint", "Description"]}
              rows={[
                ["GET", "/api/registry/wallets", "Paginated list of registered wallet addresses."],
                ["GET", "/api/registry/blocks", "Recent Aztec L2 block headers (block roots)."],
                ["GET", "/api/humanidfi/activity", "Paginated activity feed for the current session."],
                ["POST", "/api/provenance/register", "Register a new asset provenance commitment."],
                ["GET", "/api/provenance/:id", "Fetch a specific provenance record by ID."],
              ]}
            />

            <DocH2>Rate Limits & Authentication Requirements</DocH2>
            <DocTable
              headers={["Endpoint Group", "Auth Required", "Rate Limit"]}
              rows={[
                ["Auth endpoints", "No", "10 requests/min per IP"],
                ["Public registry", "No", "60 requests/min per IP"],
                ["Activity feed", "Yes (SIWE session)", "120 requests/min per session"],
                ["Provenance write", "Yes (SIWE session)", "10 requests/min per session"],
              ]}
            />
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // SDK
      // ─────────────────────────────────────────────────────────────────────────
      case "sdk":
        return (
          <>
            <DocTag>Reference</DocTag>
            <DocH1>Humanity Ledger JavaScript SDK</DocH1>
            <DocP>
              The Humanity Ledger JS SDK provides typed abstractions for interacting with the Aztec PXE, submitting private transactions, and reading encrypted state. It is built on top of <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-xs">@aztec/aztec.js</code> and extends it with Humanity Ledger-specific account contracts, identity derivation utilities, and the PXE settings engine.
            </DocP>

            <DocH2>Installation</DocH2>
            <DocP>
              Install via npm: <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-sm">npm install @humanityledger/sdk @aztec/aztec.js</code>
            </DocP>

            <DocH2>Core SDK Modules</DocH2>
            <DocTable
              headers={["Module", "Package Path", "Description"]}
              rows={[
                ["PXE Client", "@humanityledger/sdk/pxe", "Initialize and manage the local PXE instance"],
                ["Identity", "@humanityledger/sdk/identity", "Derive and manage Aztec identities from Ethereum keys"],
                ["Settings Engine", "@humanityledger/sdk/settings", "Read and write PXE settings with AES-256-GCM"],
                ["Provenance", "@humanityledger/sdk/provenance", "Register and query provenance records"],
                ["Messaging", "@humanityledger/sdk/messaging", "XMTP-backed encrypted messaging integration"],
                ["Portfolio", "@humanityledger/sdk/portfolio", "Aggregate multi-chain balances locally"],
              ]}
            />

            <DocH2>Quick Start: Initializing the PXE</DocH2>
            <DocP>
              The PXE must be initialized before any private operations can be performed. The PXE connects to an Aztec node and begins syncing the local note store.
            </DocP>

            <DocCallout title="Browser vs. Node.js" type="note">
              The SDK supports both browser (WASM-based PXE) and Node.js (native binary PXE) environments. Browser usage requires the <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-xs">@aztec/bb.js</code> WASM bundle and SharedArrayBuffer support (requires Cross-Origin Isolation headers). Node.js usage requires the <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-xs">@aztec/bb-prover</code> native binary.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // SECURITY MODEL
      // ─────────────────────────────────────────────────────────────────────────
      case "security-model":
        return (
          <>
            <DocTag>Reference</DocTag>
            <DocH1>Security Model</DocH1>
            <DocP>
              The Humanity Ledger security model is a multi-layer defense system combining cryptographic hardness assumptions, architectural isolation, operational security practices, and ongoing third-party auditing. This document specifies the security guarantees, the assumptions under which they hold, and the residual risks that users should be aware of.
            </DocP>

            <DocH2>Cryptographic Security Assumptions</DocH2>
            <DocTable
              headers={["Assumption", "Standard Name", "Security Level", "Best-Known Attack"]}
              rows={[
                ["BN254 DLP hardness", "Elliptic Curve Discrete Log Problem", "~110 bits", "GNFS index calculus (~2^110 ops)"],
                ["BN254 DDH hardness", "Decisional Diffie-Hellman on BN254", "~110 bits", "Same as DLP"],
                ["Poseidon2 collision resistance", "Sponge collision resistance", "~128 bits", "Generic birthday attack (2^64)"],
                ["AES-256-GCM confidentiality", "AES block cipher security", "256 bits", "Grover's algorithm (2^128 on QC)"],
                ["SHA-256 preimage resistance", "Hash preimage resistance", "256 bits", "Best known: 2^255 ops"],
              ]}
            />

            <DocH2>Audit History</DocH2>
            <DocP>
              Humanity Ledger engages independent security auditors for all production-critical components. Audit reports are published in the public GitHub repository. The Aztec protocol components are audited independently by the Aztec Labs security team and external firms including ABDK Consulting and Trail of Bits.
            </DocP>

            <DocH2>Bug Bounty Program</DocH2>
            <DocP>
              Humanity Ledger operates a responsible disclosure bug bounty program. Critical vulnerabilities in the PXE settings engine, authentication flow, or cryptographic identity derivation are eligible for rewards up to $50,000 USDC. Medium-severity issues in the UI or API layer are eligible for rewards up to $5,000 USDC. Report vulnerabilities to security@HumanityLedger.pro with a detailed proof of concept.
            </DocP>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // OPEN SOURCE
      // ─────────────────────────────────────────────────────────────────────────
      case "open-source":
        return (
          <>
            <DocTag>Reference</DocTag>
            <DocH1>Open Source</DocH1>
            <DocP>
              Humanity Ledger is committed to open-source transparency as a core tenet of trustless infrastructure. Users should not need to trust the Humanity Ledger team — they should be able to verify the code themselves. Our open-source strategy ensures that the cryptographic primitives, identity derivation logic, and smart contracts can be independently audited by anyone.
            </DocP>

            <DocH2>Open-Source Components</DocH2>
            <DocTable
              headers={["Repository", "License", "Description"]}
              rows={[
                ["humanityledger/Humanity-Ledger", "MIT", "Main application codebase (Next.js frontend, API)"],
                ["humanityledger/contracts", "MIT", "Aztec Noir smart contracts (provenance, identity)"],
                ["humanityledger/sdk", "MIT", "JavaScript SDK for third-party integrations"],
                ["aztec-network/aztec-packages", "Apache 2.0", "Aztec protocol (PXE, Barretenberg, Noir)"],
              ]}
            />

            <DocH2>Self-Hosting</DocH2>
            <DocP>
              For maximum sovereignty, users can self-host the Humanity Ledger frontend. The application is a standard Next.js app that can be deployed on any hosting platform. Self-hosting eliminates trust in the Humanity Ledger CDN and ensures the code running in your browser is exactly what is in the repository.
            </DocP>
            <DocOrderedList
              items={[
                { title: "Clone the repository", desc: "git clone https://github.com/humanityledger/Humanity-Ledger.git" },
                { title: "Install dependencies", desc: "npm install" },
                { title: "Configure environment", desc: "Copy .env.example to .env.local and fill in your RPC endpoints and API keys." },
                { title: "Build and serve", desc: "npm run build && npm start" },
              ]}
            />

            <DocCallout title="Subresource Integrity" type="note">
              The hosted version of humanidfi.com uses Content Security Policy headers and Subresource Integrity (SRI) hashes for all critical JavaScript bundles, allowing users to verify that the code served matches the audited build.
            </DocCallout>
          </>
        );

      // ─────────────────────────────────────────────────────────────────────────
      // DEFAULT FALLBACK (should not be reached given generateStaticParams)
      // ─────────────────────────────────────────────────────────────────────────
      default:
        return (
          <>
            <DocTag>{docInfo!.group}</DocTag>
            <DocH1>{docInfo!.label}</DocH1>
            <DocP>
              This documentation section is currently being finalized by the core protocol team. Technical specifications, implementation guides, and architectural diagrams for {docInfo!.label.toLowerCase()} are in active development and will be published with the next documentation release.
            </DocP>
            <DocCallout title="Stay Updated" type="note">
              Monitor our GitHub repository at github.com/humanityledger/Humanity-Ledger for the latest documentation updates. Major documentation releases are announced on our community channels.
            </DocCallout>
          </>
        );
    }
  };

  return (
    <DocsShell currentSlug={slug}>
      <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {getContent()}
      </article>
    </DocsShell>
  );
}
