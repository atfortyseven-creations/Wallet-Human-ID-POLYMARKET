export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-24 selection:bg-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-12 border-b border-zinc-900 pb-8">
          API Documentation
        </h1>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          The network provides a robust, high-performance Application Programming Interface designed for institutional developers and algorithmic integrators. This interface allows direct interaction with the zero-knowledge routing layers, shielding mechanisms, and the sovereign communication protocol without requiring deep proficiency in the underlying cryptographic primitives.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          Authentication and Access Control
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Access to the programmatic endpoints is strictly gated through cryptographic signature verification. Developers must authenticate by signing a standardized deterministic message using their registered cryptographic keypair. This process yields a session-specific JSON Web Token, which must be injected into the authorization header of all subsequent HTTPS requests. We employ ultra-short expiration windows for these tokens to aggressively mitigate the risk of session hijacking or replay attacks.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          For persistent server-to-server connections, the network supports the generation of scoped API keys. These keys are mathematically bound to specific smart contract interaction permissions and can be instantly revoked through the decentralized registry. The API strictly enforces rate limits at the edge layer, ensuring extreme availability even during periods of intense market volatility.
        </p>

        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-200 mt-16 mb-6">
          WebSockets and Real-Time State
        </h2>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          To facilitate algorithmic trading and live data synchronization, the API exposes a low-latency WebSocket connection. This persistent channel streams encrypted state updates directly from the Aztec testnet, allowing client applications to maintain perfect synchronicity with the network without the overhead of continuous HTTP polling. The WebSocket connection requires an initial handshake carrying the cryptographic session token to validate the connection upgrade.
        </p>

        <p className="text-sm md:text-base text-zinc-400 leading-loose text-justify mb-6">
          Developers utilizing the WebSocket endpoints must be prepared to handle transient disconnections gracefully. The network architecture mandates aggressive connection culling for dormant sockets to preserve core routing bandwidth. Implementing a standard exponential backoff algorithm for reconnection attempts is highly recommended for all institutional integrations.
        </p>
      </div>
    </div>
  );
}
