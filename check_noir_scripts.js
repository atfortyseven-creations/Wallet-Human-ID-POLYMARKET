const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (dirPath.includes('node_modules') || dirPath.includes('.git') || dirPath.includes('.next')) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

walkDir('.', (file) => {
  if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.mjs') || file.endsWith('.sh') || file.endsWith('.nr')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('pub verification_key') || content.includes('assert(is_valid == true)') || content.includes('tmp_noir')) {
      console.log('FOUND:', file);
    }
  }
});
