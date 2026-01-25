export type Category =
    | "Trending" | "Breaking" | "New" | "Politics" | "Sports" | "Crypto"
    | "Finance" | "Geopolitics" | "Earnings" | "Tech" | "Culture" | "World"
    | "Economy" | "Climate & Science" | "Elections" | "Mentions";

export interface NewsItem {
    id: string;
    headline: string;
    description: string;
    category: Category;
    time: string;
    source: string;
    imageUrl: string;
    imageKeyword: string; // Used for fallback or debugging
}

// --- GENERATION CONFIG ---

const CATEGORIES: Category[] = [
    "Trending", "Breaking", "New", "Politics", "Sports", "Crypto",
    "Finance", "Geopolitics", "Earnings", "Tech", "Culture", "World",
    "Economy", "Climate & Science", "Elections", "Mentions"
];

const ITEMS_PER_CATEGORY = 50;

const PREFIXES = ["Breaking:", "Update:", "Analysis:", "Exclusive:", "Report:", "Live:", "Just In:", "Forecast:", "Alert:", "Deep Dive:"];

const TOPICS: Record<Category, { subjects: string[], actions: string[], keywords: string[] }> = {
    Trending: {
        subjects: ["Bitcoin", "Taylor Swift", "SpaceX", "AI Model", "Super Bowl", "Election Polls"],
        actions: ["breaks internet records", "surges in popularity", "faces controversy", "announces surprise tour", "launches new rocket"],
        keywords: ["crowd", "concert", "rocket", "bitcoin", "celebrity"]
    },
    Breaking: {
        subjects: ["White House", "Federal Reserve", "NASA", "UN Security Council", "TSA", "CDC"],
        actions: ["declares state of emergency", "issues warning", "releases classified report", "holds press conference", "shuts down operations"],
        keywords: ["siren", "police", "press conference", "emergency", "breaking news"]
    },
    New: {
        subjects: ["Startup", "Gadget", "App", "Protocol", "Design Trend", "Beta Feature"],
        actions: ["launches today", "goes viral on TikTok", "secures Series A funding", "disrupts the market", "opens waitlist"],
        keywords: ["startup", "phone", "app", "launch", "rocket"]
    },
    Politics: {
        subjects: ["Congress", "Senate", "Supreme Court", "The President", "GOP", "Democrats"],
        actions: ["votes on critical bill", "blocks legislation", "debates new policy", "faces backlash", "rallies supporters"],
        keywords: ["capitol", "white house", "flag", "politics", "vote"]
    },
    Sports: {
        subjects: ["NBA Finals", "NFL Draft", "Champions League", "F1 Grand Prix", "UFC Title Fight", "Olympics"],
        actions: ["ends in dramatic finish", "sees record breaking performance", "postponed due to weather", "attracts millions of viewers", "ends in upset"],
        keywords: ["stadium", "basketball", "soccer", "race car", "athlete"]
    },
    Crypto: {
        subjects: ["Bitcoin", "Ethereum", "Solana", "DeFi TVL", "NFT Market", "Coinbase"],
        actions: ["smashes resistance", "drops 10%", "integrates new layer 2", "faces sec scrutiny", "partners with BlackRock"],
        keywords: ["bitcoin", "ethereum", "blockchain", "crypto", "trading"]
    },
    Finance: {
        subjects: ["S&P 500", "Goldman Sachs", "Interest Rates", "Inflation", "Oil Prices", "Housing Market"],
        actions: ["hits all time high", "plummets on earnings", "stabilizes after crash", "predicts recession", "outperforms expectations"],
        keywords: ["stock market", "chart", "money", "finance", "wall street"]
    },
    Geopolitics: {
        subjects: ["NATO", "China", "Russia", "Middle East", "EU Commission", "Trade War"],
        actions: ["imposes new sanctions", "signs peace treaty", "deploys troops", "holds summit", "issues ultimatum"],
        keywords: ["map", "globe", "flag", "army", "diplomacy"]
    },
    Earnings: {
        subjects: ["Apple", "Tesla", "Nvidia", "Amazon", "Microsoft", "Netflix"],
        actions: ["beats revenue estimates", "misses profit targets", "announces buyback", "warns of supply chain issues", "soars in after hours"],
        keywords: ["chart", "money", "meeting", "finance", "stock"]
    },
    Tech: {
        subjects: ["OpenAI", "Google Gemini", "Quantum Computer", "Robot", "VR Headset", "Microchip"],
        actions: ["achieves AGI milestone", "fails turing test", "unveiled at CES", "replaces human workers", "becomes open source"],
        keywords: ["robot", "computer", "code", "technology", "vr"]
    },
    Culture: {
        subjects: ["Hollywood", "Music Awards", "Modern Art", "Viral Meme", "Fashion Week", "Streaming Service"],
        actions: ["creates chaos", "sets new trend", "canceled after tweet", "dominates conversation", "wins best picture"],
        keywords: ["concert", "fashion", "art", "cinema", "music"]
    },
    World: {
        subjects: ["UN", "Global Population", "Pandemic Treaty", "Ocean Cleanup", "Space Station", "Antarctica"],
        actions: ["reaches critical mass", "signs historic accord", "discovers new species", "launches mission", "melts faster than expected"],
        keywords: ["earth", "people", "city", "nature", "world"]
    },
    Economy: {
        subjects: ["Jobs Report", "GDP Growth", "Consumer Spending", "Manufacturing", "Supply Chain", "Minimum Wage"],
        actions: ["exceeds forecast", "slows down", "rebounds strongly", "stalls due to strikes", "increases incrementally"],
        keywords: ["factory", "money", "shopping", "economy", "worker"]
    },
    Climate_Science: {
        subjects: ["Global Warming", "Space Telescope", "New Vaccine", "Renewable Energy", "Mars Rover", "Ocean Temperature"],
        actions: ["breaks heat records", "captures image of galaxy", "enters clinical trials", "surpasses coal", "lands successfully"],
        keywords: ["nature", "space", "science", "solar panel", "forest"]
    },
    Elections: {
        subjects: ["Trump", "Biden", "Swing State", "Electoral College", "Debate", "Voter Turnout"],
        actions: ["leads in new poll", "campaigns in Ohio", "secures endorsement", "attacks opponent", "faces legal challenge"],
        keywords: ["vote", "ballot", "trump", "biden", "usa"]
    },
    Mentions: {
        subjects: ["Polymarket", "Vitalik Buterin", "Prediction Markets", "Crypto Twitter", "Betting Odds", "Whale Alert"],
        actions: ["mentioned on CNBC", "tweets about market efficiency", "predicts election outcome", "moves $10M USDC", "goes viral"],
        keywords: ["twitter", "polymarket", "chart", "phone", "news"]
    }
};

// Handle category mapping for keys with special chars
const getTopic = (cat: Category) => {
    if (cat === "Climate & Science") return TOPICS["Climate_Science"];
    return TOPICS[cat];
};

const generateNews = (): NewsItem[] => {
    let allNews: NewsItem[] = [];
    let idCounter = 1;

    CATEGORIES.forEach(category => {
        const topic = getTopic(category);
        for (let i = 0; i < ITEMS_PER_CATEGORY; i++) {
            const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
            const subject = topic.subjects[Math.floor(Math.random() * topic.subjects.length)];
            const action = topic.actions[Math.floor(Math.random() * topic.actions.length)];
            const keyword = topic.keywords[Math.floor(Math.random() * topic.keywords.length)];

            // Generate a deterministic-ish image URL so it doesn't change on every re-render but is unique per item
            // Using unsplash source with specific sizing and keyword
            const imageUrl = `https://images.unsplash.com/photo-${(1500000000000 + (idCounter * 123456)).toString().slice(0, 13)}?auto=format&fit=crop&w=800&q=80`;
            // Note: Since real unsplash IDs correspond to specific photos, randomly generating IDs like above will likely result in 404s.
            // Better approach as per user "Fail Safe": Use a set of Valid Base URLs and cycle them? 
            // OR use the requested fail-safe component which handles the error gracefully.
            // The prompt says "Guarantee absolute image visualization".
            // Since I cannot guarantee random Unsplash IDs are valid, I will use a keyword-based source URL which usually redirects to a valid image,
            // OR I will rely on the SafeImage component to show the gradient fallback if the random ID fails.
            // Given the requirement "generate 800 items", I can't check 800 urls.
            // I will use source.unsplash.com/random which IS supported by my next.config update (source.unsplash.com).
            // Format: https://source.unsplash.com/800x600/?{keyword}&sig={id} to ensure consistency per ID.

            const robustImageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}&sig=${idCounter}`;

            allNews.push({
                id: idCounter.toString(),
                headline: `${prefix} ${subject} ${action} amid growing uncertainty`,
                description: `Exclusive report on how ${subject} is reshaping the landscape of ${category}. Analysts suggest this could be a turning point.`,
                category: category,
                time: `${Math.floor(Math.random() * 59) + 1}m ago`,
                source: "Polymarket Analytics",
                imageUrl: robustImageUrl,
                imageKeyword: keyword
            });
            idCounter++;
        }
    });

    // Shuffle array (Fisher-Yates) to mix categories if needed, but requirements say "Filter by category". 
    // So keeping them ordered might be easier or shuffling and then filtering.
    // Let's shuffle so the "All" view (if it existed) or the initial state looks dynamic.
    // Actually, prompt says "Default starts in Trending".

    return allNews;
};

export const NEWS_DATA = generateNews();
