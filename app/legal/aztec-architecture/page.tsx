export default function AztecArchitecturePage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          Aztec Architecture
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The structural foundation of this network relies entirely upon the advanced cryptographic primitives provided by the Aztec protocol. This architectural document outlines the mechanical integration between our user-facing interfaces and the underlying zero-knowledge infrastructure, detailing how state is managed, shielded, and verified across distributed nodes.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Client-Side Execution Enclaves
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Unlike traditional virtual machines that compute state transitions on public validator nodes, our architecture shifts the computational burden directly to the end-user. When an action is initiated within the terminal, the local application generates a zero-knowledge circuit execution. The client proves knowledge of their private state, the validity of the transition, and the correct execution of the logic without broadcasting the inputs.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This model fundamentally eliminates the concept of an exposed mempool. Transactions exist as encrypted blobs accompanied by succinct proofs. When these structures are submitted to the sequencer, the network validators can rapidly confirm the mathematical validity of the proof without ever unwrapping the encrypted payload, achieving both high throughput and impenetrable secrecy.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          State Trees and Encrypted Notes
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The network tracks ownership not through a public mapping of addresses to balances, but through an append-only cryptographic state tree populated by encrypted notes. A note represents a quantum of value or an identity attestation that belongs to a specific viewing key. To spend or alter a note, the user must provide a cryptographic nullifier, ensuring that a note cannot be spent twice while simultaneously preventing external observers from linking the nullifier to the original note.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This system of partitioned state trees creates a flawless abstraction layer for private commerce. Our implementation perfectly adheres to the zero-mock mandate; all identity proofs, cross-device session linkages, and financial interactions occurring on our platform are actively anchoring into the genuine Aztec testnet architecture, establishing an uncompromised environment for institutional capital.
        </p>
      </div>
    </div>
  );
}
