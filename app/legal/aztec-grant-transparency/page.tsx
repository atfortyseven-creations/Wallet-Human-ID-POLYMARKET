export default function AztecTransparencyPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          Aztec Grant Transparency Report
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This document serves as a comprehensive transparency report detailing the allocation, progress, and architectural deployment of the resources provided by the Aztec Foundation. Our mandate is to engineer an uncompromisingly private, institutional-grade financial network, and we believe that radical transparency in our development process is essential to maintaining the trust of the cryptographic community.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Zero-Mock Data Mandate
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          A fundamental directive of our development ethos is the absolute elimination of simulated environments within our production and testnet deployments. Every metric, forum post, transaction ledger, and identity attestation visible on the network is derived from genuine on-chain interactions or authenticated user databases. We have systematically purged all placeholder artifacts to ensure that validators and grant sponsors audit a legitimate, high-fidelity environment.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          This Zero-Mock policy guarantees that our performance metrics regarding zero-knowledge proof generation and network latency are completely authentic. By interacting directly with the Aztec testnet, our throughput and shielding mechanisms reflect real-world cryptographic constraints and throughput capacities, providing a transparent view of our technical maturity.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Architectural Integration Status
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The integration of Aztec's privacy-preserving layer has moved beyond the conceptual phase and is deeply embedded within our core infrastructure. All components handling sensitive transactional routing, including the Privacy Hub and Shielding Terminals, have been meticulously re-engineered to point exclusively to the Aztec testnet explorer. Legacy interactions with non-private testnets have been fully deprecated and removed from the routing logic.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Moving forward, our engineering resources remain laser-focused on optimizing client-side proof generation and ensuring seamless cross-platform synchronization between our desktop environments and mobile applications. The grant continues to accelerate our mission to establish a sovereign, mathematically private financial ecosystem that refuses to compromise on usability or security.
        </p>
      </div>
    </div>
  );
}
