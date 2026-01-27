
const { NewsDataService } = require('./lib/news-service');
// Mock fetch
global.fetch = async (url) => {
    console.log("Fetching:", url);
    return {
        ok: true,
        json: async () => ({
            status: "success",
            results: Array(10).fill(0).map((_, i) => ({
                title: `News Item ${Math.random()}`,
                link: `http://example.com/${i}`,
                source_id: "source"
            }))
        })
    };
}
// Mock Env
process.env.NEWSDATA_API_KEY = "pub_37e6802d84354845bec7cff76350c478";

async function run() {
    console.log("Starting parallel fetch...");
    const articles = await NewsDataService.fetchByCategory('Crypto');
    console.log(`Fetched ${articles.length} articles.`);
}

run();
