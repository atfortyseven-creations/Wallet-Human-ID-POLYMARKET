export interface NodeSolution {
    id: string;
    name: string;
    description: string;
    price: string;
    performance: string[];
    mode: string[];
    networks: string[];
    category: 'EVM' | 'NON-EVM' | 'ZK' | 'L2' | 'L1';
}

export const NODE_SOLUTIONS: NodeSolution[] = [
    { id: 'eth', name: 'Ethereum', description: 'The bedrock of DeFi and Smart Contracts.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia', 'Hoodi'], category: 'EVM' },
    { id: 'bnb', name: 'BNB Smart Chain', description: 'High-speed, low-cost EVM compatible chain.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'sol', name: 'Solana', description: 'High-performance monolithic blockchain.', price: '$2200', performance: ['High', 'Standard'], mode: ['Full'], networks: ['Mainnet', 'Devnet'], category: 'NON-EVM' },
    { id: 'base', name: 'BASE', description: 'Coinbase-backed Layer 2 on Optimism stack.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia', 'Goerli'], category: 'L2' },
    { id: 'arb-nova', name: 'Arbitrum Nova', description: 'AnyTrust solution for ultra-low fees.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Nova'], category: 'L2' },
    { id: 'arb', name: 'Arbitrum', description: 'The leading L2 Scaling solution for Ethereum.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'L2' },
    { id: 'polygon', name: 'Polygon', description: 'The definitive platform for Web3 scale.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Amoy'], category: 'EVM' },
    { id: 'btc', name: 'Bitcoin', description: 'The original decentralized digital currency.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Testnet'], category: 'NON-EVM' },
    { id: 'sui', name: 'Sui', description: 'Object-centric L1 for fast execution.', price: '$1700', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'tron', name: 'Tron', description: 'High-throughput Elite network.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'ton', name: 'TON', description: 'The Open Network for Telegram integration.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'NON-EVM' },
    { id: 'opbnb', name: 'opBNB', description: 'Optimistic L2 on BNB Smart Chain.', price: '$1100', performance: ['High', 'Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'L2' },
    { id: 'op', name: 'Optimism', description: 'Low-cost and lightning-fast Ethereum L2.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'L2' },
    { id: 'avax', name: 'Avalanche', description: 'Blazing fast, customizable subnet architecture.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'btc-cash', name: 'Bitcoin Cash', description: 'Decentralized peer-to-peer electronic cash.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Testnet'], category: 'NON-EVM' },
    { id: 'sonic', name: 'Sonic (Fantom)', description: 'The evolved evolution of Fantom Opera.', price: '$1200', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'EVM' },
    { id: 'zcash', name: 'ZCash', description: 'Privacy-preserving decentralized finance.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'cronos', name: 'Cronos', description: 'EVM chain on the Cosmos SDK.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'EVM' },
    { id: 'cronos-zkevm', name: 'Cronos zkEVM', description: 'Hyper-scalable ZK L2 solution.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'L2' },
    { id: 'sei', name: 'SEI', description: 'Fastest L1 for digital asset exchanges.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'ripple', name: 'Ripple', description: 'Real-time settlement for global payments.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'cardano', name: 'Cardano', description: 'Proof-of-stake blockchain with smart contracts.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'scroll', name: 'Scroll', description: 'Bytecode-equivalent zkEVM L2.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'ZK' },
    { id: 'kusama', name: 'Kusama', description: 'Polkadot canary network for innovation.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Asset-Hub'], category: 'NON-EVM' },
    { id: 'linea', name: 'Linea', description: 'ConsenSys powered Type 2 zkEVM.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'ZK' },
    { id: 'filecoin', name: 'Filecoin', description: 'Decentralized storage network for Web3.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'zksync', name: 'ZKsync', description: 'ZK-rollups powered L2 scaling solutions.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'ZK' },
    { id: 'rollux', name: 'Rollux', description: 'Optimistic rollup anchored to Bitcoin hash.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'L2' },
    { id: 'kaia', name: 'Kaia', description: 'Next-gen L1 for digital infrastructure.', price: '$1100', performance: ['High', 'Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'polygonzkevm', name: 'Polygon zkEVM', description: 'ZK-powered Ethereum scaling platform.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Cardona'], category: 'ZK' },
    { id: 'litecoin', name: 'Litecoin', description: 'The silver to Bitcoins gold.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Testnet'], category: 'NON-EVM' },
    { id: 'aptos', name: 'Aptos', description: 'Layer 1 built for safe, scalable Web3.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'algorand', name: 'Algorand', description: 'Carbon-negative, permissionless blockchain.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'NON-EVM' },
    { id: '0g', name: '0g', description: 'Modular infrastructure for massive datasets.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'abstract', name: 'Abstract', description: 'The L2 for developers and creators.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'L2' },
    { id: 'akash', name: 'Akash', description: 'Decentralized open-source cloud computing.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'allora', name: 'Allora', description: 'Analytics-driven decentralized network.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Testnet'], category: 'NON-EVM' },
    { id: 'atleta', name: 'Atleta', description: 'Blockchain for high-performance sports.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'avail', name: 'Avail', description: 'Modular data availability layer.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'L1' },
    { id: 'axelar', name: 'Axelar', description: 'Universal cross-chain communication.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'b3', name: 'B3', description: 'High-speed modular infrastructure.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'L2' },
    { id: 'berachain', name: 'Berachain', description: 'DeFi-focused L1 on Cosmos SDK.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'blast', name: 'Blast', description: 'The only L2 with native yield.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Sepolia'], category: 'L2' },
    { id: 'celo', name: 'Celo', description: 'Mobile-first carbon neutral EVM.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Sepolia'], category: 'EVM' },
    { id: 'factom', name: 'Factom', description: 'Data integrity for enterprise logic.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'flow', name: 'Flow', description: 'Consumer-scale blockchain for creators.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'gnosis', name: 'Gnosis Chain', description: 'Resilient and community-run network.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'hive', name: 'Hive', description: 'Social media network on the blockchain.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'monad', name: 'Monad', description: 'High-performance parallel EVM L1.', price: '$1000', performance: ['Standard'], mode: ['Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'near', name: 'Near Protocol', description: 'Sharded L1 for infinite scalability.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'neo', name: 'NEO', description: 'Smart economy network architecture.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'polkadot', name: 'Polkadot', description: 'The multichain heterogeneous network.', price: '$1000', performance: ['Standard'], mode: ['Full', 'Archive'], networks: ['Mainnet', 'Asset-Hub'], category: 'NON-EVM' },
    { id: 'rootstock', name: 'Rootstock', description: 'Bitcoin sidechain for smart contracts.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'EVM' },
    { id: 'starknet', name: 'StarkNet', description: 'Validity rollup L2 on Ethereum.', price: '$1000', performance: ['High', 'Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet', 'Testnet'], category: 'ZK' },
    { id: 'waves', name: 'Waves', description: 'Universal blockchain for Web3 assets.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'wax', name: 'Wax', description: 'The king of NFT blockchains.', price: '$', performance: ['Standard', 'High'], mode: ['Full'], networks: ['Mainnet'], category: 'NON-EVM' },
    { id: 'worldchain', name: 'World Chain', description: 'High-performance L2 for identity and finance.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'L2' },
    { id: 'zora', name: 'Zora', description: 'The L2 for the imagination.', price: '$1000', performance: ['Standard'], mode: ['Archive', 'Full'], networks: ['Mainnet'], category: 'L2' }
];
