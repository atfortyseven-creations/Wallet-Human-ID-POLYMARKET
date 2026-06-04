let fs = require('fs');
let content = fs.readFileSync('config/token-stats-snapshot.ts', 'utf8');
let lines = content.split('\n');
let seen = new Set();
let res = [];
for (let line of lines) {
  let m = line.match(/^\s*"([^"]+)":/);
  if (m) {
    if (seen.has(m[1])) {
       continue;
    }
    seen.add(m[1]);
  }
  res.push(line);
}
fs.writeFileSync('config/token-stats-snapshot.ts', res.join('\n'));
