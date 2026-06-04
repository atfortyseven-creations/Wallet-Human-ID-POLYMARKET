const fs = require('fs');
const files = fs.readdirSync('public/system-shots/logostoken');
const tokens = files.map(f => {
  const parts = f.replace('-logo.png', '').split('-');
  const symbol = parts.pop().toUpperCase();
  const nameId = parts.join('-');
  return { symbol, nameId, logoPath: `/system-shots/logostoken/${f}` };
});
fs.writeFileSync('scratch/token-list.json', JSON.stringify(tokens, null, 2));
console.log('Saved ' + tokens.length + ' tokens to scratch/token-list.json');
