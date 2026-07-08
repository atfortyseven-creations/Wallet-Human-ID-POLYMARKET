const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

console.log("=== QD TOKEN AND STATUS AUDIT ===");

walkDir('app/api', (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        // Check for token string mismatches
        if (line.includes('token:') || line.includes('token :')) {
            if (line.includes("'QD'") || line.includes('"QD"')) {
                console.log(`[BUG: QD without s] ${filePath}:${index + 1} -> ${line.trim()}`);
            }
        }
        
        // Check for status mismatches
        if (line.includes('status:') || line.includes('status :')) {
            if (line.includes('CONFIRMED') || line.includes('PENDING') || line.includes('SUCCESS')) {
                console.log(`[SUSPECT STATUS] ${filePath}:${index + 1} -> ${line.trim()}`);
            }
        }
    });
});

console.log("=== AUDIT COMPLETE ===");
