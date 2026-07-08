const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.toLowerCase().includes('0xbaad') || content.toUpperCase().includes('MONTHLY AIRDROP')) {
          results.push(file);
        }
      }
    }
  });
  return results;
}

console.log(walk('.').join('\n'));
