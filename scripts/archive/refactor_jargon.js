const fs = require('fs');
const path = require('path');

const DIRECTORY_TO_SCAN = path.join(__dirname);
const IGNORE_DIRS = ['node_modules', '.git', '.next', '.gemini', 'brain'];

const REPLACE_RULES = [
    { from: /System/g, to: 'System' },
    { from: /system/g, to: 'system' },
    { from: /Core/g, to: 'Core' },
    { from: /core/g, to: 'core' },
    { from: /Analytics/g, to: 'Analytics' },
    { from: /analytics/g, to: 'analytics' },
    { from: /Grid/g, to: 'Grid' },
    { from: /grid/g, to: 'grid' },
    { from: /Identity/g, to: 'Identity' },
    { from: /identity/g, to: 'identity' },
    { from: /Identity/g, to: 'Identity' },
    { from: /AUTH/g, to: 'AUTH' },
    { from: /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, to: '' }
];

function walkAndRefactor(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (IGNORE_DIRS.includes(file)) continue;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkAndRefactor(fullPath);
        } else {
            let currentPath = fullPath;
            
            // 1. Rename file
            let newFileName = file;
            for (const rule of REPLACE_RULES) {
                if (rule.from.test(newFileName)) {
                    newFileName = newFileName.replace(rule.from, rule.to);
                }
            }
            
            if (newFileName !== file) {
                const newFullPath = path.join(dir, newFileName);
                fs.renameSync(currentPath, newFullPath);
                currentPath = newFullPath;
                console.log(`Renamed: ${file} -> ${newFileName}`);
            }

            // 2. Refactor content
            if (!currentPath.match(/\.(png|jpg|jpeg|gif|ico|svg|ttf|woff|woff2|eot|pdf|mp4)$/i)) {
                try {
                    let content = fs.readFileSync(currentPath, 'utf8');
                    let newContent = content;

                    for (const rule of REPLACE_RULES) {
                        newContent = newContent.replace(rule.from, rule.to);
                    }

                    if (content !== newContent) {
                        fs.writeFileSync(currentPath, newContent, 'utf8');
                    }
                } catch (e) {
                    console.error(`Error reading ${currentPath}:`, e.message);
                }
            }
        }
    }
}

console.log("Starting refactor...");
walkAndRefactor(DIRECTORY_TO_SCAN);
console.log("Refactor complete.");
