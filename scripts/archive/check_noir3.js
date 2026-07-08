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
  if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.tsx')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('verification_key') && content.includes('Field; 114')) {
      console.log('FOUND:', file);
    }
  }
});
