const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles() {
  const dirs = [
    'c:\\Users\\admin\\.gemini\\antigravity\\scratch\\Wallet Human Polymarket ID\\components',
    'c:\\Users\\admin\\.gemini\\antigravity\\scratch\\Wallet Human Polymarket ID\\app'
  ];
  
  let count = 0;
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, filePath => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;
      
      // Remove green pulse dots
      content = content.replace(/(bg-emerald-[45]00|bg-green-[45]00|bg-\[#00C076\])\s*animate-pulse/g, 'bg-[#E5E5E5]');
      content = content.replace(/animate-pulse\s*(bg-emerald-[45]00|bg-green-[45]00|bg-\[#00C076\])/g, 'bg-[#E5E5E5]');
      
      // Remove generic animate-pulse
      content = content.replace(/ animate-pulse/g, '');
      content = content.replace(/animate-pulse /g, '');
      
      // Replace Text
      content = content.replace(/Syncing\.\.\./g, 'Loading...');
      content = content.replace(/SYNCING\.\.\./g, 'LOADING...');
      content = content.replace(/\bSYNCING\b/g, 'PROCESSING');
      content = content.replace(/\bSyncing\b/g, 'Processing');
      content = content.replace(/Live On-Chain/g, 'On-Chain');
      content = content.replace(/LIVE ON-CHAIN/g, 'ON-CHAIN');
      content = content.replace(/LIVE STATUS/g, 'STATUS');
      content = content.replace(/Live Feed/g, 'Data Feed');
      content = content.replace(/LIVE STREAMING/g, 'STREAMING');
      content = content.replace(/Live /g, 'Active ');
      content = content.replace(/LIVE /g, 'ACTIVE ');

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
      }
    });
  });
  console.log(`Processed ${count} files.`);
}

processFiles();
