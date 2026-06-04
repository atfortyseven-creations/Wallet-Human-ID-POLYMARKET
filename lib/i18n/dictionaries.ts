export type Locale = 'en';

//  Base dictionary shape (English is the source of truth) 
const en = {
  metadata: {
    title: 'Whale Alert Network',
    description: 'The leading system identity and whale analytics platform.',
  },
  nav: {
    wallet: 'Wallet',
    portfolio: 'Portfolio',
    earn: 'Earn',
    activity: 'Activity',
    whales: 'Whales',
    cards: 'Cards',
    nfc: 'NFC',
    referrals: 'Referrals',
    settings: 'Settings',
    functions: 'Features',
    developer: 'Developers',
    human_card: 'Whale Card',
    support: 'Support',
    network: 'Network',
    vip: 'VIP MEMBER',
    start: 'Launch App',
    wallet_settings: 'Wallet Settings',
  },
  landing: {
    hero: {
        badge: 'Elite Tracking Protocol',
        title: 'Whale Alert Network',
        subtitle: 'System tracking with advanced security, real-time alerts, and unmatched precision.',
        keys: 'Real data. Deep insights.',
        identity: 'Tracking. Data. Alpha.',
        stats: {
            identities: 'Entities',
            secured: 'Monitored',
            decentralized: 'Active'
        },
        accessGranted: 'Dashboard Ready',
        welcome: 'Welcome,',
        syncing: 'Synchronizing network streams...'
    },
    visual: {
        badge: 'Monitoring Network Streams',
        badgeDetected: 'Whale Detected in Mempool',
        title: 'Whale Detection',
        precision: 'High-Precision',
        description: 'Our low-latency architecture connects directly to global Bitcoin nodes to see whale flow before the market reacts.',
        latency: 'Low Latency',
        noiseFilter: 'Noise Filter',
        impactAlert: 'Impact Alert'
    },
    features: {
        title: 'Legendary Analytics',
        hint: 'Continue scrolling or swipe cards to explore more',
        cta: 'KEY BENEFITS',
        que: 'QUEUED',
        tap: 'TAP/SWIPE ',
        feat: 'FEATURE',
        categories: {
            analytics: 'Analytics',
            network: 'Network',
            ai: 'AI Analytics',
            viz: 'Visualization',
            ranking: 'Ranking',
            protocol: 'Protocol'
        },
        items: [
          {
            title: "Whale Movement Alerts",
            category: "Analytics",
            description: "Instant notifications for massive BTC transactions in the mempool.",
            detailedInfo: "Track top holders, elite movements, and Satoshi-era wallets in real-time. Our system monitors every block and transaction to identify whale activity before it hits the exchanges.",
            benefits: ["Custom BTC threshold triggers", "Real-time sonar audio alerts", "One-click address profiling", "Permanent whale watchlist"]
          },
          {
            title: "Real-Time Mempool Explorer",
            category: "Network",
            description: "A high-fidelity view of the Bitcoin mempool and recent blocks.",
            detailedInfo: "Analyze unconfirmed transactions, fee distributions, and block health. Our explorer provides a transparent window into the network's liquidity and pending settlement layers.",
            benefits: ["Low-latency data feed", "Transaction values in satoshis", "Mining pool identification", "Active sync progress monitoring"]
          },
          {
            title: "AI Whale Signals",
            category: "AI Analytics",
            description: "Neural-driven market sentiment based on transaction patterns.",
            detailedInfo: "Our proprietary AI models analyze the flow of funds into and out of exchanges, identifying 'Iceberg orders' and strategic accumulation phases of market makers.",
            benefits: ["Pattern recognition logic", "Volume-weighted sentiment", "Market impact predictions", "Historical correlation data"]
          },
          {
            title: "BTC Flow Visualization",
            category: "Visualization",
            description: "Global flow of Bitcoin across networks and players.",
            detailedInfo: "Visualize how Bitcoin moves between miners, exchanges, and private whale wallets using interactive Sankey and flow diagrams. Understand the velocity of the network at a glance.",
            benefits: ["Interactive Sankey diagrams", "Node-based movement mapping", "Exchange inflow/outflow balance", "Miner distribution tracking"]
          },
          {
            title: "Whale Leaderboard",
            category: "Ranking",
            description: "Rank the top 100 most active BTC wallets by volume.",
            detailedInfo: "Identify the top 100 most influential players in the market. Filter by address type (SegWit, Taproot, Legacy) and track their cumulative received volume across history.",
            benefits: ["Historical volume rankings", "Transaction frequency data", "Wallet label identification", "Direct profile deep-links"]
          },
          {
            title: "Whale Alert Network",
            category: "Protocol",
            description: "Elite identity for the next billion.",
            detailedInfo: "Whale Alert Network is built on the principle of market transparency. We provide verified data directly from the blockchain for professional traders.",
            benefits: ["Verified data streams", "Encrypted data persistence", "Elite grade architecture", "On-chain verification"]
          }
        ]
    },
    swap: {
        badge: 'Premium Network Analytics',
        title: 'Whale Monitoring',
        realtime: 'In Real Time',
        description: 'Advanced detection of whale movements in the Bitcoin Mempool. We guarantee you will always be informed of big flows before anyone else.',
        features: {
            lowLatency: { title: 'Direct Mempool Feed', desc: 'Low-latency connection to global Bitcoin nodes for sub-second data' },
            volume: { title: 'Volume Analysis', desc: 'Intelligent tracking of Satoshi-era wallets and large flows' },
            alerts: { title: 'Real-Time Alerts', desc: 'Customizable sonar alerts for transactions exceeding your BTC threshold' },
            security: { title: 'System Privacy', desc: 'Non-custodial, anonymous monitoring with zero-knowledge data proofs' }
        },
        stats: {
            detection: 'Wallet Detection',
            refresh: 'Sync Refresh',
            data: 'Real Data',
            latency: 'Alert Latency'
        },
        ctaPrimary: 'Try Now',
        ctaPrimaryActive: 'Go to Whale Tracker'
    }
  },
  common: {
    loading: 'Loading...',
    copy: 'Copy',
    copied: 'Copied',
    error: 'Error',
    success: 'Success',
    back: 'Back',
    continue: 'Continue',
    cancel: 'Cancel',
    confirm: 'Confirm',
    retry: 'Retry',
    language: 'Language',
    autoLoad: 'Auto-loading top whale from Leaderboard  click any address to switch',
    loadingLeaderboard: 'Loading leaderboard data...',
  },
  whale: {
    tabs: {
      liveFeed: 'Active Feed',
      liveFeedDesc: 'Real-time early warning system. Monitor large BTC transactions as they enter the mempool before they are even confirmed. This allows you to see massive market shifts seconds before the rest of the world.',
      alerts: 'Alerts',
      alertsDesc: 'Personalized surveillance suite. Configure the specific threshold of BTC that triggers your "Whale Sonar" and never miss a critical elite move again with instant visual and audio feedback.',
      aiSignals: 'AI Signals',
      aiSignalsDesc: 'Neural-network powered pattern recognition. Our proprietary AI scans thousands of transactions to detect complex market manipulation, wash-trading, and hidden strategic accumulation phases.',
      leaderboard: 'Ranking',
      leaderboardDesc: 'The Hall of Titans. A dynamic ranking of the world\'s most powerful Bitcoin entities based on 24-hour transactional volume, revealing who is currently dominating the liquidity of the network.',
      watchlist: 'Watch List',
      watchlistDesc: 'Your private high-value analytics list. Track specific addresses of interest and receive targeted updates whenever these specific entities initiate any movement on the blockchain.',
      flowChart: 'Network Graph',
      flowChartDesc: 'Visual mapping of the BTC ecosystem. See the complex web of interactions between whale wallets and major global exchanges to understand the path liquidity is taking across the entire grid.',
      satoshi: 'Satoshi Detector',
      satoshiDesc: 'The ultimate "Black Swan" event monitor. This tool scans for movements from wallets dormant for 8 years (Satoshi Era). When these ancient whales wake up, it usually signals the end of a cycle.',
      cascada: 'Cascade Liquidations',
      cascadaDesc: 'Real-time tracking of forced selling pressure. Watch as Longs and Shorts are liquidated on global futures exchanges, creating the "cascade" effect that drives sudden and violent price movements.',
      flujo: 'Exchange Cockpit',
      flujoDesc: 'Advanced pressure monitoring. Visualizes the net flow of Bitcoin: Inflow to exchanges signals high selling pressure, while Outflow to Cold Storage confirms strong accumulation.',
      nexo: 'Entity Nexus',
      nexoDesc: 'Advanced entity clustering engine. Using complex heuristics, we link thousands of fragmented addresses to reveal the single massive entity operating behind them, exposing the true size of whale holdings.',
      pulsoIA: 'AI Market Pulse',
      pulsoIADesc: 'The EKG of the entire market. A proprietary synthetic signal that fuses all our analytics layers into a single, real-time "heartbeat" to tell you instantly if the market mood is healthy or in distress.',
    },
    scanning: 'Scanning historic Bitcoin wallets...',
    armed: 'ARMED',
    detected: 'DETECTED',
    noData: 'No data available',
    btc: 'BTC',
    megaLabel: 'MEGA',
    whaleLabel: 'WHALE',
    inflow: 'Exchange Inflow',
    outflow: 'Cold Storage',
    networkCalm: 'NETWORK CALM',
    criticalActivity: 'CRITICAL ACTIVITY DETECTED',
    elevatedActivity: 'ELEVATED NETWORK ACTIVITY',
    satoshiEra: 'SATOSHI ERA',
    dormant: 'DORMANT 8Y',
    watched: 'WATCHED',
    active: 'ACTIVE',
    yearsInactive: 'years inactive',
    firstActivity: 'First activity',
    bullish: 'bullish',
    bearish: 'bearish',
    neutral: 'neutral',
    accumulation: ' ACCUMULATION',
    selling: '️ SELL PRESSURE',
    neutralSignal: ' NEUTRAL',
  },
  footer: {
      cta: {
          badge: 'Join the Revolution',
          title: 'Get Started with',
          subtitle: 'Your identity. Your data. Your wealth. Take control today.'
      },
      mobile: {
          title: 'Mobile App',
          subtitle: 'iOS & Android'
      },
      extension: {
          title: 'Extension',
          subtitle: 'Chrome & Brave'
      },
      sections: {
          product: 'Product',
          developers: 'Developers',
          company: 'Company',
          legal: 'Legal'
      },
      links: {
          portfolio: 'Portfolio',
          vip: 'VIP Demo',
          network: 'Network',
          api: 'API Docs',
          github: 'GitHub',
          contracts: 'Contracts',
          whitepaper: 'Whitepaper',
          about: 'About',
          careers: 'Careers',
          blog: 'Blog',
          press: 'Press Kit',
          privacy: 'Privacy',
          terms: 'Terms',
          security: 'Security',
          compliance: 'Compliance'
      },
      rights: '© 2026 Whale Alert Network. All rights reserved.'
  },
  countdown: {
      badge: 'Beyond the Horizon',
      title: 'WORLD RELEASE',
      description: 'Witness the convergence of system identity and decentralized power. Absolute financial freedom.',
      days: 'DAYS',
      hours: 'HOURS',
      minutes: 'MINUTES',
      seconds: 'SECONDS'
  },
  ecosystem: {
    title: 'Whale Alert Network',
    subtitle: "Engineering trust. We don't sell hype, we sell verifiable architecture.",
    cat_core: 'Core Ecosystem',
    cat_trading: 'Trading & Security',
    cat_products: 'Products',
    cat_dev: 'Developer Hub',
    cat_about: 'About',
    deep_dive: 'The Deep Dive',
    why_hero: 'Why We Are #1',
  },
  market: {
    price: 'Price',
    volume: 'Volume (24h)',
    market_cap: 'Market Cap',
    hour: '1H',
    day: '24H',
    week: '7D',
    month: '30D',
    year: '1Y',
    sync: 'Market data sync active  Latency compensation enabled',
  },
  backers: {
      badge: 'Strategic Partners',
      title: 'Backed By'
  },
  cards: {
    title: 'The Whale Card',
    subtitle: 'Spend your crypto instantly, anywhere.',
    designBtn: 'Design Your Card',
    features: {
      global: 'Global acceptance via Visa network',
      applePay: 'Instant Apple Pay & Google Pay',
      security: 'Bank-grade security with freeze toggle',
    },
  },
  nfc: {
    title: 'Tap to Pair',
    subtitle: 'Turn your Whale Card into a hardware key.',
    start: 'Start Pairing',
    scanning: 'Scanning...',
    instruction: 'Hold your Whale Card against the back of your device.',
    success: 'Paired',
  },
  vault: {
    title: 'Advanced Grade Security',
    status: 'Vault Secured',
    description: 'Your assets are protected by rigorous spending limits and time locks.',
    activeProtection: 'Protection Level',
    dailyLimit: 'Daily Limit',
    advancedSettings: 'Advanced Controls',
    timeLock: '24h Time Lock',
    biometric: 'Biometric Enforcer',
  },
  portfolio: {
    syncing: 'Syncing Portfolio Ledger',
    encryption: 'Maximum Security Encryption',
    notConnectedDesc: 'Active cryptographic connection required to inspect asset ledger.',
    liveFeed: 'Active Feed',
    updated: 'Updated',
    injectPlaceholder: 'Inject Wallet Address / ENS...',
    terminal: 'Portfolio',
    bubbles: 'Bubbles',
    marketsRealTime: 'Markets on Real Time',
    historyEngine: 'History Engine',
    volatility: 'Portfolio Volatility',
    concentration: 'Asset Concentration',
    assetLedger: 'Asset Ledger',
    entries: 'Entries',
    export: 'Export Ledger (.csv)',
    legendaryAdvice: 'Legendary Strategic Advice',
    logicStatus: 'Logic Core Status',
    scoreIndex: 'Score Index',
    sectorAllocation: 'Sector Allocation',
    send: 'Send',
    receive: 'Receive',
    swap: 'Swap',
    volatilityDesc: 'Based on 24h asset velocity',
    topWeight: 'Top Weight',
    domains: 'Domains',
    verified: 'Verified Entity',
    crossChain: 'Cross-Chain Active',
    explorer: 'View on Explorer',
    sectors: {
      ai: 'AI', meme: 'Meme', defi: 'DeFi', stablecoin: 'Stablecoin',
      l1: 'Layer 1', l2: 'Layer 2', gaming: 'Gaming', other: 'Other',
    },
  },
  trade: {
    buy: 'Buy', sell: 'Sell', limit: 'Limit', market: 'Market',
    amount: 'Amount', price: 'Price', total: 'Total', balance: 'Balance',
    connectWallet: 'Connect Wallet', positions: 'Positions',
    openOrders: 'Open Orders', orderHistory: 'Order History',
    assets: 'Assets', noActivity: 'No activity yet',
    tradingActivity: 'Your trading activity will appear here',
  },
  vip: {
      heroTitle: 'Elite Analytics',
      heroSubtitle: 'Advanced analytical tools to track whale wallets, predict on-chain liquidations, and measure token unlock pressure. Raw data presented without distractions.',
      stats: {
          activeWhales: 'Active Mega Whales',
          tps: 'Current TPS (Active)',
          systemicRisk: 'Systemic Risk',
          baseFee: 'Base Fee (Gwei)'
      },
      reset: {
          title: 'Elite Analytics Reset',
          countdown: 'NEXT RESET IN:',
          status: 'Cross-Chain Persistence Active'
      },
      grid: {
          title: 'Active Settlement Grid',
          streamingBlock: 'Streaming Block',
          table: {
              timestamp: 'Timestamp',
              origin: 'Origin Vector (Full)',
              destination: 'Destination / Asset',
              volume: 'Volume (USD)',
              action: 'Protocol & Action',
              threat: 'Threat Level',
              awaiting: 'Awaiting Network Telemetry...'
          }
      },
      cta: {
          title: 'Analytics Enabled',
          subtitle: 'Neural modules are reading the chain. Integrate the flow into Portfolio in the next step.',
          button: 'Go to Portfolio'
      }
  },
  network: {
      title: 'Global Network',
      subtitle: 'Real-time exploration of the Bitcoin blockchain & Lightning Network.',
      tabs: {
          overview: 'Overview',
          transactions: 'Transactions',
          lightning: 'Lightning',
          mining: 'Mining',
      },
      stats: {
          price: 'Bitcoin Price',
          fees: {
          title: 'Network Fees',
          radar: 'Calibrating Fee Radar...',
          economy: 'Economy',
          standard: 'Standard',
          fastest: 'Fastest',
          recommended: 'RECOMMENDED',
          minRelay: 'Minimum Relay',
          liveUpdates: 'Active Updates',
      },
          difficulty: 'Difficulty Adjustment',
          status: 'Network Status',
          highPriority: 'High Priority',
          lowPriority: 'Low Priority',
          operational: 'Operational',
          lastBlock: 'Last Block',
          remaining: 'blocks remaining',
      },
      blocks: 'Latest Blocks',
      mempool: {
          title: 'Mempool Visualizer',
          depth: 'Mempool Depth',
          empty: 'Mempool Empty',
          next: 'Next',
          pending: 'Pending',
          nextBlock: 'Next Block',
          blockPlus: 'Block +',
      },
      lightning: 'Lightning Network',
      mining: 'Mining Hashrate',
      unknown: 'Unknown',
      feesTitle: 'Fees',
      txs: 'txs',
      time: {
          unknown: 'Unknown time',
          invalid: 'Invalid date',
          unavailable: 'Time unavailable',
      },
      searchPlaceholder: 'Search Block, Transaction, or Address...',
      invalidSearch: 'Invalid search query',
      view: 'View',
      whaleWatch: {
          title: 'Whale Watch',
          scanning: 'Scanning for Whales...',
          live: 'LIVE',
          fee: 'Fee',
          noMovements: 'No major movements detected.',
      },
  },
  support: {
      title: 'Support Analytics',
      heroSubtitle: 'Direct connection with our liquidators and level 3 engineers. Specialized technical help without bots.',
      stats: {
          responseTime: 'Response Time',
          vipSupport: 'PRIORITY Support',
          uptime: 'System Uptime'
      },
      form: {
          title: 'Secure Transmission',
          name: 'Identification',
          namePlaceholder: 'Your name or entity...',
          email: 'Encrypted Email',
          emailPlaceholder: 'email@provider.com',
          category: 'Category',
          categories: {
              general: 'General Analytics',
              technical: 'Technical Anomaly',
              wallet: 'Wallet / Security',
              security: 'Security Report',
              billing: 'Account Billing',
              partnership: 'Strategic Partnership'
          },
          message: 'Telemetry / Details',
          messagePlaceholder: 'Describe the situation in detail...',
          submit: 'SEND SIGNAL',
          sending: 'TRANSMITTING...'
      },
      channels: {
          technical: 'Technical Support',
          security: 'Security Hub',
          community: 'Community Channels'
      },
      toasts: {
          success: 'Signal Transmitted',
          successDesc: 'Your request is being processed by the duty engineer.',
          error: 'Transmission Failure',
          errorDesc: 'Could not send the signal. Try again.',
          networkError: 'Telemetry Error',
          networkErrorDesc: 'Check your connection.'
      }
  }
};

type Dictionary = typeof en;

//  Export 
export const dictionaries = { en } as any;


