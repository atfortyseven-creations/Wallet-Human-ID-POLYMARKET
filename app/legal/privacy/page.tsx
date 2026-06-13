export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          Privacy Policy
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Privacy within this network is not treated as a feature, but as the fundamental architectural baseline. This policy outlines how the protocol manages state transitions and identity attestations without exposing the underlying data to the public internet or centralized servers. We do not engage in the harvesting, monetization, or transmission of personal information.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Default-Private Infrastructure
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Every action performed within the shielded environment, from establishing a secure communication channel to executing a financial transaction, is enveloped in a zero-knowledge succinct non-interactive argument of knowledge. This guarantees that validators on the Aztec testnet only process the cryptographic proof of correctness, never the inputs themselves. The sender, receiver, and the transaction value remain structurally hidden from external observers.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Communication across devices, such as the cryptographic pairing between the mobile application and the desktop terminal, occurs via ephemeral encrypted websockets. Once the session is terminated or destructed, all transient keys are instantly purged from memory, leaving no residual metadata that could be exploited for surveillance or network analysis.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          On-Chain Anonymity Sets
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          To prevent forensic blockchain analysis from deanonymizing our users, the network relies on highly dense anonymity sets. When a user interacts with the protocol, their interaction is merged cryptographically with thousands of simultaneous state transitions. This creates an impenetrable cryptographic fog where the origin and destination of specific interactions cannot be mapped.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          In cases where the user opts to participate in the public forum or the transparent ledger layers, pseudonymity is strictly maintained. The system relies entirely on secure cryptographic nullifiers to prevent double-spending or sybil attacks, ensuring absolute system integrity without requiring the sacrifice of the user's fundamental right to financial and communicative privacy.
        </p>
      </div>
    </div>
  );
}
