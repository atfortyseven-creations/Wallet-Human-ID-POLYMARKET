export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          The Whitepaper
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The structural evolution of decentralized finance mandates a transition from universally transparent ledgers to privacy-preserving architectures. This whitepaper formally introduces our implementation of a sovereign, institutional-grade financial network operating exclusively via zero-knowledge succinct non-interactive arguments of knowledge on the Aztec network. We present a mathematical framework for executing complex state transitions without revealing the underlying operational data to public validators.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          The Transparency Problem
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Legacy blockchain ecosystems force market participants into a state of absolute informational vulnerability. The broadcasting of wallet balances, trade sizes, and strategic capital movements enables maximal extractable value exploitation, front-running, and systemic surveillance. For institutional capital to safely migrate on-chain, confidentiality cannot remain an optional layer; it must be an inescapable default built into the consensus mechanism itself.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Our protocol solves this by migrating execution logic to the client side. By compiling smart contracts into zero-knowledge circuits, users calculate their own state transitions within secure local enclaves. The broader network only receives the resulting cryptographic proof. This paradigm shift guarantees that while the network mathematically verifies that all rules were followed, it learns absolutely nothing about the nature of the transaction.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Zero-Knowledge Identity and Compliance
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Privacy networks traditionally struggle with regulatory compliance, often becoming havens for unsanctioned activity. We circumvent this limitation by introducing programmable identity attestations. Institutional actors can issue encrypted compliance credentials directly to user wallets. Users can then mathematically prove they possess these credentials, satisfying anti-money laundering requirements without ever exposing their actual identity to the counterparties or the public ledger.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This system of cryptographic nullifiers and encrypted notes fundamentally redefines financial autonomy. By utilizing the Aztec architecture, our network provides a sovereign sanctuary where capital efficiency, regulatory adherence, and absolute privacy coalesce perfectly. We are not conceptualizing the future of private finance; we are currently running it.
        </p>
      </div>
    </div>
  );
}
