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
        avatarUrl: "https://i.pravatar.cc/250?u=1", // CEO look
        profit: "+$2,450,120",
        rawProfit: 2450120,
        volume: "$142.5M",
        verified: true
    },
    {
        rank: 2,
        name: "Vitalik_Fan",
        address: "0xd8d...45e1",
        avatarUrl: "https://i.pravatar.cc/250?u=2",
        profit: "+$1,890,500",
        rawProfit: 1890500,
        volume: "$98.2M",
        verified: true
    },
    {
        rank: 3,
        name: "CryptoQueen",
        address: "0x3f1...a2b9",
        avatarUrl: "https://i.pravatar.cc/250?u=3",
        profit: "+$1,240,400",
        rawProfit: 1240400,
        volume: "$75.1M",
        verified: true
    },
    {
        rank: 4,
        name: "Satoshi_N",
        address: "0x1a2...3b4c",
        avatarUrl: "https://i.pravatar.cc/250?u=4",
        profit: "+$980,200",
        rawProfit: 980200,
        volume: "$52.8M",
        verified: false
    },
    {
        rank: 5,
        name: "PredictionGuru",
        address: "0x9c8...7d6e",
        avatarUrl: "https://i.pravatar.cc/250?u=5",
        profit: "+$875,100",
        rawProfit: 875100,
        volume: "$45.3M",
        verified: true
    },
    {
        rank: 6,
        name: "WallSt_Bet",
        address: "0x5e4...3f2a",
        avatarUrl: "https://i.pravatar.cc/250?u=6",
        profit: "+$750,900",
        rawProfit: 750900,
        volume: "$41.0M",
        verified: false
    },
    {
        rank: 7,
        name: "DeFi_Wizard",
        address: "0x2b1...0a9c",
        avatarUrl: "https://i.pravatar.cc/250?u=7",
        profit: "+$620,400",
        rawProfit: 620400,
        volume: "$38.5M",
        verified: true
    },
    {
        rank: 8,
        name: "Oracle_Eye",
        address: "0x8f7...6e5d",
        avatarUrl: "https://i.pravatar.cc/250?u=8",
        profit: "+$590,200",
        rawProfit: 590200,
        volume: "$35.2M",
        verified: true
    },
    {
        rank: 9,
        name: "Moon_Walker",
        address: "0x4d3...2c1b",
        avatarUrl: "https://i.pravatar.cc/250?u=9",
        profit: "+$510,800",
        rawProfit: 510800,
        volume: "$32.9M",
        verified: false
    },
    {
        rank: 10,
        name: "Alpha_Seeker",
        address: "0x0a9...8b7c",
        avatarUrl: "https://i.pravatar.cc/250?u=10",
        profit: "+$480,500",
        rawProfit: 480500,
        volume: "$30.1M",
        verified: true
    },
    {
        rank: 11,
        name: "Risk_Taker",
        address: "0x6e5...4d3f",
        avatarUrl: "https://i.pravatar.cc/250?u=11",
        profit: "+$450,100",
        rawProfit: 450100,
        volume: "$28.4M",
        verified: false
    },
    {
        rank: 12,
        name: "Trend_Spotter",
        address: "0x2c1...0b9a",
        avatarUrl: "https://i.pravatar.cc/250?u=12",
        profit: "+$420,300",
        rawProfit: 420300,
        volume: "$26.7M",
        verified: true
    },
    {
        rank: 13,
        name: "Market_Maker",
        address: "0x8b7...6a5e",
        avatarUrl: "https://i.pravatar.cc/250?u=13",
        profit: "+$390,700",
        rawProfit: 390700,
        volume: "$25.0M",
        verified: true
    },
    {
        rank: 14,
        name: "Volatility_King",
        address: "0x4d3...2f1e",
        avatarUrl: "https://i.pravatar.cc/250?u=14",
        profit: "+$360,200",
        rawProfit: 360200,
        volume: "$23.5M",
        verified: false
    },
    {
        rank: 15,
        name: "Yield_Hunter",
        address: "0x0a9...8c7d",
        avatarUrl: "https://i.pravatar.cc/250?u=15",
        profit: "+$330,900",
        rawProfit: 330900,
        volume: "$21.8M",
        verified: true
    },
    {
        rank: 16,
        name: "Chart_Reader",
        address: "0x6e5...4b3a",
        avatarUrl: "https://i.pravatar.cc/250?u=16",
        profit: "+$300,500",
        rawProfit: 300500,
        volume: "$20.2M",
        verified: false
    },
    {
        rank: 17,
        name: "Hodl_Strong",
        address: "0x2c1...0a9f",
        avatarUrl: "https://i.pravatar.cc/250?u=17",
        profit: "+$270,100",
        rawProfit: 270100,
        volume: "$18.6M",
        verified: true
    },
    {
        rank: 18,
        name: "Swing_Trader",
        address: "0x8b7...6d5c",
        avatarUrl: "https://i.pravatar.cc/250?u=18",
        profit: "+$240,800",
        rawProfit: 240800,
        volume: "$17.1M",
        verified: false
    },
    {
        rank: 19,
        name: "Arbitrage_Bot",
        address: "0x4d3...2e1a",
        avatarUrl: "https://i.pravatar.cc/250?u=19",
        profit: "+$210,400",
        rawProfit: 210400,
        volume: "$15.5M",
        verified: true
    },
    {
        rank: 20,
        name: "Newbie_Luck",
        address: "0x0a9...8f7e",
        avatarUrl: "https://i.pravatar.cc/250?u=20",
        profit: "+$180,200",
        rawProfit: 180200,
        volume: "$14.0M",
        verified: false
    }
];
