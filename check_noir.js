const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

walkDir('noir-projects', (file) => {
  if (file.endsWith('.nr')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('pub verification_key') || content.includes('pub kyc_merkle_root') || content.includes('is_valid == true')) {
      console.log('\n--- ' + file + ' ---');
      console.log(content.split('\n').slice(0, 20).join('\n'));
    }
  }
});
