const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let stat = fs.statSync(dirPath);
    if (stat.isDirectory()) {
      if (!dirPath.includes('node_modules') && !dirPath.includes('.git') && !dirPath.includes('.next') && !dirPath.includes('tmp')) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

const replacements = [
  { match: /\bInstitutional\b/g, replacement: 'Sovereign' },
  { match: /\binstitutional\b/g, replacement: 'sovereign' },
  { match: /\bINSTITUTIONAL\b/g, replacement: 'SOVEREIGN' },
  { match: /\bCompliance\b/g, replacement: 'Attestation' },
  { match: /\bcompliance\b/g, replacement: 'attestation' },
  { match: /\bCOMPLIANCE\b/g, replacement: 'ATTESTATION' },
  { match: /\bEnterprise\b/g, replacement: 'Cryptographic' },
  { match: /\benterprise\b/g, replacement: 'cryptographic' },
  { match: /\bENTERPRISE\b/g, replacement: 'CRYPTOGRAPHIC' },
  { match: /\bProgressive Decentralization\b/ig, replacement: 'Native Decentralization' }
];

function processFile(filePath) {
  const validExts = ['.md', '.ts', '.tsx', '.js', '.jsx', '.txt', '.html', '.mdx'];
  const ext = path.extname(filePath);
  if (!validExts.includes(ext)) return;
  // skip this script itself
  if (filePath.includes('aztec_alignment.js')) return;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return;
  }

  let original = content;

  if (ext === '.md' || ext === '.txt' || ext === '.html') {
    replacements.forEach(r => {
      content = content.replace(r.match, r.replacement);
    });
  } else {
    // Comments
    content = content.replace(/\/\/.*/g, (match) => {
        let newMatch = match;
        replacements.forEach(r => { newMatch = newMatch.replace(r.match, r.replacement); });
        return newMatch;
    });
    content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
        let newMatch = match;
        replacements.forEach(r => { newMatch = newMatch.replace(r.match, r.replacement); });
        return newMatch;
    });

    // JSX text
    content = content.replace(/>([^<]+)</g, (match, p1) => {
        let newText = p1;
        replacements.forEach(r => { newText = newText.replace(r.match, r.replacement); });
        return `>${newText}<`;
    });

    // Strings with spaces (phrases)
    content = content.replace(/(['"`])(.*?)\1/gs, (match, quote, p1) => {
        if (p1.includes(' ')) {
            if (p1.includes('http') || p1.includes('STRIPE_')) return match;
            let newText = p1;
            replacements.forEach(r => { newText = newText.replace(r.match, r.replacement); });
            return `${quote}${newText}${quote}`;
        }
        return match;
    });
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Quantum alignment applied to:', filePath);
  }
}

const targetDirs = [
  __dirname
];

targetDirs.forEach(dir => walkDir(dir, processFile));
console.log("Purge complete.");
