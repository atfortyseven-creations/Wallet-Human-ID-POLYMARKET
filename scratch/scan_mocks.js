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
      if (content.includes('setTimeout(') || content.includes('Mock') || content.includes('0x1234')) {
        results.push(file);
      }
    }
  });
  return results;
}

console.log('Mocks and Latency Simulation found in:');
console.log(walk('./app/api').join('\n'));
