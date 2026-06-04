const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('scratch/token-registry.json', 'utf8'));

let content = `// AUTO-GENERATED: Quantum Asset Registry
// Extracted and cross-referenced with 7 networks via CoinGecko + Local Logos

export interface QuantumToken {
  symbol: string;
  name: string;
  decimals: number;
  logoPath: string;
  addresses: Record<string, string>;
}

export const QUANTUM_TOKENS: QuantumToken[] = [\n`;

for (const t of tokens) {
  content += `  {
    symbol: "${t.symbol}",
    name: "${(t.name || t.nameId).replace(/"/g, '\\"')}",
    decimals: ${t.decimals || 18},
    logoPath: "${t.logoPath}",
    addresses: ${JSON.stringify(t.addresses)}
  },\n`;
}

content += '];\n';
if (!fs.existsSync('lib/config')) fs.mkdirSync('lib/config', { recursive: true });
fs.writeFileSync('lib/config/tokens.ts', content);
console.log('Created lib/config/tokens.ts with ' + tokens.length + ' tokens.');
