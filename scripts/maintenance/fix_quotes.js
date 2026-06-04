const fs = require('fs');
const path = require('path');

const dirs = [
  'app/legal/terms',
  'app/legal/privacy',
  'app/legal/security',
  'app/legal/compliance'
];

dirs.forEach(d => {
  const f = path.join(__dirname, d, 'page.tsx');
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Replace all instances of &apos; with a single quote
    content = content.replace(/&apos;/g, "'");
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
