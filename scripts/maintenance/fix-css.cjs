const fs = require('fs');
const path = require('path');

function walk(dir) {
  let list = fs.readdirSync(dir);
  for (let file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    let full = path.join(dir, file);
    let stat = fs.statSync(full);
    if (stat && stat.isDirectory()) walk(full);
    else if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.css')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('min-h-screen') || content.includes('h-screen')) {
         let newContent = content.replace(/\bmin-h-screen\b/g, 'min-h-[100dvh]').replace(/\bh-screen\b/g, 'h-[100dvh]');
         if (content !== newContent) {
           fs.writeFileSync(full, newContent);
           console.log('Fixed:', full);
         }
      }
    }
  }
}
walk(__dirname);
console.log('Viewport replacement complete.');
