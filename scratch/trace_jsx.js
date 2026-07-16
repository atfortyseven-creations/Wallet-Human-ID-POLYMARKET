const fs = require('fs');
const code = fs.readFileSync('components/landing/ConnectPage.tsx', 'utf-8');
const lines = code.split('\n');
let depth = 0;
let stack = [];

for(let i = 520; i < lines.length; i++) {
  const line = lines[i];
  
  // A crude regex to find opening and closing tags on the line
  const tagRegex = /<\/?([a-zA-Z0-9\.]+)[^>]*>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    // Ignore self-closing tags like <img />, <Loader2 />, <svg ... /> (we assume svg doesn't have nested divs for this)
    if (fullTag.endsWith('/>')) continue;
    // Ignore br, hr, input etc if any
    
    if (fullTag.startsWith('</')) {
      depth--;
      const popped = stack.pop();
      console.log(String(i+1).padStart(4), depth, " ".repeat(Math.max(0, depth)) + "CLOSE: " + fullTag + " (matched: " + popped + ")");
    } else {
      stack.push(tagName);
      console.log(String(i+1).padStart(4), depth, " ".repeat(Math.max(0, depth)) + "OPEN:  " + fullTag);
      depth++;
    }
  }
}
