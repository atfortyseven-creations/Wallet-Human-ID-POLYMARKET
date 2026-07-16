const fs = require('fs');
const lines = fs.readFileSync('components/landing/ConnectPage.tsx', 'utf-8').split('\n');
let depth = 0;
for(let i = 523; i < lines.length; i++) {
  const line = lines[i];
  let diff = 0;
  
  const tagRegex = /<\/?(?:div|motion\.div)[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    if (fullTag.endsWith('/>')) continue;
    
    if (fullTag.startsWith('</')) {
      diff--;
    } else {
      diff++;
    }
  }
  
  depth += diff;
  if (diff !== 0) {
    console.log(String(i+1).padStart(4), depth, line.trim());
  }
}
