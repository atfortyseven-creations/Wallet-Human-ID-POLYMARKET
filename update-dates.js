const fs = require('fs');
const path = require('path');

const targetDate = 'July 10, 2026';
const targetDateEs = '10 de julio de 2026';
const targetDateISO = '2026-07-10';

const patterns = [
    /July\s+[789](?:th)?,\s+2026/gi,
    /June\s+29(?:th)?,\s+2026/gi,
    /0[789]\/07\/2026/g,
    /2026-07-0[789]/g,
    /2026-06-29/g,
    /\b7\s+de\s+julio\s+de\s+2026\b/gi,
    /\b8\s+de\s+julio\s+de\s+2026\b/gi,
    /\b9\s+de\s+julio\s+de\s+2026\b/gi
];

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
            processDir(fullPath);
        } else if (file.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const pattern of patterns) {
                if (pattern.test(content)) {
                    const pStr = pattern.toString();
                    let replacement = targetDate;
                    if (pStr.includes('0[789]/07')) replacement = '10/07/2026';
                    else if (pStr.includes('2026-0')) replacement = targetDateISO;
                    else if (pStr.includes('julio')) replacement = targetDateEs;
                    
                    content = content.replace(pattern, replacement);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated dates in: ' + fullPath);
            }
        }
    }
}

processDir(process.cwd());
processDir('C:\\Users\\admin\\.gemini\\antigravity\\brain\\9e53c761-a933-48ce-b6ec-0a8d9f723264');
console.log('Date update complete.');
