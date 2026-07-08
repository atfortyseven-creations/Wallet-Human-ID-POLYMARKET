const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.css') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('mobile-sterile-lock') || content.includes('w3m-modal')) {
          console.log('Found in:', file);
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('mobile-sterile-lock') || lines[i].includes('w3m-modal')) {
                  console.log(i + 1, lines[i].trim());
              }
          }
        }
      } catch(e) {}
    }
  });
  return results;
}
walk('.');
