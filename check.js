const fs = require('fs'); 
const code = fs.readFileSync('app/api/aztec/airdrop/route.ts', 'utf8'); 
let depth = 0; 
code.split('\n').forEach((l, i) => { 
  for(let c of l) { 
    if(c==='{') depth++; 
    if(c==='}') depth--; 
  } 
  if(depth < 0) { 
    console.log('NEGATIVE DEPTH AT', i+1, l); 
    process.exit(1); 
  } 
  if(l.trim().startsWith('} catch') || l.trim().startsWith('} else') || l.trim() === '}') 
    console.log(i+1, depth, l.trim()); 
}); 
console.log('FINAL DEPTH:', depth);
