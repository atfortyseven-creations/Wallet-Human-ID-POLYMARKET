export interface NewsItem {
    id: number;
    headline: string;
    description: string;
    category: "Elections" | "Crypto" | "Finance";
    time: string;
    source: string;
    imageKeyword: string;
    footer: string;
}

export const NEWS_DATA: NewsItem[] = [
    // --- 15 ELECTIONS ---
    {
        id: 1,
        headline: "Trump Leads Biden by 4 Points in Key Swing State Pennsylvania",
        description: "Latest Quinnipiac poll shows a widening gap as economic concerns dominate voter sentiment in the Rust Belt.",
        category: "Elections",
        time: "10m ago",
        source: "Polymarket Data",
        imageKeyword: "trump rally",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 2,
        headline: "Biden's Approval Rating Hits All-Time Low Amid Inflation Fears",
        description: "Democrat strategists panic as core demographics show signs of wavering support ahead of the convention.",
        category: "Elections",
        time: "25m ago",
        source: "Gallup / polymarket",
        imageKeyword: "joe biden",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 3,
        headline: "Polymarket Odds Shift: 55% Probability of GOP Senate Takeover",
        description: "Heavy betting volume on Montana and West Virginia Senate races signals a likely shift in Congressional power.",
        category: "Elections",
        time: "40m ago",
        source: "Market Analytics",
        imageKeyword: "senate voting",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 4,
        headline: "DeSantis Endorses Trump: Unifying the Republican Base?",
        description: "The Florida Governor suspend his campaign, clearing the path for a United GOP front against Biden.",
        category: "Elections",
        time: "1h ago",
        source: "Campaign Trail",
        imageKeyword: "ron desantis",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 5,
        headline: "RFK Jr. Polling at 15%: The Spoiler Effect in Question",
        description: "Third-party candidate draws equally from both major parties, creating unpredictable volatility in swing states.",
        category: "Elections",
        time: "1h 20m ago",
        source: "FiveThirtyEight",
        imageKeyword: "kennedy",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 6,
        headline: "Supreme Court Rules on Ballot Eligibility: Trump Remains",
        description: "Unanimous decision prevents states from removing candidates unilaterally, securing Trump's place on the ballot nationwide.",
        category: "Elections",
        time: "2h ago",
        source: "SCOTUS Blog",
        imageKeyword: "supreme court",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 7,
        headline: "Debate Night Chaos: Moderators Struggle to Control Narrative",
        description: "Heated exchanges over immigration and foreign policy define the final debate before Super Tuesday.",
        category: "Elections",
        time: "2h 15m ago",
        source: "Live Feed",
        imageKeyword: "presidential debate",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 8,
        headline: "Voter Turnout Projected to Smash 2020 Records",
        description: "Early voting numbers in Georgia and Arizona suggest unprecedented engagement from Gen Z voters.",
        category: "Elections",
        time: "3h ago",
        source: "Election Data",
        imageKeyword: "voting line",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 9,
        headline: "Kamala Harris to Tour Midwest in Last-Ditch Effort",
        description: "Vice President focuses on abortion rights messaging to mobilize suburban women in critical battlegrounds.",
        category: "Elections",
        time: "3h 45m ago",
        source: "White House Press",
        imageKeyword: "kamala harris",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 10,
        headline: "Polymarket Whale Bets $5M on Trump Victory",
        description: "A single anonymous wallet moves market probability by 2% in a matter of minutes.",
        category: "Elections",
        time: "4h ago",
        source: "Whale Alert",
        imageKeyword: "betting graph",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 11,
        headline: "Tech Billionaires Split: Musk Leans Right, Hoffman Left",
        description: "Silicon Valley donor money flows into Super PACs, reshaping the financial landscape of the election.",
        category: "Elections",
        time: "4h 30m ago",
        source: "FEC Filings",
        imageKeyword: "silicon valley",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 12,
        headline: "Border Security Becomes Top Issue for Independent Voters",
        description: "New polling data indicates immigration policy now outweighs economy for undecided voters in Texas.",
        category: "Elections",
        time: "5h ago",
        source: "Pew Research",
        imageKeyword: "border wall",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 13,
        headline: "Mail-In Ballot Controversy Erupts in Wisconsin",
        description: "GOP lawyers challenge validity of 20,000 ballots due to signature mismatch claims.",
        category: "Elections",
        time: "5h 20m ago",
        source: "Legal Update",
        imageKeyword: "mail ballot",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 14,
        headline: "Polymarket Expands Electoral College Map Trading",
        description: "Traders can now bet on individual state outcomes with granular precision.",
        category: "Elections",
        time: "6h ago",
        source: "Platform Update",
        imageKeyword: "usa map",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 15,
        headline: "Final Polls: It's a Dead Heat Heading into November",
        description: "Aggregated polling data shows a 49-49 split, making this the tightest race in modern history.",
        category: "Elections",
        time: "6h 30m ago",
        source: "RealClearPolitics",
        imageKeyword: "voting box",
        footer: "✍️ Firmado por Polymarket Wallet"
    },

    // --- 15 CRYPTO ---
    {
        id: 16,
        headline: "Bitcoin Smashes $70k Resistance: Road to $100k?",
        description: "Institutional inflows via spot ETFs drive BTC price to new ATH as supply squeeze intensifies.",
        category: "Crypto",
        time: "12m ago",
        source: "CoinGecko",
        imageKeyword: "bitcoin bull",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 17,
        headline: "BlackRock's IBIT ETF Absorbs Another $500M in One Day",
        description: "Traditional finance appetite for crypto exposure shows no signs of slowing down.",
        category: "Crypto",
        time: "32m ago",
        source: "ETF Stream",
        imageKeyword: "blackrock",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 18,
        headline: "Ethereum Dencun Upgrade Live: L2 Fees Drop 90%",
        description: "Proto-danksharding implementation successfully reduces gas costs for Arbitrum and Optimism.",
        category: "Crypto",
        time: "45m ago",
        source: "Ethereum Foundation",
        imageKeyword: "ethereum logo",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 19,
        headline: "Solana Flippening? SOL Market Cap Nears BNB",
        description: "Memecoin frenzy and high DEX volume push Solana to challenge for the #3 spot.",
        category: "Crypto",
        time: "1h 10m ago",
        source: "DefiLlama",
        imageKeyword: "solana",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 20,
        headline: "SEC vs Coinbase: Judge Denies Motion to Dismiss",
        description: "The landmark case defining crypto regulation in the US proceeds to trial.",
        category: "Crypto",
        time: "1h 45m ago",
        source: "Legal Brief",
        imageKeyword: "gavel",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 21,
        headline: "MicroStrategy Buys Another 12,000 BTC",
        description: "Michael Saylor doubles down, raising convertible debt to acquire more Bitcoin reserves.",
        category: "Crypto",
        time: "2h ago",
        source: "SEC Filing",
        imageKeyword: "michael saylor",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 22,
        headline: "Uniswap Governance Proposal: Fee Switch Activation?",
        description: "UNI token holders vote on proposal to distribute protocol fees to stakers.",
        category: "Crypto",
        time: "2h 30m ago",
        source: "Uniswap Gov",
        imageKeyword: "unicorn",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 23,
        headline: "Vitalik Buterin Proposes New 'Purge' Phase for ETH",
        description: "Steps to simplify the Ethereum protocol and reduce node resource requirements.",
        category: "Crypto",
        time: "3h ago",
        source: "Vitalik Blog",
        imageKeyword: "vitalik buterin",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 24,
        headline: "Tether (USDT) Market Cap Crosses $100 Billion",
        description: "Dominance of the stablecoin giant grows despite regulatory scrutiny.",
        category: "Crypto",
        time: "3h 20m ago",
        source: "Stablecoin Data",
        imageKeyword: "tether",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 25,
        headline: "Crypto Whale Moves $200M in dormant BTC from 2012",
        description: "Satoshi-era wallet activates, sparking speculation about early miner activity.",
        category: "Crypto",
        time: "4h ago",
        source: "Whale Alert",
        imageKeyword: "bitcoin whale",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 26,
        headline: "Ledger Launches New Hardware Wallet 'Stax'",
        description: "E-ink touchscreen device aims to improve UX for crypto self-custody.",
        category: "Crypto",
        time: "4h 45m ago",
        source: "Tech Review",
        imageKeyword: "ledger wallet",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 27,
        headline: "Base Network TVL Explodes Driven by SocialFi Apps",
        description: "Coinbase's L2 chain becomes a hub for consumer crypto applications.",
        category: "Crypto",
        time: "5h ago",
        source: "L2Beat",
        imageKeyword: "coinbase app",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 28,
        headline: "Ripple (XRP) Announces Stablecoin Launch",
        description: "Blockchain payments firm enters the crowded USD stablecoin market.",
        category: "Crypto",
        time: "5h 30m ago",
        source: "Ripple Press",
        imageKeyword: "ripple xrp",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 29,
        headline: "Runes Protocol Launches on Bitcoin Halving Block",
        description: "Casey Rodarmor's new fungible token standard clogs mempool with high fees.",
        category: "Crypto",
        time: "6h ago",
        source: "Mempool Space",
        imageKeyword: "bitcoin runes",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 30,
        headline: "Binance Founder CZ Sentenced to 4 Months",
        description: "Conclusion of the DOJ money laundering investigation into the world's largest exchange.",
        category: "Crypto",
        time: "6h 45m ago",
        source: "Court Ruling",
        imageKeyword: "changpeng zhao",
        footer: "✍️ Firmado por Polymarket Wallet"
    },

    // --- 10 FINANCE ---
    {
        id: 31,
        headline: "Fed Chair Powell Signals Rate Cuts in Late 2024",
        description: "FOMC meeting minutes reveal a dovish pivot as inflation cools towards the 2% target.",
        category: "Finance",
        time: "20m ago",
        source: "Federal Reserve",
        imageKeyword: "jerome powell",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 32,
        headline: "S&P 500 Closes at Record High AI Rally Continues",
        description: "NVIDIA and Microsoft drive the index upward, defying recession fears.",
        category: "Finance",
        time: "50m ago",
        source: "Wall Street Journal",
        imageKeyword: "stock chart",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 33,
        headline: "Gold Price Touches $2,400/oz on Geopolitical Tension",
        description: "Safe-haven asset demand surges amidst conflict in the Middle East.",
        category: "Finance",
        time: "1h 15m ago",
        source: "Bloomberg",
        imageKeyword: "gold bars",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 34,
        headline: "Japanese Yen Crumbles to 34-Year Low Against Dollar",
        description: "Bank of Japan considers intervention as currency weakness threatens imports.",
        category: "Finance",
        time: "1h 50m ago",
        source: "Forex Market",
        imageKeyword: "yen currency",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 35,
        headline: "Commercial Real Estate Crisis: Regional Banks at Risk",
        description: "Empty office buildings in major cities pose systemic risk to small lenders.",
        category: "Finance",
        time: "2h 40m ago",
        source: "Financial Times",
        imageKeyword: "office building",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 36,
        headline: "Oil Prices Spike as OPEC+ Extends Supply Cuts",
        description: "Brent Crude climbs above $90/barrel, threatening to reignite inflation.",
        category: "Finance",
        time: "3h 10m ago",
        source: "Oil Price",
        imageKeyword: "oil rig",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 37,
        headline: "Apple Faces DOJ Antitrust Lawsuit over iPhone Ecosystem",
        description: "Government alleges monopolistic practices in smartphone market.",
        category: "Finance",
        time: "4h 15m ago",
        source: "Reuters",
        imageKeyword: "apple store",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 38,
        headline: "Reddit IPO Soars 48% on Debut Trading Day",
        description: "Social media platform's listing reignites the IPO market after a dry spell.",
        category: "Finance",
        time: "5h ago",
        source: "NYSE",
        imageKeyword: "reddit logo",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 39,
        headline: "Tesla Shares Dip on Weak Delivery Numbers",
        description: "EV competition from China impacts quarterly performance for Elon Musk's company.",
        category: "Finance",
        time: "5h 45m ago",
        source: "CNBC",
        imageKeyword: "tesla car",
        footer: "✍️ Firmado por Polymarket Wallet"
    },
    {
        id: 40,
        headline: "Global Debt Hits Record $313 Trillion",
        description: "IIF report highlights growing fiscal imbalances in emerging markets.",
        category: "Finance",
        time: "6h 30m ago",
        source: "World Bank",
        imageKeyword: "debt clock",
        footer: "✍️ Firmado por Polymarket Wallet"
    }
];
