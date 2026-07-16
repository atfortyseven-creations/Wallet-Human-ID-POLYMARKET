const fs = require('fs');
const lines = fs.readFileSync('components/landing/ConnectPage.tsx', 'utf-8').split('\n');
let depth = 0;
for(let i = 523; i < lines.length; i++) {
  const l = lines[i];
  const opens = (l.match(/<(div|motion\.div)[^>]*>/g) || []).length;
  const selfCloses = (l.match(/<(div|motion\.div)[^>]*\/>/g) || []).length;
  const closes = (l.match(/<\/(div|motion\.div)>/g) || []).length;
  const realOpens = opens - selfCloses;
  depth += realOpens - closes;
  if(realOpens > 0 || closes > 0) {
    console.log(String(i+1).padStart(4), depth, " ".repeat(Math.max(0, depth)) + l.trim());
  }
}
