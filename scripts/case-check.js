const fs = require('fs');
const path = require('path');

function checkCaseConflicts(dir) {
    if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git')) return;
    
    const items = fs.readdirSync(dir);
    const lowercasedNames = new Map();

    for (const item of items) {
        const lower = item.toLowerCase();
        if (lowercasedNames.has(lower)) {
            console.log(`CONFLICT: "${item}" and "${lowercasedNames.get(lower)}" in ${dir}`);
        } else {
            lowercasedNames.set(lower, item);
        }

        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            checkCaseConflicts(fullPath);
        }
    }
}

try {
    console.log("Starting case conflict check...");
    checkCaseConflicts('.');
    console.log("Check finished.");
} catch (e) {
    console.error(e);
}
