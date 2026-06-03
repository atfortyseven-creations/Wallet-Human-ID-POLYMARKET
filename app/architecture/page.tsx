import DocLayout from '@/components/layout/DocLayout';
import { Network, Smartphone, KeyRound, Shield, MessageSquare, HardDrive, Scan, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ArchitecturePage() {
    return (
        <DocLayout
            title="System Architecture Protocol"
            description="A formal technical specification of the Humanity Ledger infrastructure, detailing cryptographic primitives, state transitions, and privacy-preserving consensus mechanisms."
            lastUpdated="June 3, 2026"
            category="Technical Specification"
        >
            <div className="space-y-16 text-[#050505]">
                {/* 1. Protocol Overview */}
                <section>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">1. Protocol Overview</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            This document serves as the formal architectural specification for the Humanity Ledger protocol. The system is designed to provide privacy-preserving state transitions for financial interactions and identity attestation, leveraging zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs).
                        </p>
                        <p>
                            Unlike conventional transparent ledgers that broadcast unencrypted state data to all network participants, Humanity Ledger operates under a default-private model. Key generation, witness construction, and proof computation occur strictly within isolated local execution environments. The protocol ensures that validation networks receive only cryptographic proofs of correctness, thereby preserving the confidentiality of the underlying inputs.
                        </p>
                    </div>
                </section>

                {/* 2. Cryptographic Authentication */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <Network size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">2. Cryptographic Authentication</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Authentication across the protocol utilizes asymmetric cryptography rather than symmetric shared secrets (passwords). Client interactions require the generation of deterministic elliptic curve digital signatures (ECDSA or EdDSA, depending on the client wallet implementation).
                        </p>
                        <p>
                            During the initial handshake, the client signs a uniquely timestamped, server-generated nonce. This establishes proof of private key possession without exposing the private key material to the network. Upon successful validation of the signature against the derived public key, the protocol provisions a stateless session token.
                        </p>
                    </div>
                </section>

                {/* 3. Session State & Access Control */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505]">
                            <KeyRound size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">3. Session State & Access Control</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Session state is maintained via cryptographically signed JSON Web Tokens (JWTs). To mitigate unauthorized access vectors such as Cross-Site Scripting (XSS), the tokens are enforced as `HttpOnly` and `Secure` cookies.
                        </p>
                        <p>
                            API gateways validate the integrity of these tokens using public key infrastructure (PKI) at the edge. The validation process verifies the issuer signature, timestamp constraints, and embedded permission scopes, guaranteeing that only authenticated clients may query the encrypted indexing infrastructure.
                        </p>
                    </div>
                </section>

                {/* 4. Cross-Device Key Exchange */}
                <section className="bg-[#050505] text-white p-10 md:p-14 rounded-3xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                            <Smartphone size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">4. Cross-Device Key Exchange Protocol</h2>
                    </div>
                    <div className="prose prose-lg prose-invert max-w-none text-white/70 space-y-6">
                        <p>
                            Cross-device synchronization is achieved through an Elliptic Curve Diffie-Hellman (ECDH) key exchange protocol, facilitating secure payload transfer without exposing plaintext credentials over intermediary signaling servers.
                        </p>
                        <ul className="list-decimal pl-6 space-y-2">
                            <li>The target device generates an ephemeral secp256k1 keypair and encodes the public key along with a routing UUID into an optical matrix barcode (QR code).</li>
                            <li>The authenticated source device scans the barcode and generates its own ephemeral keypair.</li>
                            <li>The source device computes the shared secret via ECDH using its private key and the target's public key.</li>
                            <li>The session credentials are encrypted utilizing AES-256-GCM authenticated encryption, using a symmetric key derived from the shared secret.</li>
                            <li>The encrypted payload is transmitted to the target device, which computes the identical shared secret to decrypt the payload locally.</li>
                        </ul>
                    </div>
                </section>

                {/* 5. End-to-End Encrypted Messaging */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#050505]">
                            <MessageSquare size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">5. End-to-End Encrypted Communication</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            Peer-to-peer communication is routed through the Extensible Message Transport Protocol (XMTP) network. Message payloads undergo client-side encryption before transmission, ensuring end-to-end confidentiality.
                        </p>
                        <p>
                            Identity keys are derived deterministically from the user's base Ethereum keypair. These keys facilitate the establishment of secure channels using standard public key cryptography methodologies. Protocol nodes serve strictly as data availability layers and cannot access the plaintext message content.
                        </p>
                    </div>
                </section>

                {/* 6. Data Isolation Boundaries */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <HardDrive size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">6. Cryptographic Boundary Definitions</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            The protocol enforces strict separation between local trusted execution environments and remote infrastructure. Data locality is governed by the principle of least privilege.
                        </p>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="bg-white p-6 border border-black/10 rounded-2xl">
                                <h4 className="font-bold text-[#050505] mb-4 text-lg">Local Client Environment</h4>
                                <ul className="space-y-2 text-sm text-[#050505]/70">
                                    <li>• Base Private Keys (Never transmitted)</li>
                                    <li>• Ephemeral Key Exchange Material</li>
                                    <li>• Zero-Knowledge Proving Witnesses</li>
                                    <li>• XMTP Decryption Keys</li>
                                    <li>• IndexedDB State Cache</li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 border border-black/10 rounded-2xl">
                                <h4 className="font-bold text-[#050505] mb-4 text-lg">Remote Infrastructure</h4>
                                <ul className="space-y-2 text-sm text-[#050505]/70">
                                    <li>• Public Wallet Identifiers</li>
                                    <li>• Encrypted State Commitments</li>
                                    <li>• Merkle Tree Nullifier Sets</li>
                                    <li>• Network Routing Information</li>
                                    <li>• Public Forum Ciphertexts</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Zero-Knowledge Execution Environment */}
                <section className="bg-white p-10 md:p-14 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#050505]">
                            <Cpu size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight m-0">7. Zero-Knowledge Execution Environment</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>
                            The protocol relies extensively on the Aztec Network to enable private state transitions. All confidential logic is compiled into constraint systems utilizing the Noir domain-specific language.
                        </p>
                        <p>
                            <strong>State Management:</strong> State variables are stored as encrypted commitments within an append-only Merkle tree. To modify state, the client constructs a zk-SNARK proving the validity of the transition rules without revealing the inputs. To prevent double-spending, the client publishes a deterministic nullifier derived from the consumed state commitment.
                        </p>
                        <p>
                            <strong>Client-Side Proving:</strong> The computationally intensive process of generating cryptographic proofs occurs entirely within the user's browser, utilizing WebAssembly (Wasm) implementations of the Barretenberg proving backend. This guarantees that private inputs (witnesses) are never exposed to remote sequencers or provers.
                        </p>
                        <p>
                            <strong>Account Abstraction:</strong> Interactions with the network utilize Aztec account contracts. These smart contracts decouple the signing mechanism from the transaction execution, allowing for advanced cryptographic authorization models, such as threshold signatures and non-ECDSA signature validation, directly within the zero-knowledge circuit.
                        </p>
                    </div>
                </section>

                {/* 8. Useful Links */}
                <section className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-black/10">
                    <Link href="/legal/privacy" className="flex-1 p-8 bg-white border border-black/10 rounded-2xl hover:bg-white transition-all group flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-[#050505] text-lg mb-1">Privacy Specification</h4>
                            <p className="text-[#050505]/60 text-sm">Review our data minimization frameworks.</p>
                        </div>
                        <ArrowRight className="text-[#050505]/30 group-hover:text-[#050505] transition-colors" />
                    </Link>
                    <Link href="/whitepaper" className="flex-1 p-8 bg-white border border-black/10 rounded-2xl hover:bg-white transition-all group flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-[#050505] text-lg mb-1">Protocol Whitepaper</h4>
                            <p className="text-[#050505]/60 text-sm">Read the formal cryptographic thesis.</p>
                        </div>
                        <ArrowRight className="text-[#050505]/30 group-hover:text-[#050505] transition-colors" />
                    </Link>
                </section>
            </div>
        </DocLayout>
    );
}
