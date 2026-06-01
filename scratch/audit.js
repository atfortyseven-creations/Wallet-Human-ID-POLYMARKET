const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('scratch/token-registry.json', 'utf8'));
const syms = tokens.map(x => x.symbol);
const dups = [...new Set(syms.filter((s, i) => syms.indexOf(s) !== i))];
console.log('Total tokens:', tokens.length);
console.log('Duplicates:', dups.length, dups.join(', '));

// Also check for tokens with empty/missing addresses
const noAddr = tokens.filter(t => !t.addresses || Object.keys(t.addresses).length === 0);
console.log('No addresses:', noAddr.length);

// Check for missing logoPath
const noLogo = tokens.filter(t => !t.logoPath);
console.log('No logo:', noLogo.length);
