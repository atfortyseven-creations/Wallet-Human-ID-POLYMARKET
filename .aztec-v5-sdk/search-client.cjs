const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.d.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/export (?:declare )?function create[a-zA-Z0-9_]*Client/g);
      if (matches) {
        console.log(file + ':', matches.join(', '));
      }
    }
  }
  return results;
}
walk('node_modules/@aztec');
