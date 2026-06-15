export const MODULE_EXPLANATIONS: Record<string, { title: string, subtitle: string, overview: string, features: { title: string, desc: string }[] }> = {
    'dashboard': {
        title: 'Dashboard',
        subtitle: 'Network overview',
        overview: 'A real-time summary of network activity, wallet state, and protocol health. All data is read directly from verified node connections.',
        features: [
            { title: 'Active Data', desc: 'Direct node feeds with no third-party intermediary.' },
            { title: 'Network Health', desc: 'Connection status, latency, and block confirmation monitoring.' },
            { title: 'Unified View', desc: 'Key metrics across all connected accounts and chains.' },
        ]
    },
    'watchlist': {
        title: 'Watchlist',
        subtitle: 'Address monitoring',
        overview: 'Track specific wallet addresses and receive alerts when they move capital. Configuration is stored locally and never sent to the network.',
        features: [
            { title: 'Address Tracking', desc: 'Monitor any on-chain address across supported networks.' },
            { title: 'Custom Alerts', desc: 'Set value thresholds to filter notifications by significance.' },
            { title: 'Local Storage', desc: 'Watchlist configuration stays on your device only.' },
        ]
    },

    'gold': {
        title: 'Identity',
        subtitle: 'Account management',
        overview: 'Manage your cryptographic identity, view your access level, and configure privacy settings for your account.',
        features: [
            { title: 'ZK Verification', desc: 'Biometric liveness proof — unique human status, no personal data disclosed.' },
            { title: 'Access Level', desc: 'View your current permissions and account tier.' },
            { title: 'Session Control', desc: 'Configure auto-lock timers and session security settings.' },
        ]
    },
    'markets': {
        title: 'Markets',
        subtitle: 'Real-time prices',
        overview: 'Active market data sourced directly from major exchanges. Track prices, depth, and capital flows across asset classes.',
        features: [
            { title: 'Depth View', desc: 'Order book depth for major trading pairs.' },
            { title: 'Capital Flow', desc: 'Net flow tracking between exchanges and wallets.' },
            { title: 'Price Index', desc: 'Volume-weighted average across verified sources.' },
        ]
    },
    'newpairs': {
        title: 'New Pairs',
        subtitle: 'Contract deployment monitoring',
        overview: 'Track newly deployed trading contracts as they appear on-chain. Evaluate basic token metrics before the wider market takes notice.',
        features: [
            { title: 'Real-Time Detection', desc: 'Identifies new contracts within seconds of deployment.' },
            { title: 'Structural Review', desc: 'Checks liquidity lock status and supply distribution.' },
            { title: 'Filtering', desc: 'Hide pairs that fail basic validation criteria.' },
        ]
    },
    'omniexplorer': {
        title: 'Explorer',
        subtitle: 'Multi-chain search',
        overview: 'Search transactions, addresses, and blocks across multiple blockchain networks from a single interface.',
        features: [
            { title: 'Multi-Chain', desc: 'Supports Ethereum, Bitcoin, Solana, BNB Chain, and more.' },
            { title: 'Clean Output', desc: 'Translates raw blockchain data into readable formats.' },
            { title: 'No Trackers', desc: 'Search activity is not logged or transmitted externally.' },
        ]
    },
    'brc': {
        title: 'Bitcoin',
        subtitle: 'Bitcoin network view',
        overview: 'Dedicated Bitcoin network monitoring fed directly from Bitcoin Core nodes.',
        features: [
            { title: 'Native Node', desc: 'Data sourced directly from Bitcoin Core.' },
            { title: 'UTXO Tracking', desc: 'Monitor unspent outputs and address balances.' },
            { title: 'Fee Estimation', desc: 'Real-time mempool fee rates for transaction planning.' },
        ]
    },
    'firehose': {
        title: 'Active Feed',
        subtitle: 'Mempool stream',
        overview: 'A direct stream from the network mempool. See large transactions as they are broadcast, before confirmation.',
        features: [
            { title: 'Sub-Second Updates', desc: 'Events delivered as they enter the mempool.' },
            { title: 'Value Threshold', desc: 'Filter the stream to only show transfers above a set size.' },
            { title: 'Structured Events', desc: 'Automatic parsing of transfer type, asset, and routing.' },
        ]
    },
    'sov-intel': {
        title: 'Pattern Analysis',
        subtitle: 'Behavioral correlation',
        overview: 'Identify recurring on-chain patterns across wallets and time periods. Useful for understanding accumulation behavior and capital routing.',
        features: [
            { title: 'Behavioral Patterns', desc: 'Groups wallets by on-chain interaction signatures.' },
            { title: 'Activity History', desc: 'Chronological view of significant movements.' },
            { title: 'Accumulation Trends', desc: 'Tracks net inflow and outflow over configurable windows.' },
        ]
    },
    'inst-ledger': {
        title: 'Explorer',
        subtitle: 'Block explorer',
        overview: 'Browse the Aztec L2 block history, view verified state roots, and look up specific transactions by commitment or nullifier.',
        features: [
            { title: 'State Root History', desc: 'Chronological record of Aztec L2 state anchors.' },
            { title: 'Commitment Search', desc: 'Look up specific note commitments or nullifiers.' },
            { title: 'Export Ready', desc: 'Data structured for compliance and audit use.' },
        ]
    },
    'mass-transfer': {
        title: 'Sync',
        subtitle: 'Record synchronization',
        overview: 'Synchronize your local private state with the latest Aztec L2 note tree. Recover notes from published transaction data if your local database is out of date.',
        features: [
            { title: 'Note Recovery', desc: 'Re-derives your private notes from on-chain encrypted data.' },
            { title: 'Nullifier Check', desc: 'Validates which notes have been spent against the nullifier tree.' },
            { title: 'Progress Tracking', desc: 'Clear progress indicator during full sync operations.' },
        ]
    },
    'graph': {
        title: 'Graph',
        subtitle: 'Relationship visualization',
        overview: 'Visualize the relationships between wallets and transactions as an interactive node graph.',
        features: [
            { title: 'Node Mapping', desc: 'Wallets and contracts represented as interactive nodes.' },
            { title: 'Concentration View', desc: 'Highlights addresses with the highest interaction counts.' },
            { title: 'Smooth Rendering', desc: 'Optimized layout engine for large transaction graphs.' },
        ]
    },
    'defi': {
        title: 'Protocols',
        subtitle: 'DeFi liquidity overview',
        overview: 'Monitor liquidity pools and vault positions across major DeFi protocols.',
        features: [
            { title: 'Yield Metrics', desc: 'Current APR and historical yield data for major pools.' },
            { title: 'Total Value Locked', desc: 'Protocol-level TVL across supported chains.' },
            { title: 'Pool Composition', desc: 'Asset breakdown within each monitored pool.' },
        ]
    },
    'polymarket': {
        title: 'Prediction Markets',
        subtitle: 'Event probabilities',
        overview: 'Real-time probability data from major prediction markets. View the collective market estimate of upcoming global events.',
        features: [
            { title: 'Probability Display', desc: 'Numerical probabilities derived directly from market state.' },
            { title: 'Momentum Tracking', desc: 'Shows how probabilities shift over time.' },
            { title: 'Outcome History', desc: 'Records of resolved markets for reference.' },
        ]
    },
    'forge': {
        title: 'Settings',
        subtitle: 'Application configuration',
        overview: 'Configure your application environment, connection settings, and privacy preferences.',
        features: [
            { title: 'Connection Settings', desc: 'Configure node endpoints and network preferences.' },
            { title: 'Privacy Options', desc: 'Set data handling, stealth mode, and session behavior.' },
            { title: 'Display Preferences', desc: 'Theme, currency display, and layout configuration.' },
        ]
    },
    'live-port': {
        title: 'Portfolio',
        subtitle: 'Balance overview',
        overview: 'A focused view of your current holdings across connected accounts. Balances are read locally — never transmitted.',
        features: [
            { title: 'Multi-Account', desc: 'Aggregates balances across all connected wallets.' },
            { title: 'Local Calculation', desc: 'Portfolio totals computed on your device only.' },
            { title: 'Asset Breakdown', desc: 'Per-asset view with current market values.' },
        ]
    },
    'whale-port': {
        title: 'Whale Watch',
        subtitle: 'Large wallet monitoring',
        overview: 'Observe the public portfolio positions of large on-chain participants. Useful for understanding how major holders are positioned.',
        features: [
            { title: 'Wallet Observation', desc: 'View public holdings of specified addresses.' },
            { title: 'Cost Basis Estimate', desc: 'Infers approximate entry prices from transaction history.' },
            { title: 'Allocation View', desc: 'Visual breakdown of asset distribution.' },
        ]
    },
    'vault': {
        title: 'Vault',
        subtitle: 'Local credential storage',
        overview: 'Securely store API keys and configuration values in local encrypted storage. Nothing is sent to a server.',
        features: [
            { title: 'Local Only', desc: 'Credentials stored in browser encrypted storage, never transmitted.' },
            { title: 'Session Scoped', desc: 'Secrets are cleared when the session ends or the browser closes.' },
            { title: 'Access Control', desc: 'Vault requires wallet authentication to read or write.' },
        ]
    },
    'zk': {
        title: 'ZK Status',
        subtitle: 'Proof verification state',
        overview: 'View the status of your zero-knowledge verification layer and confirm your session is operating within the shielded environment.',
        features: [
            { title: 'PXE Status', desc: 'Confirms the local proving environment is initialized and active.' },
            { title: 'Proof Queue', desc: 'Shows pending and completed proof submissions.' },
            { title: 'Note Count', desc: 'Number of verified private notes in your local state.' },
        ]
    },
    'logs': {
        title: 'Logs',
        subtitle: 'Session activity',
        overview: 'A local record of events from the current session. Useful for reviewing recent actions or diagnosing connection issues.',
        features: [
            { title: 'Event Log', desc: 'Timestamped record of queries, alerts, and state changes.' },
            { title: 'Error Reporting', desc: 'Connection and proof errors recorded for debugging.' },
            { title: 'Local Only', desc: 'Logs are stored in memory only and cleared on disconnect.' },
        ]
    },
    'academy': {
        title: 'Documentation',
        subtitle: 'Technical reference',
        overview: 'Technical documentation covering the Humanity Ledger protocol, Aztec integration, Noir circuits, and the Whale Network.',
        features: [
            { title: 'Protocol Guides', desc: 'Architecture overviews and component documentation.' },
            { title: 'API Reference', desc: 'Complete endpoint specifications with examples.' },
            { title: 'Circuit Specs', desc: 'Noir circuit descriptions and constraint documentation.' },
        ]
    },
    'support': {
        title: 'Support',
        subtitle: 'Technical assistance',
        overview: 'Contact the technical team for help with connection issues, account access, or protocol questions.',
        features: [
            { title: 'Direct Contact', desc: 'Open a support request to reach the technical team.' },
            { title: 'Status Page', desc: 'Current network and API operational status.' },
            { title: 'Documentation Link', desc: 'Quick access to relevant guides for common issues.' },
        ]
    },
    'humanity-ledger': {
        title: 'Roadmap',
        subtitle: 'Protocol development timeline',
        overview: 'An interactive view of the Humanity Ledger development roadmap. Explore delivered, in-progress, and planned protocol components.',
        features: [
            { title: 'Interactive Canvas', desc: 'Drag to pan, scroll to zoom, click nodes for details.' },
            { title: 'Status Tracking', desc: 'Active, building, and planned states for each component.' },
            { title: 'Architecture Summary', desc: 'Layer-by-layer breakdown below the roadmap canvas.' },
        ]
    },
};
