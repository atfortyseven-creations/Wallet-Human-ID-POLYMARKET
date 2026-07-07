const fs = require('fs');
const path = require('path');

function searchFiles(dir, term) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== '.next' && file.name !== '.git') {
        searchFiles(fullPath, term);
      }
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(term)) {
        console.log(fullPath);
      }
    }
  }
}

searchFiles('.', 'SponsoredFPC');
searchFiles('.', '0x2613');
searchFiles('.', 'mock');
