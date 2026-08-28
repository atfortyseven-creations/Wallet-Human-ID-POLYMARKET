const fs = require('fs');
const execSync = require('child_process').execSync;
try {
  let files = [];
  try {
    files = execSync('git grep -l "official-ledger"').toString().trim().split('\n').filter(Boolean);
  } catch (e) { }
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/official-ledger(-monochrome|-vector|-legendary)?\.png/g, 'logo-mark.png');
    content = content.replace(/ledger-logo\.png/g, 'logo-mark.png');
    content = content.replace(/logo-landingpage\.png/g, 'logo-mark.png');
    fs.writeFileSync(file, content);
  });
  
  let files2 = [];
  try {
    files2 = execSync('git grep -l "ledger-logo"').toString().trim().split('\n').filter(Boolean);
  } catch(e) {}
  files2.forEach(file => {
    if (file !== 'replace-logos.js') {
      let content = fs.readFileSync(file, 'utf8');
      content = content.replace(/ledger-logo\.png/g, 'logo-mark.png');
      fs.writeFileSync(file, content);
    }
  });

  console.log('Replaced official-ledger in ' + files.length + ' files');
} catch (e) {
  console.error(e);
}
