const fs = require('fs');
function findWallet(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) {
      findWallet(p);
    } else if (f.endsWith('.js') || f.endsWith('.d.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('class AccountWallet')) {
        console.log(p);
      }
    }
  }
}
findWallet('./node_modules/@aztec');
