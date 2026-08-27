import { notFound } from "next/navigation";
import { DocsShell, DocH1, DocH2, DocH3, DocP, DocTable, DocCallout, DocOrderedList, DocTag } from "@/components/docs/DocsShell";
import { ALL_DOC_SLUGS } from "@/components/docs/DocsData";
import Link from 'next/link';

export function generateStaticParams() {
  return ALL_DOC_SLUGS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const doc = ALL_DOC_SLUGS.find((d) => d.slug === resolvedParams.slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.label} - Humanity Ledger Docs`,
    description: `Documentation for ${doc.label}.`,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const docInfo = ALL_DOC_SLUGS.find((d) => d.slug === slug);
  if (!docInfo) notFound();

  return (
    <DocsShell activeSlug={slug} breadcrumb={[{ label: docInfo.group }, { label: docInfo.label }]}>
      {slug === 'index' && (
        <>
          <DocH1>Documentation Index</DocH1>
          <DocTag>Living</DocTag>
          <DocP><strong>Purpose:</strong> Provide an overview of the system architecture and available documentation.</DocP>
          <DocH2>What the user does</DocH2>
          <DocP>Navigates the documentation to understand the system properties and cryptographic guarantees.</DocP>
          <DocH2>What is stored, and where</DocH2>
          <DocP>No user data is stored by viewing documentation.</DocP>
          <DocH2>Threat model</DocH2>
          <ul className="list-disc pl-5 mb-6 text-[15px] text-black/70 space-y-2">
            <li>In scope: Clear communication of system state.</li>
            <li>Out of scope: Active exploits against the documentation site.</li>
          </ul>
          <DocP><Link href="/docs/status" className="text-blue-600 hover:underline">View STATUS</Link></DocP>
          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'ledger-chat' && (
        <>
          <DocH1>Ledger Chat</DocH1>
          <DocTag>Beta</DocTag>
          <DocP><strong>Purpose:</strong> Wallet-to-wallet messaging with end-to-end encryption using XMTP and WebRTC.</DocP>
          <DocH2>What the user does</DocH2>
          <DocP>Connects a wallet, signs a session message, and exchanges messages or calls with other wallet addresses.</DocP>
          <DocH2>What is stored, and where</DocH2>
          <DocP>Message bodies are encrypted on the device and stored on the decentralized XMTP network. WebRTC signaling passes through relay servers but media is peer-to-peer. Local settings are in browser localStorage.</DocP>
          <DocH2>Threat model</DocH2>
          <ul className="list-disc pl-5 mb-6 text-[15px] text-black/70 space-y-2">
            <li>In scope: Host reading chat bodies (prevented by XMTP end-to-end encryption).</li>
            <li>In scope: Session hijacking (prevented by JWT and SIWE nonces).</li>
            <li>Out of scope: Nation-state traffic analysis.</li>
            <li>Out of scope: Compromised handset or endpoint.</li>
            <li>Out of scope: Sybil resistance (uniqueness today is per wallet, not per human).</li>
          </ul>
          <DocP><Link href="/docs/status" className="text-blue-600 hover:underline">View STATUS</Link></DocP>
          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'authentication' && (
        <>
          <DocH1>Authentication</DocH1>
          <DocTag>Simulated ZK / live SIWE</DocTag>
          <DocP><strong>Purpose:</strong> Gate access to the workspace via cryptographic signatures without consuming gas.</DocP>
          <DocH2>What the user does</DocH2>
          <DocP>Signs an EIP-191 message with their self-custodial wallet (Sign-In with Ethereum).</DocP>
          <DocH2>What is stored, and where</DocH2>
          <DocP>A session JWT is stored in an HTTP-only secure cookie. The wallet's private keys never leave the device.</DocP>
          <DocH2>Threat model</DocH2>
          <ul className="list-disc pl-5 mb-6 text-[15px] text-black/70 space-y-2">
            <li>In scope: Replay attacks (prevented by nonces and expiration).</li>
            <li>In scope: Cookie theft (prevented by HTTP-only and SameSite flags).</li>
            <li>Out of scope: Production ZK authentication (currently simulated via HMAC-SHA256).</li>
            <li>Out of scope: One-human-one-account restrictions.</li>
          </ul>
          <DocP><Link href="/docs/status" className="text-blue-600 hover:underline">View STATUS</Link></DocP>
          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'cryptography' && (
        <>
          <DocH1>Cryptography Matrix</DocH1>
          <DocTag>Mixed</DocTag>
          <DocP><strong>Purpose:</strong> Exhaustive accounting of cryptographic primitives used in the system and their current deployment status.</DocP>
          
          <div className="overflow-x-auto my-8 border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-black/10">
                  <th className="py-3 px-4 font-bold text-sm">Mechanism</th>
                  <th className="py-3 px-4 font-bold text-sm">Where</th>
                  <th className="py-3 px-4 font-bold text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">EIP-191 / SIWE</td><td className="py-3 px-4 text-sm">Session open</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600">Live</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">Session JWT</td><td className="py-3 px-4 text-sm">Cookie</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600">Live</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">X25519 ECDH</td><td className="py-3 px-4 text-sm">Ledger Chat keys</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600">Live in chat path</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">WebRTC DTLS-SRTP</td><td className="py-3 px-4 text-sm">Voice / video</td><td className="py-3 px-4 text-sm font-semibold text-amber-600">Beta</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">HMAC-SHA256</td><td className="py-3 px-4 text-sm">/api/zk/prove</td><td className="py-3 px-4 text-sm font-semibold text-purple-600">Simulated stand-in</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">Noir in noir-projects/</td><td className="py-3 px-4 text-sm">Repository</td><td className="py-3 px-4 text-sm font-semibold text-gray-500">Planned — not called</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">Aztec PXE / L2 notes</td><td className="py-3 px-4 text-sm">Roadmap</td><td className="py-3 px-4 text-sm font-semibold text-gray-500">Planned</td></tr>
                <tr><td className="py-3 px-4 text-sm font-mono text-black/70">QDS token</td><td className="py-3 px-4 text-sm">Hub tile</td><td className="py-3 px-4 text-sm font-semibold text-red-500">Unavailable</td></tr>
              </tbody>
            </table>
          </div>

          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'status' && (
        <>
          <DocH1>Platform Status</DocH1>
          <DocTag>Living</DocTag>
          <DocP><strong>Purpose:</strong> Single source of truth for the live status of system components.</DocP>
          
          <div className="overflow-x-auto my-8 border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-black/10">
                  <th className="py-3 px-4 font-bold text-sm">Component</th>
                  <th className="py-3 px-4 font-bold text-sm">Status</th>
                  <th className="py-3 px-4 font-bold text-sm">Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr><td className="py-3 px-4 text-sm font-semibold">Ledger Chat</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600">LIVE (BETA)</td><td className="py-3 px-4 text-sm text-black/60">XMTP + WebRTC</td></tr>
                <tr><td className="py-3 px-4 text-sm font-semibold">Authentication</td><td className="py-3 px-4 text-sm font-semibold text-amber-600">SIMULATED ZK / live SIWE</td><td className="py-3 px-4 text-sm text-black/60">NextAuth / Web2 + EIP-191</td></tr>
                <tr><td className="py-3 px-4 text-sm font-semibold">ZK proving</td><td className="py-3 px-4 text-sm font-semibold text-purple-600">SIMULATED</td><td className="py-3 px-4 text-sm text-black/60">HMAC-SHA256 mocks</td></tr>
                <tr><td className="py-3 px-4 text-sm font-semibold">State storage</td><td className="py-3 px-4 text-sm font-semibold text-blue-600">WEB2</td><td className="py-3 px-4 text-sm text-black/60">PostgreSQL</td></tr>
                <tr><td className="py-3 px-4 text-sm font-semibold">Aztec L2 / Noir</td><td className="py-3 px-4 text-sm font-semibold text-gray-500">PLANNED</td><td className="py-3 px-4 text-sm text-black/60">Circuits and contracts written, not connected</td></tr>
                <tr><td className="py-3 px-4 text-sm font-semibold">Portfolio sync</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600">LIVE</td><td className="py-3 px-4 text-sm text-black/60">Read-only RPCs (e.g. Alchemy)</td></tr>
              </tbody>
            </table>
          </div>

          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'architecture' && (
        <>
          <DocH1>Architecture</DocH1>
          <DocTag>Living</DocTag>
          <DocP><strong>Purpose:</strong> Explain the structural design of the Humanity Ledger workspace.</DocP>
          <DocH2>Overview</DocH2>
          <DocP>Humanity Ledger is a Web2-hosted workspace. Authentication is handled via SIWE (Sign-In with Ethereum). The primary functional module is Ledger Chat, an encrypted messenger.</DocP>
          <DocH2>Ledger Chat Confidentiality</DocH2>
          <DocP>Confidentiality of message bodies rests on the XMTP/WebRTC stack, not on a live zero-knowledge proof. Transport is peer-to-peer or via decentralized relays.</DocP>
          <DocH2>Zero-Knowledge Integration</DocH2>
          <DocP>Circuits for Aztec exist in the repository (under <code>noir-projects/</code>) and are not connected to the current frontend interface. The endpoint named as a prover currently functions as a message-authentication code (HMAC).</DocP>
          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

      {slug === 'app-hub' && (
        <>
          <DocH1>App Hub</DocH1>
          <DocTag>Living</DocTag>
          <DocP><strong>Purpose:</strong> Document the availability of modules within the workspace.</DocP>
          <DocH2>Available Modules</DocH2>
          <ul className="list-disc pl-5 mb-6 text-[15px] text-black/70 space-y-2">
            <li><strong>Ledger Chat:</strong> Beta (Live)</li>
          </ul>
          <DocH2>Locked Modules</DocH2>
          <DocP>The following modules are in development or under repair and are not usable in the public release:</DocP>
          <ul className="list-disc pl-5 mb-6 text-[15px] text-black/70 space-y-2">
            <li>Dashboard</li>
            <li>Markets</li>
            <li>Studio Provenance</li>
            <li>Governance</li>
            <li>Network</li>
            <li>Academy</li>
            <li>QDS Token</li>
          </ul>
          <DocP className="text-sm text-gray-500 mt-8">Last reviewed: August 27, 2026</DocP>
        </>
      )}

    </DocsShell>
  );
}
