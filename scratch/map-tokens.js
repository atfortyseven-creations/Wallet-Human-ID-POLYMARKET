const fs = require('fs');
const https = require('https');

const networks = [
  { id: 'ethereum', url: 'https://tokens.coingecko.com/uniswap/all.json' },
  { id: 'polygon', url: 'https://tokens.coingecko.com/polygon-pos/all.json' },
  { id: 'arbitrum', url: 'https://tokens.coingecko.com/arbitrum-one/all.json' },
  { id: 'optimism', url: 'https://tokens.coingecko.com/optimistic-ethereum/all.json' },
  { id: 'base', url: 'https://tokens.coingecko.com/base/all.json' },
  { id: 'bsc', url: 'https://tokens.coingecko.com/binance-smart-chain/all.json' },
  { id: 'avalanche', url: 'https://tokens.coingecko.com/avalanche/all.json' }
];

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const localTokens = JSON.parse(fs.readFileSync('scratch/token-list.json', 'utf8'));
  const masterRegistry = {};

  for (const t of localTokens) {
    masterRegistry[t.symbol] = {
      symbol: t.symbol,
      nameId: t.nameId,
      logoPath: t.logoPath,
      addresses: {}
    };
  }

  for (const net of networks) {
    console.log(`Fetching ${net.id}...`);
    try {
      const data = await fetchJson(net.url);
      if (data && data.tokens) {
        for (const t of data.tokens) {
          const sym = t.symbol.toUpperCase();
          if (masterRegistry[sym]) {
            masterRegistry[sym].addresses[net.id] = t.address;
            masterRegistry[sym].decimals = masterRegistry[sym].decimals || t.decimals;
            masterRegistry[sym].name = masterRegistry[sym].name || t.name;
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching ${net.id}`, e.message);
    }
  }

  const finalTokens = Object.values(masterRegistry).filter(t => Object.keys(t.addresses).length > 0);
  
  fs.writeFileSync('scratch/token-registry.json', JSON.stringify(finalTokens, null, 2));
  console.log(`Mapped ${finalTokens.length} out of ${localTokens.length} tokens to on-chain addresses.`);
}

run();
