const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        results = results.concat(walk(full));
      }
    } else {
      if (full.endsWith('.tsx') || full.endsWith('.ts')) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('HISTORY') && content.includes('ACTIONS')) {
          results.push(full);
        }
      }
    }
  }
  return results;
}
console.log(walk('.'));
