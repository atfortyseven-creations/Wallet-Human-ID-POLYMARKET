const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/tokenunion/polymarket-matic';
const GAMMA_API_URL = 'https://gammap-api.polymarket.com/profiles';

export interface Trader {
    rank: number;
    address: string;
    name: string;
    image: string;
    volume: number;
    profit: number;
    profileUrl: string;
}

// FALLBACK_TRADERS removed per Extermination Roadmap. 
// System now relies strictly on authentic on-chain data.


function smartNormalize(valueStr: string): number {
    const val = parseFloat(valueStr || "0");
    if (val > 1_000_000_000) return val / 1_000_000;
    return val;
}

// Ahora aceptamos 'page' como argumento
export async function fetchTopTraders(page: number = 1): Promise<Trader[]> {
    const ITEMS_PER_PAGE = 20;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Dynamic query with pagination variables
    const query = `
    {
      users(first: ${ITEMS_PER_PAGE}, skip: ${skip}, orderBy: totalVolume, orderDirection: desc, where: { totalVolume_gt: "100" }) {
        id
        totalVolume
        totalProfit
      }
    }
  `;

    try {
        const graphRes = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            next: { revalidate: 60 }
        });

        if (!graphRes.ok) throw new Error(`Graph API returned ${graphRes.status}`);

        const { data } = await graphRes.json();

        // FAIL-SAFE: Return empty array instead of mocks
        if ((!data || !data.users || data.users.length === 0)) {
            return [];
        }

        const traders = await Promise.all(data.users.map(async (user: any, index: number) => {
            let displayName = `${user.id.substring(0, 6)}...`;
            let displayImage = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`;

            try {
                const profileRes = await fetch(`${GAMMA_API_URL}?address=${user.id}`);
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.display_name) displayName = profileData.display_name;
                    if (profileData.profile_image) displayImage = profileData.profile_image;
                }
            } catch (e) { }

            return {
                // REAL RANK CALCULATION: (Previous page * 20) + current position + 1
                rank: skip + index + 1,
                address: user.id,
                name: displayName,
                image: displayImage,
                volume: smartNormalize(user.totalVolume),
                profit: smartNormalize(user.totalProfit),
                profileUrl: `https://polymarket.com/profile/${user.id}`
            };
        }));

        return traders.sort((a, b) => b.volume - a.volume);

    } catch (error) {
        console.error("Error Leaderboard Paginado:", error);
        return [];
    }
}

