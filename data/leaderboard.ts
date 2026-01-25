export interface LeaderboardUser {
    rank: number;
    name: string;
    address: string;
    avatarUrl: string;
    profit: string;
    rawProfit: number;
    volume: string;
    verified: boolean;
}

export const LEADERBOARD_DATA: LeaderboardUser[] = [
    {
        rank: 1,
        name: "PolyWhale_Alpha",
        address: "0x7a2...9b12",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80", // CEO look
        profit: "+$2,450,120",
        rawProfit: 2450120,
        volume: "$142.5M",
        verified: true
    },
    {
        rank: 2,
        name: "Vitalik_Fan",
        address: "0xd8d...45e1",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        profit: "+$1,890,500",
        rawProfit: 1890500,
        volume: "$98.2M",
        verified: true
    },
    {
        rank: 3,
        name: "CryptoQueen",
        address: "0x3f1...a2b9",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        profit: "+$1,240,400",
        rawProfit: 1240400,
        volume: "$75.1M",
        verified: true
    },
    {
        rank: 4,
        name: "Satoshi_N",
        address: "0x1a2...3b4c",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
        profit: "+$980,200",
        rawProfit: 980200,
        volume: "$52.8M",
        verified: false
    },
    {
        rank: 5,
        name: "PredictionGuru",
        address: "0x9c8...7d6e",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
        profit: "+$875,100",
        rawProfit: 875100,
        volume: "$45.3M",
        verified: true
    },
    {
        rank: 6,
        name: "WallSt_Bet",
        address: "0x5e4...3f2a",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
        profit: "+$750,900",
        rawProfit: 750900,
        volume: "$41.0M",
        verified: false
    },
    {
        rank: 7,
        name: "DeFi_Wizard",
        address: "0x2b1...0a9c",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        profit: "+$620,400",
        rawProfit: 620400,
        volume: "$38.5M",
        verified: true
    },
    {
        rank: 8,
        name: "Oracle_Eye",
        address: "0x8f7...6e5d",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
        profit: "+$590,200",
        rawProfit: 590200,
        volume: "$35.2M",
        verified: true
    },
    {
        rank: 9,
        name: "Moon_Walker",
        address: "0x4d3...2c1b",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
        profit: "+$510,800",
        rawProfit: 510800,
        volume: "$32.9M",
        verified: false
    },
    {
        rank: 10,
        name: "Alpha_Seeker",
        address: "0x0a9...8b7c",
        avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80",
        profit: "+$480,500",
        rawProfit: 480500,
        volume: "$30.1M",
        verified: true
    },
    {
        rank: 11,
        name: "Risk_Taker",
        address: "0x6e5...4d3f",
        avatarUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=256&q=80",
        profit: "+$450,100",
        rawProfit: 450100,
        volume: "$28.4M",
        verified: false
    },
    {
        rank: 12,
        name: "Trend_Spotter",
        address: "0x2c1...0b9a",
        avatarUrl: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=256&q=80",
        profit: "+$420,300",
        rawProfit: 420300,
        volume: "$26.7M",
        verified: true
    },
    {
        rank: 13,
        name: "Market_Maker",
        address: "0x8b7...6a5e",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
        profit: "+$390,700",
        rawProfit: 390700,
        volume: "$25.0M",
        verified: true
    },
    {
        rank: 14,
        name: "Volatility_King",
        address: "0x4d3...2f1e",
        avatarUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=256&q=80",
        profit: "+$360,200",
        rawProfit: 360200,
        volume: "$23.5M",
        verified: false
    },
    {
        rank: 15,
        name: "Yield_Hunter",
        address: "0x0a9...8c7d",
        avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=256&q=80",
        profit: "+$330,900",
        rawProfit: 330900,
        volume: "$21.8M",
        verified: true
    },
    {
        rank: 16,
        name: "Chart_Reader",
        address: "0x6e5...4b3a",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80",
        profit: "+$300,500",
        rawProfit: 300500,
        volume: "$20.2M",
        verified: false
    },
    {
        rank: 17,
        name: "Hodl_Strong",
        address: "0x2c1...0a9f",
        avatarUrl: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?auto=format&fit=crop&w=256&q=80",
        profit: "+$270,100",
        rawProfit: 270100,
        volume: "$18.6M",
        verified: true
    },
    {
        rank: 18,
        name: "Swing_Trader",
        address: "0x8b7...6d5c",
        avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=256&q=80",
        profit: "+$240,800",
        rawProfit: 240800,
        volume: "$17.1M",
        verified: false
    },
    {
        rank: 19,
        name: "Arbitrage_Bot",
        address: "0x4d3...2e1a",
        avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&q=80",
        profit: "+$210,400",
        rawProfit: 210400,
        volume: "$15.5M",
        verified: true
    },
    {
        rank: 20,
        name: "Newbie_Luck",
        address: "0x0a9...8f7e",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
        profit: "+$180,200",
        rawProfit: 180200,
        volume: "$14.0M",
        verified: false
    }
];
