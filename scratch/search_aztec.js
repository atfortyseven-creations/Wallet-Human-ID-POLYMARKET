const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('aztec.js') || content.includes('ContractInstanceRegistryContract')) {
        results.push(file);
      }
    }
  });
  return results;
}

console.log(walk('./app').join('\n'));
console.log(walk('./components').join('\n'));
console.log(walk('./lib').join('\n'));
