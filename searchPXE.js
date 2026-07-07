const fs = require('fs');
const path = require('path');

function searchForString(dir, str) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchForString(fullPath, str);
        } else if (fullPath.endsWith('.d.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(str)) {
                console.log('Found in:', fullPath);
            }
        }
    }
}

searchForString(path.join(__dirname, 'node_modules', '@aztec'), 'createPXEClient');
