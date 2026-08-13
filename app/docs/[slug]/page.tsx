import { notFound } from "next/navigation";
import { DocsShell, DocH1, DocH2, DocH3, DocP, DocTable, DocCallout, DocOrderedList, DocTag } from "@/components/docs/DocsShell";
import { ALL_DOC_SLUGS } from "@/components/docs/DocsData";

// This allows Next.js to statically generate all doc routes at build time
export function generateStaticParams() {
  return ALL_DOC_SLUGS.map((doc) => ({
    slug: doc.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const doc = ALL_DOC_SLUGS.find((d) => d.slug === params.slug);
  if (!doc) return { title: "Not Found" };
  return { title: `${doc.label} - Humanity Ledger Docs` };
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const docInfo = ALL_DOC_SLUGS.find((d) => d.slug === slug);

  if (!docInfo) {
    notFound();
  }

  // Define content mapping for each slug
  const getContent = () => {
    switch (slug) {
      case "overview":
        return (
          <>
            <DocTag>Overview</DocTag>
            <DocH1>What Humanity Ledger Does</DocH1>
            <DocP>
              Humanity Ledger is a privacy-first ecosystem built on top of Aztec L2. It provides infrastructure for decentralized identity, verifiable asset registration, and encrypted peer-to-peer communication—all running directly in the browser.
            </DocP>
            <DocP>
              At its core, Humanity Ledger utilizes <strong className="font-semibold text-slate-800">Zero-Knowledge Proofs (ZKPs)</strong> to verify actions without revealing the underlying data. Everything happens locally within your device's Private Execution Environment (PXE).
            </DocP>
            
            <DocH2>The Three Pillars</DocH2>
            <DocOrderedList
              items={[
                {
                  title: "Whale Chat",
                  desc: "End-to-end encrypted messaging. ZK identity replaces phone numbers. Your IP address and metadata are shielded.",
                },
                {
                  title: "Studio Provenance",
                  desc: "On-chain registry for real-world assets. The proof of existence is public, but ownership and valuations remain entirely encrypted.",
                },
                {
                  title: "Portfolio Terminal",
                  desc: "A unified dashboard tracking your multi-chain assets. It reads your encrypted balances locally, meaning block explorers see nothing.",
                },
              ]}
            />

            <DocCallout title="Key Insight" type="note">
              Humanity Ledger doesn't just choose to protect your data—it is mathematically incapable of accessing it. Your encryption keys never leave your browser, and only cryptographic proofs are submitted to the network.
            </DocCallout>

            <DocH2>System Architecture</DocH2>
            <DocTable
              headers={["Layer", "Technology", "Runs Where"]}
              rows={[
                ["L1 Settlement", "Ethereum Smart Contracts", "Ethereum Mainnet"],
                ["L2 Rollup", "Aztec Network (Noir)", "Aztec Sequencers"],
                ["Proof Generation", "Client-Side ZK Prover", "Browser (Web Workers)"],
                ["Identity", "Client-side ZK Accounts", "Secure Enclave"],
                ["Storage", "AES-256-GCM Encrypted Notes", "Aztec State Tree"],
              ]}
            />
          </>
        );

      case "aztec-identity":
        return (
          <>
            <DocTag>Getting Started</DocTag>
            <DocH1>Create Aztec Identity</DocH1>
            <DocP>
              Unlike traditional blockchains where your wallet address is public and all your transactions are traceable, Humanity Ledger uses Aztec's privacy abstraction.
            </DocP>
            <DocP>
              Your Aztec Identity is a combination of public nullifiers and private spending keys. When you perform an action, you don't broadcast a signature from your address; you submit a Zero-Knowledge Proof that you own a valid key.
            </DocP>

            <DocH2>How it works</DocH2>
            <DocOrderedList
              items={[
                {
                  title: "Generate Keypair",
                  desc: "Your browser generates a Grumpkin curve keypair entirely offline.",
                },
                {
                  title: "Register Alias",
                  desc: "You can optionally link a human-readable alias to your account using the Aztec Registry Contract.",
                },
                {
                  title: "Fund Account",
                  desc: "Shield tokens from Ethereum L1 into Aztec L2 to pay for transaction fees privately.",
                },
              ]}
            />

            <DocCallout title="Warning" type="warning">
              If you lose access to your private key, your funds and encrypted data cannot be recovered by the Humanity Ledger team. Always back up your seed phrase securely.
            </DocCallout>
          </>
        );

      case "zk-proofs":
        return (
          <>
            <DocTag>Core Concepts</DocTag>
            <DocH1>Zero-Knowledge Proofs</DocH1>
            <DocP>
              A Zero-Knowledge Proof (ZKP) is a cryptographic method where one party (the prover) can prove to another party (the verifier) that a specific statement is true, without conveying any additional information.
            </DocP>
            
            <DocH2>Client-Side Proving</DocH2>
            <DocP>
              Unlike standard ZK Rollups (like zkSync or Starknet) where proofs are generated on centralized servers, Humanity Ledger leverages Aztec's architecture to generate proofs directly on your device.
            </DocP>
            
            <DocTable
              headers={["Standard ZK Rollups", "Aztec Privacy Rollups"]}
              rows={[
                ["Data Privacy", "Public (Servers see all data)", "Encrypted (Servers see nothing)"],
                ["Proving Location", "Centralized Server", "User's Browser / Device"],
                ["State Model", "Account-based", "UTXO (Notes)"],
                ["Use Case", "Scalability", "Scalability + Privacy"],
              ]}
            />
          </>
        );

      case "whale-chat":
        return (
          <>
            <DocTag>Products</DocTag>
            <DocH1>Whale Chat</DocH1>
            <DocP>
              Whale Chat is an end-to-end encrypted messaging protocol built on top of your Aztec Identity. It removes the need for phone numbers, centralized servers, and IP tracking.
            </DocP>

            <DocH2>Cryptographic Handshake</DocH2>
            <DocP>
              When two users initiate a chat, they perform a cryptographic handshake. They exchange public keys via a secure channel (like scanning a QR code) and establish a shared secret using Diffie-Hellman key exchange.
            </DocP>
            
            <DocCallout title="Privacy Guarantee" type="key">
              Because messages are encrypted locally using AES-GCM before being sent over the peer-to-peer network, not even Humanity Ledger nodes can read the contents or metadata of your conversations.
            </DocCallout>
          </>
        );

      default:
        return (
          <>
            <DocTag>{docInfo.group}</DocTag>
            <DocH1>{docInfo.label}</DocH1>
            <DocP>
              This section is currently under active development. The technical specifications and deployment guides for {docInfo.label.toLowerCase()} are being finalized by the core protocol team.
            </DocP>
            <DocCallout title="Status" type="note">
              Check back soon or monitor our GitHub repositories for the latest architectural updates regarding this module.
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
