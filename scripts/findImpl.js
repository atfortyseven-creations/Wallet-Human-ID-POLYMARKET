const fs = require('fs');
function findImpl(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) {
      findImpl(p);
    } else if (f.endsWith('.js') || f.endsWith('.d.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.match(/function\s+getWallet\b/g) || content.match(/const\s+getWallet\s*=/g) || content.match(/export\s+function\s+getWallet/g) || content.match(/export\s+const\s+getWallet/g)) {
        console.log(p);
      }
    }
  }
}
findImpl('./node_modules/@aztec');
