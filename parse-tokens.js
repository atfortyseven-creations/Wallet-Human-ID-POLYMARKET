const fs = require('fs');

const raw = fs.readFileSync('tokens.txt', 'utf-8').trim().split('\n');

const tokens = [];
let current = [];

for (const line of raw) {
    if (line.trim() === '') continue;
    current.push(line.trim());
    if (current.length === 8) {
        tokens.push({
            name: current[0],
            ticker: current[1],
            price: current[2],
            currencyPrice: current[3],
            change24h: current[4],
            mcap: current[5],
            mcapCurrency: current[6],
            circulation: current[7]
        });
        current = [];
    }
}

const content = `export const MARKETS_DATA = ${JSON.stringify(tokens, null, 4)};`;
fs.writeFileSync('lib/data/markets-data.ts', content);
console.log('Successfully wrote markets-data.ts with', tokens.length, 'tokens');
