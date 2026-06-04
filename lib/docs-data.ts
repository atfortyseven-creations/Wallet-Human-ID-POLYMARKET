export interface DocSection {
  title: string;
  category: string;
  content: string[];
}

export const docsData: Record<string, DocSection> = {
  // PROTOCOL
  "security": {
    title: "Security Architecture",
    category: "Protocol",
    content: [
      "Our system employs a comprehensive security architecture designed to protect sensitive financial and personal data against advanced threats. By operating on a zero-trust model, every requestwhether originating from an internal microservice or an external clientmust be fully authenticated, authorized, and continuously validated before access is granted. This foundational principle ensures that no entity is trusted by default.",
      "The architecture is built upon industry-standard cryptographic primitives. We utilize elliptic curve cryptography, specifically the secp256k1 curve, which provides robust security with minimal computational overhead. All data in transit is encrypted using Transport Layer Security (TLS) 1.3, ensuring that man-in-the-middle attacks are mathematically unfeasible. Furthermore, data at rest is encrypted using AES-256-GCM, managed by isolated hardware security modules (HSMs).",
      "To prevent lateral movement within the network, we have implemented strict network micro-segmentation. Each service operates within its own isolated virtual private cloud (VPC) subnet, with strict egress and ingress firewall rules. Application programming interfaces (APIs) are exposed only through a centralized gateway that performs deep packet inspection, rate limiting, and anomaly detection in real-time."
    ]
  },
  "mempool": {
    title: "Mempool Analysis",
    category: "Protocol",
    content: [
      "Mempool analysis is a critical component for understanding pending transactions before they are confirmed on the blockchain. Our infrastructure connects directly to a globally distributed network of full nodes, allowing us to ingest and process unconfirmed transactions with sub-millisecond latency. This provides our users with a comprehensive view of network activity and transaction sequencing.",
      "Upon ingestion, each transaction is parsed to extract metadata such as gas price, gas limit, sender, receiver, and execution data. We employ a highly optimized Rust-based indexer that categorizes these transactions into specific cohorts based on their complexity and economic value. This categorization enables advanced analytics, such as predicting block inclusion probabilities and identifying potential front-running or sandwich attacks.",
      "Developers can access this normalized mempool data via our WebSocket API or through historical REST endpoints. The data is continuously cleaned to filter out invalid or dropped transactions, ensuring that your trading algorithms and analytical models are operating on the most accurate and up-to-date information available."
    ]
  },
  "anomalies": {
    title: "Anomaly Detection",
    category: "Protocol",
    content: [
      "Our anomaly detection engine utilizes advanced statistical methods and machine learning algorithms to identify irregular patterns in network traffic and transaction volume. By establishing a dynamic baseline of normal network behavior, the system can autonomously flag deviations that may indicate coordinated attacks, network congestion, or significant market events.",
      "The core of this engine is based on calculating the Z-score of various metrics, such as transaction frequency and gas utilization, over rolling time windows. When a metric deviates from the mean by a statistically significant margin, an alert is triggered. These alerts are categorized by severity and immediately broadcasted through our WebSocket channels, allowing integrated systems to react autonomously.",
      "In addition to statistical methods, we incorporate unsupervised learning models that cluster transaction behaviors. This allows us to identify novel attack vectors and emerging trends without relying on predefined signatures. This proactive approach to security and analytics ensures that our infrastructure remains resilient against evolving threats and market dynamics."
    ]
  },
  "edge": {
    title: "Edge Computing",
    category: "Protocol",
    content: [
      "To guarantee low latency and high availability across the globe, our infrastructure leverages a robust edge computing network. Instead of routing all requests to a centralized data center, we deploy lightweight application runtimes and caching layers directly to edge nodes situated in hundreds of cities worldwide. This significantly reduces the physical distance between the end-user and the computational resources.",
      "Our edge nodes are responsible for terminating TLS connections, verifying authentication tokens, and serving static assets. Furthermore, they execute serverless functions that perform data validation and routing before the request ever reaches our core infrastructure. This decentralized approach not only improves performance but also provides a massive buffer against Distributed Denial of Service (DDoS) attacks.",
      "Data consistency across the edge network is maintained through a distributed Key-Value store that propagates state changes globally in under 500 milliseconds. This ensures that users experience a seamless and synchronous application state, regardless of their geographical location, while developers benefit from a highly scalable and fault-tolerant deployment architecture."
    ]
  },

  // IDENTITY & AUTH
  "mobile-auth": {
    title: "Mobile Authentication",
    category: "Identity & Auth",
    content: [
      "We provide a seamless and secure mobile authentication flow designed to eliminate the vulnerabilities associated with traditional passwords. Utilizing standard protocols such as OAuth 2.0 and OpenID Connect, our mobile authentication module allows users to verify their identity using their personal mobile devices as hardware authenticators.",
      "The process typically involves a QR code handshake. When a user attempts to access the platform on a desktop device, a unique, time-sensitive QR code is generated. The user scans this code using our secure mobile application, which signs a challenge cryptographically using keys stored in the device's Wallet. This out-of-band authentication method is highly resistant to phishing and credential stuffing attacks.",
      "Once the challenge is successfully signed and verified by our servers, a secure session is established. This session is bound to both the specific device and the geographical location, providing an additional layer of contextual security. Developers can easily integrate this flow using our provided SDKs, significantly reducing the friction of onboarding while maximizing security."
    ]
  },
  "biometrics": {
    title: "Biometric Verification",
    category: "Identity & Auth",
    content: [
      "Biometric verification represents the highest tier of identity assurance within our system. By integrating with leading biometric identity providers, we enable the verification of unique human users while strictly adhering to privacy and data protection regulations, such as GDPR and CCPA.",
      "The system utilizes zero-knowledge proofs to verify biometric claims. When a user undergoes biometric verification (e.g., facial recognition or iris scanning) through an integrated hardware provider, the provider generates a cryptographic proof that the user is a unique, living human. Our servers verify this mathematical proof without ever receiving, processing, or storing the actual biometric data.",
      "This separation of verification and data storage ensures that user privacy is absolute. The verified status is then linked to an anonymized decentralized identifier (DID), allowing the user to access restricted platform features, participate in governance, or prevent Sybil attacks, all without compromising their personal identity."
    ]
  },
  "sessions": {
    title: "Session Management",
    category: "Identity & Auth",
    content: [
      "Robust session management is crucial for maintaining state and security across the application lifecycle. Our system implements short-lived, cryptographically secure JSON Web Tokens (JWTs) to manage user sessions. These tokens contain only essential claims and are signed using asymmetric cryptography to prevent tampering.",
      "To mitigate the risk of token theft, access tokens have a maximum lifespan of 15 minutes. To maintain a continuous user experience, we employ secure, HttpOnly, and SameSite refresh tokens. When an access token expires, the client application automatically requests a new one using the refresh token. This process is transparent to the user and ensures that sessions can be instantly revoked if suspicious activity is detected.",
      "Furthermore, every session is monitored for anomalies. If a session exhibits irregular behavior, such as sudden changes in IP address or unusual request patterns, our automated security protocols will immediately invalidate the session and require the user to re-authenticate. This proactive monitoring is standard across all integrated applications."
    ]
  },
  "signatures": {
    title: "Digital Signatures",
    category: "Identity & Auth",
    content: [
      "Digital signatures form the bedrock of data integrity and non-repudiation within our platform. Every critical action, configuration change, and data payload must be cryptographically signed by the responsible entity before it is accepted by our system.",
      "We utilize the ECDSA (Elliptic Curve Digital Signature Algorithm) standard. When a client wishes to submit data, it hashes the payload using SHA-256 and signs the hash with its private key. The server then independently hashes the received payload and verifies the signature using the client's public key. If the signatures match, the system is mathematically guaranteed that the data has not been altered in transit and that it originated from the authorized client.",
      "This standard is applied uniformly across the platform, from authenticating REST API requests to verifying the integrity of WebSocket streams. It provides an auditable, immutable record of all system interactions, ensuring absolute accountability for both users and automated services."
    ]
  },

  // STORAGE & DATA
  "routing": {
    title: "Transaction Routing",
    category: "Storage & Data",
    content: [
      "Efficient transaction routing is essential for processing high volumes of data reliably. Our infrastructure employs a highly optimized, distributed routing layer that directs incoming data streams to the appropriate processing nodes based on content, priority, and current system load.",
      "This routing layer utilizes a Kafka-based event streaming platform. When a transaction is ingested, it is published to a specific topic partition. Consumer groups, consisting of scalable processing microservices, subscribe to these topics and process the data in parallel. This decoupling of ingestion and processing allows the system to handle massive spikes in traffic without degrading performance.",
      "Furthermore, the routing system includes intelligent retry mechanisms and dead-letter queues to handle processing failures gracefully. If a microservice encounters an error while processing a transaction, the routing layer will automatically retry the operation or reroute the data to an alternative node, ensuring zero data loss and maximum system availability."
    ]
  },
  "graph": {
    title: "Graph Database",
    category: "Storage & Data",
    content: [
      "To analyze the complex relationships between millions of entities, traditional relational databases are insufficient. We utilize an advanced Graph Database to store and query highly interconnected data, allowing us to uncover hidden patterns and dependencies that would otherwise remain invisible.",
      "In our graph model, entities such as wallets, smart contracts, and IP addresses are represented as nodes, while transactions and interactions are represented as edges connecting these nodes. This architecture allows us to perform deep, multi-hop traversals in milliseconds. For example, we can instantly trace the flow of funds through dozens of intermediary addresses to identify the ultimate source or destination.",
      "Developers can query this graph database using standardized query languages. This capability is invaluable for compliance monitoring, risk assessment, and advanced market research, providing an unprecedented level of visibility into the structural dynamics of the network."
    ]
  },
  "storage": {
    title: "Transient Storage",
    category: "Storage & Data",
    content: [
      "Certain computational processes require the rapid storage and retrieval of temporary data without the overhead of persisting it to disk. We implement a high-performance transient storage layer utilizing distributed, in-memory data structures like Redis.",
      "This storage layer is used extensively for caching frequently accessed data, managing rate limits, and maintaining the state of active WebSocket connections. By keeping this data entirely in Random Access Memory (RAM), we achieve read and write latencies in the microsecond range. This is essential for applications that require real-time responsiveness, such as trading interfaces and live analytics dashboards.",
      "Data in the transient storage layer is highly volatile and is typically configured with strict Time-To-Active (TTL) parameters. Once the TTL expires, the data is automatically evicted, ensuring that memory usage remains optimized and that the system does not retain unnecessary state. This architectural choice maximizes throughput while minimizing infrastructure costs."
    ]
  },
  "blocks": {
    title: "Block Analysis",
    category: "Storage & Data",
    content: [
      "Our platform provides comprehensive tools for deep block analysis, allowing developers to extract and interpret historical data with absolute precision. We maintain a fully indexed, immutable archive of all network blocks, organized for rapid sequential and parallel querying.",
      "The block analysis engine allows users to retrieve complete block headers, transaction receipts, and state diffs. By analyzing the state changes that occur within a specific block, developers can reconstruct the exact execution path of smart contracts and verify the final balances of all involved accounts. This level of detail is critical for auditing and historical research.",
      "To facilitate large-scale data extraction, we offer batch processing APIs and direct database exports. Researchers can download terabytes of normalized block data for offline analysis, training machine learning models, or conducting academic studies on network economics and consensus dynamics."
    ]
  },

  // NETWORK LAYER
  "websockets": {
    title: "WebSocket API",
    category: "Network Layer",
    content: [
      "The WebSocket API is the primary interface for receiving real-time data streams from our platform. Unlike standard HTTP requests, WebSockets establish a persistent, full-duplex communication channel between the client and the server, allowing data to be pushed to the client the moment it becomes available.",
      "To connect, clients must initiate a standard HTTP upgrade request, authenticated via a cryptographically signed token. Once the connection is established, the client can subscribe to specific data channels, such as live transaction feeds, price updates, or system alerts. The server will then continuously push JSON-formatted payloads to the client as events occur.",
      "Our WebSocket infrastructure is built to handle hundreds of thousands of concurrent connections. It includes automatic ping/pong heartbeats to detect and close dead connections, as well as automatic reconnection logic to ensure uninterrupted service. Developers must implement robust handling for these events to maintain a stable integration."
    ]
  },
  "secure-comm": {
    title: "Secure Communication",
    category: "Network Layer",
    content: [
      "All communication within our network, and between our network and external clients, is secured using industry-standard encryption protocols. We mandate the use of Transport Layer Security (TLS) version 1.3 for all HTTP and WebSocket connections, ensuring the confidentiality and integrity of data in transit.",
      "TLS 1.3 provides significant improvements over previous versions, including faster handshake processes and the removal of obsolete cryptographic algorithms. This ensures that our communication channels are protected against modern eavesdropping and tampering techniques. We utilize strong cipher suites, prioritizing Forward Secrecy, so that even if a private key is compromised in the future, past communications cannot be decrypted.",
      "For internal microservice communication, we employ a service mesh architecture with mutual TLS (mTLS). This means that not only does the client verify the server's certificate, but the server also verifies the client's certificate. This strict mutual authentication guarantees that only authorized internal services can interact with one another, effectively neutralizing the threat of internal network breaches."
    ]
  },
  "caching": {
    title: "Distributed Caching",
    category: "Network Layer",
    content: [
      "To minimize latency and reduce the load on our primary databases, we implement a comprehensive distributed caching strategy. Frequently requested data, such as market summaries, API configurations, and static assets, are stored in a distributed in-memory cache that spans multiple availability zones.",
      "When a client requests data, the system first checks the cache. If the data is present (a cache hit), it is returned immediately, typically within milliseconds. If the data is not present (a cache miss), the system queries the primary database, returns the result to the client, and simultaneously populates the cache for future requests. This read-through caching mechanism significantly improves overall system responsiveness.",
      "Cache invalidation is handled programmatically to ensure data consistency. When the underlying data changes, the corresponding cache entries are automatically purged or updated. We utilize a combination of Time-To-Active (TTL) expiration and event-driven invalidation to balance performance with accuracy, providing developers with fast, reliable access to platform data."
    ]
  },
  "fallbacks": {
    title: "System Fallbacks",
    category: "Network Layer",
    content: [
      "High availability is a core requirement of our infrastructure. To ensure continuous operation even in the face of hardware failures or network disruptions, we have engineered robust system fallbacks and redundancy mechanisms across all critical components.",
      "Our services are deployed across multiple geographically diverse data centers. We utilize global load balancing to direct traffic to the healthiest and closest nodes. If an entire data center experiences an outage, the load balancer automatically reroutes traffic to the remaining operational facilities. This failover process occurs in seconds, often without the end-user experiencing any interruption.",
      "At the database layer, we employ real-time synchronous replication to standby clusters. In the event of a primary database failure, the system automatically promotes a standby node to primary status, ensuring zero data loss and minimal downtime. Developers building on our platform can rely on this resilient architecture to support their mission-critical applications."
    ]
  },

  // INTEGRATIONS
  "worldid": {
    title: "WorldID Protocol",
    category: "Integrations",
    content: [
      "Our platform integrates natively with the WorldID protocol to provide secure, privacy-preserving proof of humanity. WorldID allows users to verify that they are unique individuals without revealing any personal identifying information, effectively solving the problem of Sybil attacks in digital networks.",
      "The integration utilizes WorldID's zero-knowledge proof verification endpoints. When a user authenticates, the World App generates a cryptographic proof. Our servers verify this proof against the WorldID smart contracts, ensuring the user's uniqueness. This verification process is completely anonymous; we receive a nullifier hash that proves uniqueness but cannot be linked to the user's real-world identity.",
      "Developers can leverage this integration to gate access to specific features, distribute rewards fairly, or prevent automated bot activity within their applications. By relying on a standardized, decentralized identity protocol, we enhance the security and fairness of the platform while maintaining absolute respect for user privacy."
    ]
  },
  "cloudflare": {
    title: "Cloudflare Workers",
    category: "Integrations",
    content: [
      "We utilize Cloudflare Workers to deploy serverless functions directly to the network edge. This integration allows us to execute custom logic, such as request routing, security filtering, and response modification, mere milliseconds away from the end-user, drastically improving performance.",
      "By moving logic to the edge, we reduce the burden on our core infrastructure. For example, Cloudflare Workers handle initial API key validation, rate limiting checks, and the serving of cached responses. Only requests that require complex processing or database interactions are forwarded to our central servers.",
      "This serverless architecture is inherently scalable. As traffic increases, Cloudflare automatically spins up additional worker instances across its global network to handle the load. This ensures that our platform remains responsive and highly available, regardless of sudden spikes in user activity or geographical distribution."
    ]
  },
  "railway": {
    title: "Railway Hosting",
    category: "Integrations",
    content: [
      "Our core microservices and backend infrastructure are deployed using the Railway hosting platform. Railway provides a robust, developer-friendly environment for orchestrating containerized applications, databases, and continuous integration pipelines.",
      "The integration with Railway allows for rapid, automated deployments. Whenever code is merged into our production branches, Railway automatically builds the Docker containers and deplons them to isolated environments. This continuous delivery model ensures that updates and security patches are rolled out swiftly and reliably.",
      "Furthermore, Railway provides automated scaling and comprehensive infrastructure monitoring. The platform continuously monitors CPU and memory usage, automatically allocating additional resources during high-traffic periods to maintain optimal performance. This managed infrastructure allows our engineering team to focus entirely on protocol development rather than server maintenance."
    ]
  },
  "evm": {
    title: "EVM Compatibility",
    category: "Integrations",
    content: [
      "Our systems are built with full compatibility with the Ethereum Virtual Machine (EVM) standard. This integration ensures that our analytical tools, data pipelines, and developer APIs can seamlessly interact with Ethereum and all other EVM-compatible networks, such as Polygon, Arbitrum, and Optimism.",
      "We utilize standard RPC protocols and web3 libraries to ingest blocks, decode smart contract events, and simulate transactions. Because the EVM provides a standardized execution environment, our tools can be applied uniformly across multiple chains without requiring custom adaptations for each network.",
      "Developers familiar with Solidity and standard web3 tooling will find our platform highly intuitive. Our APIs return data formatted according to EVM standards, and our documentation includes examples utilizing popular libraries like Ethers.js and Web3.py, streamlining the integration process for blockchain developers."
    ]
  },

  // LEGAL & ETHICS
  "independence": {
    title: "Data Independence",
    category: "Legal & Ethics",
    content: [
      "Data independence is a fundamental tenet of our operational philosophy. We engineer our systems to ensure that users maintain complete control and ownership over their personal and financial data. We reject the standard industry practice of monetizing user telemetry or selling access to third-party data brokers.",
      "Our architecture is designed to minimize data collection. We only process the information strictly necessary to provide our services. Wherever possible, data is anonymized or pseudonymized at the point of ingestion. For instance, user sessions are managed via ephemeral cryptographic hashes rather than permanent identifiers.",
      "Users have the right to request the complete deletion of their data at any time. Our systems are built to ensure that such deletion requests are executed thoroughly and irreversibly across all active databases and backups, ensuring absolute compliance with global data systemty regulations."
    ]
  },
  "user-rights": {
    title: "User Rights",
    category: "Legal & Ethics",
    content: [
      "We are committed to upholding the highest standards of user rights and digital consumer protection. Our policies are aligned with global frameworks such as the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), ensuring that our users have transparent and enforceable rights regarding their interaction with our platform.",
      "Users have the right to full transparency regarding how their data is processed. We provide clear, plain-language documentation explaining our data practices. Furthermore, users have the right to access any data we hold about them, the right to correct inaccuracies, and the right to export their data in a standard, machine-readable format.",
      "If a user believes their rights have been violated, we provide a direct and responsive channel for arbitration and resolution. We view user rights not as a legal burden, but as a core component of the trust required to operate a reliable and secure technology platform."
    ]
  }
};
