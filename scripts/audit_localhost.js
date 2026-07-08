const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

console.log("=== LOCALHOST & 127.0.0.1 AUDIT ===");

walkDir('app', (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if (line.includes('127.0.0.1') || line.includes('localhost')) {
            // Ignore common next.js / comment boilerplate if needed, but let's see everything
            if (!line.includes('x-forwarded-for')) {
                console.log(`[SUSPECT] ${filePath}:${index + 1} -> ${line.trim()}`);
            }
        }
    });
});

console.log("=== AUDIT COMPLETE ===");
